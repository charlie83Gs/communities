# Deployment Guide

## Structure

The infrastructure is organized into individual apps under `infrastructure/apps/`:

```
apps/
├── external-secrets/     # External Secrets Operator (foundation)
├── cnpg/                 # CloudNativePG Operator (foundation)
├── communities-app/      # PostgreSQL clusters
├── keycloak/            # Identity and Access Management
└── openfga/             # Authorization service
```

## Flux Deployment

The `infrastructure/flux/` directory contains Flux Kustomization resources that will deploy all apps in the correct order with dependencies.

### Deployment Order (Automatic via dependsOn)

1. **communities-external-secrets** - External Secrets Operator
2. **communities-cnpg** - CloudNativePG Operator (parallel with external-secrets)
3. **communities-app** - PostgreSQL clusters (depends on cnpg + external-secrets)
4. **communities-keycloak** - Keycloak (depends on communities-app)
5. **communities-openfga** - OpenFGA (depends on communities-app + external-secrets)

### Apply to Cluster

```bash
kubectl apply -k infrastructure/flux
```

This will create all Flux Kustomization resources which will then:
- Monitor the git repository for changes
- Deploy apps in the correct order
- Automatically retry failed deployments
- Self-heal if resources drift from desired state

## Secrets Management

All database passwords are now generated automatically using External Secrets Operator:

- **Keycloak passwords**: Auto-generated via Password generator
- **PostgreSQL passwords**: Auto-generated via Password generator
- **Backup credentials**: Manual configuration required (see below)

### Manual Secrets Setup

The backup credentials need to be configured manually:

```bash
# Edit and apply backup credentials
cp infrastructure/apps/communities-app/communities-app/backup-credentials-MANUAL.yaml \
   infrastructure/apps/communities-app/communities-app/backup-credentials.yaml

# Edit with your S3/Minio credentials
vim infrastructure/apps/communities-app/communities-app/backup-credentials.yaml

# Uncomment in kustomization.yaml
vim infrastructure/apps/communities-app/communities-app/kustomization.yaml
# Uncomment the line: # - backup-credentials.yaml
```

## Verification

Check Flux Kustomization status:

```bash
kubectl get kustomizations -n flux-system
```

Expected output:
```
NAME                            READY   STATUS
communities-external-secrets    True    Applied revision: main@sha1:...
communities-cnpg               True    Applied revision: main@sha1:...
communities-app                True    Applied revision: main@sha1:...
communities-keycloak           True    Applied revision: main@sha1:...
communities-openfga            True    Applied revision: main@sha1:...
```

Check deployed resources:

```bash
# Check PostgreSQL clusters
kubectl get cluster -n share-app

# Check External Secrets
kubectl get externalsecret -n share-app
kubectl get password -n share-app

# Check Keycloak
kubectl get helmrelease -n share-app keycloak

# Check OpenFGA
kubectl get deployment -n share-app openfga
```

## Troubleshooting

### App Fails to Deploy

Check the Flux Kustomization status:
```bash
kubectl describe kustomization <app-name> -n flux-system
```

### Secrets Not Generated

Check External Secrets Operator is running:
```bash
kubectl get pods -n default | grep external-secrets
```

Check Password generators:
```bash
kubectl get password -n share-app
kubectl describe password <password-name> -n share-app
```

### Database Connection Issues

Check PostgreSQL clusters:
```bash
kubectl get cluster -n share-app
kubectl describe cluster postgres-api -n share-app
```

Check credentials were created:
```bash
kubectl get secret -n share-app | grep postgres
```

## Configuration Changes

After making changes to the infrastructure, commit and push:

```bash
git add infrastructure/
git commit -m "Update infrastructure"
git push
```

Flux will automatically detect changes and reconcile within 5 minutes, or you can force reconciliation:

```bash
flux reconcile kustomization communities-external-secrets
flux reconcile kustomization communities-cnpg
flux reconcile kustomization communities-app
flux reconcile kustomization communities-keycloak
flux reconcile kustomization communities-openfga
```
