import { Suspense, type Component, Show, type JSX, onMount } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { useAuth } from '@/hooks/useAuth';
import { makeTranslator } from '@/i18n/makeTranslator';
import { appDict } from '@/app.i18n';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const App: Component<{ children: JSX.Element }> = (props) => {
  const location = useLocation();
  const { isAuthenticated, user, logout, checkSession, isLoading } = useAuth();

  const t = makeTranslator(appDict, 'app');

  // Initial auth check on app mount (runs once)
  // Keycloak is already initialized in index.tsx before app renders
  onMount(() => {
    checkSession();
  });

  const displayName = () => user()?.displayName || user()?.username || t('userFallback');

  return (
    <Show
      when={!isLoading()}
      fallback={<div class="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <>
        <nav class="bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-4 border-b border-stone-300 dark:border-stone-700">
          <ul class="flex items-center">
            <Show when={!isAuthenticated()}>
              <li class="py-2 px-4">
                <A href="/" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.home')}
                </A>
              </li>
            </Show>
            <Show when={!isAuthenticated()}>
              <li class="py-2 px-4">
                <A href="/about" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.about')}
                </A>
              </li>
            </Show>
            <Show when={isAuthenticated()}>
              <li class="py-2 px-4">
                <A href="/dashboard" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.dashboard')}
                </A>
              </li>
            </Show>
            <Show when={isAuthenticated()}>
              <li class="py-2 px-4">
                <A href="/my-requests" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.myRequests')}
                </A>
              </li>
            </Show>
            <Show when={isAuthenticated()}>
              <li class="py-2 px-4">
                <A href="/my-trust" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.myTrust')}
                </A>
              </li>
            </Show>
            <Show when={isAuthenticated()}>
              <li class="py-2 px-4 ml-auto">
                <A href="/profile" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.welcome').replace('{{name}}', displayName())}
                </A>
              </li>
              <li class="py-2 px-4">
                <button onClick={logout} class="text-sunset-600 hover:text-sunset-700 dark:text-sunset-400 dark:hover:text-sunset-300">
                  {t('nav.logout')}
                </button>
              </li>
            </Show>
            <Show when={!isAuthenticated()}>
              <li class="py-2 px-4 ml-auto">
                <A href="/login" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.login')}
                </A>
              </li>
              <li class="py-2 px-4">
                <A href="/register" class="no-underline hover:underline hover:text-ocean-600 dark:hover:text-ocean-400">
                  {t('nav.register')}
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

        <main>
          <Suspense>{props.children}</Suspense>
        </main>
      </>
    </Show>
  );
};

export default App;
