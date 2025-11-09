import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './pages/home';
import KeycloakLoginPage from './pages/public/keycloak-login';
import KeycloakSignupPage from './pages/public/keycloak-signup';
import KeycloakDashboard from './pages/protected/keycloak-dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

export const keycloakRoutes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/about',
    component: lazy(() => import('./pages/about')),
  },
  {
    path: '/theme-demo',
    component: lazy(() => import('./pages/theme-demo')),
  },
  {
    path: '/keycloak-login',
    component: KeycloakLoginPage,
  },
  {
    path: '/keycloak-signup',
    component: KeycloakSignupPage,
  },
  {
    path: '/keycloak-dashboard',
    component: () => {
      return (
        <ProtectedRoute>
          <KeycloakDashboard />
        </ProtectedRoute>
      );
    },
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];
