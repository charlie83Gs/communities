# Flux Image Automation Setup Guide

## Overview

This setup enables automatic updates of container image tags in Kubernetes deployment manifests when new images are pushed to GitHub Container Registry (GHCR).

## Architecture

### Components Needed

1. **image-reflector-controller** - Scans GHCR for new image tags
2. **image-automation-controller** - Updates manifests and commits to Git

These controllers must be installed in the `communities-infra` repository.

### Resources in This Repository

1. **ImageRepository** - Defines which container registries to watch
2. **ImagePolicy** - Defines which tags to select (semver >=1.0.0)
3. **ImageUpdateAutomation** - Configures how and when to update manifests

## Installation Steps

### Step 1: Install Controllers in communities-infra Repo

Add the following to your `communities-infra` repository:

```bash
flux install \
  --components=image-reflector-controller,image-automation-controller \
  --export > clusters/production/flux-image-automation.yaml
```

Or manually add deployment manifests for both controllers.

### Step 2: Apply Resources in This Repo

The resources are already configured in:
- `infrastructure/flux/image-automation/image-repositories.yaml`
- `infrastructure/flux/image-automation/image-policies.yaml`
- `infrastructure/flux/image-automation/image-update-automation.yaml`

These will be applied automatically by Flux when committed to main.

### Step 3: Verify Deployment Markers

Deployment manifests must have image policy markers:

```yaml
spec:
  containers:
    - name: api
      image: ghcr.io/charlie83gs/communities-api:1.3.1 # {"$imagepolicy": "flux-system:communities-api"}
```

Already configured in:
- `infrastructure/apps/communities-app/base/api-deployment.yaml`
- `infrastructure/apps/communities-app/base/frontend-deployment.yaml`

## How It Works

1. **Release Process**:
   - Developer merges PR to main
   - Release Please creates release PR
   - Merging release PR triggers GitHub Actions
   - Docker images built and pushed to GHCR with semver tags

2. **Flux Automation**:
   - ImageRepository scans GHCR every 5 minutes
   - ImagePolicy evaluates new tags against semver rules
   - ImageUpdateAutomation updates deployment manifests
   - Flux commits changes back to Git with [ci skip]
   - Flux reconciles and deploys updated images

## Verification

### Check ImageRepository Status
```bash
kubectl get imagerepositories -n flux-system
kubectl describe imagerepository communities-api -n flux-system
```

### Check ImagePolicy Status
```bash
kubectl get imagepolicies -n flux-system
kubectl describe imagepolicy communities-api -n flux-system
```

### Check ImageUpdateAutomation Status
```bash
kubectl get imageupdateautomations -n flux-system
kubectl describe imageupdateautomation communities-app-images -n flux-system
```

### View Latest Detected Image
```bash
flux get image repository communities-api
flux get image policy communities-api
```

## Authentication for Private Registries

If your GHCR repositories are private, you need to configure authentication:

```bash
kubectl create secret docker-registry ghcr-image-pull \
  --namespace=flux-system \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<github-pat>
```

Then reference it in ImageRepository:

```yaml
spec:
  secretRef:
    name: ghcr-image-pull
```

## Troubleshooting

### Images Not Being Detected

```bash
kubectl logs -n flux-system -l app=image-reflector-controller
```

### Manifests Not Being Updated

```bash
kubectl logs -n flux-system -l app=image-automation-controller
```

### Check Git Write Access

The ImageUpdateAutomation needs write access to your Git repository. Verify the Git credentials secret exists:

```bash
kubectl get secret -n flux-system flux-system
```

## Migration from release-please extra-files

Previously, release-please tried to update manifests via `extra-files` configuration. This didn't work because:
- Paths outside package directories aren't supported in monorepos
- GitHub issue #2477 documents this limitation

Now:
- Release-please handles versioning only
- Flux handles manifest updates
- Clean separation of concerns
- Industry-standard GitOps workflow
