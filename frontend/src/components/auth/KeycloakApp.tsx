import { Component, Show, type JSX } from 'solid-js';
import { A } from '@solidjs/router';
import { useAuth } from './AuthContext';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const KeycloakApp: Component<{ children: JSX.Element }> = (props) => {
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.logout();
  };

  const displayName = () => auth.user()?.username || 'User';

  return (
    <>
      <nav class="bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-4 border-b border-stone-300 dark:border-stone-700">
        <ul class="flex items-center">
          <Show when={!auth.authenticated()}>
            <li class="py-2 px-4">
              <A href="/" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                Home
              </A>
            </li>
          </Show>
          <Show when={!auth.authenticated()}>
            <li class="py-2 px-4">
              <A href="/about" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                About
              </A>
            </li>
          </Show>
          <Show when={auth.authenticated()}>
            <li class="py-2 px-4">
              <A href="/keycloak-dashboard" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                Dashboard
              </A>
            </li>
          </Show>
          <Show when={auth.authenticated()}>
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
          <Show when={!auth.authenticated()}>
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
  );
};

export default KeycloakApp;
