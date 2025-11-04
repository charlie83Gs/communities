import { Component, createEffect, createSignal, Show, type JSX } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { keycloakService } from '@/services/keycloak.service';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const KeycloakApp: Component<{ children: JSX.Element }> = (props) => {
  const location = useLocation();
  const [initialized, setInitialized] = createSignal(false);
  const [authenticated, setAuthenticated] = createSignal(false);
  const [user, setUser] = createSignal(keycloakService.getUser());

  // Initialize Keycloak on mount
  createEffect(async () => {
    try {
      const auth = await keycloakService.initAuth({
        onLoad: 'check-sso',
        checkLoginIframe: true,
      });

      setAuthenticated(auth);
      setUser(keycloakService.getUser());
      setInitialized(true);

      console.log('Keycloak initialized:', auth ? 'authenticated' : 'not authenticated');
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      setInitialized(true);
    }
  });

  const handleLogout = async () => {
    await keycloakService.logout();
  };

  const displayName = () => user()?.username || 'User';

  return (
    <Show
      when={initialized()}
      fallback={
        <div class="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-stone-900">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
            <p class="text-stone-600 dark:text-stone-400">Loading authentication...</p>
          </div>
        </div>
      }
    >
      <>
        <nav class="bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-4 border-b border-stone-300 dark:border-stone-700">
          <ul class="flex items-center">
            <Show when={!authenticated()}>
              <li class="py-2 px-4">
                <A href="/" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  Home
                </A>
              </li>
            </Show>
            <Show when={!authenticated()}>
              <li class="py-2 px-4">
                <A href="/about" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  About
                </A>
              </li>
            </Show>
            <Show when={authenticated()}>
              <li class="py-2 px-4">
                <A href="/keycloak-dashboard" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  Dashboard
                </A>
              </li>
            </Show>
            <Show when={authenticated()}>
              <li class="py-2 px-4 ml-auto">
                <span class="text-stone-700 dark:text-stone-300">
                  Welcome, {displayName()}
                </span>
              </li>
              <li class="py-2 px-4">
                <button
                  onClick={handleLogout}
                  class="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                >
                  Logout
                </button>
              </li>
            </Show>
            <Show when={!authenticated()}>
              <li class="py-2 px-4 ml-auto">
                <A href="/keycloak-login" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  Login
                </A>
              </li>
              <li class="py-2 px-4">
                <A href="/keycloak-signup" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  Sign Up
                </A>
              </li>
            </Show>
            <li class="py-2 px-4">
              <LanguageSwitcher />
            </li>
            <li class="py-2 px-4">
              <ThemeSwitcher />
            </li>
          </ul>
        </nav>

        <main>{props.children}</main>
      </>
    </Show>
  );
};

export default KeycloakApp;
