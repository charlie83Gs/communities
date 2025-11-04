# Keycloak Service Account Configuration

## Overview

The `share-app-backend` client uses a **service account** to call the Keycloak Admin REST API for user management operations (creating users, etc.).

This service account needs specific permissions to manage users in the `share-app` realm.

---

## ✅ Configuration as Code (Recommended)

The service account permissions are now configured **automatically** via `realm-export.json`.

### What's Configured

The realm export includes:

```json
{
  "users": [
    {
      "username": "service-account-share-app-backend",
      "enabled": true,
      "emailVerified": false,
      "serviceAccountClientId": "share-app-backend",
      "clientRoles": {
        "realm-management": [
          "manage-users",
          "view-users",
          "query-users",
          "query-groups"
        ]
      }
    }
  ]
}
```

### How It Works

1. When Keycloak starts with `--import-realm` flag (configured in `docker-compose.yml`)
2. It imports `keycloak/realm-export.json`
3. The service account user is created automatically
4. The required roles are assigned automatically
5. **No manual configuration needed!**

### Fresh Install (After Volume Reset)

If you recreate Docker volumes:

```bash
cd api
docker compose down -v  # Remove volumes
docker compose up -d    # Start fresh
```

The service account will be configured automatically on first start.

---

## 🔧 Manual Configuration (Legacy)

For existing Keycloak instances created **before** the service account was added to `realm-export.json`, use the configuration script:

```bash
cd api
bash scripts/configure-keycloak-service-account.sh
```

### When You Need This Script

- ✅ Upgrading from old version without service account in realm-export.json
- ✅ Keycloak instance was manually created without using realm-export.json
- ❌ Fresh install (script not needed)
- ❌ After recreating Docker volumes (script not needed)

---

## 📋 Verifying Configuration

### Check Service Account Exists

```bash
# Get admin token
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:8081/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin&grant_type=password&client_id=admin-cli" | jq -r '.access_token')

# Check service account user
curl -s -X GET "http://localhost:8081/admin/realms/share-app/users?username=service-account-share-app-backend" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.[0].username'

# Expected output: "service-account-share-app-backend"
```

### Check Service Account Roles

```bash
# Get backend client ID
BACKEND_CLIENT_ID=$(curl -s -X GET "http://localhost:8081/admin/realms/share-app/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.clientId=="share-app-backend") | .id')

# Get service account user ID
USER_ID=$(curl -s -X GET "http://localhost:8081/admin/realms/share-app/clients/$BACKEND_CLIENT_ID/service-account-user" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.id')

# Get realm-management client ID
REALM_MGMT=$(curl -s -X GET "http://localhost:8081/admin/realms/share-app/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.clientId=="realm-management") | .id')

# Check assigned roles
curl -s -X GET "http://localhost:8081/admin/realms/share-app/users/$USER_ID/role-mappings/clients/$REALM_MGMT" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.[] | .name'

# Expected output:
# "view-users"
# "manage-users"
# "query-users"
```

### Test Service Account Can Create Users

```bash
# Get service account token
TOKEN=$(curl -s -X POST "http://localhost:8081/realms/share-app/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=share-app-backend&client_secret=your-client-secret-change-in-production" | jq -r '.access_token')

# Try to create a test user
curl -v -X POST "http://localhost:8081/admin/realms/share-app/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "servicetest",
    "email": "servicetest@example.com",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "Test123!",
      "temporary": false
    }]
  }'

# Expected: HTTP 201 Created
```

---

## 🔑 Required Roles

| Role | Purpose |
|------|---------|
| `manage-users` | Create, update, delete users |
| `view-users` | View user details |
| `query-users` | Search and list users |
| `query-groups` | Search and list groups (optional, but recommended) |

These roles are from the `realm-management` client.

---

## 🐛 Troubleshooting

### Issue: HTTP 403 when creating users

**Symptom**: Backend returns "Failed to create account" with 403 error

**Cause**: Service account doesn't have required roles

**Solution**:
1. If fresh install, recreate volumes: `docker compose down -v && docker compose up -d`
2. If existing install, run: `bash scripts/configure-keycloak-service-account.sh`

### Issue: Service account user doesn't exist

**Symptom**: Script fails with "Service account user not found"

**Cause**: Client doesn't have `serviceAccountsEnabled: true`

**Solution**: Check `realm-export.json` line 64:
```json
"serviceAccountsEnabled": true
```

If missing, add it and recreate volumes.

### Issue: Realm export not being imported

**Symptom**: Fresh install doesn't have service account configured

**Cause**: Keycloak might be using existing database

**Solution**:
```bash
# Completely reset Keycloak
docker compose down -v
docker volume ls | grep keycloak  # Make sure volumes are gone
docker compose up -d keycloak
docker compose logs -f keycloak  # Watch for "Import finished successfully"
```

---

## 📚 References

- [Keycloak Service Accounts](https://www.keycloak.org/docs/26.3.5/server_admin/#_service_accounts)
- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/26.3.5/rest-api/)
- [Realm Export/Import](https://www.keycloak.org/docs/26.3.5/server_admin/#_export_import)

---

**Last Updated**: 2025-11-03
**Keycloak Version**: 26.3.5
**Status**: ✅ Configuration as Code Implemented
