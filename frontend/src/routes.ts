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
      {
        path: ':id',
        component: lazy(() => import('./pages/protected/community/[id]')),
      },
      {
        path: ':id/health',
        component: lazy(() => import('./pages/protected/community/health')),
      },
      {
        path: ':id/settings/trust-levels',
        component: lazy(() => import('./pages/protected/community/trust-levels')),
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
      // Pools are now embedded in the community page via the sidebar
      // {
      //   path: ':id/pools',
      //   component: lazy(() => import('./pages/protected/community/pools')),
      // },
      {
        path: ':id/pools/create',
        component: lazy(() => import('./pages/protected/community/pools/create')),
      },
      {
        path: ':id/pools/:poolId',
        component: lazy(() => import('./pages/protected/community/pools/[poolId]')),
      },
      {
        path: ':communityId/contributions',
        component: lazy(() => import('./pages/protected/CommunityContributions')),
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
    path: '/councils',
    component: AuthGuard,
    children: [
      {
        path: ':id/needs',
        component: lazy(() => import('./pages/protected/council/needs')),
      },
      {
        path: ':id/needs/create',
        component: lazy(() => import('./pages/protected/council/needs/create')),
      },
    ],
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];
