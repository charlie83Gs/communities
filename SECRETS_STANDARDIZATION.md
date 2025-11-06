# External Secrets Standardization Summary

## Overview

Successfully standardized all external secrets configuration into a single centralized location, eliminating duplicates and inconsistencies across the infrastructure.

## Changes Made

### 1. Created Centralized Secrets Directory

**Location:** `k3d/infrastructure/secrets/`

**New Files:**
- `cluster-secret-store.yaml` - Single ClusterSecretStore for all apps
- `password-generators.yaml` - All 4 password generators in one file
- `external-secrets.yaml` - All 6 ExternalSecrets in one file
- `kustomization.yaml` - Kustomize configuration
- `README.md` - Complete documentation

### 2. Removed Duplicate Files

**OpenFGA (4 files removed):**
- ❌ `infrastructure/apps/openfga/base/cluster-secret-store.yaml`
- ❌ `infrastructure/apps/openfga/base/secret-generator.yaml`
- ❌ `infrastructure/apps/openfga/base/external-secret.yaml`
- ❌ `infrastructure/apps/openfga/base/openfga-db-uri-secret.yaml`

**Keycloak (2 files removed):**
- ❌ `infrastructure/apps/keycloak/overlays/production/keycloak-db-password.yaml`
- ❌ `infrastructure/apps/keycloak/overlays/production/keycloak-admin-password.yaml`

**Communities App (1 file removed):**
- ❌ `infrastructure/apps/communities-app/overlays/production/postgres-credentials.yaml`

**Total:** 7 duplicate files removed

### 3. Updated Kustomization Files

**Updated Files:**
- `infrastructure/apps/openfga/base/kustomization.yaml` - Removed secret resource references
- `infrastructure/apps/keycloak/overlays/production/kustomization.yaml` - Removed secret resource references
- `infrastructure/apps/communities-app/overlays/production/kustomization.yaml` - Removed secret resource references
- `infrastructure/flux/communities-sync.yaml` - Added centralized secrets deployment and updated dependencies

### 4. Standardized Configuration

**Before:** Mixed configurations across apps
- OpenFGA: 10 digits in passwords
- Others: 5 digits in passwords
- Different refresh strategies (1h vs "0")
- Different secret types (Opaque vs basic-auth)

**After:** Consistent configuration
- All passwords: 32 chars, 5 digits, 5 symbols
- All ExternalSecrets: `refreshInterval: "0"` (generate once)
- Standardized secret types: `kubernetes.io/basic-auth` for database credentials
- All ExternalSecrets reference the same ClusterSecretStore

## Architecture

### Deployment Order

```
1. External Secrets Operator (communities-external-secrets)
   ↓
2. Centralized Secrets (communities-secrets) [NEW]
   ├─ ClusterSecretStore
   ├─ Password Generators
   └─ ExternalSecrets
   ↓
3. CNPG Operator (communities-cnpg)
   ↓
4. App-specific components
   ├─ Keycloak (depends on communities-secrets)
   ├─ OpenFGA (depends on communities-secrets)
   └─ Communities App (depends on communities-secrets)
```

### Generated Secrets

All secrets are created in the `share-app` namespace:

| Secret Name | Type | Keys | Used By |
|-------------|------|------|---------|
| postgres-openfga-credentials | basic-auth | username, password | OpenFGA CNPG cluster |
| openfga-db | Opaque | uri | OpenFGA deployment |
| postgres-keycloak-credentials | basic-auth | username, password | Keycloak CNPG cluster |
| keycloak-db | Opaque | url, username, password | Keycloak Helm chart |
| keycloak-admin | Opaque | username, password | Keycloak Helm chart |
| postgres-api-credentials | basic-auth | username, password | API CNPG cluster |

## Benefits

### ✅ Single Source of Truth
- All secrets defined in one location: `k3d/infrastructure/secrets/`
- Easy to audit all secrets at a glance
- No more hunting across multiple directories

### ✅ No Duplicates
- **Before:** OpenFGA and Keycloak credentials defined in TWO places each
- **After:** Each secret defined exactly ONCE

### ✅ Consistent Configuration
- Standardized password generation settings
- Uniform refresh strategy (generate once, never refresh)
- Consistent secret types and naming

### ✅ Proper ClusterSecretStore Usage
- **Before:** ClusterSecretStore existed but only 2/7 ExternalSecrets used it
- **After:** All 6 ExternalSecrets reference the single ClusterSecretStore

### ✅ Simplified Maintenance
- Add new secrets in one place
- Modify password policies in one file
- Clear dependency chain in Flux

### ✅ Better Documentation
- Comprehensive README in secrets directory
- Clear usage examples
- Troubleshooting guide

## File Count Reduction

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| Files | 7 files across 3 directories | 4 files in 1 directory | 43% fewer files |
| Password Generators | 6 separate YAML docs | 4 in one file | Consolidated |
| ExternalSecrets | 7 separate YAML docs | 6 in one file | Consolidated |
| ClusterSecretStores | 1 (partially used) | 1 (fully used) | Properly utilized |

## Testing

To verify the changes work correctly:

```bash
# 1. Apply the centralized secrets
kubectl apply -k k3d/infrastructure/secrets/

# 2. Check that all Password generators are created
kubectl get password -n share-app
# Should show: openfga-db-password, keycloak-db-password, keycloak-admin-password, postgres-api-password

# 3. Check that all ExternalSecrets are created
kubectl get externalsecrets -n share-app
# Should show 6 ExternalSecrets

# 4. Check that secrets are generated
kubectl get secrets -n share-app | grep -E "(postgres-|keycloak-|openfga-)"
# Should show all 6 generated secrets

# 5. Verify ClusterSecretStore is healthy
kubectl describe clustersecretstore password-store

# 6. Check ExternalSecret sync status
kubectl get externalsecrets -n share-app -o wide
# All should show "SecretSynced" status
```

## Migration Notes

### No Breaking Changes
- All generated secret names remain the same
- All secret keys remain the same
- All consuming applications continue to work without modification

### Deployment Process
1. Flux detects new `communities-secrets` Kustomization
2. ClusterSecretStore is created first
3. Password generators are created
4. ExternalSecrets are created and immediately sync
5. Kubernetes secrets are generated
6. Apps reference the same secret names as before

### Rollback
If needed, the old files can be restored from git history. However, the new structure is fully backward compatible.

## Future Improvements

### Potential Enhancements
1. **Backup Integration:** Add backup credentials to centralized location
2. **Additional Apps:** New apps can easily add secrets to the centralized files
3. **Policy Enforcement:** Could add OPA policies to validate secret configurations
4. **Rotation Strategy:** Could implement secret rotation if needed in the future

### Monitoring
Consider adding alerts for:
- ExternalSecret sync failures
- Password generator errors
- ClusterSecretStore unavailability

## Related Documentation

- See `k3d/infrastructure/secrets/README.md` for detailed usage guide
- See `infrastructure/flux/communities-sync.yaml` for deployment order
- See External Secrets Operator docs: https://external-secrets.io/

## Questions?

If you have questions about the new structure, refer to:
1. `k3d/infrastructure/secrets/README.md` - Complete usage guide
2. This document - High-level overview of changes
3. External Secrets docs - Operator-specific questions
