# Communities App Deployment

This directory contains Kubernetes manifests for deploying the Communities App (API + Frontend).

## Architecture

- **API**: Express.js backend with TypeScript, Keycloak auth, Drizzle ORM, and OpenFGA
- **Frontend**: Solid.js SPA with TanStack Query and Keycloak integration
- **Database**: PostgreSQL managed by CNPG (CloudNativePG)

## Container Images

Images are built and pushed to GitHub Container Registry (GHCR) by the release-please workflow:

- API: `ghcr.io/<owner>/communities-api:<version>`
- Frontend: `ghcr.io/<owner>/communities-frontend:<version>`

## Deployment Structure

```
base/
├── namespace.yaml                  # Namespace definition
├── api-deployment.yaml             # API deployment (auto-updated by release-please)
├── api-service.yaml                # API service
├── frontend-deployment.yaml        # Frontend deployment (auto-updated by release-please)
├── frontend-service.yaml           # Frontend service
├── ingressroute.yaml               # Traefik IngressRoutes for both services
├── secrets-MANUAL.yaml             # Documentation for manual secrets
└── kustomization.yaml              # Kustomize configuration

overlays/
└── production/
    ├── postgres-api-cluster.yaml   # CNPG PostgreSQL cluster
    └── kustomization.yaml          # Production-specific configuration
```

## Prerequisites

### 1. Create GitHub Container Registry Pull Secret

```bash
kubectl create secret docker-registry ghcr-credentials \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_PERSONAL_ACCESS_TOKEN> \
  --namespace=communities-app
```

The GitHub PAT needs the `read:packages` scope.

### 2. Create OpenFGA Configuration Secret

```bash
kubectl create secret generic openfga-config \
  --from-literal=store-id=<YOUR_OPENFGA_STORE_ID> \
  --namespace=communities-app
```

### 3. PostgreSQL Database

The PostgreSQL database is managed by CNPG. The `postgres-api-app` secret with connection details is automatically created by the CNPG operator.

## Deployment

### Using Flux (Recommended)

The app is automatically deployed via Flux CD when changes are pushed to the repository.

### Manual Deployment

```bash
# Deploy base resources
kubectl apply -k infrastructure/apps/communities-app/base

# Deploy production overlay
kubectl apply -k infrastructure/apps/communities-app/overlays/production
```

## Release Process

### Automatic Version Updates

Release-please is configured to automatically update the deployment manifests when a new release is created:

1. Make changes to `api/` or `frontend/` directories
2. Commit with conventional commit messages (e.g., `feat:`, `fix:`, etc.)
3. Push to `main` branch
4. Release-please creates/updates a PR with version bumps
5. Merge the PR to trigger:
   - New GitHub release
   - Docker image build and push
   - **Automatic update of deployment image tags in the PR**

### Image Tag Pattern

The deployments use version tags that are automatically updated by release-please:

```yaml
image: ghcr.io/OWNER/communities-api:1.0.0
```

Release-please uses JSONPath to target and update the image field in each deployment.

### Extra Files Configuration

In `release-please-config.json`:

```json
{
  "packages": {
    "api": {
      "extra-files": [
        {
          "type": "yaml",
          "path": "infrastructure/apps/communities-app/base/api-deployment.yaml",
          "jsonpath": "$.spec.template.spec.containers[0].image"
        }
      ]
    },
    "frontend": {
      "extra-files": [
        {
          "type": "yaml",
          "path": "infrastructure/apps/communities-app/base/frontend-deployment.yaml",
          "jsonpath": "$.spec.template.spec.containers[0].image"
        }
      ]
    }
  }
}
```

**How it works:**
- Each package (api/frontend) has its own versioning
- The `yaml` type updater parses the YAML structure
- The `jsonpath` targets the exact field: `$.spec.template.spec.containers[0].image`
- Release-please replaces the version tag in the image field with the new version

## Exposed Endpoints

- **Frontend**: https://app.plv.it.com
- **API**: https://api.plv.it.com
- **Keycloak**: https://auth.plv.it.com
- **OpenFGA**: Internal only (openfga-openfga.openfga.svc.cluster.local:8080)

## Environment Variables

### API

- `NODE_ENV`: production
- `PORT`: 3000
- `DATABASE_URL`: From postgres-api-app secret (CNPG)
- `KEYCLOAK_URL`: https://auth.plv.it.com
- `KEYCLOAK_REALM`: share-app
- `OPENFGA_API_URL`: Internal service URL
- `OPENFGA_STORE_ID`: From openfga-config secret

### Frontend

- `VITE_API_URL`: https://api.plv.it.com
- `VITE_KEYCLOAK_URL`: https://auth.plv.it.com
- `VITE_KEYCLOAK_REALM`: share-app
- `VITE_KEYCLOAK_CLIENT_ID`: communities-app

## Health Checks

### API
- Liveness: `GET /health` (30s initial delay)
- Readiness: `GET /health` (10s initial delay)

### Frontend
- Liveness: `GET /` (10s initial delay)
- Readiness: `GET /` (5s initial delay)

## Resource Limits

### API
- Requests: 100m CPU, 256Mi memory
- Limits: 500m CPU, 512Mi memory
- Replicas: 2

### Frontend
- Requests: 50m CPU, 128Mi memory
- Limits: 200m CPU, 256Mi memory
- Replicas: 2

## Troubleshooting

### Check Deployment Status
```bash
kubectl get deployments -n communities-app
kubectl get pods -n communities-app
```

### View Logs
```bash
# API logs
kubectl logs -n communities-app -l app=communities-api -f

# Frontend logs
kubectl logs -n communities-app -l app=communities-frontend -f
```

### Check Image Pull Issues
```bash
kubectl describe pod -n communities-app <pod-name>
```

If you see `ImagePullBackOff`, verify:
1. The `ghcr-credentials` secret exists
2. The GitHub PAT has `read:packages` scope
3. The image exists in GHCR

### Database Connection Issues
```bash
# Check CNPG cluster status
kubectl get cluster -n communities-app

# Check postgres secret
kubectl get secret postgres-api-app -n communities-app -o yaml
```

## Updating Manually

If you need to update the image version manually (e.g., for testing):

```bash
# Update API
kubectl set image deployment/communities-api \
  api=ghcr.io/OWNER/communities-api:NEW_VERSION \
  -n communities-app

# Update Frontend
kubectl set image deployment/communities-frontend \
  frontend=ghcr.io/OWNER/communities-frontend:NEW_VERSION \
  -n communities-app
```

**Note**: Manual updates will be overwritten by Flux/GitOps on the next sync.
