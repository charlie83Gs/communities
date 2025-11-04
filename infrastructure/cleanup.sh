#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is specified
if [ -z "$1" ]; then
    log_error "Usage: $0 <development|production>"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Invalid environment. Use 'development' or 'production'"
    exit 1
fi

log_warn "⚠️  CLEANUP WARNING ⚠️"
log_warn "This will delete ALL resources for environment: $ENVIRONMENT"
log_warn "This includes:"
log_warn "  - PostgreSQL clusters (with all data)"
log_warn "  - Keycloak deployment (with all realms and users)"
log_warn "  - OpenFGA deployment (with all authorization data)"
log_warn "  - All associated secrets and configmaps"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    log_error "⚠️  PRODUCTION ENVIRONMENT ⚠️"
    log_warn "You are about to delete production resources!"
    echo ""
    read -p "Type 'DELETE PRODUCTION' to confirm: " confirm
    if [ "$confirm" != "DELETE PRODUCTION" ]; then
        log_error "Cleanup cancelled."
        exit 1
    fi
else
    read -p "Type 'yes' to confirm cleanup: " confirm
    if [ "$confirm" != "yes" ]; then
        log_error "Cleanup cancelled."
        exit 1
    fi
fi

# Check prerequisites
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl first."
    exit 1
fi

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

log_info "Starting cleanup for environment: $ENVIRONMENT"

# Delete the kustomization (this will remove most resources)
log_info "Deleting infrastructure manifests..."
kubectl delete -k overlays/$ENVIRONMENT --ignore-not-found=true

# Delete PostgreSQL clusters explicitly (to ensure they're removed)
log_info "Deleting PostgreSQL clusters..."
kubectl delete cluster postgres-api -n share-app --ignore-not-found=true
kubectl delete cluster postgres-keycloak -n share-app --ignore-not-found=true
kubectl delete cluster postgres-openfga -n share-app --ignore-not-found=true

# Delete PVCs (optional, uncomment if you want to delete data volumes)
# log_warn "Deleting Persistent Volume Claims (data will be lost)..."
# kubectl delete pvc -n share-app --all

# Delete jobs
log_info "Deleting jobs..."
kubectl delete job openfga-migrate -n share-app --ignore-not-found=true

# Delete secrets
log_info "Deleting secrets..."
kubectl delete secret postgres-api-credentials -n share-app --ignore-not-found=true
kubectl delete secret postgres-keycloak-credentials -n share-app --ignore-not-found=true
kubectl delete secret postgres-openfga-credentials -n share-app --ignore-not-found=true
kubectl delete secret keycloak-admin -n share-app --ignore-not-found=true
kubectl delete secret keycloak-db -n share-app --ignore-not-found=true
kubectl delete secret openfga-db -n share-app --ignore-not-found=true

if [ "$ENVIRONMENT" = "production" ]; then
    kubectl delete secret backup-credentials -n share-app --ignore-not-found=true
fi

# Wait for resources to be deleted
log_info "Waiting for resources to be fully deleted..."
sleep 10

# Check if namespace is empty
REMAINING=$(kubectl get all -n share-app 2>/dev/null | wc -l)
if [ "$REMAINING" -le 1 ]; then
    log_info "All resources deleted successfully ✓"

    read -p "Delete the share-app namespace? (yes/no): " delete_ns
    if [ "$delete_ns" = "yes" ]; then
        kubectl delete namespace share-app --ignore-not-found=true
        log_info "Namespace deleted ✓"
    fi
else
    log_warn "Some resources may still exist in share-app namespace"
    log_info "Check with: kubectl get all -n share-app"
fi

echo ""
log_info "========================================="
log_info "Cleanup Complete!"
log_info "========================================="
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    log_warn "Note: Production backups in S3 are NOT deleted."
    log_warn "You may want to clean them up manually if needed."
fi

log_info "To redeploy, run: ./deploy.sh $ENVIRONMENT"
