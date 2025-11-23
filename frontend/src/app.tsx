import { Suspense, type Component, Show, type JSX, onMount, createSignal } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { useAuth } from '@/hooks/useAuth';
import { makeTranslator } from '@/i18n/makeTranslator';
import { appDict } from '@/app.i18n';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const App: Component<{ children: JSX.Element }> = (props) => {
  const location = useLocation();
  const { isAuthenticated, user, logout, checkSession, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

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
        <nav class="bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-b border-stone-300 dark:border-stone-700">
          {/* Desktop nav */}
          <ul class="hidden md:flex items-center px-4">
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

          {/* Mobile nav */}
          <div class="md:hidden flex items-center justify-between px-4 py-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
              class="p-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
              aria-label="Toggle menu"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <Show when={!mobileMenuOpen()}>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </Show>
                <Show when={mobileMenuOpen()}>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </Show>
              </svg>
            </button>
            <div class="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>

          {/* Mobile menu dropdown */}
          <Show when={mobileMenuOpen()}>
            <div class="md:hidden border-t border-stone-300 dark:border-stone-700 px-4 py-2 space-y-1">
              <Show when={!isAuthenticated()}>
                <A
                  href="/"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.home')}
                </A>
                <A
                  href="/about"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.about')}
                </A>
                <A
                  href="/login"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </A>
                <A
                  href="/register"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.register')}
                </A>
              </Show>
              <Show when={isAuthenticated()}>
                <A
                  href="/dashboard"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </A>
                <A
                  href="/my-requests"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.myRequests')}
                </A>
                <A
                  href="/my-trust"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.myTrust')}
                </A>
                <A
                  href="/profile"
                  class="block py-2 px-2 rounded hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.welcome').replace('{{name}}', displayName())}
                </A>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  class="block w-full text-left py-2 px-2 rounded text-sunset-600 dark:text-sunset-400 hover:bg-stone-300 dark:hover:bg-stone-700"
                >
                  {t('nav.logout')}
                </button>
              </Show>
            </div>
          </Show>
        </nav>

        <main>
          <Suspense>{props.children}</Suspense>
        </main>
      </>
    </Show>
  );
};

export default App;
