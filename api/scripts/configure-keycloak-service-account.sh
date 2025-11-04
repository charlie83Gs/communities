#!/bin/bash

# Script to configure Keycloak service account for user management
#
# NOTE: This script is only needed for EXISTING Keycloak instances that were
# created before the service account roles were added to realm-export.json.
#
# For FRESH installs (after the realm-export.json was updated), this script
# is NOT needed - the service account will be configured automatically on import.
#
# If you recreated Docker volumes, this script is NOT needed.

set -e

echo "Configuring Keycloak service account for share-app-backend..."
echo "(Note: Not needed for fresh installs after realm-export.json was updated)"

# Get admin token from master realm
echo "Getting admin token..."
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:8081/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "ERROR: Failed to get admin token"
  echo "Make sure Keycloak is running on http://localhost:8081"
  exit 1
fi

echo "✓ Got admin token"

# Get share-app-backend client ID
echo "Finding share-app-backend client..."
BACKEND_CLIENT_ID=$(curl -s -X GET "http://localhost:8081/admin/realms/share-app/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.clientId=="share-app-backend") | .id')

if [ -z "$BACKEND_CLIENT_ID" ] || [ "$BACKEND_CLIENT_ID" = "null" ]; then
  echo "ERROR: share-app-backend client not found"
  exit 1
fi

echo "✓ Found client: $BACKEND_CLIENT_ID"

# Get the service account user for this client
echo "Finding service account user..."
SERVICE_ACCOUNT_USER=$(curl -s -X GET "http://localhost:8081/admin/realms/share-app/clients/$BACKEND_CLIENT_ID/service-account-user" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.id')

if [ -z "$SERVICE_ACCOUNT_USER" ] || [ "$SERVICE_ACCOUNT_USER" = "null" ]; then
  echo "ERROR: Service account user not found"
  echo "Make sure serviceAccountsEnabled is true for share-app-backend client"
  exit 1
fi

echo "✓ Found service account user: $SERVICE_ACCOUNT_USER"

# Get realm-management client ID
echo "Finding realm-management client..."
REALM_MGMT_CLIENT=$(curl -s -X GET "http://localhost:8081/admin/realms/share-app/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.[] | select(.clientId=="realm-management") | .id')

if [ -z "$REALM_MGMT_CLIENT" ] || [ "$REALM_MGMT_CLIENT" = "null" ]; then
  echo "ERROR: realm-management client not found"
  exit 1
fi

echo "✓ Found realm-management client: $REALM_MGMT_CLIENT"

# Get manage-users role
echo "Getting manage-users role..."
MANAGE_USERS_ROLE=$(curl -s -X GET "http://localhost:8081/admin/realms/share-app/clients/$REALM_MGMT_CLIENT/roles/manage-users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

ROLE_ID=$(echo "$MANAGE_USERS_ROLE" | jq -r '.id')
ROLE_NAME=$(echo "$MANAGE_USERS_ROLE" | jq -r '.name')

if [ -z "$ROLE_ID" ] || [ "$ROLE_ID" = "null" ]; then
  echo "ERROR: manage-users role not found"
  exit 1
fi

echo "✓ Found role: $ROLE_NAME ($ROLE_ID)"

# Assign role to service account
echo "Assigning manage-users role to service account..."
RESULT=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8081/admin/realms/share-app/users/$SERVICE_ACCOUNT_USER/role-mappings/clients/$REALM_MGMT_CLIENT" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[$MANAGE_USERS_ROLE]")

HTTP_CODE=$(echo "$RESULT" | tail -n 1)

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Successfully assigned manage-users role"
elif [ "$HTTP_CODE" = "409" ]; then
  echo "✓ Role already assigned (this is fine)"
else
  echo "ERROR: Failed to assign role (HTTP $HTTP_CODE)"
  echo "$RESULT"
  exit 1
fi

echo ""
echo "==================================="
echo "✓ Configuration complete!"
echo "==================================="
echo ""
echo "The share-app-backend service account now has permission to create and manage users."
echo "You can now test user signup:"
echo ""
echo "curl -X POST http://localhost:3000/api/auth/signup \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"Test123!\"}'"
echo ""
