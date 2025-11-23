import jwksClient from 'jwks-rsa';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  jwksUri: string;
  issuer: string;
  adminUrl: string;
  // Admin (service account) client used for Admin REST API calls
  adminRealm: string;
  adminClientId: string;
  adminClientSecret: string;
  // Optional: allow multiple audiences (e.g., frontend and backend clients)
  // If empty, defaults to [clientId]
  allowedAudiences?: string[];
}

export const keycloakConfig: KeycloakConfig = {
  url: process.env.KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.KEYCLOAK_REALM || 'share-app',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'share-app-backend',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  jwksUri:
    process.env.KEYCLOAK_JWKS_URI ||
    'http://localhost:8081/realms/share-app/protocol/openid-connect/certs',
  issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8081/realms/share-app',
  adminUrl: `${process.env.KEYCLOAK_URL || 'http://localhost:8081'}/admin/realms/${process.env.KEYCLOAK_REALM || 'share-app'}`,
  // Defaults for Admin API service account: prefer using the application realm
  adminRealm: process.env.KEYCLOAK_ADMIN_REALM || process.env.KEYCLOAK_REALM || 'share-app',
  adminClientId:
    process.env.KEYCLOAK_ADMIN_CLIENT_ID || process.env.KEYCLOAK_CLIENT_ID || 'share-app-backend',
  adminClientSecret:
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || process.env.KEYCLOAK_CLIENT_SECRET || '',
  // Accept tokens issued for any of these audiences (comma-separated)
  allowedAudiences: (process.env.KEYCLOAK_ALLOWED_AUDIENCES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

// JWKS Client for token verification (compatible with Keycloak 26.3.5)
export const jwksClientInstance = jwksClient({
  jwksUri: keycloakConfig.jwksUri,
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

/**
 * Get the signing key from JWKS endpoint
 * Used for JWT token verification
 */
export const getSigningKey = (header: { kid: string; alg: string }): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwksClientInstance.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        const signingKey = key?.getPublicKey();
        resolve(signingKey || '');
      }
    });
  });
};
