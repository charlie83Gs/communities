import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './pages/home';
import Login from './pages/public/login';
import Register from './pages/public/register';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import Dashboard from './pages/protected/dashboard';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: GuestGuard,
    children: [
      {
        path: '',
        component: Home,
      },
    ],
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
    path: '/communities',
    component: AuthGuard,
    children: [
      // Main community page with tab-based navigation
      {
        path: ':id',
        component: lazy(() => import('./pages/protected/community/[id]')),
      },
      // Tab routes - all handled by the same page component
      {
        path: ':id/resources',
        component: lazy(() => import('./pages/protected/community/[id]')),
      },
      {
        path: ':id/members',
        component: lazy(() => import('./pages/protected/community/[id]')),
      },
      {
        path: ':id/discussion',
        component: lazy(() => import('./pages/protected/community/[id]')),
      },
      {
        path: ':id/settings',
        component: lazy(() => import('./pages/protected/community/[id]')),
      },
      // Legacy/sub-pages that remain separate
      {
        path: ':id/health',
        component: lazy(() => import('./pages/protected/community/health')),
      },
      {
        path: ':id/settings/trust-levels',
        component: lazy(() => import('./pages/protected/community/trust-levels')),
      },
      {
        path: ':id/polls/new',
        component: lazy(() => import('./pages/protected/community/polls/new')),
      },
      {
        path: ':id/polls/:pollId',
        component: lazy(() => import('./pages/protected/community/polls/[pollId]')),
      },
      {
        path: ':id/needs',
        component: lazy(() => import('./pages/protected/community/needs')),
      },
      {
        path: ':id/needs/create',
        component: lazy(() => import('./pages/protected/community/needs/create')),
      },
      {
        path: ':id/needs/aggregate',
        component: lazy(() => import('./pages/protected/community/needs/aggregate')),
      },
      {
        path: ':id/wealth',
        component: lazy(() => import('./pages/protected/community/wealth')),
      },
      {
        path: ':id/wealth/create',
        component: lazy(() => import('./pages/protected/community/wealth/create')),
      },
      {
        path: ':id/pools',
        component: lazy(() => import('./pages/protected/community/pools')),
      },
      {
        path: ':id/pools/create',
        component: lazy(() => import('./pages/protected/community/pools/create')),
      },
      {
        path: ':id/pools/:poolId',
        component: lazy(() => import('./pages/protected/community/pools/[poolId]')),
      },
      {
        path: ':id/items',
        component: lazy(() => import('./pages/protected/community/items')),
      },
      {
        path: ':id/disputes',
        component: lazy(() => import('./pages/protected/community/disputes')),
      },
      {
        path: ':id/disputes/new',
        component: lazy(() => import('./pages/protected/community/disputes/new')),
      },
      {
        path: ':id/disputes/:disputeId',
        component: lazy(() => import('./pages/protected/community/disputes/[disputeId]')),
      },
      {
        path: ':id/contributions',
        component: lazy(() => import('./pages/protected/community/contributions')),
      },
      {
        path: ':id/councils/:councilId',
        component: lazy(() => import('./pages/protected/community/councils/[councilId]')),
      },
      {
        path: ':id/councils/:councilId/initiatives/:initiativeId',
        component: lazy(
          () => import('./pages/protected/community/councils/initiatives/[initiativeId]')
        ),
      },
    ],
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
  {
    path: '/checkout/:linkCode',
    component: lazy(() => import('./pages/public/checkout/[linkCode]')),
  },
  {
    path: '/dashboard',
    component: AuthGuard,
    children: [
      {
        path: '',
        component: Dashboard,
      },
    ],
  },
  {
    path: '/profile',
    component: AuthGuard,
    children: [
      {
        path: '',
        component: lazy(() => import('./pages/protected/profile')),
      },
    ],
  },
  {
    path: '/wealth',
    component: AuthGuard,
    children: [
      {
        path: ':id',
        component: lazy(() => import('./pages/protected/wealth/[id]')),
      },
    ],
  },
  {
    path: '/my-requests',
    component: AuthGuard,
    children: [
      {
        path: '',
        component: lazy(() => import('./pages/protected/my-requests')),
      },
    ],
  },
  {
    path: '/my-trust',
    component: AuthGuard,
    children: [
      {
        path: '',
        component: lazy(() => import('./pages/protected/my-trust')),
      },
    ],
  },
  {
    path: '/users',
    component: AuthGuard,
    children: [
      {
        path: ':id',
        component: lazy(() => import('./pages/protected/users/[id]')),
      },
    ],
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];
