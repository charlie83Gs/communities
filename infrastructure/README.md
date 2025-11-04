# Infrastructure Deployment with Flux

This directory contains Kubernetes manifests for deploying the Share App infrastructure using Flux CD and Kustomize overlays.

## Components

- **CNPG (CloudNativePG)**: PostgreSQL operator for managing database clusters
- **Keycloak**: Identity and access management with realm configuration
- **OpenFGA**: Fine-grained authorization system

## Directory Structure

```
infrastructure/
├── base/                           # Base configurations (environment-agnostic)
│   ├── cnpg/                      # CNPG operator Helm chart
│   ├── keycloak/                  # Keycloak Helm chart + realm config
│   └── openfga/                   # OpenFGA deployment
├── overlays/
│   ├── development/               # Development environment overlay
│   │   ├── cnpg/                  # 1 instance clusters, small resources
│   │   ├── keycloak/              # Dev-mode Keycloak
│   │   └── openfga/               # OpenFGA with playground enabled
│   └── production/                # Production environment overlay
│       ├── cnpg/                  # 3 instance clusters, backups, monitoring
│       ├── keycloak/              # Production Keycloak with HTTPS
│       └── openfga/               # OpenFGA with playground disabled
└── README.md                      # This file
```

## Prerequisites

1. **Kubernetes cluster** (v1.24+)
2. **Flux CLI** installed ([installation guide](https://fluxcd.io/docs/installation/))
3. **kubectl** configured to access your cluster
4. **Storage class** available:
   - Development: `standard` (default)
   - Production: `fast-ssd` (configure as needed)

## Quick Start

### 1. Install Flux

```bash
# Check prerequisites
flux check --pre

# Install Flux on your cluster
flux install
```

### 2. Deploy Development Environment

```bash
# Apply the development overlay
kubectl apply -k infrastructure/overlays/development

# Wait for PostgreSQL clusters to be ready
kubectl wait --for=condition=Ready cluster/postgres-api -n share-app --timeout=300s
kubectl wait --for=condition=Ready cluster/postgres-keycloak -n share-app --timeout=300s
kubectl wait --for=condition=Ready cluster/postgres-openfga -n share-app --timeout=300s

# Check Keycloak deployment
kubectl get helmrelease keycloak -n flux-system
kubectl get pods -n share-app -l app.kubernetes.io/name=keycloak

# Check OpenFGA deployment
kubectl get pods -n share-app -l app=openfga
```

### 3. Deploy Production Environment

```bash
# IMPORTANT: Update secrets before deploying to production!
# Edit these files and replace CHANGE_ME placeholders:
# - infrastructure/overlays/production/cnpg/secrets.yaml
# - infrastructure/overlays/production/keycloak/secrets.yaml
# - infrastructure/overlays/production/keycloak/realm-configmap-patch.yaml
# - infrastructure/overlays/production/keycloak/helmrelease-patch.yaml
# - infrastructure/overlays/production/openfga/secrets.yaml

# Apply the production overlay
kubectl apply -k infrastructure/overlays/production

# Monitor the deployment
flux get helmreleases -n flux-system
kubectl get clusters -n share-app
```

## Configuration Details

### PostgreSQL Clusters (CNPG)

#### Development
- **Instances**: 1 replica per cluster
- **Storage**: 5-10Gi per cluster
- **Resources**: 250m-1000m CPU, 256Mi-1Gi memory
- **Backups**: Disabled

#### Production
- **Instances**: 3 replicas per cluster (HA)
- **Storage**: 20-50Gi per cluster
- **Resources**: 500m-2000m CPU, 512Mi-4Gi memory
- **Backups**: Enabled with S3 (30-day retention)
- **Monitoring**: PodMonitor enabled for Prometheus

**Cluster Services** (auto-created by CNPG):
- `postgres-api-rw`: Read-write service (port 5432)
- `postgres-api-ro`: Read-only service (port 5432)
- `postgres-keycloak-rw`: Read-write service (port 5432)
- `postgres-openfga-rw`: Read-write service (port 5432)

### Keycloak

#### Development
- **Replicas**: 1
- **Command**: `start-dev` mode
- **Hostname**: `localhost:8081`
- **HTTPS**: Disabled
- **Realm Import**: Enabled with development settings
- **Client Secrets**: Development values (insecure)
- **Email Verification**: Disabled

#### Production
- **Replicas**: 3 (with HPA: 3-10 replicas)
- **Command**: `start --optimized` mode
- **Hostname**: `auth.yourdomain.com` (update in helmrelease-patch.yaml)
- **HTTPS**: Required (via ingress with cert-manager)
- **Realm Import**: Enabled with production settings
- **Client Secrets**: Must be changed (see secrets.yaml)
- **Email Verification**: Enabled
- **SMTP**: Configured (update credentials)
- **Events Logging**: Enabled

**Realm Configuration**:
The Keycloak realm is imported from `base/keycloak/realm-configmap.yaml` which mirrors your existing `api/keycloak/realm-export.json`. Key features:
- Realm: `share-app`
- Clients: `share-app-backend` (confidential), `share-app-frontend` (public)
- Roles: `user` (default), `admin`
- Password Policy: Strong requirements (production uses 12+ chars)
- Brute Force Protection: Enabled

### OpenFGA

#### Development
- **Replicas**: 1
- **Playground**: Enabled on port 3001
- **Database**: PostgreSQL (postgres-openfga-rw)
- **SSL Mode**: Disabled

#### Production
- **Replicas**: 3
- **Playground**: Disabled
- **Database**: PostgreSQL with SSL required
- **Resources**: 500m-1000m CPU, 512Mi-1Gi memory

## Accessing Services

### Development (Port-Forward)

```bash
# Keycloak Admin Console
kubectl port-forward -n share-app svc/keycloak 8081:80
# Access: http://localhost:8081
# Username: admin
# Password: admin

# OpenFGA Playground
kubectl port-forward -n share-app svc/openfga 3001:3001
# Access: http://localhost:3001

# OpenFGA HTTP API
kubectl port-forward -n share-app svc/openfga 8080:8080
# Access: http://localhost:8080

# PostgreSQL (API DB)
kubectl port-forward -n share-app svc/postgres-api-rw 5432:5432
# Connect: postgresql://api_user:api_password@localhost:5432/api_db
```

### Production (Ingress)

Keycloak is exposed via Ingress with TLS:
- **URL**: https://auth.yourdomain.com (configure in helmrelease-patch.yaml)
- **TLS**: Managed by cert-manager with Let's Encrypt

OpenFGA should be exposed via internal service or API gateway (not directly via ingress).

## Database Credentials

Database credentials are managed via Kubernetes Secrets. The CNPG operator uses these secrets to bootstrap the clusters.

### Development Credentials

From `overlays/development/cnpg/secrets.yaml`:
- **postgres-api**: `api_user` / `api_password`
- **postgres-keycloak**: `keycloak` / `keycloak_password`
- **postgres-openfga**: `openfga_user` / `openfga_password`

### Production Credentials

**CRITICAL**: Update all `CHANGE_ME` placeholders in:
- `overlays/production/cnpg/secrets.yaml`
- `overlays/production/keycloak/secrets.yaml`
- `overlays/production/openfga/secrets.yaml`

**Best Practice**: Use a secret management solution:
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [External Secrets Operator](https://external-secrets.io/)
- [SOPS](https://github.com/mozilla/sops)

## Keycloak Realm Configuration

The Keycloak realm is configured via a ConfigMap (`keycloak-realm`) that imports the realm on startup.

### Updating the Realm

#### Development
Edit `base/keycloak/realm-configmap.yaml` and apply:
```bash
kubectl apply -k infrastructure/overlays/development
kubectl rollout restart deployment/keycloak -n share-app
```

#### Production
1. Edit `overlays/production/keycloak/realm-configmap-patch.yaml`
2. Update sensitive values:
   - Client secrets
   - Redirect URIs (use your production domain)
   - SMTP credentials
   - Password policies
3. Apply changes:
```bash
kubectl apply -k infrastructure/overlays/production
kubectl rollout restart deployment/keycloak -n share-app
```

### Important Realm Settings to Update for Production

In `overlays/production/keycloak/realm-configmap-patch.yaml`:

1. **Client Secrets**:
   - `share-app-backend` → `secret`: Generate a secure random value

2. **Redirect URIs**:
   - `share-app-frontend` → `redirectUris`: Update to production URLs
   - `share-app-frontend` → `webOrigins`: Update to production origins

3. **SMTP Configuration**:
   - Update all SMTP fields with your email provider details

4. **Hostname**:
   - In `helmrelease-patch.yaml`, update `KC_HOSTNAME` to your production domain

## Migrating from Docker Compose

This Kubernetes setup mirrors your existing `api/docker-compose.yml` configuration:

| Docker Compose | Kubernetes Equivalent |
|----------------|----------------------|
| `postgres_api` | `postgres-api` CNPG Cluster |
| `keycloak_db` | `postgres-keycloak` CNPG Cluster |
| `postgres_openfga` | `postgres-openfga` CNPG Cluster |
| `keycloak` | Keycloak HelmRelease |
| `openfga` | OpenFGA Deployment |
| `openfga_migrate` | OpenFGA Migration Job |

### Connection Strings

**Development Docker Compose**:
```
postgres://api_user:api_password@postgres_api:5432/api_db
jdbc:postgresql://keycloak_db:5432/keycloak
postgres://openfga_user:openfga_password@postgres_openfga:5432/openfga
```

**Kubernetes (Development)**:
```
postgres://api_user:api_password@postgres-api-rw.share-app.svc.cluster.local:5432/api_db
jdbc:postgresql://postgres-keycloak-rw.share-app.svc.cluster.local:5432/keycloak
postgres://openfga_user:openfga_password@postgres-openfga-rw.share-app.svc.cluster.local:5432/openfga
```

## Monitoring and Troubleshooting

### Check Flux Reconciliation

```bash
# Check all Flux resources
flux get all -n flux-system

# Check specific HelmRelease
flux get helmrelease keycloak -n flux-system

# Force reconciliation
flux reconcile helmrelease keycloak -n flux-system
```

### Check PostgreSQL Clusters

```bash
# List all clusters
kubectl get clusters -n share-app

# Check cluster status
kubectl describe cluster postgres-api -n share-app

# View cluster logs
kubectl logs -n share-app postgres-api-1 -f

# Check backups (production)
kubectl get backups -n share-app
```

### Check Keycloak

```bash
# Check pods
kubectl get pods -n share-app -l app.kubernetes.io/name=keycloak

# View logs
kubectl logs -n share-app -l app.kubernetes.io/name=keycloak -f

# Check realm import
kubectl exec -n share-app -it deployment/keycloak -- /opt/keycloak/bin/kcadm.sh get realms/share-app
```

### Check OpenFGA

```bash
# Check pods
kubectl get pods -n share-app -l app=openfga

# View logs
kubectl logs -n share-app -l app=openfga -f

# Check migration job
kubectl get jobs -n share-app
kubectl logs -n share-app job/openfga-migrate
```

## Backup and Restore

### PostgreSQL (Production Only)

CNPG handles automated backups to S3:

```bash
# Trigger manual backup
kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: postgres-api-manual-backup
  namespace: share-app
spec:
  cluster:
    name: postgres-api
EOF

# List backups
kubectl get backups -n share-app

# Restore from backup (create new cluster)
kubectl apply -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-api-restored
  namespace: share-app
spec:
  instances: 3
  bootstrap:
    recovery:
      source: postgres-api
      recoveryTarget:
        targetTime: "2025-11-03 12:00:00"
  externalClusters:
    - name: postgres-api
      barmanObjectStore:
        destinationPath: s3://backup-bucket/postgres-api
        s3Credentials:
          accessKeyId:
            name: backup-credentials
            key: ACCESS_KEY_ID
          secretAccessKey:
            name: backup-credentials
            key: ACCESS_SECRET_KEY
EOF
```

## Upgrading Components

### CNPG Operator

```bash
# Edit base/cnpg/helmrelease.yaml and update version
# Then apply
kubectl apply -k infrastructure/overlays/development
```

### Keycloak

```bash
# Edit base/keycloak/helmrelease.yaml and update image.tag
# Then apply
kubectl apply -k infrastructure/overlays/development
kubectl rollout status deployment/keycloak -n share-app
```

### PostgreSQL Version

```bash
# CNPG supports in-place upgrades
# Edit cluster spec and update imageName
kubectl edit cluster postgres-api -n share-app
```

## Security Considerations

### Development
- Default credentials are used (NOT SECURE)
- HTTPS is disabled
- Email verification is disabled
- Playground features are enabled

### Production
- **Change all default passwords** in secrets
- **Enable HTTPS** via ingress with valid certificates
- **Enable email verification** for user registration
- **Configure SMTP** for email delivery
- **Disable playground** features (OpenFGA)
- **Use secret management** (sealed-secrets, external-secrets)
- **Enable monitoring** with Prometheus
- **Configure resource limits** to prevent resource exhaustion
- **Enable network policies** to restrict pod-to-pod communication
- **Use private container registries** for production images

## Additional Resources

- [Flux Documentation](https://fluxcd.io/docs/)
- [CNPG Documentation](https://cloudnative-pg.io/documentation/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenFGA Documentation](https://openfga.dev/docs)
- [Kustomize Documentation](https://kustomize.io/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review component logs
3. Consult official documentation
4. Open an issue in the project repository
