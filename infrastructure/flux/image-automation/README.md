# Image Automation Setup

These manifests should be added to the `communities-infra` repository to install the image automation controllers.

The controllers needed are:
1. image-reflector-controller - Scans container registries for new image tags
2. image-automation-controller - Updates manifests in Git when new images are detected

After adding to communities-infra repo, the ImageRepository, ImagePolicy, and ImageUpdateAutomation resources in this directory will work to automatically update our deployment manifests.
