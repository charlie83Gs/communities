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
      prompt: options?.prompt as 'none' | 'login' | undefined,
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

    const tokenParsed = this.keycloak.tokenParsed as Record<string, unknown> | undefined;
    const realmAccess = (tokenParsed?.realm_access as { roles?: string[] }) || {};
    const resourceAccess = (tokenParsed?.resource_access as Record<string, { roles?: string[] }>) || {};
    const clientId = this.keycloak.clientId || '';
    const clientAccess = resourceAccess[clientId] || {};

    return {
      id: (tokenParsed?.sub as string) || '',
      email: (tokenParsed?.email as string) || '',
      username: (tokenParsed?.preferred_username as string) || '',
      firstName: tokenParsed?.given_name as string | undefined,
      lastName: tokenParsed?.family_name as string | undefined,
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
