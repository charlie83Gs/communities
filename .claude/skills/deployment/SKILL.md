---
name: deployment
description: This skill teaches the agent how to manage application deployments using GitOps with Flux CD. MANDATORY - You MUST read this skill before modifying deployment manifests or managing releases.
---

# App Deployment Skill

## Purpose
This skill covers the deployment and release management of the Communities application using GitOps principles with Flux CD, GitHub Actions, and Kubernetes.

## When to Use This Skill
- Deploying application changes to the cluster
- Managing Flux CD manifests
- Troubleshooting deployment issues
- Viewing application logs
- Creating releases via GitHub workflows
- Verifying deployment health
- Managing pull requests for deployment changes

## Repository Structure

### Main Repository: communities
**URL:** https://github.com/charlie83Gs/communities

This is the **current working directory** and contains:
- Application source code (`/api` and `/frontend`)
- Flux CD manifests for the application (`/deploy/flux/`)
- Kubernetes resource manifests
- GitHub Actions workflows

### Infrastructure Repository: communities-infra
**URL:** https://github.com/charlie83Gs/communities-infra

Contains:
- Flux CD bootstrap manifests
- Infrastructure-level configurations
- Base Flux controllers setup

**Note:** You will primarily work with the `communities` repository. The `communities-infra` repository is managed separately for infrastructure concerns.

## Available Tools

### 1. Git
- Commit and push deployment manifest changes
- Create feature branches for deployment updates
- View commit history
- Manage repository state

### 2. GitHub CLI (`gh`)
- **Already authenticated** to the account that owns the repositories
- Create and manage pull requests
- View and interact with GitHub workflow runs
- Check workflow status
- Trigger workflows
- View issues and discussions

### 3. Kubectl
- **Already connected** to the deployment cluster
- Verify deployment success
- Read pod logs
- Restart Flux synchronizations
- Check resource status
- Describe resources for debugging
- Execute commands in pods

## GitOps Workflow with Flux CD

### How Flux CD Works

1. **Repository Monitoring**: Flux watches the Git repository for changes
2. **Automatic Sync**: When changes are detected, Flux applies them to the cluster
3. **Reconciliation**: Flux continuously ensures cluster state matches Git state
4. **Image Updates**: Flux can automatically update image tags when new versions are built

### Deployment Flow

```
Code Change → GitHub Push → GitHub Actions Build → Docker Image
                                                         ↓
Git Repository ← Flux Updates Manifest ← Container Registry
      ↓
   Flux CD
      ↓
  Kubernetes Cluster
```

## Common Deployment Tasks

### 1. Verify Deployment Status

```bash
# Check if Flux is synced
flux get sources git

# Check kustomizations status
flux get kustomizations

# Check specific application pods
kubectl get pods -n communities-app

# Describe a pod for detailed status
kubectl describe pod <pod-name> -n communities-app

# Check deployment status
kubectl get deployments -n communities-app
```

### 2. View Application Logs

```bash
# Get logs from a specific pod
kubectl logs <pod-name> -n communities-app

# Follow logs in real-time
kubectl logs -f <pod-name> -n communities-app

# Get logs from all pods in a deployment
kubectl logs -l app=communities-api -n communities-app

# Get logs from previous container instance (if crashed)
kubectl logs <pod-name> -n communities-app --previous
```

### 3. Force Flux Reconciliation

```bash
# Force Flux to check for Git changes immediately
flux reconcile source git communities

# Force Flux to reconcile a specific kustomization
flux reconcile kustomization communities-app

# Suspend and resume to force full reconciliation
flux suspend kustomization communities-app
flux resume kustomization communities-app
```

### 4. Check Flux Synchronization Status

```bash
# View all Flux resources
flux get all

# Check specific GitRepository source
flux get sources git communities

# View kustomization with details
kubectl get kustomizations.kustomize.toolkit.fluxcd.io -n flux-system

# Describe kustomization for errors
kubectl describe kustomization communities-app -n flux-system
```

### 5. Working with GitHub Workflows

```bash
# List recent workflow runs
gh run list --limit 10

# View specific workflow run
gh run view <run-id>

# Watch a workflow run in real-time
gh run watch <run-id>

# List workflows
gh workflow list

# Trigger a workflow (if configured for manual dispatch)
gh workflow run <workflow-name>

# View workflow run logs
gh run view <run-id> --log
```

### 6. Managing Pull Requests

```bash
# Create a pull request for deployment changes
gh pr create --title "Deploy: update API configuration" \
  --body "Updates API configuration for production" \
  --base main

# List open pull requests
gh pr list

# View pull request details
gh pr view <pr-number>

# Check PR status and checks
gh pr checks <pr-number>

# Merge a pull request
gh pr merge <pr-number> --squash

# View PR diff
gh pr diff <pr-number>
```

### 7. Troubleshooting Failed Deployments

```bash
# Check events in the namespace
kubectl get events -n communities-app --sort-by='.lastTimestamp'

# Check pod status with reason
kubectl get pods -n communities-app -o wide

# Get detailed pod information
kubectl describe pod <pod-name> -n communities-app

# Check if images are pulling correctly
kubectl get pods -n communities-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[*].state}{"\n"}{end}'

# Check Flux logs
kubectl logs -n flux-system deployment/source-controller
kubectl logs -n flux-system deployment/kustomize-controller

# Check for ImagePolicy/ImageRepository issues
flux get image repository
flux get image policy
```

## Flux Manifest Structure

### Typical Flux Directory Layout

```
deploy/flux/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── secret.yaml (sealed or external-secrets)
├── overlays/
│   ├── dev/
│   │   └── kustomization.yaml
│   ├── staging/
│   │   └── kustomization.yaml
│   └── prod/
│       └── kustomization.yaml
└── flux-system/
    ├── gotk-components.yaml
    ├── gotk-sync.yaml
    └── kustomization.yaml
```

### Example Kustomization for Flux

```yaml
# deploy/flux/overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namespace: communities-app

images:
  - name: ghcr.io/charlie83gs/communities-api
    newTag: main-abc123  # Updated by Flux or CI/CD

configMapGenerator:
  - name: api-config
    literals:
      - NODE_ENV=production
      - LOG_LEVEL=info

secretGenerator:
  - name: api-secrets
    envs:
      - secrets.env
```

### Flux GitRepository Resource

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: communities
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/charlie83Gs/communities
  ref:
    branch: main
  secretRef:
    name: flux-system
```

### Flux Kustomization Resource

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: communities-app
  namespace: flux-system
spec:
  interval: 5m
  path: ./deploy/flux/overlays/prod
  prune: true
  sourceRef:
    kind: GitRepository
    name: communities
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: communities-api
      namespace: communities-app
    - apiVersion: apps/v1
      kind: Deployment
      name: communities-frontend
      namespace: communities-app
```

## Image Update Automation

### ImageRepository (watches container registry)

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: communities-api
  namespace: flux-system
spec:
  image: ghcr.io/charlie83gs/communities-api
  interval: 1m
  secretRef:
    name: ghcr-auth
```

### ImagePolicy (defines version strategy)

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: communities-api
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: communities-api
  policy:
    semver:
      range: 1.x.x  # or use 'alphabetical' for branch-based tags
```

### ImageUpdateAutomation (commits updates to Git)

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageUpdateAutomation
metadata:
  name: communities-app
  namespace: flux-system
spec:
  interval: 1m
  sourceRef:
    kind: GitRepository
    name: communities
  git:
    checkout:
      ref:
        branch: main
    commit:
      author:
        email: fluxcd@users.noreply.github.com
        name: Flux CD
      messageTemplate: 'Update image {{range .Updated.Images}}{{println .}}{{end}}'
    push:
      branch: main
  update:
    path: ./deploy/flux/overlays/prod
    strategy: Setters
```

## Deployment Verification Checklist

After making deployment changes:

1. **Verify Flux Sync**
   ```bash
   flux get sources git
   flux get kustomizations
   ```

2. **Check Pod Status**
   ```bash
   kubectl get pods -n communities-app
   ```

3. **Verify Image Version**
   ```bash
   kubectl get deployment communities-api -n communities-app -o jsonpath='{.spec.template.spec.containers[0].image}'
   ```

4. **Check Application Logs**
   ```bash
   kubectl logs -l app=communities-api -n communities-app --tail=50
   ```

5. **Test Application Health**
   ```bash
   kubectl port-forward svc/communities-api 8080:80 -n communities-app
   curl http://localhost:8080/health
   ```

6. **Verify GitHub Workflow**
   ```bash
   gh run list --limit 5
   gh run view <run-id>
   ```

## Common Issues and Solutions

### Issue: Flux Not Syncing

**Symptoms:** Changes pushed to Git but not applied to cluster

**Solution:**
```bash
# Check Flux system status
kubectl get pods -n flux-system

# Check GitRepository source
flux get sources git communities

# Force reconciliation
flux reconcile source git communities
flux reconcile kustomization communities-app

# Check for errors
kubectl logs -n flux-system deployment/source-controller
```

### Issue: Image Pull Errors

**Symptoms:** Pods in `ImagePullBackOff` state

**Solution:**
```bash
# Check image pull secrets
kubectl get secrets -n communities-app

# Verify image exists in registry
# (via GitHub package page or Docker Hub)

# Check pod events
kubectl describe pod <pod-name> -n communities-app

# Verify image name in deployment
kubectl get deployment communities-api -n communities-app -o yaml | grep image:
```

### Issue: Pod CrashLoopBackOff

**Symptoms:** Pods continuously restarting

**Solution:**
```bash
# Check pod logs
kubectl logs <pod-name> -n communities-app

# Check previous container logs
kubectl logs <pod-name> -n communities-app --previous

# Check pod events
kubectl describe pod <pod-name> -n communities-app

# Check liveness/readiness probes
kubectl get pod <pod-name> -n communities-app -o yaml | grep -A 5 "livenessProbe\|readinessProbe"
```

### Issue: Deployment Stuck in Progress

**Symptoms:** Deployment shows old and new pods running

**Solution:**
```bash
# Check deployment status
kubectl rollout status deployment/communities-api -n communities-app

# View rollout history
kubectl rollout history deployment/communities-api -n communities-app

# Restart rollout
kubectl rollout restart deployment/communities-api -n communities-app

# If needed, rollback
kubectl rollout undo deployment/communities-api -n communities-app
```

## Best Practices

### 1. Git Workflow
- Always create feature branches for deployment changes
- Use descriptive commit messages (e.g., "deploy: update API image to v1.2.3")
- Create PRs for deployment manifest changes
- Tag releases for production deployments

### 2. Flux CD Management
- Monitor Flux sync status regularly
- Set appropriate reconciliation intervals (balance freshness vs. API load)
- Use health checks in Kustomization resources
- Keep Flux components updated

### 3. Verification
- Always verify deployments after changes
- Check application logs for errors
- Test application functionality after deployment
- Monitor resource usage (CPU, memory)

### 4. Rollback Strategy
- Keep previous deployment versions
- Test rollback procedures
- Document rollback steps for critical services
- Use `kubectl rollout undo` for quick rollbacks

### 5. Security
- Never commit secrets in plain text
- Use Sealed Secrets or External Secrets Operator
- Rotate image pull secrets regularly
- Use RBAC for cluster access

### 6. Monitoring
- Set up alerts for deployment failures
- Monitor Flux controller health
- Track image update frequency
- Monitor pod restart counts

## Emergency Procedures

### Quick Rollback

```bash
# Rollback deployment to previous version
kubectl rollout undo deployment/communities-api -n communities-app

# Rollback to specific revision
kubectl rollout undo deployment/communities-api -n communities-app --to-revision=2

# Verify rollback
kubectl rollout status deployment/communities-api -n communities-app
```

### Suspend Flux (for emergency changes)

```bash
# Suspend Flux automation
flux suspend kustomization communities-app

# Make manual changes to cluster
kubectl apply -f emergency-fix.yaml

# Resume Flux (will override manual changes)
flux resume kustomization communities-app
```

### Scale Deployment

```bash
# Scale down to zero (emergency shutdown)
kubectl scale deployment communities-api -n communities-app --replicas=0

# Scale up
kubectl scale deployment communities-api -n communities-app --replicas=3

# Autoscaling (if HPA is configured)
kubectl autoscale deployment communities-api -n communities-app --min=2 --max=10 --cpu-percent=80
```

## Integration with CI/CD

### GitHub Actions Workflow Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t ghcr.io/charlie83gs/communities-api:${{ github.sha }} ./api

      - name: Push to registry
        run: docker push ghcr.io/charlie83gs/communities-api:${{ github.sha }}

      - name: Update Flux manifest
        run: |
          cd deploy/flux/overlays/prod
          kustomize edit set image ghcr.io/charlie83gs/communities-api:${{ github.sha }}

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git commit -am "deploy: update API to ${{ github.sha }}"
          git push
```

### Verifying Workflow Success

```bash
# Check if workflow completed
gh run list --workflow="Build and Deploy" --limit 1

# View workflow details
gh run view --log

# Check if deployment was triggered
flux get kustomizations
kubectl get pods -n communities-app
```

## Related Skills
- `git` - Version control for deployment manifests
- `api-db` - Database migrations in deployment context
- `api-config` - Managing application configuration

## Additional Resources

### Flux CD Documentation
- Official Docs: https://fluxcd.io/docs/
- GitHub: https://github.com/fluxcd/flux2

### Kubectl Cheat Sheet
- Official: https://kubernetes.io/docs/reference/kubectl/cheatsheet/

### GitHub CLI Documentation
- Official: https://cli.github.com/manual/

## Quick Reference Commands

```bash
# === Flux CD ===
flux get all                              # View all Flux resources
flux reconcile source git <name>          # Force Git sync
flux reconcile kustomization <name>       # Force kustomization sync
flux logs --follow                        # Watch Flux logs

# === Kubectl ===
kubectl get pods -n <namespace>           # List pods
kubectl logs <pod> -n <namespace>         # View logs
kubectl describe pod <pod> -n <namespace> # Detailed pod info
kubectl get events -n <namespace>         # List events
kubectl rollout restart deployment/<name> # Restart deployment

# === GitHub CLI ===
gh run list                               # List workflow runs
gh run watch                              # Watch latest run
gh pr create                              # Create pull request
gh pr merge                               # Merge pull request

# === Debugging ===
kubectl get pods -n <namespace> -o wide   # Pods with node info
kubectl top pods -n <namespace>           # Resource usage
kubectl exec -it <pod> -n <namespace> -- /bin/sh  # Shell into pod
kubectl port-forward <pod> <local>:<remote>        # Port forward
```
