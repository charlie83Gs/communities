import { Router, Request, Response } from 'express';
import { keycloakUserService } from '../../services/keycloakUser.service';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import { appUserRepository } from '../../repositories/appUser.repository';
import { keycloakConfig } from '../../config/keycloak.config';
import axios from 'axios';

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
        success: false,
        error: 'Missing required fields',
        required: ['email', 'username', 'password'],
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Check if email already exists in app database
    const existingEmail = await appUserRepository.findByEmail(email);
    if (existingEmail) {
      res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists',
      });
      return;
    }

    // Check if username already taken
    const existingUsername = await appUserRepository.findByUsername(username);
    if (existingUsername) {
      res.status(409).json({
        success: false,
        error: 'Username taken',
        message: 'This username is already taken',
      });
      return;
    }

    // Check if user exists in Keycloak
    const keycloakUserByEmail = await keycloakUserService.getUserByEmail(email);
    if (keycloakUserByEmail) {
      res.status(409).json({
        success: false,
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
    const appUser = await appUserRepository.create({
      id: keycloakUser.id, // Same text-based ID!
      email: keycloakUser.email,
      username: keycloakUser.username,
      displayName: `${firstName || ''} ${lastName || ''}`.trim() || username,
    });

    // Send verification email (v26 feature)
    try {
      await keycloakUserService.sendVerificationEmail(keycloakUser.id);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user is created
    }

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
      success: false,
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
    const user = await appUserRepository.findById(req.user!.id);

    if (!user) {
      // User exists in Keycloak but not in app database - sync now
      const appUser = await appUserRepository.create({
        id: req.user!.id,
        email: req.user!.email,
        username: req.user!.username,
        displayName: req.user!.username,
      });

      res.json({
        user: {
          id: appUser.id,
          email: appUser.email,
          username: appUser.username,
          displayName: appUser.displayName,
          roles: req.user!.roles,
        },
      });
      return;
    }

    // Update last seen
    await appUserRepository.updateLastSeen(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
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
