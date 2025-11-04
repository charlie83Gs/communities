# Infrastructure Quick Start Guide

## TL;DR - Deploy Everything

### Development
```bash
cd infrastructure
./deploy.sh development
```

### Production
```bash
cd infrastructure
# 1. Update all CHANGE_ME values in overlays/production/
# 2. Deploy
./deploy.sh production
```

## Prerequisites

```bash
# Install Flux CLI
curl -s https://fluxcd.io/install.sh | sudo bash

# Verify kubectl is connected
kubectl cluster-info

# Check Flux prerequisites
flux check --pre
```

## Configuration Checklist

### Development (Ready to Use)
✅ All secrets are pre-configured
✅ Works with localhost
✅ No SSL/TLS required
✅ Playground features enabled

### Production (Requires Configuration)

Before deploying, update these files:

#### 1. Database Passwords
**File**: `overlays/production/cnpg/secrets.yaml`
- [ ] postgres-api password
- [ ] postgres-keycloak password
- [ ] postgres-openfga password
- [ ] S3 backup credentials (ACCESS_KEY_ID, ACCESS_SECRET_KEY)

#### 2. Keycloak Admin
**File**: `overlays/production/keycloak/secrets.yaml`
- [ ] Admin username
- [ ] Admin password
- [ ] Database password

#### 3. Keycloak Configuration
**File**: `overlays/production/keycloak/helmrelease-patch.yaml`
- [ ] KC_HOSTNAME (your production domain)
- [ ] Ingress host (auth.yourdomain.com)
- [ ] TLS certificate settings

#### 4. Keycloak Realm
**File**: `overlays/production/keycloak/realm-configmap-patch.yaml`
- [ ] Client secret for share-app-backend
- [ ] Redirect URIs (production URLs)
- [ ] Web origins (production origins)
- [ ] SMTP server configuration
- [ ] SMTP credentials

#### 5. OpenFGA Database
**File**: `overlays/production/openfga/secrets.yaml`
- [ ] Database URI with secure password

## Common Commands

### Deploy
```bash
# Development
./deploy.sh development

# Production
./deploy.sh production
```

### Access Services (Development)

```bash
# Keycloak Admin
kubectl port-forward -n share-app svc/keycloak 8081:80
# http://localhost:8081 (admin/admin)

# OpenFGA Playground
kubectl port-forward -n share-app svc/openfga 3001:3001
# http://localhost:3001

# OpenFGA API
kubectl port-forward -n share-app svc/openfga 8080:8080
# http://localhost:8080

# PostgreSQL
kubectl port-forward -n share-app svc/postgres-api-rw 5432:5432
# postgresql://api_user:api_password@localhost:5432/api_db
```

### Check Status

```bash
# All resources
kubectl get all -n share-app

# PostgreSQL clusters
kubectl get clusters -n share-app

# Cluster details
kubectl describe cluster postgres-api -n share-app

# Flux resources (if using Flux)
flux get all -n flux-system

# Keycloak status
kubectl get helmrelease keycloak -n flux-system
kubectl get pods -n share-app -l app.kubernetes.io/name=keycloak

# OpenFGA status
kubectl get pods -n share-app -l app=openfga
```

### View Logs

```bash
# Keycloak
kubectl logs -n share-app -l app.kubernetes.io/name=keycloak -f

# OpenFGA
kubectl logs -n share-app -l app=openfga -f

# PostgreSQL
kubectl logs -n share-app postgres-api-1 -f

# OpenFGA migration
kubectl logs -n share-app job/openfga-migrate
```

### Cleanup

```bash
# Development
./cleanup.sh development

# Production (careful!)
./cleanup.sh production
```

## Troubleshooting

### PostgreSQL Cluster Not Starting

```bash
# Check cluster status
kubectl describe cluster postgres-api -n share-app

# Check pod events
kubectl get events -n share-app --sort-by='.lastTimestamp'

# Check logs
kubectl logs -n share-app postgres-api-1
```

### Keycloak Not Starting

```bash
# Check HelmRelease
flux get helmrelease keycloak -n flux-system

# Check pod status
kubectl get pods -n share-app -l app.kubernetes.io/name=keycloak

# View logs
kubectl logs -n share-app -l app.kubernetes.io/name=keycloak

# Common issue: Database not ready
# Wait for postgres-keycloak cluster to be Ready
kubectl wait --for=condition=Ready cluster/postgres-keycloak -n share-app --timeout=600s
```

### OpenFGA Migration Failed

```bash
# Check job status
kubectl get jobs -n share-app

# View logs
kubectl logs -n share-app job/openfga-migrate

# Delete and retry
kubectl delete job openfga-migrate -n share-app
kubectl apply -k overlays/development
```

### Realm Not Imported to Keycloak

```bash
# Check ConfigMap
kubectl get configmap keycloak-realm -n share-app -o yaml

# Restart Keycloak
kubectl rollout restart deployment/keycloak -n share-app

# Check logs for import messages
kubectl logs -n share-app -l app.kubernetes.io/name=keycloak | grep import
```

## Database Connection Strings

### From Inside Kubernetes Cluster

```bash
# API Database
postgres://api_user:api_password@postgres-api-rw.share-app.svc.cluster.local:5432/api_db

# Keycloak Database
jdbc:postgresql://postgres-keycloak-rw.share-app.svc.cluster.local:5432/keycloak

# OpenFGA Database
postgres://openfga_user:openfga_password@postgres-openfga-rw.share-app.svc.cluster.local:5432/openfga
```

### From Outside (Port-Forward)

```bash
# Forward API DB
kubectl port-forward -n share-app svc/postgres-api-rw 5432:5432
# Connection: postgresql://api_user:api_password@localhost:5432/api_db

# Forward Keycloak DB
kubectl port-forward -n share-app svc/postgres-keycloak-rw 5433:5432
# Connection: postgresql://keycloak:keycloak_password@localhost:5433/keycloak

# Forward OpenFGA DB
kubectl port-forward -n share-app svc/postgres-openfga-rw 5434:5432
# Connection: postgresql://openfga_user:openfga_password@localhost:5434/openfga
```

## Backup and Restore (Production)

### Manual Backup

```bash
kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: postgres-api-manual-$(date +%Y%m%d-%H%M%S)
  namespace: share-app
spec:
  cluster:
    name: postgres-api
EOF
```

### List Backups

```bash
kubectl get backups -n share-app
```

### Restore from Backup

See README.md for detailed restore instructions.

## Next Steps

1. ✅ Deploy infrastructure
2. Deploy your application
3. Configure ingress/load balancers
4. Set up monitoring (Prometheus/Grafana)
5. Configure alerting
6. Set up CI/CD with Flux GitOps

## Support

- Full documentation: `README.md`
- Flux docs: https://fluxcd.io/docs/
- CNPG docs: https://cloudnative-pg.io/
- Keycloak docs: https://www.keycloak.org/documentation
- OpenFGA docs: https://openfga.dev/docs
