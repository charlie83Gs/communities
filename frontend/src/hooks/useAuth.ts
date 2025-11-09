import { onCleanup } from 'solid-js';
import { useQueryClient } from '@tanstack/solid-query';
import { authStore, setAuthStore } from '@/stores/auth.store';
import { usersService } from '@/services/api/users.service';
import { keycloakService } from '@/services/keycloak.service';
import type { User } from '@/types/user.types';

let __authChecking = false;

export const useAuth = () => {
  const checkSession = async () => {
    if (__authChecking) return;
    __authChecking = true;
    setAuthStore('isLoading', true);
    try {
      const isAuthenticated = keycloakService.isAuthenticated();
      if (isAuthenticated) {
        const keycloakUser = keycloakService.getUser();
        if (keycloakUser) {
          try {
            // Fetch full user profile from backend
            const fullUser = await usersService.getUser(keycloakUser.id);
            setAuthStore({ user: fullUser as User, isAuthenticated: true, isLoading: false });
          } catch (fetchError) {
            console.error('Failed to fetch user details:', fetchError);
            // Fallback to basic user from Keycloak token
            const basicUser: User = {
              id: keycloakUser.id,
              email: keycloakUser.email,
              username: keycloakUser.username,
              firstName: keycloakUser.firstName,
              lastName: keycloakUser.lastName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setAuthStore({ user: basicUser, isAuthenticated: true, isLoading: false });
          }
        } else {
          setAuthStore({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setAuthStore({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthStore({ user: null, isAuthenticated: false, isLoading: false });
    } finally {
      __authChecking = false;
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      // Redirect to Keycloak registration page
      // Note: Keycloak doesn't support direct API signup from frontend
      // User will be redirected to Keycloak's registration form
      await keycloakService.register(window.location.origin + '/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { success: false, error: 'Sign up failed' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Redirect to Keycloak login page
      // Note: With standard OIDC flow, we don't handle credentials directly
      // User will be redirected to Keycloak's login form
      await keycloakService.login({
        redirectUri: window.location.origin + '/dashboard',
        prompt: 'login',
        loginHint: email,
      });
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      // Clear all cached queries to prevent data leakage between users
      // Access queryClient lazily only when needed (during logout)
      try {
        const queryClient = useQueryClient();
        queryClient.clear();
      } catch (error) {
        // QueryClient might not be available in all contexts, which is fine
        console.warn('QueryClient not available during logout:', error);
      }

      setAuthStore({ user: null, isAuthenticated: false, isLoading: false });

      // Redirect to Keycloak logout
      await keycloakService.logout(window.location.origin);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  onCleanup(() => {
    // Cleanup if necessary
  });

  return {
    user: () => authStore.user,
    isAuthenticated: () => authStore.isAuthenticated,
    isLoading: () => authStore.isLoading,
    signUp,
    login,
    logout,
    checkSession,
  };
};
