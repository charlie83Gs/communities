# Kustomize build commands

# Build development overlay and save to generated.yaml
kustomize-dev:
    kustomize build infrastructure/overlays/development > infrastructure/overlays/development/generated.yaml
    @echo "Development manifests generated at infrastructure/overlays/development/generated.yaml"

# Build production overlay and save to generated.yaml
kustomize-prod:
    kustomize build infrastructure/overlays/production > infrastructure/overlays/production/generated.yaml
    @echo "Production manifests generated at infrastructure/overlays/production/generated.yaml"

# Build both development and production overlays
kustomize-all: kustomize-dev kustomize-prod
    @echo "All manifests generated successfully"

# Clean generated manifests
kustomize-clean:
    rm -f infrastructure/overlays/development/generated.yaml
    rm -f infrastructure/overlays/production/generated.yaml
    @echo "Generated manifests cleaned"

# View development manifests (without saving)
kustomize-view-dev:
    kustomize build infrastructure/overlays/development

# View production manifests (without saving)
kustomize-view-prod:
    kustomize build infrastructure/overlays/production
