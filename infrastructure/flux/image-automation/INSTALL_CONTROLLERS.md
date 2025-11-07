# Install Image Automation Controllers

## Quick Install (Recommended)

Run this command to install both controllers in your cluster:

```bash
flux install \
  --components-extra=image-reflector-controller,image-automation-controller \
  --export > /tmp/image-automation-controllers.yaml

kubectl apply -f /tmp/image-automation-controllers.yaml
```

## Or Add to communities-infra Repo

To make it permanent via GitOps, add to your `communities-infra` repository:

1. Export the manifests:
```bash
cd /path/to/communities-infra

flux install \
  --components-extra=image-reflector-controller,image-automation-controller \
  --export > clusters/production/image-automation-controllers.yaml
```

2. Commit and push:
```bash
git add clusters/production/image-automation-controllers.yaml
git commit -m "feat: add Flux image automation controllers"
git push
```

3. Wait for Flux to reconcile (automatic)

## Verification

After installation, verify the controllers are running:

```bash
# Check pods
kubectl get pods -n flux-system | grep image

# Should show:
# image-automation-controller-xxx   1/1     Running
# image-reflector-controller-xxx    1/1     Running

# Check CRDs
kubectl get crd | grep image

# Should show:
# imagepolicies.image.toolkit.fluxcd.io
# imagerepositories.image.toolkit.fluxcd.io
# imageupdateautomations.image.toolkit.fluxcd.io
```

## What's Already Configured

✅ SSH GitRepository with write access (uses flux-system credentials)
✅ ImageRepository resources for API and Frontend
✅ ImagePolicy resources with semver tracking
✅ ImageUpdateAutomation resource
✅ Deployment manifests with policy markers

Once the controllers are installed, everything will work automatically!

## Test the Setup

After installing controllers, force a reconciliation:

```bash
# Trigger image scan
flux reconcile image repository communities-api
flux reconcile image repository communities-frontend

# Check what images were found
flux get image repository
flux get image policy

# Check automation status
flux get image update
```

Within 10 minutes, Flux should detect the latest images and commit updates to your manifests.
