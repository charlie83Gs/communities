# Infrastructure Apps Structure

This directory contains individual applications structured for Flux CD multi-tenancy. Each app has its own base and overlays, and can be deployed independently via Flux Kustomizations.

## Directory Structure

```
apps/
├── external-secrets/     # External Secrets Operator (CRDs + Controller)
├── cnpg/                 # CloudNativePG Operator (PostgreSQL management)
├── postgres-clusters/    # PostgreSQL cluster instances
├── keycloak/            # Identity and Access Management
└── openfga/             # Authorization and Fine-Grained Access Control
```

## Dependency Order

Apps have dependencies on each other. Flux will retry failed reconciliations automatically.

### 1. **external-secrets** (No dependencies)
- Installs External Secrets Operator CRDs and controller
- Provides ClusterSecretStore and password generators
- **Must be installed first**

### 2. **cnpg** (No dependencies)
- Installs CloudNativePG Operator
- Provides PostgreSQL cluster management CRDs
- **Can be installed in parallel with external-secrets**

### 3. **postgres-clusters** (Depends on: cnpg, external-secrets)
- Creates PostgreSQL cluster instances:
  - `postgres-api` - API database
  - `postgres-keycloak` - Keycloak database
  - `postgres-openfga` - OpenFGA database
- Uses CNPG CRDs from cnpg app
- May initially fail if cnpg is not ready (will retry)

### 4. **keycloak** (Depends on: postgres-clusters)
- Deploys Keycloak via Helm
- Connects to `postgres-keycloak` cluster
- Includes production realm configuration
- May initially fail if database is not ready (will retry)

### 5. **openfga** (Depends on: postgres-clusters, external-secrets)
- Deploys OpenFGA authorization service
- Connects to `postgres-openfga` cluster
- Uses External Secrets for database password management
- May initially fail if database or secrets are not ready (will retry)

## Flux Kustomization Setup

Create one Flux Kustomization resource per app in your Flux repository:

### Example: external-secrets Kustomization

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: external-secrets
  namespace: flux-system
spec:
  interval: 5m
  path: ./infrastructure/apps/external-secrets/overlays/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: communities
  timeout: 5m
  wait: true
```

### Example: cnpg Kustomization

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: cnpg
  namespace: flux-system
spec:
  interval: 5m
  path: ./infrastructure/apps/cnpg/overlays/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: communities
  timeout: 5m
  wait: true
```

### Example: postgres-clusters Kustomization (with dependencies)

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: postgres-clusters
  namespace: flux-system
spec:
  interval: 5m
  path: ./infrastructure/apps/postgres-clusters/overlays/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: communities
  timeout: 10m
  wait: true
  # Optional: specify dependencies explicitly (Flux will wait for these)
  dependsOn:
    - name: cnpg
    - name: external-secrets
```

### Example: keycloak Kustomization (with dependencies)

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: keycloak
  namespace: flux-system
spec:
  interval: 5m
  path: ./infrastructure/apps/keycloak/overlays/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: communities
  timeout: 10m
  wait: true
  dependsOn:
    - name: postgres-clusters
```

### Example: openfga Kustomization (with dependencies)

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: openfga
  namespace: flux-system
spec:
  interval: 5m
  path: ./infrastructure/apps/openfga/overlays/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: communities
  timeout: 10m
  wait: true
  dependsOn:
    - name: postgres-clusters
    - name: external-secrets
```

## Retry Behavior

Flux automatically retries failed reconciliations. Apps will:
- Initially fail if dependencies are not ready
- Retry every `interval` period (e.g., 5m)
- Eventually succeed once dependencies are available

This approach is more resilient than strict ordering because:
- Apps can be deployed in any order
- Flux handles retry logic automatically
- No manual intervention needed
- Self-healing if dependencies are temporarily unavailable

## Health Checks

Use `wait: true` in Kustomizations to ensure Flux waits for resources to be ready before marking the reconciliation as successful.

## Testing Locally

Build and validate each app independently:

```bash
# Test external-secrets
kustomize build infrastructure/apps/external-secrets/overlays/production

# Test cnpg
kustomize build infrastructure/apps/cnpg/overlays/production

# Test postgres-clusters
kustomize build infrastructure/apps/postgres-clusters/overlays/production

# Test keycloak
kustomize build infrastructure/apps/keycloak/overlays/production

# Test openfga
kustomize build infrastructure/apps/openfga/overlays/production
```

## Migration from Old Structure

The old monolithic `infrastructure/overlays/production` has been split into individual apps. The old structure is still present for reference but should not be used.

## Development Environment

For development, create similar Kustomizations pointing to `overlays/development` paths with different configurations (e.g., localhost URLs, weaker passwords, disabled email verification).
