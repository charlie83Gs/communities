import axios, { AxiosInstance } from 'axios';
import { keycloakConfig } from '@/config/keycloak.config';
import { customAlphabet } from 'nanoid';

// Custom ID generator (24 character text-based IDs)
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

    const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: keycloakConfig.adminClientId,
      client_secret: keycloakConfig.adminClientSecret,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.accessToken = response.data.access_token;
    // Set expiry 30 seconds before actual expiry
    this.tokenExpiry = Date.now() + (response.data.expires_in - 30) * 1000;

    return this.accessToken as string;
  }

  /**
   * Create user with custom text-based ID (v26 Admin API)
   */
  async createUser(userData: CreateUserDTO): Promise<KeycloakUser> {
    const token = await this.getAdminToken();

    // Generate custom text-based ID
    const customUserId = generateUserId();

    // Create user payload (v26 format)
    // NOTE: Keycloak Admin REST typically ignores an explicit "id" on POST /users
    // and generates a UUID. We DO NOT send "id" here; we instead read the Location
    // header or search by username/email to get the persisted ID.
    const userPayload = {
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
        // Persist our desired customId as an attribute for traceability
        // even though Keycloak will assign its own UUID as the primary id.
        customId: [customUserId],
      },
    } as const;

    try {
      console.log('[Keycloak] Creating user:', { username: userData.username, email: userData.email });
      console.log('[Keycloak] Admin URL:', this.adminClient.defaults.baseURL);
      console.log('[Keycloak] Token:', token.substring(0, 20) + '...');

      // Create user
      const response = await this.adminClient.post('/users', userPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[Keycloak] Create user response status:', response.status);
      
      // Keycloak returns 201 with Location header
      if (response.status === 201) {
        // Prefer Location header to extract the actual Keycloak user id
        const location: string | undefined = (response.headers as any)?.location || (response as any)?.headers?.get?.('location');
        if (location) {
          // Example: http://localhost:8081/admin/realms/share-app/users/3d6c5f7b-3a07-44f4-8f5e-8a7f0b0d2a63
          const parts = location.split('/');
          const kcId = parts[parts.length - 1];
          try {
            const createdUser = await this.getUserById(kcId);
            return createdUser;
          } catch (e) {
            console.warn('[Keycloak] Failed to fetch user by Location id, will fallback to username lookup', e);
          }
        }

        // Fallback to search by username (exact)
        const byUsername = await this.getUserByUsername(userData.username);
        if (byUsername) {
          return byUsername;
        }

        // Fallback to search by email (exact)
        const byEmail = await this.getUserByEmail(userData.email);
        if (byEmail) {
          return byEmail;
        }

        throw new Error('User created but could not resolve user id (Location/lookup failed)');
      }

      throw new Error('Failed to create user');
    } catch (error: any) {
      console.error('[Keycloak] Error creating user:');
      console.error('  Status:', error.response?.status);
      console.error('  Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('  Message:', error.message);

      if (error.response?.status === 409) {
        throw new Error('User already exists');
      }
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
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<KeycloakUser | null> {
    const token = await this.getAdminToken();

    const response = await this.adminClient.get('/users', {
      params: { username, exact: true },
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
