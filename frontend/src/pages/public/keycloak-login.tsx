import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '@/components/auth';

const KeycloakLoginPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = createSignal(false);

  // Option 1: Redirect to Keycloak hosted login (Recommended)
  const handleKeycloakLogin = async () => {
    setLoading(true);
    try {
      await auth.login(`${window.location.origin}/dashboard`);
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const handleKeycloakRegister = async () => {
    setLoading(true);
    try {
      await auth.register(`${window.location.origin}/dashboard`);
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950 py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
            Powered by Keycloak SSO
          </p>
        </div>

        <div class="mt-8 space-y-6">
          <button
            onClick={handleKeycloakLogin}
            disabled={loading()}
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading() ? 'Redirecting...' : 'Sign in with Keycloak'}
          </button>

          <button
            onClick={handleKeycloakRegister}
            disabled={loading()}
            class="group relative w-full flex justify-center py-3 px-4 border border-stone-300 dark:border-stone-600 text-sm font-medium rounded-md text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create new account
          </button>

          <div class="text-center text-xs text-stone-500 dark:text-stone-400">
            <p>You'll be redirected to a secure login page</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeycloakLoginPage;
