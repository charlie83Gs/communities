import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { keycloakConfig, getSigningKey } from '../../config/keycloak.config';
import { appUserRepository } from '@/repositories/appUser.repository';

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

    // Token verification is non-optional for this middleware.
    // Use verifyTokenOptional for endpoints that allow anonymous access.

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

    // Validate header has required fields
    if (!decodedHeader.header.kid || !decodedHeader.header.alg) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Token header missing required fields'
      });
      return;
    }

    // Get the signing key from JWKS endpoint
    const signingKey = await getSigningKey({
      kid: decodedHeader.header.kid,
      alg: decodedHeader.header.alg
    });

    // Verify and decode the token
    // Note: Keycloak's frontend client tokens might not have "aud" claim,
    // so we'll skip audience validation and just verify signature + issuer
    const decoded = jwt.verify(token, signingKey, {
      issuer: keycloakConfig.issuer,
      algorithms: ['RS256'],
      // Skip audience validation - Keycloak tokens from public clients
      // (like share-app-frontend) may not include audience claim
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

    // On-demand sync of app_users entry
    // Ensures user exists in internal DB and updates last seen timestamp
    await appUserRepository.findOrCreate({
      id: userId,
      email: email || null,
      username: username || userId,
      displayName: username || null,
    });
    await appUserRepository.updateLastSeen(userId);

    next();
  } catch (error: any) {
    console.error('Token verification failed:', error?.message || error);


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
 * Optional token verification - doesn't fail if no token is provided
 * Used for public endpoints that can work with or without authentication
 */
export const verifyTokenOptional = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without user info
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    req.token = token;

    // Decode token header to get key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true });

    if (!decodedHeader || typeof decodedHeader === 'string') {
      // Invalid token format, but don't fail - just continue without auth
      return next();
    }

    // Validate header has required fields
    if (!decodedHeader.header.kid || !decodedHeader.header.alg) {
      // Invalid header, but don't fail - just continue without auth
      return next();
    }

    // Get the signing key from JWKS endpoint
    const signingKey = await getSigningKey({
      kid: decodedHeader.header.kid,
      alg: decodedHeader.header.alg
    });

    // Verify and decode the token (skip audience validation like in verifyToken)
    const decoded = jwt.verify(token, signingKey, {
      issuer: keycloakConfig.issuer,
      algorithms: ['RS256'],
    }) as any;

    // Extract user information from token
    const userId = decoded.sub;
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
    // Token verification failed, but it's optional so just continue
    console.warn('Optional token verification failed:', error.message);
    next();
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
