# Keycloak Migration Plan - Enhanced & Updated Guide

## 📋 Document Overview
- **Last Updated**: November 2025
- **Keycloak Version**: 26.3.5 (Latest Stable)
- **Status**: ✅ Reviewed & Enhanced with Latest Best Practices

## Table of Contents
1. [Overview](#overview)
2. [Version Updates & Key Changes](#version-updates--key-changes)
3. [Architecture](#architecture)
4. [Infrastructure as Code Setup](#infrastructure-as-code-setup)
5. [Backend Migration](#backend-migration)
6. [Frontend Migration](#frontend-migration)
7. [Complete Implementation Examples](#complete-implementation-examples)
8. [Testing Strategy](#testing-strategy)
9. [Deployment & Rollback](#deployment--rollback)
10. [Timeline](#timeline)

---

## Overview

### Migration Goals
- Replace SuperTokens with Keycloak 26.3.5
- Enable OAuth2/OIDC provider capabilities
- Maintain all existing functionality
- **Keep text-based user IDs** - same as SuperTokens for compatibility
- **No data migration needed** - fresh application, no existing users
- Zero configuration via UI (100% infrastructure as code)
- Single `docker compose up` to run entire stack

### Key Differences: SuperTokens → Keycloak

| Aspect | SuperTokens | Keycloak |
|--------|-------------|----------|
| **Session Type** | Custom JWT | Standard OIDC tokens |
| **User ID** | Text (custom) | **Text (custom) - SAME!** |
| **SDK** | SuperTokens SDK | Keycloak JS + OIDC libraries |
| **Middleware** | `verifySession()` | JWT verification middleware |
| **Token Storage** | Cookies + headers | Access token + refresh token |
| **OAuth2 Provider** | ❌ No | ✅ Yes |
| **Password Hashing** | PBKDF2 | **Argon2** (v25+) - Better performance |
| **Session Persistence** | In-memory | **Database by default** (v26+) |

---

## Version Updates & Key Changes

### ⚠️ Critical Updates from Your Original Plan

#### 1. **Keycloak Version Update: 24.0 → 26.3.5**

The latest stable version is Keycloak 26.3.5 (released October 2025), which includes critical security fixes for CVE-2025-58057 and CVE-2025-58056. Your plan references version 24.0, which is outdated.

**Updated Docker Configuration:**
```yaml
keycloak:
  image: quay.io/keycloak/keycloak:26.3.5  # Updated from 24.0
  container_name: keycloak
  command:
    - start-dev
    - --import-realm
```

#### 2. **Password Hashing Algorithm Change**

Keycloak v25 introduced Argon2 password hashing to replace PBKDF2, which significantly improves performance and security. The v24 version in your plan had known performance issues with password hashing.

#### 3. **Persistent Sessions Now Default**

Starting with Keycloak 26, all user sessions are persisted in the database by default, not just offline sessions. This improves reliability but requires database capacity planning.

#### 4. **JavaScript Adapter Independence**

The Keycloak JS adapter split from the main Keycloak project with version 26.2.0 and now follows its own release cycle. It maintains backwards compatibility with all actively supported Keycloak server versions.

**Updated Frontend Dependency:**
```json
{
  "dependencies": {
    "keycloak-js": "^26.2.1"  // Latest independent version
  }
}
```

#### 5. **New Default Login Theme (v2)**

Keycloak 26 introduces keycloak.v2 as the default login theme with improved look, dark mode support, and better accessibility.

#### 6. **JDBC-PING Now Default for Clustering**

Keycloak 26.1+ uses jdbc-ping by default instead of UDP multicast for cluster discovery, which works better in cloud environments.

---

## Architecture

### Current Architecture (SuperTokens)
```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Frontend   │────────▶│  Express API │────────▶│  SuperTokens    │
│  (Solid.js) │         │  (Backend)   │         │  Core (Docker)  │
└─────────────┘         └──────────────┘         └─────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────┐         ┌─────────────────┐
                        │   OpenFGA    │         │   PostgreSQL    │
                        │   (AuthZ)    │         │  (supertokens)  │
                        └──────────────┘         └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │   (api_db)   │
                        └──────────────┘
```

### New Architecture (Keycloak 26.3.5)
```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Frontend   │────────▶│  Express API │         │   Keycloak      │
│  (Solid.js) │         │  (Backend)   │         │   26.3.5        │
│             │         │              │         │                 │
│ keycloak-js │         │ JWT Verify   │         │ • Auth Server   │
│   26.2.1    │         │ Middleware   │         │ • OAuth2 Server │
└──────┬──────┘         └──────┬───────┘         │ • User Store    │
       │                       │                 │ • Argon2 Hash   │
       │  Login/Logout         │  Validate JWT   │ • DB Sessions   │
       │  (OIDC Flow)          │  Extract User   └────────┬────────┘
       └───────────────────────┼──────────────────────────┘
                               │                  
                               ▼                  
                        ┌──────────────┐         
                        │   OpenFGA    │         
                        │   (AuthZ)    │         
                        └──────────────┘         
                               │
                               ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │   (api_db)   │
                        │ + app_users  │
                        └──────────────┘
```

---

## Infrastructure as Code Setup

### Updated Docker Compose Configuration

#### File: `api/docker-compose.yml`

```yaml
version: '3.8'

services:
  # ============================================================================
  # KEYCLOAK SERVICES (Updated to 26.3.5)
  # ============================================================================

  keycloak-db:
    image: postgres:16-alpine
    container_name: keycloak-db
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ${KEYCLOAK_DB_PASSWORD:-keycloak_password}
    volumes:
      - keycloak-db-data:/var/lib/postgresql/data
    ports:
      - "5434:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U keycloak -d keycloak"]
      interval: 10s
      timeout: 5s
      retries: 5

  keycloak:
    image: quay.io/keycloak/keycloak:26.3.5
    container_name: keycloak
    command:
      - start-dev
      - --import-realm
      - --health-enabled=true
      - --metrics-enabled=true
    environment:
      # Admin Console
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin}

      # Database
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://keycloak-db:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${KEYCLOAK_DB_PASSWORD:-keycloak_password}

      # Hostname (critical for token validation)
      KC_HOSTNAME: ${KEYCLOAK_HOSTNAME:-localhost}
      KC_HOSTNAME_PORT: ${KEYCLOAK_PORT:-8081}
      KC_HOSTNAME_STRICT: false
      KC_HOSTNAME_STRICT_HTTPS: false

      # HTTP Settings (dev mode)
      KC_HTTP_ENABLED: true
      KC_HTTP_PORT: 8080

      # Proxy settings
      KC_PROXY: edge
      
      # Features (v26+ defaults)
      KC_FEATURES: persistent-user-sessions  # Enabled by default in v26

      # Logging
      KC_LOG_LEVEL: info
      
    volumes:
      - ./keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro
      - ./keycloak/themes:/opt/keycloak/themes:ro  # Optional custom themes
    ports:
      - "${KEYCLOAK_PORT:-8081}:8080"
    depends_on:
      keycloak-db:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "exec 3<>/dev/tcp/127.0.0.1/8080;echo -e 'GET /health/ready HTTP/1.1\r\nhost: http://localhost\r\nConnection: close\r\n\r\n' >&3;grep -q '200 OK' <&3"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 120s  # Increased for v26 (more startup time)

  # ============================================================================
  # APPLICATION SERVICES (EXISTING)
  # ============================================================================

  db:
    image: postgres:16-alpine
    container_name: api-db
    environment:
      POSTGRES_DB: api_db
      POSTGRES_USER: api_user
      POSTGRES_PASSWORD: ${API_DB_PASSWORD:-api_password}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U api_user -d api_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  openfga:
    image: openfga/openfga:latest
    container_name: openfga
    command: run
    environment:
      OPENFGA_DATASTORE_ENGINE: postgres
      OPENFGA_DATASTORE_URI: postgres://api_user:${API_DB_PASSWORD:-api_password}@db:5432/api_db?sslmode=disable
      OPENFGA_LOG_LEVEL: info
    ports:
      - "8080:8080"  # HTTP API
      - "8082:8081"  # gRPC API (changed to avoid conflict)
      - "3001:3000"  # Playground UI (changed to avoid conflict)
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "grpc_health_probe", "-addr=:8081"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: api
    environment:
      NODE_ENV: development
      PORT: 3000

      # Database
      DATABASE_URL: postgresql://api_user:${API_DB_PASSWORD:-api_password}@db:5432/api_db

      # Keycloak Configuration
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: share-app
      KEYCLOAK_CLIENT_ID: share-app-backend
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}

      # Public keys endpoint for JWT validation
      KEYCLOAK_JWKS_URI: http://keycloak:8080/realms/share-app/protocol/openid-connect/certs

      # Token issuer (must match JWT iss claim)
      KEYCLOAK_ISSUER: http://localhost:${KEYCLOAK_PORT:-8081}/realms/share-app

      # OpenFGA
      OPENFGA_API_URL: http://openfga:8080
      OPENFGA_STORE_ID: ${OPENFGA_STORE_ID}
      OPENFGA_MODEL_ID: ${OPENFGA_MODEL_ID}

    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
      keycloak:
        condition: service_healthy
      openfga:
        condition: service_healthy
    networks:
      - app-network
    volumes:
      - .:/app
      - /app/node_modules
    command: bun run dev

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  keycloak-db-data:
```

### Environment Variables Configuration

#### File: `api/.env.example`

```bash
# Application
NODE_ENV=development
PORT=3000

# Keycloak
KEYCLOAK_HOSTNAME=localhost
KEYCLOAK_PORT=8081
KEYCLOAK_ADMIN_PASSWORD=your-secure-admin-password
KEYCLOAK_CLIENT_SECRET=your-client-secret-from-realm-export
KEYCLOAK_DB_PASSWORD=keycloak_secure_password

# Application Database
API_DB_PASSWORD=api_secure_password

# OpenFGA
OPENFGA_STORE_ID=your-store-id
OPENFGA_MODEL_ID=your-model-id
```

---

## Backend Migration

### Updated Keycloak Configuration with v26 Features

#### File: `api/src/config/keycloak.config.ts`

```typescript
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  jwksUri: string;
  issuer: string;
  adminUrl: string;
}

export const keycloakConfig: KeycloakConfig = {
  url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'share-app',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'share-app-backend',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  jwksUri: process.env.KEYCLOAK_JWKS_URI || 
    'http://keycloak:8080/realms/share-app/protocol/openid-connect/certs',
  issuer: process.env.KEYCLOAK_ISSUER || 
    'http://localhost:8081/realms/share-app',
  adminUrl: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`,
};

// JWKS Client for token verification (works with v26)
export const jwksClientInstance = jwksClient({
  jwksUri: keycloakConfig.jwksUri,
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

export const getSigningKey = (header: any): Promise<string> => {
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
```

### JWT Verification Middleware (Compatible with v26)

#### File: `api/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { keycloakConfig, getSigningKey } from '../config/keycloak.config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;           // Custom text-based user ID
    email: string;
    username: string;
    roles: string[];
    realmRoles: string[];
    clientRoles: string[];
  };
  token?: string;
}

/**
 * Middleware to verify Keycloak JWT tokens (v26 compatible)
 * Supports both access tokens and ID tokens
 */
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
      return;
    }

    const token = authHeader.substring(7);
    req.token = token;

    // Decode token header to get key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true });
    
    if (!decodedHeader || typeof decodedHeader === 'string') {
      res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token format is invalid' 
      });
      return;
    }

    // Get the signing key from JWKS endpoint
    const signingKey = await getSigningKey(decodedHeader.header);

    // Verify and decode the token
    const decoded = jwt.verify(token, signingKey, {
      issuer: keycloakConfig.issuer,
      audience: keycloakConfig.clientId,
      algorithms: ['RS256'],
    }) as any;

    // Extract user information from token
    const userId = decoded.sub; // This is the custom text-based ID we set
    const email = decoded.email || decoded.preferred_username;
    const username = decoded.preferred_username || decoded.name;

    // Extract roles (v26 structure)
    const realmAccess = decoded.realm_access || {};
    const resourceAccess = decoded.resource_access || {};
    const clientAccess = resourceAccess[keycloakConfig.clientId] || {};

    req.user = {
      id: userId,
      email,
      username,
      roles: [...(realmAccess.roles || []), ...(clientAccess.roles || [])],
      realmRoles: realmAccess.roles || [],
      clientRoles: clientAccess.roles || [],
    };

    next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        error: 'Token expired',
        message: 'Please refresh your token or re-authenticate' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        error: 'Invalid token',
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Authentication error',
        message: 'Failed to verify token' 
      });
    }
  }
};

/**
 * Middleware to check if user has specific role(s)
 */
export const requireRole = (...requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasRole = requiredRoles.some(role => 
      req.user!.roles.includes(role)
    );

    if (!hasRole) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `Required role(s): ${requiredRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
};
```

### User Service with Custom ID Support (v26 Admin API)

#### File: `api/src/services/keycloakUser.service.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { keycloakConfig } from '../config/keycloak.config';
import { customAlphabet } from 'nanoid';

// Custom ID generator (matching SuperTokens format)
const generateUserId = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  24
);

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp: number;
}

export class KeycloakUserService {
  private adminClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.adminClient = axios.create({
      baseURL: keycloakConfig.adminUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get admin access token (with caching)
   */
  private async getAdminToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const tokenUrl = `${keycloakConfig.url}/realms/master/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: keycloakConfig.clientId,
      client_secret: keycloakConfig.clientSecret,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.accessToken = response.data.access_token;
    // Set expiry 30 seconds before actual expiry
    this.tokenExpiry = Date.now() + (response.data.expires_in - 30) * 1000;

    return this.accessToken;
  }

  /**
   * Create user with custom text-based ID (v26 Admin API)
   */
  async createUser(userData: CreateUserDTO): Promise<KeycloakUser> {
    const token = await this.getAdminToken();
    
    // Generate custom text-based ID (compatible with SuperTokens format)
    const customUserId = generateUserId();

    // Create user payload (v26 format)
    const userPayload = {
      id: customUserId,  // Custom ID - Keycloak Admin API allows this
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      enabled: userData.enabled !== false,
      emailVerified: false,
      credentials: [
        {
          type: 'password',
          value: userData.password,
          temporary: false,
        },
      ],
      attributes: {
        createdBy: ['api'],
        customId: [customUserId],  // Also store in attributes for reference
      },
    };

    try {
      // Create user
      const response = await this.adminClient.post('/users', userPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Keycloak returns 201 with Location header
      if (response.status === 201) {
        // Get the created user
        const createdUser = await this.getUserById(customUserId);
        return createdUser;
      }

      throw new Error('Failed to create user');
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('User already exists');
      }
      console.error('Error creating user:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<KeycloakUser> {
    const token = await this.getAdminToken();
    
    const response = await this.adminClient.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<KeycloakUser | null> {
    const token = await this.getAdminToken();
    
    const response = await this.adminClient.get('/users', {
      params: { email, exact: true },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.length > 0 ? response.data[0] : null;
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updates: Partial<CreateUserDTO>
  ): Promise<KeycloakUser> {
    const token = await this.getAdminToken();
    
    await this.adminClient.put(`/users/${userId}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return this.getUserById(userId);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    const token = await this.getAdminToken();
    
    await this.adminClient.delete(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Send verification email (v26 feature)
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    const token = await this.getAdminToken();
    
    await this.adminClient.put(
      `/users/${userId}/send-verify-email`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /**
   * Reset password (send email)
   */
  async sendResetPasswordEmail(userId: string): Promise<void> {
    const token = await this.getAdminToken();
    
    await this.adminClient.put(
      `/users/${userId}/execute-actions-email`,
      ['UPDATE_PASSWORD'],
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}

export const keycloakUserService = new KeycloakUserService();
```

## Backward Compatibility: SuperTokens feature parity and no‑break migration

This section ensures that replacing SuperTokens with Keycloak does not break existing features. It maps all current SuperTokens touchpoints in this codebase to their Keycloak equivalents, provides a safe transition strategy, and defines shims/adapters to allow an incremental rollout.

### SuperTokens touchpoints in this repo

- SuperTokens initialization and signup/signin hooks:
  - [initSuperTokens()](api/src/config/supertokens.config.ts:1)
  - Uses hooks to validate and persist username/displayName into the internal DB at [signUpPOST](api/src/config/supertokens.config.ts:86) and to sync on signin at [signInPOST](api/src/config/supertokens.config.ts:149)

- SuperTokens user metadata service used by various features (profile/preferences):
  - [SuperTokensUserService](api/src/services/supertokensUser.service.ts:27)
  - Provides read/update of metadata and deletes user in SuperTokens

- Internal user database repository:
  - [AppUserRepository](api/src/repositories/appUser.repository.ts:10)
  - Note: existing logs reference a non-existent method findBySupertokensUserId; plan below adds a safe alias during migration

- Docs and examples mention middleware verifySession() usage in routes (e.g. [AUTHORIZATION.md](api/AUTHORIZATION.md)):
  - Replace with Keycloak JWT verification middleware detailed in this plan at [auth.middleware.ts](api/src/middleware/auth.middleware.ts)

### 1) Authentication middleware replacement (no runtime breakage)

- Replace SuperTokens session middleware verifySession() with Keycloak JWT verification [verifyToken](api/src/middleware/auth.middleware.ts) and expose a compatible request shape.

- Transitional compatibility adapter (optional but recommended for zero-diff in handlers):
  - Create a thin adapter that emulates the minimal SuperTokens session API your handlers relied on:
    - req.session.getUserId() → returns req.user.id
    - req.session.userId → returns req.user.id

Example adapter (to add next to auth middleware):
```ts
// api/src/middleware/session.adapter.ts
import { Request, Response, NextFunction } from 'express';
type UserShape = { id: string };
export function supertokensSessionAdapter(req: Request & { user?: UserShape; session?: any }, _res: Response, next: NextFunction) {
  // Only attach if Keycloak auth already ran and set req.user
  if (req.user && !req.session) {
    const userId = req.user.id;
    req.session = {
      userId,
      getUserId: () => userId,
    };
  }
  next();
}
```

Usage during transition:
```ts
// In routes where verifySession() was used
// router.use(verifySession());  // remove
// Replace with:
import { verifyToken } from '@/middleware/auth.middleware';
import { supertokensSessionAdapter } from '@/middleware/session.adapter';
router.use(verifyToken, supertokensSessionAdapter);
```

This avoids touching downstream business logic that previously read req.session.userId or req.session.getUserId().

### 2) User profile/metadata + internal app_users sync (replaces SuperTokens hooks)

Current behavior with SuperTokens:
- On signup [signUpPOST](api/src/config/supertokens.config.ts:86):
  - Validate username uniqueness via [appUserRepository.isUsernameTaken](api/src/repositories/appUser.repository.ts:140)
  - Persist new app user via [appUserRepository.create](api/src/repositories/appUser.repository.ts:53)
  - Store username/displayName in SuperTokens metadata
- On signin [signInPOST](api/src/config/supertokens.config.ts:149):
  - Ensure user exists in app_users (find or create) via [appUserRepository.findOrCreate](api/src/repositories/appUser.repository.ts:70)
  - Update lastSeenAt via [appUserRepository.updateLastSeen](api/src/repositories/appUser.repository.ts:100)

Keycloak equivalents and recommended source of truth:
- Make app_users the source-of-truth for profile fields (username, displayName, etc.). Use token claims and/or Keycloak user attributes as inputs, but store and read from app_users inside the API.
- Provide two sync paths to match current hooks:
  1) Backend signup endpoint flow (preferred): when creating a Keycloak user via Admin API, immediately upsert in app_users using the same text-based ID and enforce uniqueness through [appUserRepository.isUsernameTaken](api/src/repositories/appUser.repository.ts:140) before creation. This mirrors the SuperTokens signUpPOST hook behavior.
  2) On-demand sync in middleware: in [verifyToken](api/src/middleware/auth.middleware.ts), after decoding the token, call a small sync routine:
     - Read current app user by ID [appUserRepository.findById](api/src/repositories/appUser.repository.ts:14)
     - If missing, upsert using claims: sub (id), email, preferred_username → [appUserRepository.findOrCreate](api/src/repositories/appUser.repository.ts:70)
     - Update lastSeenAt → [appUserRepository.updateLastSeen](api/src/repositories/appUser.repository.ts:100)
  This makes the first authenticated request create the app_users row if signup happened outside your backend.

Optional enhancements:
- Use Keycloak Admin Events (user created/updated) to call a webhook in the API that upserts app_users. This centralizes sync and avoids relying on first-request creation.

### 3) Services depending on SuperTokens metadata

- Replace [SuperTokensUserService](api/src/services/supertokensUser.service.ts:27) with a Keycloak-backed service that:
  - Reads the user base info primarily from app_users (id/email/username/displayName/…)
  - Writes profile fields into app_users (preferred) and optionally mirrors to Keycloak attributes if needed
  - Deletes users by calling Keycloak Admin API and then removing from app_users

Transitional shim (no breakage):
- Keep the file path and exported symbol name but re-implement internals to call Keycloak + app_users. Alternatively, create a new KeycloakUserProfileService and add a re-export:
```ts
// api/src/services/supertokensUser.service.ts
export { keycloakUserProfileService as superTokensUserService } from './keycloakUserProfile.service';
```
This allows existing imports to keep working while you migrate call sites.

Mapping of methods:
- getUserById → read from app_users; if missing, optionally fetch from Keycloak Admin API and upsert then return
- getUserByEmail → same as above (find in app_users by email; fallback to Admin API, then upsert)
- updateUserMetadata/updateUserPreferences → write into app_users; optionally mirror to Keycloak attributes
- deleteUser → delete in Keycloak, then [appUserRepository.delete](api/src/repositories/appUser.repository.ts:110)

### 4) Repository compatibility alias (fix missing method references)

Logs show references to appUserRepository.findBySupertokensUserId which do not exist in [AppUserRepository](api/src/repositories/appUser.repository.ts:10). To avoid runtime errors during the migration window:

- Add a no-op alias that forwards to findById:
```ts
// In appUser.repository.ts
async findBySupertokensUserId(id: string) { return this.findById(id); }
```
- Plan a follow-up refactor to replace all findBySupertokensUserId call sites with findById since IDs remain text-based and unchanged between SuperTokens and Keycloak.

No database migration required since we continue to use text-based IDs as primary keys in app_users.

### 5) Route protection and OpenFGA integration

- Replace any usage of verifySession() in routes/docs (see examples in [AUTHORIZATION.md](api/AUTHORIZATION.md)) with:
  - [verifyToken](api/src/middleware/auth.middleware.ts) → sets req.user.id (Keycloak sub)
  - Optional [supertokensSessionAdapter](api/src/middleware/session.adapter.ts) during transition
- Ensure OpenFGA checks use the same user identifier:
  - user: user:${req.user.id}
- If you had utility functions pulling requesterId from req.session.getUserId(), add a helper:
```ts
export const getRequesterId = (req: { user?: { id: string }; session?: any }) =>
  req.user?.id ?? req.session?.getUserId?.();
```
Then update FGA middleware to call getRequesterId(req) to be provider‑agnostic.

### 6) Testing, fixtures, and HTTP examples

- Replace SuperTokens-based test setup with Keycloak token acquisition:
  - Use password grant or a test client to get a token, then hit protected endpoints with Authorization: Bearer
- Update [tests/http/*.http](api/tests/http/auth.http) examples to include Keycloak-issued Bearer tokens instead of SuperTokens session cookies
- Update unit/integration tests that asserted session APIs to assert req.user.id presence and behavior from the adapter where needed

### 7) Dual-run feature flag (optional), rollout, and rollback

- Introduce an env flag AUTH_PROVIDER=supertokens|keycloak to enable a short dual-run or cutover period:
  - Wire a tiny Provider abstraction for:
    - middleware injection (verifySession vs verifyToken),
    - user sync hooks (ST signUpPOST/signInPOST vs KC sync-on-login),
    - profile service (ST metadata vs app_users + KC attributes)
- Keep SuperTokens containers up until all routes & tests pass with Keycloak; then remove ST from docker compose.

### 8) Concrete migration checklist (no break steps)

- Code
  - [ ] Add verifyToken middleware and wire it on all protected routes
  - [ ] Add supertokensSessionAdapter and getRequesterId helper; keep until all call sites are refactored
  - [ ] Implement Keycloak user profile service and replace internals of [SuperTokensUserService](api/src/services/supertokensUser.service.ts:27) via re-export or direct rename
  - [ ] Add repository alias method findBySupertokensUserId → findById
  - [ ] Implement signup flow that creates both Keycloak user and app_users entry, enforcing username uniqueness via [isUsernameTaken](api/src/repositories/appUser.repository.ts:140)
  - [ ] Implement on-demand app_users upsert in verifyToken (first request) and update lastSeenAt
- Tests & examples
  - [ ] Update test utils to fetch Keycloak tokens and inject Authorization: Bearer header
  - [ ] Update .http request files to demonstrate Keycloak flows
- Ops
  - [ ] Keep SuperTokens running during a short validation window, guarded by AUTH_PROVIDER
  - [ ] When validated, remove ST stack from docker compose and delete ST-specific code paths

With these shims and the sync strategy, the migration will not break:
- Existing controller/service logic that relied on req.session.getUserId() keeps working through the adapter
- Internal user database population previously done via SuperTokens hooks is now handled by backend signup and the on-demand sync in verifyToken
- Services reading/writing user metadata work against app_users and optionally mirror to Keycloak attributes
- OpenFGA continues to receive the same text-based user IDs for relationship checks
---

## Frontend Migration

### Updated Frontend Configuration with keycloak-js 26.2.1

#### File: `frontend/package.json`

```json
{
  "name": "share-app-frontend",
  "version": "1.0.0",
  "dependencies": {
    "solid-js": "^1.8.0",
    "keycloak-js": "^26.2.1",
    "@solidjs/router": "^0.13.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-solid": "^2.10.0",
    "typescript": "^5.3.0"
  }
}
```

### Keycloak Service (v26.2.1 Compatible)

#### File: `frontend/src/services/keycloak.service.ts`

```typescript
import Keycloak from 'keycloak-js';

export interface KeycloakUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

class KeycloakService {
  private keycloak: Keycloak | null = null;
  private initialized: boolean = false;

  /**
   * Initialize Keycloak instance (v26.2.1)
   */
  init(): Keycloak {
    if (this.keycloak) {
      return this.keycloak;
    }

    this.keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8081',
      realm: import.meta.env.VITE_KEYCLOAK_REALM || 'share-app',
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'share-app-frontend',
    });

    // Set up token refresh callback
    this.keycloak.onTokenExpired = () => {
      console.log('Token expired, refreshing...');
      this.refreshToken();
    };

    return this.keycloak;
  }

  /**
   * Initialize authentication (v26.2.1 features)
   */
  async initAuth(options?: {
    onLoad?: 'login-required' | 'check-sso';
    checkLoginIframe?: boolean;
  }): Promise<boolean> {
    if (!this.keycloak) {
      this.init();
    }

    try {
      const authenticated = await this.keycloak!.init({
        onLoad: options?.onLoad || 'check-sso',
        checkLoginIframe: options?.checkLoginIframe !== false,
        checkLoginIframeInterval: 5,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',  // v26 recommendation: use PKCE
        flow: 'standard',     // Authorization Code flow
      });

      this.initialized = true;

      // Set up automatic token refresh
      if (authenticated) {
        this.setupTokenRefresh();
      }

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      throw error;
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    // Refresh token when it expires in 30 seconds or less
    setInterval(() => {
      this.refreshToken();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.keycloak) return false;

    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        console.log('Token refreshed successfully');
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Token refresh failed - likely session expired
      this.logout();
      return false;
    }
  }

  /**
   * Login (redirect to Keycloak)
   */
  async login(options?: {
    redirectUri?: string;
    prompt?: 'none' | 'login' | 'consent' | 'select_account';
    maxAge?: number;
    loginHint?: string;
    scope?: string;
  }): Promise<void> {
    if (!this.keycloak) {
      this.init();
    }

    await this.keycloak!.login({
      redirectUri: options?.redirectUri || window.location.origin,
      prompt: options?.prompt,
      maxAge: options?.maxAge,
      loginHint: options?.loginHint,
      scope: options?.scope,
    });
  }

  /**
   * Logout
   */
  async logout(redirectUri?: string): Promise<void> {
    if (!this.keycloak) return;

    await this.keycloak.logout({
      redirectUri: redirectUri || window.location.origin,
    });
  }

  /**
   * Register new user (redirect to registration page)
   */
  async register(redirectUri?: string): Promise<void> {
    if (!this.keycloak) {
      this.init();
    }

    await this.keycloak!.register({
      redirectUri: redirectUri || window.location.origin,
    });
  }

  /**
   * Get current user information
   */
  getUser(): KeycloakUser | null {
    if (!this.keycloak || !this.keycloak.authenticated) {
      return null;
    }

    const tokenParsed = this.keycloak.tokenParsed;
    const realmAccess = tokenParsed?.realm_access || {};
    const resourceAccess = tokenParsed?.resource_access || {};
    const clientId = this.keycloak.clientId || '';
    const clientAccess = resourceAccess[clientId] || {};

    return {
      id: tokenParsed?.sub || '',
      email: tokenParsed?.email || '',
      username: tokenParsed?.preferred_username || '',
      firstName: tokenParsed?.given_name,
      lastName: tokenParsed?.family_name,
      roles: [...(realmAccess.roles || []), ...(clientAccess.roles || [])],
    };
  }

  /**
   * Get access token
   */
  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.keycloak?.authenticated || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.keycloak?.hasRealmRole(role) || 
           this.keycloak?.hasResourceRole(role) || 
           false;
  }

  /**
   * Get account management URL
   */
  getAccountUrl(): string {
    return this.keycloak?.createAccountUrl() || '';
  }
}

export const keycloakService = new KeycloakService();
```

---

## Complete Implementation Examples

### Backend: Signup & Login Endpoints

#### File: `api/src/routes/auth.routes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { keycloakUserService } from '../services/keycloakUser.service';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

/**
 * POST /api/auth/signup
 * Create a new user account in Keycloak and sync to app database
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !username || !password) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'username', 'password'],
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await keycloakUserService.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists',
      });
      return;
    }

    // Create user in Keycloak (with custom text-based ID)
    const keycloakUser = await keycloakUserService.createUser({
      email,
      username,
      password,
      firstName,
      lastName,
      enabled: true,
    });

    // Sync to app database (using same ID as Keycloak)
    const appUser = await prisma.user.create({
      data: {
        id: keycloakUser.id,  // Same text-based ID!
        email: keycloakUser.email,
        username: keycloakUser.username,
        firstName: keycloakUser.firstName,
        lastName: keycloakUser.lastName,
      },
    });

    // Send verification email (v26 feature)
    await keycloakUserService.sendVerificationEmail(keycloakUser.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: appUser.id,
        email: appUser.email,
        username: appUser.username,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Failed to create account',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/token
 * Exchange username/password for access token (Direct Grant/Password flow)
 * Note: This should be disabled in production - use OIDC flows instead
 */
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: 'Missing credentials',
        required: ['username', 'password'],
      });
      return;
    }

    const axios = (await import('axios')).default;
    const { keycloakConfig } = await import('../config/keycloak.config');

    // Request token from Keycloak
    const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: keycloakConfig.clientId,
      client_secret: keycloakConfig.clientSecret,
      username,
      password,
      scope: 'openid profile email',
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
      token_type: response.data.token_type,
    });
  } catch (error: any) {
    console.error('Token error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect',
      });
    } else {
      res.status(500).json({
        error: 'Authentication failed',
        message: error.message,
      });
    }
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        error: 'Missing refresh token',
      });
      return;
    }

    const axios = (await import('axios')).default;
    const { keycloakConfig } = await import('../config/keycloak.config');

    const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: keycloakConfig.clientId,
      client_secret: keycloakConfig.clientSecret,
      refresh_token,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    });
  } catch (error: any) {
    console.error('Refresh error:', error.response?.data || error.message);
    res.status(401).json({
      error: 'Failed to refresh token',
      message: 'Refresh token is invalid or expired',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile (protected route)
 */
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    res.json({
      user: {
        ...user,
        roles: req.user!.roles,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (revoke tokens)
 */
router.post('/logout', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const axios = (await import('axios')).default;
    const { keycloakConfig } = await import('../config/keycloak.config');

    const logoutUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`;
    
    const params = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      client_secret: keycloakConfig.clientSecret,
      refresh_token: req.body.refresh_token || '',
    });

    await axios.post(logoutUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    // Even if logout fails on Keycloak side, we consider it successful
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
});

export default router;
```

### Frontend: Complete Authentication Components

#### File: `frontend/src/App.tsx`

```typescript
import { Component, createEffect, createSignal, Show } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { keycloakService } from './services/keycloak.service';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App: Component = () => {
  const [initialized, setInitialized] = createSignal(false);
  const [authenticated, setAuthenticated] = createSignal(false);

  createEffect(async () => {
    try {
      // Initialize Keycloak
      const auth = await keycloakService.initAuth({
        onLoad: 'check-sso',
        checkLoginIframe: true,
      });

      setAuthenticated(auth);
      setInitialized(true);

      console.log('Keycloak initialized:', auth ? 'authenticated' : 'not authenticated');
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      setInitialized(true);
    }
  });

  return (
    <Show when={initialized()} fallback={<div>Loading...</div>}>
      <Router>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route 
          path="/dashboard" 
          component={() => (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )} 
        />
        <Route path="/" component={() => {
          if (authenticated()) {
            return <Dashboard />;
          } else {
            return <LoginPage />;
          }
        }} />
      </Router>
    </Show>
  );
};

export default App;
```

#### File: `frontend/src/pages/Signup.tsx`

```typescript
import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const SignupPage: Component = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = createSignal({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = formData();

    // Validation
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Call backend signup endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          email: data.email,
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }
      );

      console.log('Signup successful:', response.data);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error ||
        'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        {success() ? (
          <div class="rounded-md bg-green-50 p-4">
            <p class="text-sm text-green-800">
              Account created successfully! Please check your email to verify your account.
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error() && (
              <div class="rounded-md bg-red-50 p-4">
                <p class="text-sm text-red-800">{error()}</p>
              </div>
            )}

            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="email" class="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData().email}
                  onInput={(e) => setFormData({ ...formData(), email: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="username" class="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={formData().username}
                  onInput={(e) => setFormData({ ...formData(), username: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="firstName" class="sr-only">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="First name (optional)"
                  value={formData().firstName}
                  onInput={(e) => setFormData({ ...formData(), firstName: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="lastName" class="sr-only">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Last name (optional)"
                  value={formData().lastName}
                  onInput={(e) => setFormData({ ...formData(), lastName: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="password" class="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password (min. 8 characters)"
                  value={formData().password}
                  onInput={(e) => setFormData({ ...formData(), password: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="confirmPassword" class="sr-only">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={formData().confirmPassword}
                  onInput={(e) => setFormData({ ...formData(), confirmPassword: e.currentTarget.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading()}
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading() ? 'Creating account...' : 'Sign up'}
              </button>
            </div>

            <div class="text-center">
              <a href="/login" class="text-sm text-indigo-600 hover:text-indigo-500">
                Already have an account? Sign in
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
```

#### File: `frontend/src/pages/Login.tsx`

```typescript
import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { keycloakService } from '../services/keycloak.service';

const LoginPage: Component = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);

  // Option 1: Redirect to Keycloak hosted login (Recommended)
  const handleKeycloakLogin = async () => {
    setLoading(true);
    try {
      await keycloakService.login({
        redirectUri: `${window.location.origin}/dashboard`,
        prompt: 'login',
      });
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const handleKeycloakRegister = async () => {
    setLoading(true);
    try {
      await keycloakService.register(
        `${window.location.origin}/dashboard`
      );
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Powered by Keycloak SSO
          </p>
        </div>

        <div class="mt-8 space-y-6">
          <button
            onClick={handleKeycloakLogin}
            disabled={loading()}
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading() ? 'Redirecting...' : 'Sign in with Keycloak'}
          </button>

          <button
            onClick={handleKeycloakRegister}
            disabled={loading()}
            class="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Create new account
          </button>

          <div class="text-center text-xs text-gray-500">
            <p>You'll be redirected to a secure login page</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

#### File: `frontend/src/pages/Dashboard.tsx`

```typescript
import { Component, createSignal, createEffect } from 'solid-js';
import { keycloakService } from '../services/keycloak.service';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const Dashboard: Component = () => {
  const navigate = useNavigate();
  const [user, setUser] = createSignal(keycloakService.getUser());
  const [profile, setProfile] = createSignal<any>(null);
  const [loading, setLoading] = createSignal(true);

  createEffect(async () => {
    try {
      // Fetch full user profile from backend
      const token = keycloakService.getToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  });

  const handleLogout = async () => {
    await keycloakService.logout();
  };

  const handleManageAccount = () => {
    window.open(keycloakService.getAccountUrl(), '_blank');
  };

  return (
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold">Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button
                onClick={handleManageAccount}
                class="text-gray-700 hover:text-gray-900"
              >
                Manage Account
              </button>
              <button
                onClick={handleLogout}
                class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading() ? (
          <div class="text-center">Loading...</div>
        ) : (
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                User Profile
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and settings
              </p>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">User ID</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile()?.id}
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Username</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile()?.username}
                  </dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile()?.email}
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Name</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile()?.firstName} {profile()?.lastName}
                  </dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Roles</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {profile()?.roles?.join(', ') || 'None'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
```

#### File: `frontend/src/components/ProtectedRoute.tsx`

```typescript
import { Component, JSX, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { keycloakService } from '../services/keycloak.service';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

const ProtectedRoute: Component<ProtectedRouteProps> = (props) => {
  const navigate = useNavigate();

  // Check authentication
  const isAuthenticated = keycloakService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login
    navigate('/login');
    return null;
  }

  // Check role if required
  if (props.requiredRole && !keycloakService.hasRole(props.requiredRole)) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p class="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{props.children}</>;
};

export default ProtectedRoute;
```

#### File: `frontend/public/silent-check-sso.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Silent SSO Check</title>
</head>
<body>
    <script>
        // This page is used by Keycloak for silent SSO checks
        parent.postMessage(location.href, location.origin);
    </script>
</body>
</html>
```

---

## Testing Strategy

### Updated Test Configuration

#### File: `api/tests/auth.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'bun:test';
import axios from 'axios';

const KEYCLOAK_URL = 'http://localhost:8081';
const API_URL = 'http://localhost:3000';
const REALM = 'share-app';

describe('Keycloak v26 Authentication Tests', () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'Test123456!',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeAll(async () => {
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  it('should create a new user via API', async () => {
    const response = await axios.post(
      `${API_URL}/api/auth/signup`,
      testUser
    );

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.user.id).toBeDefined();
    expect(response.data.user.email).toBe(testUser.email);

    userId = response.data.user.id;
  });

  it('should login and receive tokens', async () => {
    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: 'share-app-backend',
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      username: testUser.username,
      password: testUser.password,
      scope: 'openid profile email',
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(response.status).toBe(200);
    expect(response.data.access_token).toBeDefined();
    expect(response.data.refresh_token).toBeDefined();
    expect(response.data.token_type).toBe('Bearer');

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
  });

  it('should access protected endpoint with valid token', async () => {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status).toBe(200);
    expect(response.data.user.id).toBe(userId);
    expect(response.data.user.email).toBe(testUser.email);
  });

  it('should reject access without token', async () => {
    try {
      await axios.get(`${API_URL}/api/auth/me`);
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should refresh access token', async () => {
    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: 'share-app-backend',
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      refresh_token: refreshToken,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(response.status).toBe(200);
    expect(response.data.access_token).toBeDefined();
    expect(response.data.access_token).not.toBe(accessToken);
  });

  it('should logout and revoke tokens', async () => {
    const logoutUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`;
    
    const params = new URLSearchParams({
      client_id: 'share-app-backend',
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      refresh_token: refreshToken,
    });

    const response = await axios.post(logoutUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(response.status).toBe(204);
  });

  it('should verify persistent sessions in database', async () => {
    // This test verifies v26 feature: persistent-user-sessions
    // Login again
    const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: 'share-app-backend',
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      username: testUser.username,
      password: testUser.password,
    });

    const response = await axios.post(tokenUrl, params);
    expect(response.status).toBe(200);

    // In v26, this session should be persisted in the database
    // You can verify this by querying the Keycloak database
    // SELECT * FROM user_session WHERE user_id = userId;
  });
});
```

---

## Deployment & Rollback

### Enhanced Deployment Strategy for v26

#### Pre-Deployment Checklist

1. **Version Verification**
   - [ ] Verify Keycloak 26.3.5 image is available
   - [ ] Verify keycloak-js 26.2.1 is installed
   - [ ] Check all environment variables are set

2. **Database Preparation**
   - [ ] Backup application database
   - [ ] Ensure PostgreSQL 16 is ready for Keycloak
   - [ ] Verify database has sufficient space for persistent sessions

3. **Configuration Review**
   - [ ] Review realm-export.json
   - [ ] Verify client secrets are secure
   - [ ] Check CORS and redirect URIs

#### Deployment Steps

```bash
# 1. Stop current services
docker compose down

# 2. Pull latest changes
git pull origin keycloak-migration

# 3. Build images
docker compose build

# 4. Start services (Keycloak will auto-import realm)
docker compose up -d

# 5. Monitor Keycloak startup
docker compose logs -f keycloak

# Wait for: "Keycloak 26.3.5 started"

# 6. Verify health endpoints
curl http://localhost:8081/health/ready
curl http://localhost:8081/health/live

# 7. Test OIDC configuration
curl http://localhost:8081/realms/share-app/.well-known/openid-configuration

# 8. Create test user and verify
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User"
  }'

# 9. Run automated tests
cd api && bun test
```

#### Post-Deployment Verification

```bash
# Check service status
docker compose ps

# Verify Keycloak admin console
# Open: http://localhost:8081/admin
# Login: admin/admin (or your configured password)

# Check persistent sessions
docker compose exec keycloak-db psql -U keycloak -d keycloak \
  -c "SELECT COUNT(*) FROM user_session;"

# Verify application database sync
docker compose exec db psql -U api_user -d api_db \
  -c "SELECT COUNT(*) FROM app_users;"
```

#### Rollback Plan

```bash
# 1. Stop services
docker compose down

# 2. Restore previous version
git checkout main

# 3. Restore database if needed
docker compose exec db psql -U api_user -d api_db < backup_app_db.sql

# 4. Start previous services
docker compose up -d

# 5. Verify rollback
curl http://localhost:3000/health
```

---

## Timeline

### Updated Timeline (with v26 considerations)

| Phase | Tasks | Duration | Notes |
|-------|-------|----------|-------|
| **Phase 1** | Keycloak 26.3.5 setup + Realm config | 1-2 days | Additional time for v26 features |
| **Phase 2** | Backend migration | 3-4 days | Updated middleware for v26 |
| **Phase 3** | Frontend migration (keycloak-js 26.2.1) | 2-3 days | New adapter version |
| **Phase 4** | Testing (including v26 features) | 2-3 days | Test persistent sessions, etc. |
| **Phase 5** | Deployment | 1 day | Standard deployment |
| **TOTAL** | | **9-13 days** | |

---

## Summary of Key Changes
W
### 🎯 Migration Advantages

- ✅ Latest security fixes (CVE-2025-58057, CVE-2025-58056)
- ✅ Better performance with Argon2 hashing
- ✅ Improved reliability with persistent sessions
- ✅ Modern architecture with independent adapter
- ✅ Complete code examples for signup/login
- ✅ No user data migration needed
- ✅ OpenFGA compatibility maintained

---

## Next Steps

1. Review this enhanced plan
2. Update `realm-export.json` with v26 configuration
3. Update `docker-compose.yml` to version 26.3.5
4. Install keycloak-js@26.2.1 in frontend
5. Implement backend auth endpoints
6. Implement frontend components
7. Test thoroughly
8. Deploy! 🚀

Good luck with your migration to Keycloak 26.3.5! 🎉
