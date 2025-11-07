# Solid.js Developer Guide

You are a developer for a bun solid.js project, below are instructions and examples that will be helpful during development. Make sure to use the Decision tree to determine where code and logic should be hosted.

When planning new additions, like new libraries, new components make sure to understand the contents of ./ai-docs/architecture.md before proceeding to any implementation. Is of the higest importance that we adhere to our architecture principles.

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

## Component Development


### Creating a New Component

#### Decision Tree: Where should it go?

```
Start
├─ Is it a UI surface tied to a route?
│  ├─ Yes → Page Component (/pages)
│  └─ No
│     ├─ Is it a presentational UI element reused across features?
│     │  ├─ Yes → Common Component (/components/common)
│     │  └─ No
│     │     ├─ Is it part of the global app chrome (header/sidebar/layout)?
│     │     │  ├─ Yes → Layout Component (/components/layout)
│     │     │  └─ No → Feature Component (/components/features/[feature-name])
│     │
│     └─ Is it primarily logic (no UI) to be consumed by components?
│        ├─ Does it encapsulate reactive UI logic, side-effects, or composition over state?
│        │  ├─ Yes → Hook (/hooks)
│        │  │     ├─ Is it a data-fetching/query hook?
│        │  │     │  ├─ Yes → Query Hook (/hooks/queries)
│        │  │     │  └─ No  → General Hook (/hooks)
│        │  └─ No
│        │
│        ├─ Is it pure, stateless helper code (formatting, parsing, math, mappers)?
│        │  ├─ Yes → Utility (/utils)
│        │  └─ No
│        │
│        ├─ Is it centralized, long-lived application state shared across areas?
│        │  ├─ Yes → Store (/stores)
│        │  └─ No
│        │
│        ├─ Is it about route access control or navigation protection?
│        │  ├─ Yes → Guard (/guards)
│        │  └─ No
│        │
│        ├─ Does it integrate with external systems (HTTP, SDKs) or define API calls?
│        │  ├─ Yes → Service (/services)
│        │  │     ├─ HTTP/API endpoints → (/services/api)
│        │  │     ├─ Auth provider setup → (/services/auth)
│        │  │     └─ Query key/defs (if centralizing) → (/services/queries)
│        │  └─ No
│        │
│        ├─ Is it a shared type/interface/schema?
│        │  ├─ Yes → Types (/types)
│        │  └─ No
│        │
│        └─ Is it environment/configuration/static app settings?
│           ├─ Yes → Config (/config)
│           └─ No → Re-evaluate: it may belong inside a feature folder or as a local module.
```

#### 1. Common Component (Reusable UI)

**When to create**: Button, Input, Card, Modal, Dropdown

**Location**: `src/components/common/`

**Template**:
```bash
# Generate component
bun run generate:component Button common
```

**Structure**:
```typescript
// src/components/common/Button.tsx
import { Component, JSX, splitProps } from 'solid-js';
import styles from './Button.module.css';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['variant', 'size', 'loading', 'children']);
  
  return (
    <button
      class={`${styles.button} ${styles[local.variant || 'primary']} ${styles[local.size || 'md']}`}
      disabled={local.loading}
      {...rest}
    >
      {local.loading ? <Spinner /> : local.children}
    </button>
  );
};
```

**Test file**:
```typescript
// src/components/common/Button.test.tsx
import { render, fireEvent } from '@solidjs/testing-library';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    const { getByText } = render(() => <Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(() => <Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 2. Feature Component (Business Logic)

**When to create**: UserProfile, ShoppingCart, CommentSection

**Location**: `src/components/features/[feature-name]/`

**Template**:
```typescript
// src/components/features/users/UserCard.tsx
import { Component, createMemo } from 'solid-js';
import { useUserQuery } from '@/hooks/queries/useUserQuery';
import { Card } from '@/components/common/Card';
import type { User } from '@/types/user.types';

interface UserCardProps {
  userId: string;
  onEdit?: (user: User) => void;
}

export const UserCard: Component<UserCardProps> = (props) => {
  const user = useUserQuery(() => props.userId);
  
  const initials = createMemo(() => {
    if (!user.data) return '';
    return `${user.data.firstName[0]}${user.data.lastName[0]}`;
  });
  
  return (
    <Card>
      <Show when={!user.isLoading} fallback={<UserCardSkeleton />}>
        <div class="flex items-center gap-4">
          <div class="avatar">{initials()}</div>
          <div>
            <h3>{user.data?.name}</h3>
            <p>{user.data?.email}</p>
          </div>
          <Show when={props.onEdit}>
            <Button onClick={() => props.onEdit?.(user.data!)}>
              Edit
            </Button>
          </Show>
        </div>
      </Show>
    </Card>
  );
};
```

#### 3. Page Component (Route Handler)

**When to create**: For each route in your application

**Location**: `src/pages/`

**Template**:
```typescript
// src/pages/protected/Dashboard.tsx
import { Component, onMount } from 'solid-js';
import { Meta, Title } from '@solidjs/meta';
import { useNavigate } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { dashboardService } from '@/services/api/dashboard.service';

const Dashboard: Component = () => {
  const navigate = useNavigate();
  
  // Data fetching
  const stats = createQuery(() => ({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
  }));
  
  onMount(() => {
    // Page-level side effects
    console.log('Dashboard mounted');
  });
  
  return (
    <>
      <Title>Dashboard - YourApp</Title>
      <Meta name="description" content="Your dashboard overview" />
      
      <DashboardLayout>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <For each={stats.data?.items}>
            {(stat) => <StatsCard {...stat} />}
          </For>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
```

## Service & API Development

### Creating an API Service

**Location**: `src/services/api/`

**Template**:
```typescript
// src/services/api/user.service.ts
import { apiClient } from './client';
import type { User, UpdateUserDto } from '@/types/user.types';

class UserService {
  private readonly basePath = '/users';
  
  async getUser(id: string): Promise<User> {
    return apiClient.get(`${this.basePath}/${id}`);
  }
  
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return apiClient.patch(`${this.basePath}/${id}`, data);
  }
  
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const userService = new UserService();
```

### Creating Query Hooks

**Location**: `src/hooks/queries/`

**Template**:
```typescript
// src/hooks/queries/useUserQuery.ts
import { createQuery, CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { userService } from '@/services/api/user.service';
import type { User } from '@/types/user.types';

export const useUserQuery = (
  userId: Accessor<string | undefined>
): CreateQueryResult<User, Error> => {
  return createQuery(() => ({
    queryKey: ['user', userId()],
    queryFn: () => userService.getUser(userId()!),
    enabled: !!userId(),
  }));
};
```

## Store Management

### Creating a Store

**Location**: `src/stores/`

**Template**:
```typescript
// src/stores/cart.store.ts
import { createStore } from 'solid-js/store';
import type { CartItem, Cart } from '@/types/cart.types';

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
}

const [cartState, setCartState] = createStore<CartState>({
  items: [],
  total: 0,
  isLoading: false,
});

// Action creators
export const cartActions = {
  addItem(item: CartItem) {
    setCartState('items', (items) => [...items, item]);
    this.updateTotal();
  },
  
  removeItem(id: string) {
    setCartState('items', (items) => items.filter(item => item.id !== id));
    this.updateTotal();
  },
  
  updateTotal() {
    const total = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCartState('total', total);
  },
  
  clear() {
    setCartState({
      items: [],
      total: 0,
      isLoading: false,
    });
  },
};

// Selectors
export const cartSelectors = {
  getItemCount: () => cartState.items.length,
  getTotal: () => cartState.total,
  getItems: () => cartState.items,
};

export { cartState };
```

## Authentication Implementation

### Protected Route Creation

```typescript
// src/pages/protected/Profile.tsx
import { Component } from 'solid-js';
import { useAuth } from '@/hooks/useAuth';

const Profile: Component = () => {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Profile</h1>
      <Show when={user()} fallback={<Navigate href="/login" />}>
        <UserProfile user={user()!} />
        <Button onClick={logout}>Logout</Button>
      </Show>
    </div>
  );
};
```

### Auth Hook Implementation

```typescript
// src/hooks/useAuth.ts
import { createEffect, onCleanup } from 'solid-js';
import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import { authStore, setAuthStore } from '@/stores/auth.store';

export const useAuth = () => {
  const checkSession = async () => {
    const exists = await Session.doesSessionExist();
    if (exists) {
      const userId = await Session.getUserId();
      const user = await userService.getProfile(userId);
      setAuthStore({ user, isAuthenticated: true });
    } else {
      setAuthStore({ user: null, isAuthenticated: false });
    }
  };
  
  const login = async (email: string, password: string) => {
    const response = await signIn(email, password);
    if (response.status === 'OK') {
      await checkSession();
      return { success: true };
    }
    return { success: false, error: response.message };
  };
  
  const logout = async () => {
    await Session.signOut();
    setAuthStore({ user: null, isAuthenticated: false });
  };
  
  return {
    user: () => authStore.user,
    isAuthenticated: () => authStore.isAuthenticated,
    login,
    logout,
    checkSession,
  };
};
```

## Testing Guidelines

### Unit Testing

#### Component Testing

```bash
# Run component test
bun test UserCard
```

```typescript
// src/components/features/users/UserCard.test.tsx
import { render, waitFor } from '@solidjs/testing-library';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { UserCard } from './UserCard';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return (props: any) => (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
};

describe('UserCard', () => {
  it('displays user information', async () => {
    const { getByText } = render(
      () => <UserCard userId="123" />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

#### Hook Testing

```typescript
// src/hooks/useDebounce.test.ts
import { renderHook } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('debounces value changes', async () => {
    const { result } = renderHook(() => {
      const [value, setValue] = createSignal('');
      const debouncedValue = useDebounce(value, 300);
      return { setValue, debouncedValue };
    });
    
    result.setValue('test');
    expect(result.debouncedValue()).toBe('');
    
    await new Promise(resolve => setTimeout(resolve, 350));
    expect(result.debouncedValue()).toBe('test');
  });
});
```

### Integration Testing

```typescript
// src/tests/integration/auth-flow.test.tsx
import { render, fireEvent, waitFor } from '@solidjs/testing-library';
import { Router } from '@solidjs/router';
import App from '@/App';

describe('Authentication Flow', () => {
  it('redirects to login when accessing protected route', async () => {
    const { history } = render(() => <App />, {
      wrapper: Router,
      initialEntries: ['/dashboard']
    });
    
    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    });
  });
  
  it('allows access after successful login', async () => {
    const { getByLabelText, getByRole, history } = render(() => <App />);
    
    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(history.location.pathname).toBe('/dashboard');
    });
  });
});
```

### E2E Testing

```bash
# Run E2E tests
bun test:e2e
```

```typescript
// src/tests/e2e/user-journey.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test('complete signup and login flow', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

## Code Style Guidelines

### Naming Conventions

```typescript
// Files
UserCard.tsx         // Components (PascalCase)
useAuth.ts          // Hooks (camelCase with 'use' prefix)
user.service.ts     // Services (camelCase with suffix)
auth.store.ts       // Stores (camelCase with suffix)
formatDate.ts       // Utilities (camelCase)

// Variables & Functions
const userData = {};           // camelCase
const MAX_RETRY_COUNT = 3;    // SCREAMING_SNAKE_CASE for constants
function calculateTotal() {}   // camelCase

// Types & Interfaces
interface UserProfile {}       // PascalCase
type ButtonVariant = 'primary' | 'secondary';  // PascalCase
```

### Import Organization

```typescript
// 1. External libraries
import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// 2. Internal absolute imports
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { UserCard } from './UserCard';
import styles from './UserList.module.css';

// 4. Type imports
import type { User } from '@/types/user.types';
```

### Component Best Practices

```typescript
// ✅ DO: Use explicit types
const MyComponent: Component<Props> = (props) => { };

// ✅ DO: Destructure props in function parameters
const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['variant', 'size']);
};

// ✅ DO: Use Show/Switch for conditional rendering
<Show when={isLoading()} fallback={<Content />}>
  <Spinner />
</Show>

// ❌ DON'T: Use ternary operators for components
{isLoading() ? <Spinner /> : <Content />}

// ✅ DO: Memoize expensive computations
const filteredItems = createMemo(() => 
  items().filter(item => item.active)
);

// ✅ DO: Clean up effects
createEffect(() => {
  const timer = setInterval(tick, 1000);
  onCleanup(() => clearInterval(timer));
});
```

## Git Workflow

### Branch Naming
```bash
feature/user-authentication
bugfix/cart-calculation
hotfix/critical-auth-issue
chore/update-dependencies
```

### Commit Messages
```bash
# Format: <type>(<scope>): <subject>

feat(auth): add SuperTokens integration
fix(cart): resolve total calculation error
docs(readme): update setup instructions
test(user): add unit tests for UserCard
style(button): update primary variant colors
refactor(api): extract common request logic
```

### Pre-commit Checklist
```bash
# Run before committing
bun run lint          # Check linting
bun run typecheck    # TypeScript validation
bun test            # Run tests
bun run build       # Verify build works
```

## Troubleshooting

### Common Issues

#### SuperTokens Session Issues
```typescript
// Check session validity
if (await Session.doesSessionExist()) {
  // Manually refresh if needed
  await Session.attemptRefreshingSession();
}
```

#### Reactivity Not Working
```typescript
// ❌ Wrong: Direct mutation
state.items.push(newItem);

// ✅ Correct: Use setter
setState('items', items => [...items, newItem]);
```

#### Component Not Re-rendering
```typescript
// Ensure dependencies are reactive
createEffect(() => {
  // ❌ Non-reactive
  console.log(props.value);
  
  // ✅ Reactive
  console.log(props.value());
});
```

## Performance Optimization

### Lazy Loading
```typescript
// Routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Heavy components
const ChartComponent = lazy(() => import('./components/Chart'));
```

### Virtual Scrolling
```typescript
// For large lists
import { VirtualList } from '@tanstack/solid-virtual';

<VirtualList
  data={items()}
  rowHeight={50}
  renderItem={(item) => <ItemCard {...item} />}
/>
```

### Bundle Analysis
```bash
# Analyze bundle size
bun run build
bun run analyze
```

### SuperTokens Setup
```bash
# Configure SuperTokens in .env.local
VITE_SUPERTOKENS_APP_NAME="YourApp"
VITE_API_DOMAIN="http://localhost:3001"
VITE_WEBSITE_DOMAIN="http://localhost:3000"
VITE_API_BASE_PATH="/auth"
VITE_WEBSITE_BASE_PATH="/auth"
```
