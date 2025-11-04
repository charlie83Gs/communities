/* @refresh reload */
import 'solid-devtools';
import './index.css';

import { render } from 'solid-js/web';
import { MetaProvider } from '@solidjs/meta';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { Router } from '@solidjs/router';

import KeycloakApp from './keycloak-app';
import { keycloakRoutes } from './keycloak-routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 300000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 1,
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

render(
  () => (
    <MetaProvider>
      <QueryClientProvider client={queryClient}>
        <Router root={(props) => <KeycloakApp>{props.children}</KeycloakApp>}>{keycloakRoutes}</Router>
      </QueryClientProvider>
    </MetaProvider>
  ),
  root!,
);
