# Tilt Setup for Local Infrastructure Testing

This directory includes a Tiltfile for rapid local development and testing of the infrastructure stack using [Tilt](https://tilt.dev/).

## What is Tilt?

Tilt is a development environment orchestrator for microservices. It automates the deployment of your infrastructure to a local Kubernetes cluster and provides:

- Live updates and hot reload
- Unified dashboard with logs and status
- Port forwarding management
- Resource organization and labeling

## Prerequisites

1. **Kubernetes cluster** (local):
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Kubernetes enabled
   - [kind](https://kind.sigs.k8s.io/) (Kubernetes in Docker)
   - [minikube](https://minikube.sigs.k8s.io/)
   - [k3d](https://k3d.io/) (Rancher k3s in Docker)

2. **Tilt CLI** ([installation guide](https://docs.tilt.dev/install.html)):
   ```bash
   curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
   ```

3. **kubectl** configured to access your local cluster

## Quick Start

### 1. Start Your Local Kubernetes Cluster

**Docker Desktop:**
```bash
# Enable Kubernetes in Docker Desktop settings
# No additional commands needed
```

**kind:**
```bash
kind create cluster --name share-app-dev
```

**minikube:**
```bash
minikube start --cpus=4 --memory=8192
```

**k3d:**
```bash
k3d cluster create share-app-dev --agents 1
```

### 2. Verify Cluster Access

```bash
kubectl cluster-info
kubectl get nodes
```

### 3. Start Tilt

```bash
cd infrastructure
tilt up
```

This will:
1. Open the Tilt UI in your browser (http://localhost:10350)
2. Deploy all infrastructure components
3. Set up port forwarding
4. Stream logs

### 4. Access Services

Once all resources are green in the Tilt UI:

- **Keycloak Admin**: http://localhost:8081 (admin/admin)
- **OpenFGA Playground**: http://localhost:3001
- **OpenFGA API**: http://localhost:8080

### 5. Stop Tilt

Press `Ctrl+C` in the terminal or run:
```bash
tilt down
```

## Tilt UI Overview

The Tilt UI (http://localhost:10350) shows:

### Resources by Label

**Infrastructure:**
- `cloudnative-pg` - CNPG operator

**Database:**
- `postgres-api` - API database cluster
- `postgres-keycloak` - Keycloak database cluster
- `postgres-openfga` - OpenFGA database cluster

**Auth & Services:**
- `keycloak` - Identity and access management
- `openfga-migrate` - OpenFGA migration job
- `openfga` - Authorization service

**Tools:**
- `cnpg-status` - Check PostgreSQL cluster health (manual trigger)
- `postgres-services` - List PostgreSQL services (manual trigger)
- `keycloak-logs` - Stream Keycloak logs (manual trigger)
- `openfga-logs` - Stream OpenFGA logs (manual trigger)
- `postgres-api-forward` - Port-forward to API DB (manual trigger)

### Resource Status

- 🟢 Green: Resource is healthy
- 🟡 Yellow: Resource is building/updating
- 🔴 Red: Resource has errors
- ⚪ Gray: Resource is pending

## Using Manual Resources

Some resources are set to manual trigger for on-demand use:

### Check Database Status
Click on `cnpg-status` in the Tilt UI and press "Trigger Update"

Or from CLI:
```bash
kubectl get clusters -n share-app
```

### View Keycloak Logs
Click on `keycloak-logs` in the Tilt UI to start streaming logs

Or from CLI:
```bash
kubectl logs -n share-app -l app.kubernetes.io/name=keycloak -f
```

### Port-Forward to PostgreSQL
Click on `postgres-api-forward` in the Tilt UI to start port-forwarding

Then connect:
```bash
psql postgresql://api_user:api_password@localhost:5432/api_db
```

## Deployment Order

Tilt automatically manages deployment order using `resource_deps`:

1. **CNPG Operator** - Installed first
2. **PostgreSQL Clusters** - Created after operator is ready
3. **Keycloak** - Deployed after postgres-keycloak is ready
4. **OpenFGA Migration** - Runs after postgres-openfga is ready
5. **OpenFGA Service** - Starts after migration completes

## Customizing the Tiltfile

### Add Your Own Services

Edit `Tiltfile` to add your application services:

```python
# Deploy your API
k8s_yaml('../api/k8s/deployment.yaml')

k8s_resource(
    'share-app-api',
    labels=['application'],
    resource_deps=['postgres-api', 'keycloak', 'openfga'],
    port_forwards=['3000:3000'],
)
```

### Change Port Forwards

Modify the `port_forwards` in the Tiltfile:

```python
k8s_resource(
    'keycloak',
    port_forwards=['9090:8080'],  # Change from 8081 to 9090
)
```

### Enable Live Updates

For your application (not infrastructure):

```python
docker_build(
    'share-app-api',
    context='../api',
    dockerfile='../api/Dockerfile',
    live_update=[
        sync('../api/src', '/app/src'),
        run('bun install', trigger=['../api/package.json']),
    ]
)
```

## Troubleshooting

### Tilt Can't Find Kubernetes Context

```bash
# List available contexts
kubectl config get-contexts

# Set the correct context
kubectl config use-context docker-desktop
# or
kubectl config use-context kind-kind
```

### PostgreSQL Cluster Stuck in "Pending"

Check the CNPG operator logs:
```bash
kubectl logs -n flux-system -l app.kubernetes.io/name=cloudnative-pg
```

Common issues:
- Storage class not available (check: `kubectl get sc`)
- Insufficient resources (check: `kubectl top nodes`)

### Keycloak Won't Start

1. Check database is ready:
   ```bash
   kubectl get cluster postgres-keycloak -n share-app
   ```

2. Check Keycloak pod status:
   ```bash
   kubectl get pods -n share-app -l app.kubernetes.io/name=keycloak
   kubectl describe pod -n share-app -l app.kubernetes.io/name=keycloak
   ```

3. View logs in Tilt UI or:
   ```bash
   kubectl logs -n share-app -l app.kubernetes.io/name=keycloak
   ```

### OpenFGA Migration Fails

```bash
# Check job status
kubectl get jobs -n share-app

# View logs
kubectl logs -n share-app job/openfga-migrate

# Delete and let Tilt recreate
kubectl delete job openfga-migrate -n share-app
```

### "Too Many Resources" or Performance Issues

Reduce resource requests in the Tiltfile or your cluster:

For **minikube/kind**, increase resources:
```bash
# minikube
minikube stop
minikube delete
minikube start --cpus=4 --memory=8192

# kind (edit cluster config)
kind delete cluster --name share-app-dev
kind create cluster --name share-app-dev --config kind-config.yaml
```

### Port Already in Use

If ports 8080, 8081, or 3001 are in use:

1. Find the process:
   ```bash
   lsof -i :8081
   ```

2. Change ports in Tiltfile:
   ```python
   k8s_resource(
       'keycloak',
       port_forwards=['8090:8080'],  # Use different local port
   )
   ```

## Cleaning Up

### Stop Tilt (Keep Resources)
```bash
# Press Ctrl+C in tilt terminal
# Or
tilt down
```

### Delete All Resources
```bash
kubectl delete namespace share-app flux-system
```

### Delete Cluster (Complete Reset)

**kind:**
```bash
kind delete cluster --name share-app-dev
```

**minikube:**
```bash
minikube delete
```

**k3d:**
```bash
k3d cluster delete share-app-dev
```

## Development Workflow

### Typical Development Session

1. Start cluster and Tilt:
   ```bash
   cd infrastructure
   tilt up
   ```

2. Wait for all resources to become healthy (green in UI)

3. Develop your application (API/frontend)

4. Deploy your app to the cluster (add to Tiltfile)

5. Test against real Keycloak and OpenFGA

6. Make changes - Tilt will auto-update

7. When done:
   ```bash
   tilt down
   ```

### Testing Infrastructure Changes

1. Make changes to manifests in `base/` or `overlays/development/`

2. Tilt will automatically detect changes and redeploy

3. View status in Tilt UI

4. Check logs and validate

### Debugging

All logs are available in the Tilt UI, or use:

```bash
# All pods in namespace
kubectl get pods -n share-app

# Specific service logs
kubectl logs -n share-app -l app=openfga -f

# Describe resources
kubectl describe cluster postgres-api -n share-app

# Execute commands in pods
kubectl exec -it -n share-app deployment/keycloak -- bash
```

## Differences from Production

This Tilt setup uses the **development overlay** with:

- Single-instance PostgreSQL clusters (no HA)
- Smaller resource requests/limits
- No backups
- No TLS/HTTPS
- Playground features enabled
- Development-mode Keycloak
- Simple credentials (admin/admin)

## Next Steps

1. ✅ Infrastructure running locally
2. Add your application services to Tiltfile
3. Configure environment variables
4. Test integrations with Keycloak and OpenFGA
5. Develop and iterate rapidly
6. Deploy to production using Flux (see README.md)

## Resources

- [Tilt Documentation](https://docs.tilt.dev/)
- [Tiltfile API Reference](https://docs.tilt.dev/api.html)
- [Tilt Extensions](https://github.com/tilt-dev/tilt-extensions)
- [CNPG Documentation](https://cloudnative-pg.io/)

## Support

For issues with:
- **Tilt**: Check [Tilt docs](https://docs.tilt.dev/) or [GitHub issues](https://github.com/tilt-dev/tilt/issues)
- **Infrastructure**: See main README.md and QUICK_START.md
- **Kubernetes**: Check cluster logs and documentation
