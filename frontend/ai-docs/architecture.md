# Application Architecture

## Technology Stack

### Core Technologies
- **Runtime**: Bun (latest)
- **Framework**: Solid.js 1.8+
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 5.x with vite-plugin-solid
- **Authentication**: SuperTokens (supertokens-web-js)
- **Routing**: @solidjs/router
- **State Management**: Solid.js Stores + @tanstack/solid-query
- **Styling**: Tailwind CSS + CSS Modules
- **Testing**: Vitest + @solidjs/testing-library
- **Component Library**: @kobalte/core (accessible components)

## Architecture Principles

### 1. Reactive State Management
```
┌─────────────────────────────────────────┐
│            Application State             │
├─────────────┬───────────┬───────────────┤
│ Auth Store  │ App Store │ Feature Stores│
│(SuperTokens)│  (Global)  │   (Domain)    │
└─────────────┴───────────┴───────────────┘
        ↓             ↓              ↓
┌─────────────────────────────────────────┐
│           Reactive Signals              │
└─────────────────────────────────────────┘
        ↓             ↓              ↓
┌─────────────────────────────────────────┐
│         Component Tree (UI)             │
└─────────────────────────────────────────┘
```

### 2. Authentication Flow
```
User Action → SuperTokens SDK → Auth Store → Route Guards → Protected Content
                    ↓
              Session Tokens
                    ↓
              API Interceptor → Backend API
```

### 3. Data Flow Architecture
```
Component → Custom Hook → Query/Mutation → API Service → Backend
              ↓                ↓
         Local State      Cache Layer
                         (@tanstack/query)
```

## Project Structure

```
src/
├── components/           # Presentational components
│   ├── common/          # Reusable UI (Button, Input, Modal)
│   ├── layout/          # App structure (Header, Sidebar)
│   └── features/        # Feature-specific components
├── pages/               # Route components
│   ├── public/          # Unprotected routes
│   └── protected/       # Auth-required routes
├── stores/              # Global reactive stores
│   ├── auth.store.ts    # SuperTokens integration
│   └── app.store.ts     # Application state
├── services/            # External integrations
│   ├── api/            # API client & endpoints
│   ├── auth/           # SuperTokens configuration
│   └── queries/        # TanStack Query definitions
├── hooks/              # Custom reactive hooks
├── guards/             # Route protection
├── utils/              # Helpers & utilities
├── types/              # TypeScript definitions
└── config/             # App configuration
```

## Core Modules

### Authentication Module (SuperTokens)
```typescript
// config/supertokens.config.ts
export const SuperTokensConfig = {
  appInfo: {
    appName: "YourApp",
    apiDomain: import.meta.env.VITE_API_URL,
    websiteDomain: import.meta.env.VITE_APP_URL,
    apiBasePath: "/auth",
    websiteBasePath: "/auth"
  },
  recipeList: [
    EmailPassword.init(),
    Session.init()
  ]
};
```

### Store Architecture
```typescript
// stores/auth.store.ts
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: string[];
}

// Reactive store with SuperTokens integration
export const [authState, setAuthState] = createStore<AuthState>();
```

### API Layer
```typescript
// services/api/client.ts
class APIClient {
  private baseURL: string;
  
  constructor() {
    // SuperTokens automatically handles auth headers
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request/response interceptors
    // Session refresh logic
  }
}
```

## Component Architecture

### Component Types

1. **Page Components** (`/pages`)
   - Route-level components
   - Data fetching orchestration
   - Layout composition

2. **Feature Components** (`/components/features`)
   - Business logic encapsulation
   - Feature-specific UI
   - Local state management

3. **Common Components** (`/components/common`)
   - Reusable UI elements
   - No business logic
   - Props-driven

4. **Layout Components** (`/components/layout`)
   - Application structure
   - Navigation
   - Global UI elements

### Component Communication
```
Props Down → Events Up
     ↓           ↑
Parent ←→ Context/Store ←→ Child
```

## Routing Strategy

### Route Structure
```typescript
// router.tsx
const routes = [
  // Public routes
  { path: '/login', component: lazy(() => import('./pages/public/Login')) },
  { path: '/register', component: lazy(() => import('./pages/public/Register')) },
  
  // Protected routes
  {
    path: '/',
    component: ProtectedRoute,
    children: [
      { path: '/', component: lazy(() => import('./pages/protected/Dashboard')) },
      { path: '/profile', component: lazy(() => import('./pages/protected/Profile')) },
    ]
  }
];
```

### Route Protection
```typescript
// guards/ProtectedRoute.tsx
const ProtectedRoute: Component = () => {
  const isAuth = () => authState.isAuthenticated;
  
  return (
    <Show when={isAuth()} fallback={<Navigate href="/login" />}>
      <Outlet />
    </Show>
  );
};
```

## State Management Patterns

### Local State (Signals)
```typescript
// For component-specific state
const [count, setCount] = createSignal(0);
```

### Shared State (Stores)
```typescript
// For cross-component state
const [appStore, setAppStore] = createStore({
  theme: 'light',
  sidebarOpen: true
});
```

### Server State (TanStack Query)
```typescript
// For API data
const query = createQuery(() => ({
  queryKey: ['users'],
  queryFn: fetchUsers,
}));
```

## Performance Optimization

### Code Splitting
- Lazy load routes
- Dynamic imports for heavy components
- Bundle splitting by feature

### Reactivity Optimization
- Use `createMemo` for expensive computations
- Implement `Show` instead of conditional rendering
- Batch updates with `batch`

### Asset Optimization
- Image lazy loading
- CDN for static assets
- Compression with Bun

## Security Considerations

### Authentication Security
- SuperTokens handles token management
- Automatic session refresh
- CSRF protection built-in
- HttpOnly cookies for sessions

### Input Validation
- Client-side validation with zod
- Sanitize user inputs
- XSS protection through Solid's default behavior

### API Security
- Request rate limiting
- Input validation schemas
- Secure headers configuration

## Error Handling

### Global Error Boundary
```typescript
// App.tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Router>
    <Routes />
  </Router>
</ErrorBoundary>
```

### API Error Handling
```typescript
// Centralized error handling
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
```

## Testing Strategy

### Unit Tests
- Component logic
- Utility functions
- Store actions

### Integration Tests
- User flows
- API interactions
- Authentication flows

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Performance benchmarks

## Deployment Architecture

### Environment Configuration
```
Development → Staging → Production
     ↓           ↓          ↓
  .env.dev   .env.stage  .env.prod
```

### Build Pipeline
1. Type checking
2. Linting
3. Unit tests
4. Build optimization
5. Bundle analysis
6. Deployment

## Monitoring & Logging

### Client-Side Monitoring
- Error tracking (Sentry)
- Performance metrics
- User analytics

### Logging Strategy
- Structured logging
- Log levels (debug, info, warn, error)
- Environment-based log configuration

## Scalability Considerations

### Horizontal Scaling
- Stateless components
- CDN for static assets
- Load balancing ready

### Vertical Scaling
- Code splitting
- Lazy loading
- Virtual scrolling for large lists
- Pagination for data sets
