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

log_info "Deploying infrastructure for environment: $ENVIRONMENT"

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl first."
    exit 1
fi

if ! command -v flux &> /dev/null; then
    log_warn "flux CLI not found. Some features may not be available."
fi

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

log_info "Prerequisites check passed ✓"

# Production safety check
if [ "$ENVIRONMENT" = "production" ]; then
    log_warn "⚠️  PRODUCTION DEPLOYMENT ⚠️"
    log_warn "Please ensure you have updated the following files:"
    log_warn "  - overlays/production/cnpg/secrets.yaml"
    log_warn "  - overlays/production/keycloak/secrets.yaml"
    log_warn "  - overlays/production/keycloak/helmrelease-patch.yaml"
    log_warn "  - overlays/production/keycloak/realm-configmap-patch.yaml"
    log_warn "  - overlays/production/openfga/secrets.yaml"
    echo ""
    read -p "Have you updated all production secrets? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_error "Deployment cancelled. Please update secrets first."
        exit 1
    fi
fi

# Install Flux (if needed)
if command -v flux &> /dev/null; then
    if ! kubectl get namespace flux-system &> /dev/null; then
        log_info "Installing Flux..."
        flux install
        log_info "Flux installed successfully ✓"
    else
        log_info "Flux already installed ✓"
    fi
fi

# Apply the infrastructure
log_info "Applying infrastructure manifests..."
kubectl apply -k overlays/$ENVIRONMENT

log_info "Deployment applied successfully ✓"

# Wait for CNPG clusters
log_info "Waiting for PostgreSQL clusters to be ready..."
log_info "This may take several minutes..."

for cluster in postgres-api postgres-keycloak postgres-openfga; do
    log_info "Waiting for $cluster..."
    if kubectl wait --for=condition=Ready cluster/$cluster -n share-app --timeout=600s; then
        log_info "$cluster is ready ✓"
    else
        log_error "$cluster failed to become ready"
        log_info "Check logs with: kubectl logs -n share-app $cluster-1"
    fi
done

# Wait for Keycloak
if command -v flux &> /dev/null; then
    log_info "Waiting for Keycloak HelmRelease..."
    flux reconcile helmrelease keycloak -n flux-system --timeout=5m
    log_info "Keycloak deployed successfully ✓"
else
    log_info "Waiting for Keycloak pods..."
    kubectl rollout status deployment/keycloak -n share-app --timeout=300s || true
fi

# Wait for OpenFGA
log_info "Waiting for OpenFGA migration..."
if kubectl wait --for=condition=complete job/openfga-migrate -n share-app --timeout=300s; then
    log_info "OpenFGA migration completed ✓"
else
    log_error "OpenFGA migration failed"
    log_info "Check logs with: kubectl logs -n share-app job/openfga-migrate"
fi

log_info "Waiting for OpenFGA deployment..."
if kubectl rollout status deployment/openfga -n share-app --timeout=300s; then
    log_info "OpenFGA deployed successfully ✓"
else
    log_error "OpenFGA deployment failed"
    log_info "Check logs with: kubectl logs -n share-app -l app=openfga"
fi

# Print access information
echo ""
log_info "========================================="
log_info "Deployment Complete!"
log_info "========================================="
echo ""

if [ "$ENVIRONMENT" = "development" ]; then
    log_info "Access services via port-forward:"
    echo ""
    echo "  Keycloak Admin Console:"
    echo "    kubectl port-forward -n share-app svc/keycloak 8081:80"
    echo "    URL: http://localhost:8081"
    echo "    Username: admin"
    echo "    Password: admin"
    echo ""
    echo "  OpenFGA Playground:"
    echo "    kubectl port-forward -n share-app svc/openfga 3001:3001"
    echo "    URL: http://localhost:3001"
    echo ""
    echo "  OpenFGA HTTP API:"
    echo "    kubectl port-forward -n share-app svc/openfga 8080:8080"
    echo "    URL: http://localhost:8080"
    echo ""
    echo "  PostgreSQL (API):"
    echo "    kubectl port-forward -n share-app svc/postgres-api-rw 5432:5432"
    echo "    Connection: postgresql://api_user:api_password@localhost:5432/api_db"
    echo ""
else
    log_info "Production services:"
    echo ""
    echo "  Keycloak:"
    echo "    URL: https://auth.yourdomain.com (configured in helmrelease-patch.yaml)"
    echo ""
    echo "  OpenFGA:"
    echo "    Internal: openfga.share-app.svc.cluster.local:8080"
    echo ""
fi

log_info "Check all resources:"
echo "  kubectl get all -n share-app"
echo "  kubectl get clusters -n share-app"
if command -v flux &> /dev/null; then
    echo "  flux get all -n flux-system"
fi

echo ""
log_info "Deployment complete! 🎉"
