# Communities App - Deployment & Release Setup

## Overview

This document explains the complete deployment and release automation setup for the Communities App.

## What's Been Set Up

### 1. Kubernetes Manifests

Created deployment manifests for both API and frontend in `infrastructure/apps/communities-app/base/`:

- ✅ `api-deployment.yaml` - API deployment with auto-updating image tags
- ✅ `api-service.yaml` - ClusterIP service for API
- ✅ `frontend-deployment.yaml` - Frontend deployment with auto-updating image tags
- ✅ `frontend-service.yaml` - ClusterIP service for frontend
- ✅ `ingressroute.yaml` - Traefik IngressRoutes for both services
- ✅ `secrets-MANUAL.yaml` - Documentation for required manual secrets
- ✅ Updated `kustomization.yaml` to include all resources

### 2. Release-Please Configuration

Updated `release-please-config.json` to automatically update deployment image tags when creating releases.

**Key feature**: When release-please creates a release PR, it will:
1. Bump version in `package.json`
2. Update `CHANGELOG.md`
3. **Automatically update the image tag in the deployment YAML files**

### 3. How It Works

#### Release Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Developer commits with conventional commit messages       │
│    (feat:, fix:, chore:, etc.)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Push to main branch                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Release-please workflow creates/updates PR                │
│    - Bumps version in api/package.json                      │
│    - Bumps version in frontend/package.json                 │
│    - Updates CHANGELOG.md                                    │
│    - Updates image tag in api-deployment.yaml               │
│    - Updates image tag in frontend-deployment.yaml          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Developer reviews and merges PR                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Release-please creates GitHub release                    │
│    - Tag: api-v1.0.0 or frontend-v0.1.0                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Docker build workflow triggers                           │
│    - Builds Docker image                                     │
│    - Tags: latest, 1.0.0, 1.0, 1                           │
│    - Pushes to ghcr.io/<owner>/communities-api:1.0.0       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Flux CD detects changes in Git                          │
│    - Applies updated deployment manifests                    │
│    - Kubernetes pulls new image from GHCR                   │
│    - Rolling update of pods                                  │
└─────────────────────────────────────────────────────────────┘
```

## Image Tag Auto-Update

### How Release-Please Updates Deployment Files

Release-please uses **JSONPath** to target specific fields in the deployment YAML files:

```yaml
spec:
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/OWNER/communities-api:1.0.0
```

The JSONPath `$.spec.template.spec.containers[0].image` tells release-please to:
1. Navigate to the container image field in the YAML structure
2. Extract the current version from the image tag
3. Update it with the new release version
4. Include this change in the release PR

### Configuration

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

This tells release-please to:
- Use the **`yaml` updater type** (not `generic`)
- Target the specific **JSONPath** to the container image field
- Update **only that specific field** in the YAML file
- Each package (api/frontend) has its own deployment file with separate versioning

## Required Manual Setup

### Before First Deployment

You must create these secrets manually:

#### 1. GitHub Container Registry Pull Secret

```bash
kubectl create secret docker-registry ghcr-credentials \
  --docker-server=ghcr.io \
  --docker-username=<YOUR_GITHUB_USERNAME> \
  --docker-password=<YOUR_GITHUB_PAT> \
  --namespace=communities-app
```

**Requirements**:
- GitHub Personal Access Token (PAT)
- Scope: `read:packages`
- Can be created at: https://github.com/settings/tokens

#### 2. OpenFGA Store ID

```bash
kubectl create secret generic openfga-config \
  --from-literal=store-id=<YOUR_OPENFGA_STORE_ID> \
  --namespace=communities-app
```

#### 3. Update Image Owner

Edit these files and replace `OWNER` with your GitHub username/org:

- `infrastructure/apps/communities-app/base/api-deployment.yaml`
- `infrastructure/apps/communities-app/base/frontend-deployment.yaml`

Change:
```yaml
image: ghcr.io/OWNER/communities-api:1.0.0 # x-release-please-version
```

To:
```yaml
image: ghcr.io/your-github-username/communities-api:1.0.0 # x-release-please-version
```

## Deployment Configuration

### Endpoints

- **Frontend**: https://app.plv.it.com
- **API**: https://api.plv.it.com

### Resources

**API**:
- 2 replicas
- Requests: 100m CPU, 256Mi memory
- Limits: 500m CPU, 512Mi memory

**Frontend**:
- 2 replicas
- Requests: 50m CPU, 128Mi memory
- Limits: 200m CPU, 256Mi memory

### Health Checks

Both services have liveness and readiness probes:
- API: `GET /health`
- Frontend: `GET /`

## Testing the Setup

### 1. Create a Test Release

```bash
# Make a change to the API
cd api
echo "// Test change" >> src/server.ts

# Commit with conventional commit
git add .
git commit -m "feat(api): add test feature"
git push origin main
```

### 2. Watch for Release PR

- GitHub Actions will create a PR with version bumps
- Check that `api-deployment.yaml` has the updated version
- Merge the PR

### 3. Verify Image Build

- Release is created automatically
- Docker build workflow runs
- Image is pushed to GHCR

### 4. Check Deployment

```bash
# Watch for Flux to sync changes
kubectl get deployments -n communities-app -w

# Check pod status
kubectl get pods -n communities-app

# View logs
kubectl logs -n communities-app -l app=communities-api
```

## Troubleshooting

### Release-Please Not Updating Deployment Files

**Check**:
1. Verify `extra-files` configuration in `release-please-config.json`
2. Ensure deployment files have `# x-release-please-version` comment
3. Check release-please PR for changes to deployment files

### Images Not Pulling

**Check**:
```bash
kubectl describe pod -n communities-app <pod-name>
```

If you see `ImagePullBackOff`:
1. Verify `ghcr-credentials` secret exists
2. Check PAT has `read:packages` scope
3. Confirm image exists in GHCR: https://github.com/orgs/<owner>/packages

### Deployment Not Updating

**Check**:
1. Flux reconciliation: `flux get kustomizations`
2. HelmRelease status: `flux get helmreleases -A`
3. Git sync status: `flux get sources git`

Force reconciliation:
```bash
flux reconcile kustomization communities-app --with-source
```

## Future Enhancements

### Consider Adding:

1. **Horizontal Pod Autoscaler (HPA)**
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: communities-api
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: communities-api
     minReplicas: 2
     maxReplicas: 10
     metrics:
       - type: Resource
         resource:
           name: cpu
           target:
             type: Utilization
             averageUtilization: 70
   ```

2. **PodDisruptionBudget (PDB)**
   ```yaml
   apiVersion: policy/v1
   kind: PodDisruptionBudget
   metadata:
     name: communities-api
   spec:
     minAvailable: 1
     selector:
       matchLabels:
         app: communities-api
   ```

3. **ConfigMap for Environment Variables**
   - Separate config from deployments
   - Easier to manage across environments

4. **Staging Environment**
   - Create `overlays/staging/`
   - Use different domains (e.g., `staging-app.plv.it.com`)
   - Deploy pre-release versions for testing

## Additional Resources

- [Release-Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Flux CD Documentation](https://fluxcd.io/flux/)
- [GHCR Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
