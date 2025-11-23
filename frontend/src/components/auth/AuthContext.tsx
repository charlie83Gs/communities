import {
  createContext,
  useContext,
  type ParentComponent,
  type Accessor,
  createResource,
  Show,
  createSignal,
  onCleanup,
} from 'solid-js';
import { keycloakService, type KeycloakUser } from '@/services/keycloak.service';

export interface AuthContextType {
  authenticated: Accessor<boolean>;
  user: Accessor<KeycloakUser | null>;
  loading: Accessor<boolean>;
  login: (redirectUri?: string) => Promise<void>;
  logout: (redirectUri?: string) => Promise<void>;
  register: (redirectUri?: string) => Promise<void>;
  ensureTokenValidity: (minValidity?: number) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  getToken: () => string | undefined;
  getAccountUrl: () => string;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider: ParentComponent = (props) => {
  // Use createResource for proper async handling in SolidJS
  const [authState] = createResource(async () => {
    try {
      const authenticated = await keycloakService.initAuth({
        onLoad: 'check-sso',
        checkLoginIframe: true,
      });

      return {
        authenticated,
        user: keycloakService.getUser(),
      };
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      return {
        authenticated: false,
        user: null,
      };
    }
  });

  // Reactive user state that updates when auth changes
  const [user, setUser] = createSignal<KeycloakUser | null>(null);

  // Update user when auth state changes
  const authenticated = () => authState()?.authenticated ?? false;

  // Keep user state synchronized
  const updateUser = () => {
    const currentUser = keycloakService.getUser();
    setUser(currentUser);
  };

  // Initialize user when authenticated
  const initializeAuth = () => {
    if (authenticated()) {
      updateUser();
    }
  };

  // Run initialization when auth state is ready
  const loading = () => authState.loading;

  const contextValue: AuthContextType = {
    authenticated,
    user,
    loading,
    login: async (redirectUri?: string) => {
      await keycloakService.login({ redirectUri });
    },
    logout: async (redirectUri?: string) => {
      await keycloakService.logout(redirectUri);
    },
    register: async (redirectUri?: string) => {
      await keycloakService.register(redirectUri);
    },
    ensureTokenValidity: async (minValidity?: number) => {
      const refreshed = await keycloakService.ensureTokenValidity(minValidity);
      if (refreshed) {
        updateUser();
      }
      return refreshed;
    },
    hasRole: (role: string) => {
      return keycloakService.hasRole(role);
    },
    getToken: () => {
      return keycloakService.getToken();
    },
    getAccountUrl: () => {
      return keycloakService.getAccountUrl();
    },
  };

  // Initialize auth when resource is ready
  const handleAuthReady = () => {
    if (!loading() && authState()) {
      initializeAuth();
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <Show
        when={!loading()}
        fallback={
          <div class="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-stone-900">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
              <p class="text-stone-600 dark:text-stone-400">Loading authentication...</p>
            </div>
          </div>
        }
      >
        {(() => {
          // Initialize auth and render children
          handleAuthReady();
          return props.children;
        })()}
      </Show>
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
