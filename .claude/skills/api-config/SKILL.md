---
name: api-config
description: This skill teaches the agent how to manage configuration in the API project. MANDATORY - You MUST read this skill before modifying any configuration files.
---

# API Configuration Skill

## Purpose
This skill covers the configuration layer of the API project, including environment variables, service initialization, and integration patterns for external services.

## When to Use This Skill
- Setting up authentication with Keycloak
- Configuring OpenFGA authorization
- Managing environment variables
- Initializing external service connections
- Understanding service integration patterns

## Environment Variables

```bash
# api/.env.example

# Database
DATABASE_URL=postgresql://api_user:api_password@localhost:5432/communities_db

# Keycloak Authentication
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=communities
KEYCLOAK_CLIENT_ID=communities-api
KEYCLOAK_CLIENT_SECRET=your-client-secret

# OpenFGA Authorization
OPENFGA_API_URL=http://localhost:8081
OPENFGA_STORE_ID=your-store-id
OPENFGA_MODEL_ID=your-model-id

# API Configuration
PORT=3000
NODE_ENV=development
API_VERSION=v1

# Logging
LOG_LEVEL=info

# Storage (for images/files)
STORAGE_TYPE=local
STORAGE_PATH=./uploads
# Or for cloud storage:
# STORAGE_TYPE=s3
# S3_BUCKET=your-bucket
# S3_REGION=us-east-1
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key
```

## Keycloak Configuration

### 1. Keycloak Client Setup
```typescript
// api/src/config/keycloak.config.ts
export const keycloakConfig = {
  url: process.env.KEYCLOAK_URL!,
  realm: process.env.KEYCLOAK_REALM!,
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
};

export const keycloakAdminConfig = {
  baseUrl: process.env.KEYCLOAK_URL!,
  realmName: process.env.KEYCLOAK_REALM!,
  // Admin credentials for user management
  adminUsername: process.env.KEYCLOAK_ADMIN_USERNAME,
  adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD,
};
```

### 2. JWT Verification Middleware
```typescript
// api/src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import { keycloakConfig } from '@/config/keycloak.config';

const client = jwksClient({
  jwksUri: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AuthenticatedRequest extends Request {
  session?: {
    userId: string;
    email: string;
    username: string;
    roles: string[];
  };
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'No token provided',
    });
  }

  const token = authHeader.substring(7);

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: `${keycloakConfig.url}/realms/${keycloakConfig.realm}`,
  }, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
    }

    // Attach session to request
    req.session = {
      userId: decoded.sub,
      email: decoded.email,
      username: decoded.preferred_username,
      roles: decoded.realm_access?.roles || [],
    };

    next();
  });
};

export const verifyTokenOptional = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without session
    return next();
  }

  // Token provided, verify it
  return verifyToken(req, res, next);
};
```

### 3. Keycloak User Service
```typescript
// api/src/services/keycloakUser.service.ts
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { keycloakAdminConfig } from '@/config/keycloak.config';

class KeycloakUserService {
  private adminClient: KcAdminClient;

  constructor() {
    this.adminClient = new KcAdminClient({
      baseUrl: keycloakAdminConfig.baseUrl,
      realmName: keycloakAdminConfig.realmName,
    });
  }

  async authenticate() {
    await this.adminClient.auth({
      username: keycloakAdminConfig.adminUsername!,
      password: keycloakAdminConfig.adminPassword!,
      grantType: 'password',
      clientId: 'admin-cli',
    });
  }

  async getUserById(userId: string) {
    await this.authenticate();
    return await this.adminClient.users.findOne({ id: userId });
  }

  async updateUser(userId: string, data: any) {
    await this.authenticate();
    return await this.adminClient.users.update({ id: userId }, data);
  }

  async deleteUser(userId: string) {
    await this.authenticate();
    return await this.adminClient.users.del({ id: userId });
  }
}

export const keycloakUserService = new KeycloakUserService();
```

## OpenFGA Configuration

### 1. OpenFGA Model Definition
```typescript
// api/src/config/openfga.model.ts
export const authorizationModel = {
  schema_version: "1.1",
  type_definitions: [
    {
      type: "user",
    },
    {
      type: "community",
      relations: {
        admin: {
          this: {},
        },
        member: {
          this: {},
        },
        // Trust-based access levels
        trust_level_0: { this: {} },
        trust_level_10: { this: {} },
        trust_level_15: { this: {} },
        trust_level_20: { this: {} },
        trust_level_30: { this: {} },
        trust_level_50: { this: {} },
        // Computed relations
        can_view: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: "member" } },
            ],
          },
        },
        can_update: {
          computedUserset: { relation: "admin" },
        },
        can_manage_members: {
          computedUserset: { relation: "admin" },
        },
        can_share_wealth: {
          union: {
            child: [
              { computedUserset: { relation: "admin" } },
              { computedUserset: { relation: "trust_level_10" } },
            ],
          },
        },
        can_create_poll: {
          union: {
            child: [
              { computedUserset: { relation: "admin" } },
              { computedUserset: { relation: "trust_level_15" } },
            ],
          },
        },
        can_moderate_forum: {
          union: {
            child: [
              { computedUserset: { relation: "admin" } },
              { computedUserset: { relation: "trust_level_30" } },
            ],
          },
        },
      },
      metadata: {
        relations: {
          admin: { directly_related_user_types: [{ type: "user" }] },
          member: { directly_related_user_types: [{ type: "user" }] },
          trust_level_0: { directly_related_user_types: [{ type: "user" }] },
          trust_level_10: { directly_related_user_types: [{ type: "user" }] },
          trust_level_15: { directly_related_user_types: [{ type: "user" }] },
          trust_level_20: { directly_related_user_types: [{ type: "user" }] },
          trust_level_30: { directly_related_user_types: [{ type: "user" }] },
          trust_level_50: { directly_related_user_types: [{ type: "user" }] },
        },
      },
    },
    {
      type: "council",
      relations: {
        manager: { this: {} },
        member: { this: {} },
        can_manage: {
          computedUserset: { relation: "manager" },
        },
      },
      metadata: {
        relations: {
          manager: { directly_related_user_types: [{ type: "user" }] },
          member: { directly_related_user_types: [{ type: "user" }] },
        },
      },
    },
  ],
};
```

### 2. OpenFGA Service
```typescript
// api/src/services/openfga.service.ts
import { OpenFgaClient } from '@openfga/sdk';
import logger from '@/utils/logger';

class OpenFGAService {
  private client: OpenFgaClient;
  private storeId: string;
  private modelId: string;

  constructor() {
    this.client = new OpenFgaClient({
      apiUrl: process.env.OPENFGA_API_URL!,
    });
    this.storeId = process.env.OPENFGA_STORE_ID!;
    this.modelId = process.env.OPENFGA_MODEL_ID!;
  }

  async check(params: {
    user: string;
    relation: string;
    object: string;
  }): Promise<boolean> {
    try {
      const response = await this.client.check({
        store_id: this.storeId,
        authorization_model_id: this.modelId,
        tuple_key: params,
      });
      return response.allowed;
    } catch (error) {
      logger.error('OpenFGA check failed', { params, error });
      return false;
    }
  }

  async writeTuple(params: {
    user: string;
    relation: string;
    object: string;
  }): Promise<void> {
    await this.client.write({
      store_id: this.storeId,
      writes: { tuple_keys: [params] },
    });
    logger.info('OpenFGA tuple written', params);
  }

  async deleteTuple(params: {
    user: string;
    relation: string;
    object: string;
  }): Promise<void> {
    await this.client.write({
      store_id: this.storeId,
      deletes: { tuple_keys: [params] },
    });
    logger.info('OpenFGA tuple deleted', params);
  }

  async listObjects(params: {
    user: string;
    relation: string;
    type: string;
  }): Promise<string[]> {
    const response = await this.client.listObjects({
      store_id: this.storeId,
      authorization_model_id: this.modelId,
      user: params.user,
      relation: params.relation,
      type: params.type,
    });
    return response.objects;
  }

  async updateTrustLevel(
    userId: string,
    communityId: string,
    newScore: number
  ): Promise<void> {
    const trustLevels = [0, 10, 15, 20, 30, 50];

    // Remove all existing trust level relations
    for (const level of trustLevels) {
      try {
        await this.deleteTuple({
          user: `user:${userId}`,
          relation: `trust_level_${level}`,
          object: `community:${communityId}`,
        });
      } catch (err) {
        // Ignore errors for non-existent tuples
      }
    }

    // Add trust level relations for all levels <= user's score
    for (const level of trustLevels) {
      if (newScore >= level) {
        await this.writeTuple({
          user: `user:${userId}`,
          relation: `trust_level_${level}`,
          object: `community:${communityId}`,
        });
      }
    }

    logger.info('Trust level updated in OpenFGA', { userId, communityId, newScore });
  }
}

export const openfgaService = new OpenFGAService();
```

### 3. OpenFGA Migration Script
```typescript
// api/src/utils/openfga-migrate.ts
import { OpenFgaClient } from '@openfga/sdk';
import { authorizationModel } from '@/config/openfga.model';

async function migrateOpenFGA() {
  const client = new OpenFgaClient({
    apiUrl: process.env.OPENFGA_API_URL!,
  });

  // Create store if not exists
  let storeId = process.env.OPENFGA_STORE_ID;

  if (!storeId) {
    const store = await client.createStore({
      name: 'communities-store',
    });
    storeId = store.id;
    console.log('Created store:', storeId);
  }

  // Write authorization model
  const model = await client.writeAuthorizationModel({
    store_id: storeId,
    type_definitions: authorizationModel.type_definitions,
    schema_version: authorizationModel.schema_version,
  });

  console.log('Authorization model written:', model.authorization_model_id);
  console.log('\nAdd to .env:');
  console.log(`OPENFGA_STORE_ID=${storeId}`);
  console.log(`OPENFGA_MODEL_ID=${model.authorization_model_id}`);
}

migrateOpenFGA();
```

## Application Configuration

```typescript
// api/src/config/app.config.ts
export const appConfig = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  logLevel: process.env.LOG_LEVEL || 'info',

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};
```

## Logging Configuration

```typescript
// api/src/utils/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

export default logger;
```

## Best Practices

1. **Environment Variables**: Never commit .env files, use .env.example
2. **Secrets Management**: Use secure secret storage in production
3. **Connection Pooling**: Use connection pools for database and external services
4. **Caching**: Cache JWKS keys and frequently accessed data
5. **Error Handling**: Handle service unavailability gracefully
6. **Logging**: Log all external service calls with correlation IDs
7. **Configuration Validation**: Validate required env vars on startup
8. **Separation**: Keep config separate from business logic
9. **Type Safety**: Type all configuration objects
10. **Documentation**: Document all environment variables in .env.example

## Related Skills
- `api-service` - Using OpenFGA for authorization checks
- `api-routes` - Using authentication middleware
- `api-db` - Database connection configuration

## Feature Documentation
Before configuring services, **MUST READ** the relevant feature documentation in `docs/features/` to understand:
- **FT-13: Security & Access Control** - OpenFGA authorization model
- **FT-02: Members & Permissions** - Permission requirements
- **FT-03: Trust System** - Trust level synchronization
