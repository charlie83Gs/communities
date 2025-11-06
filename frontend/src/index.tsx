/* @refresh reload */
import 'solid-devtools';
import './index.css';

// Import for backward compatibility (now just an empty module)
import './services/auth';

import { render } from 'solid-js/web';

import { MetaProvider } from '@solidjs/meta';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';

import App from './app';
import { Router } from '@solidjs/router';
import { routes } from './routes';
import { keycloakService } from './services/keycloak.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Queries stay fresh for 30 seconds before being considered stale
      staleTime: 30000, // 30 seconds
      // Cache data for 5 minutes before garbage collection
      gcTime: 300000, // 5 minutes (formerly cacheTime)
      // Enable automatic refetch on window focus to get fresh data when user returns
      refetchOnWindowFocus: true,
      // Enable automatic refetch on mount to ensure fresh data
      refetchOnMount: true,
      // Retry failed requests only once to avoid hanging
      retry: 1,
      // Ensure queries don't execute when disabled
      enabled: true,
    },
  },
});

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// Initialize Keycloak before rendering the app
keycloakService.initAuth({
  onLoad: 'check-sso',
  checkLoginIframe: true,
}).then(() => {
  // Render app after Keycloak initialization
  render(
    () => (
      <MetaProvider>
        <QueryClientProvider client={queryClient}>
          <Router root={(props) => <App>{props.children}</App>}>{routes}</Router>
        </QueryClientProvider>
      </MetaProvider>
    ),
    root!,
  );
}).catch((error) => {
  console.error('Failed to initialize Keycloak:', error);
  // Render app anyway with unauthenticated state
  render(
    () => (
      <MetaProvider>
        <QueryClientProvider client={queryClient}>
          <Router root={(props) => <App>{props.children}</App>}>{routes}</Router>
        </QueryClientProvider>
      </MetaProvider>
    ),
    root!,
  );
});
// Trigger release
