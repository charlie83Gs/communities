# DigitalOcean LoadBalancer Configuration

This folder contains the DigitalOcean LoadBalancer configuration that provides external access to the Traefik ingress controller.

## Architecture

The LoadBalancer is separated from the Traefik application for easier maintenance:

- **Network Layer** (this folder): Manages the DigitalOcean LoadBalancer resource
- **Application Layer** (`apps/traefik`): Manages the Traefik ingress controller

## Configuration

### LoadBalancer Settings

- **Name**: `traefik-lb`
- **Protocol**: HTTP with PROXY protocol enabled
- **Algorithm**: Round robin
- **Health Check**: HTTP on `/ping` endpoint
- **Ports**:
  - `80`: HTTP traffic (web)
  - `443`: HTTPS traffic (websecure)

### PROXY Protocol

PROXY protocol is enabled to preserve the real client IP address when forwarding requests. This requires Traefik to be configured to parse PROXY protocol headers (already configured in `apps/traefik`).

### Target Service

The LoadBalancer targets the Traefik service using these selectors:
```yaml
selector:
  app.kubernetes.io/name: traefik
  app.kubernetes.io/instance: traefik
```

## Deployment

### Base (Development)
```bash
kubectl apply -k infrastructure/apps/network/digitalocean-loadbalancer/base/
```

### Production
```bash
kubectl apply -k infrastructure/apps/network/digitalocean-loadbalancer/overlays/production/
```

### Flux CD (Automated - Recommended)
Flux will automatically deploy this when `communities-network-loadbalancer` Kustomization is applied.
The LoadBalancer will be deployed after Traefik is ready (dependency managed by Flux).

## Getting the LoadBalancer IP

After deployment, get the external IP:
```bash
kubectl get svc traefik-loadbalancer -n traefik
```

Use this IP to configure DNS records:
- `auth.plv.it.com` → LoadBalancer IP
- `openfga.plv.it.com` → LoadBalancer IP

## Maintenance

To modify LoadBalancer settings:
1. Edit `base/loadbalancer.yaml`
2. Apply changes: `kubectl apply -k infrastructure/apps/network/digitalocean-loadbalancer/base/`
   - Or commit changes and let Flux CD sync automatically

Common modifications:
- Change algorithm (round_robin, least_connections)
- Adjust health check settings
- Add/remove ports
- Modify PROXY protocol settings
