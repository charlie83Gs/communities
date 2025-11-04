---
name: "Solid.js Developer"
description: "Expert agent for Solid.js frontend development with TypeScript, TanStack Query, Keycloak, and i18n"
---

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
│   ├── auth.store.ts    # Keycloak integration
│   └── app.store.ts     # Application state
├── services/            # External integrations
│   ├── api/            # API client & endpoints
│   ├── keycloak.service.ts  # Keycloak configuration (v26.2.1)
│   └── queries/        # TanStack Query definitions
├── hooks/              # Custom reactive hooks
├── guards/             # Route protection
├── utils/              # Helpers & utilities
├── types/              # TypeScript definitions
└── config/             # App configuration
```
## Internationalization (i18n) Strategy

Goal: Keep translations close to each page/feature for maintainability. Use a tiny reactive translator bound to a global locale signal. Avoid global providers/contexts to stay compatible with @solid-primitives/i18n v2.

Key files (examples implemented in this project):
- Global locale store: [i18nLocale.locale()](frontend/src/stores/i18n.store.ts:1)
- Translator helper: [makeTranslator(dict, namespace)](frontend/src/i18n/makeTranslator.ts:1)
- App navigation dictionary: [appDict](frontend/src/app.i18n.ts:1) and usage in [App](frontend/src/app.tsx:1)
- Language switcher UI + dict: [LanguageSwitcher](frontend/src/components/common/LanguageSwitcher.tsx:1), [languageSwitcherDict](frontend/src/components/common/LanguageSwitcher.i18n.ts:1)
- Page-local dictionaries:
- Home: [homeDict](frontend/src/pages/home.i18n.ts:1), usage in [home.tsx](frontend/src/pages/home.tsx:1)
- About: [aboutDict](frontend/src/pages/about.i18n.ts:1), usage in [about.tsx](frontend/src/pages/about.tsx:1)
- Login: [loginDict](frontend/src/pages/public/login.i18n.ts:1), usage in [login.tsx](frontend/src/pages/public/login.tsx:1)
- Shares feature:
- ShareList: [shareListDict](frontend/src/components/features/shares/ShareList.i18n.ts:1), usage in [ShareList.tsx](frontend/src/components/features/shares/ShareList.tsx:1)
- ShareCard: [shareCardDict](frontend/src/components/features/shares/ShareCard.i18n.ts:1), usage in [ShareCard.tsx](frontend/src/components/features/shares/ShareCard.tsx:1)
- ShareComments: [shareCommentsDict](frontend/src/components/features/shares/ShareComments.i18n.ts:1), usage in [ShareComments.tsx](frontend/src/components/features/shares/ShareComments.tsx:1)

Library note:
- @solid-primitives/i18n v2 is installed. We intentionally do not rely on I18nProvider/I18nContext/createI18nContext (removed in v2).
- We use a minimal translator that:
- Reads current locale from the global store
- Supports nested key access with dot paths
- Falls back to English then to the key string

Patterns and rules:
1) One dictionary per page/feature next to the component
    - Name: `X.i18n.ts`, export a `const XDict = { en: { X: {/*...*/} }, es: {...}, hi: {...} } as const`
    - Use a single, predictable namespace at the top level (e.g., `home`, `about`, `shareList`, `shareComments`)

2) Use the translator in the component
    - Import the dict and translator helper
    - `const t = makeTranslator(XDict, 'namespace');`
    - Replace literals with `t('key.path')`
    - For dynamic placeholders, call `t('text').replace('{{name}}', value)` (simple substitution)

3) Global locale management
    - Store and persist the chosen locale in LocalStorage: [i18nLocale](frontend/src/stores/i18n.store.ts:1)
    - Expose supported locales: `i18nLocale.supported` and signal `i18nLocale.locale()`

4) Language switcher
    - Use the shared component in the app chrome (navbar, header, etc.): [LanguageSwitcher](frontend/src/components/common/LanguageSwitcher.tsx:1)
    - It binds to `i18nLocale.locale()` and sets `i18nLocale.setLocale(...)`

5) Fallbacks and missing keys
    - If a key is missing in the active locale, the translator falls back to English
    - If still missing, it returns the key string to make gaps obvious during development

6) Adding a new page/component with i18n (checklist)
    - [ ] Create `./X.i18n.ts` next to the page/component with `en`, `es`, `hi` locales and a top-level namespace
    - [ ] Import dict and call `const t = makeTranslator(dict, 'namespace')` in the component
    - [ ] Replace hard-coded strings with `t(...)`
    - [ ] If needed, add a small dictionary for shared UI (e.g., buttons) next to the shared component
    - [ ] Manually test language switching via the navbar LanguageSwitcher
    - [ ] Confirm persistence across refresh
    
7) Keys and formatting conventions
    - Use kebab- or snake-free lowerCamelCase keys (e.g., `ctaLogin`, `featuresTitle`, `philosophy.noMoney.title`)
    - Keep messages plain strings; where structured content is needed, split into separate keys
    - For concatenated stylings (e.g., gradient word), split into parts and render UI pieces around the translated segments

8) Do / Don’t
    - Do keep dictionaries close to the components (per-file)
    - Do keep English as the authoritative baseline (complete keys first)
    - Do keep keys stable; refactor consumers if keys change
    - Don’t introduce a global, centralized giant dictionary
    - Don’t rely on removed provider/context APIs from older i18n primitives versions

Example usage snippet:
- In a page file:
- `import { makeTranslator } from '@/i18n/makeTranslator';`
- `import { homeDict } from './home.i18n';`
- `const t = makeTranslator(homeDict, 'home');`
- `<h1>{t('title')}</h1>`

Testing guidance:
- Switch between English, Spanish, Hindi using the navbar control
- Validate that:
- Navbar labels change (see [App](frontend/src/app.tsx:1))
- Page headings and CTAs change (e.g., [home.tsx](frontend/src/pages/home.tsx:1))
- Forms (labels/placeholders) change (e.g., [login.tsx](frontend/src/pages/public/login.tsx:1))
- Feature components update (e.g., [ShareList.tsx](frontend/src/components/features/shares/ShareList.tsx:1), [ShareCard.tsx](frontend/src/components/features/shares/ShareCard.tsx:1), [ShareComments.tsx](frontend/src/components/features/shares/ShareComments.tsx:1))

## Theming System

### Nature-Inspired Theme

The application uses a comprehensive nature-inspired theme built with **Tailwind CSS v4's `@theme` directive**. All theme configuration is centralized in `/frontend/src/index.css`.

#### Color Palette

**Primary Colors:**
- **Ocean Blue** (`ocean-50` → `ocean-950`): Primary actions, links, focus states
- **Forest Green** (`forest-50` → `forest-950`): Secondary actions, trust elements

**Accent Colors:**
- **Sky Blue** (`sky-50` → `sky-900`): Lighter accents, hero backgrounds
- **Leaf Green** (`leaf-50` → `leaf-900`): Vibrant green for success states
- **Sage Green** (`sage-50` → `sage-900`): Muted, calming green

**Semantic Colors:**
- **Success** (`success-50` → `success-900`): Success messages, positive feedback
- **Warning** (`warning-50` → `warning-900`): Warnings, caution states
- **Danger** (`danger-50` → `danger-900`): Errors, destructive actions

**Neutrals:**
- **Stone** (`stone-50` → `stone-950`): Warm gray for text, backgrounds, borders

All colors use **OKLCH color space** for perceptual uniformity and consistent WCAG AA/AAA contrast ratios.

#### Dark Mode Support

Dark mode is controlled by the `dark` class on the `<html>` element. The theme includes semantic CSS variables that automatically switch between light and dark values:

**Usage:**
```tsx
// Tailwind classes with dark mode
<div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
  Adapts to theme
</div>

// Semantic variables (auto-switching)
<div className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
  Uses semantic colors
</div>
```

**Available Semantic Variables:**
- `--color-primary`, `--color-primary-hover`, `--color-primary-light`
- `--color-secondary`, `--color-secondary-hover`, `--color-secondary-light`
- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-border-primary`, `--color-border-secondary`
- `--color-surface`, `--color-surface-elevated`

#### Theme Switcher Component

**Location:** `/frontend/src/components/common/ThemeSwitcher.tsx`

Add to navigation to allow users to toggle between light and dark modes:

```tsx
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

<nav>
  {/* other nav items */}
  <ThemeSwitcher />
</nav>
```

Features:
- Persists preference to localStorage
- Smooth transitions with animations
- Accessible with keyboard navigation
- Sun/moon icon indicators

#### Component Color Guidelines

When creating new components, follow these patterns:

**Buttons:**
```tsx
// Primary action
<button className="bg-ocean-600 hover:bg-ocean-700 text-white focus:ring-2 focus:ring-ocean-500">
  Primary
</button>

// Secondary action
<button className="bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600">
  Secondary
</button>

// Danger action
<button className="bg-danger-600 hover:bg-danger-700 text-white">
  Delete
</button>
```

**Forms:**
```tsx
<input className="border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500" />
```

**Cards:**
```tsx
<div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-md">
  Card content
</div>
```

**Badges:**
```tsx
// Success
<span className="bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200">
  Success
</span>

// Warning
<span className="bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200">
  Warning
</span>
```

**Trust Elements:**
Use forest/success greens for trust-related components:
```tsx
<input type="radio" className="text-forest-600 focus:ring-forest-500" />
<span className="bg-success-100 text-success-800">Trusted</span>
```

#### Design Tokens

The theme includes design tokens for consistent spacing, typography, and effects:

**Spacing:** `--spacing-xs` through `--spacing-3xl`
**Border Radius:** `--radius-sm` through `--radius-full`
**Shadows:** `--shadow-sm` through `--shadow-xl` (auto-adjust in dark mode)
**Typography:** `--font-size-xs` through `--font-size-6xl`

#### Theme Resources

- **Documentation:** `/frontend/THEME.md` - Complete theme reference
- **Visual Demo:** `/theme-demo` route - See all colors and components
- **Configuration:** `/frontend/src/index.css` - Theme source

#### Accessibility

All color combinations meet WCAG AA standards (4.5:1 for normal text):
- Ocean-600 on white: 7.8:1 (AAA)
- Forest-600 on white: 8.2:1 (AAA)
- Consistent focus states with ocean-500 ring
- Dark mode maintains proper contrast ratios

#### Best Practices

**Do:**
- ✅ Use semantic color names (ocean, forest) over generic blues/greens
- ✅ Include dark mode variants for all colored elements
- ✅ Use ocean-500 for focus states consistently
- ✅ Use stone neutrals instead of gray
- ✅ Test components in both light and dark modes

**Don't:**
- ❌ Use raw hex colors (use theme colors)
- ❌ Skip dark mode variants
- ❌ Use inconsistent focus colors
- ❌ Hardcode colors in components

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
│        │  │     ├─ Keycloak auth integration → (/services/keycloak.service.ts)
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
import { Component, JSX, splitProps, Show } from 'solid-js';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['variant', 'size', 'loading', 'children']);

  const baseClasses = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-ocean-600 hover:bg-ocean-700 text-white',
    secondary: 'bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      class={`${baseClasses} ${variantClasses[local.variant || 'primary']} ${sizeClasses[local.size || 'md']}`}
      disabled={local.loading}
      {...rest}
    >
      <Show when={!local.loading} fallback={<Spinner />}>
        {local.children}
      </Show>
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
import { Component, createMemo, Show } from 'solid-js';
import { useUserQuery } from '@/hooks/queries/useUserQuery';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
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
          <div class="w-12 h-12 rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 flex items-center justify-center font-semibold">
            {initials()}
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {user.data?.name}
            </h3>
            <p class="text-sm text-stone-600 dark:text-stone-400">
              {user.data?.email}
            </p>
          </div>
          <Show when={props.onEdit}>
            <Button variant="secondary" onClick={() => props.onEdit?.(user.data!)}>
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

### TanStack Query and UI Consistency Rules (Critical)

To prevent UI from getting "stuck" or showing stale data, follow these rules across all pages/features:

1) Navigation/loading gates
- Never gate a page on multiple queries with OR. Use a single primary query for the page-level loading state.
  - Example: In a community page, gate on community query only; secondary queries (role, trust) can load afterwards.
- Prefer showing partial content with skeletons for secondary data instead of blocking the whole page.

2) Query options defaults
- enabled: guard with valid identifiers (uuid checks when applicable).
- SELECTIVE refetch disabling: Only disable refetchOnMount/refetchOnWindowFocus for truly static data (e.g., trust level definitions)
- ⚠️ DON'T globally disable refetchOnMount or refetchOnWindowFocus - this causes stale data issues
- placeholderData: keep previous for search lists to avoid list flicker during pagination.
- Use sane staleTime/gcTime per resource volatility (e.g., 30s/5m for roles/community details).

3) Mutation side-effects must refresh caches (CRITICAL)
- ✅ ALWAYS add onSuccess with queryClient.invalidateQueries for ALL mutations
- ❌ NEVER create a mutation without cache invalidation
- Prefer invalidateQueries with partial keys when multiple variants exist:
  - queryClient.invalidateQueries({ queryKey: ['communities'], exact: false })
  - queryClient.invalidateQueries({ queryKey: ['users', 'invites'], exact: false })
- For single-entity updates:
  - queryClient.invalidateQueries({ queryKey: ['community', id] })
  - Optionally setQueryData for optimistic or immediate updates if UX requires.
- ⚠️ Invalidate ALL affected queries, not just the primary one
  - Example: Redeeming invite should invalidate: user invites, community list, AND community members

4) Auth state changes must clear cache (SECURITY)
- ✅ ALWAYS call queryClient.clear() on logout
- This prevents data leakage between users
- Handle in logout function, NOT in component code

5) Don't read mutation.isSuccess synchronously after mutate
- Use mutate(vars, { onSuccess }) or await mutateAsync for sequential flows.
- This avoids race conditions where isSuccess isn't yet updated.

6) Consistent query keys
- Scope entity lists under feature namespaces: ['community', id, 'members'], ['community', id, 'userInvites'].
- Keep keys stable and predictable so invalidations work reliably.

7) Patterns to copy/paste
- Create mutation:
  - onSuccess: invalidate all list queries, optionally setQueryData for new item
- Update mutation:
  - onSuccess: invalidate ['entity', id] and ['entities'] (partial).
- Delete mutation:
  - onSuccess: invalidate ['entities'] (partial) and removeQueries(['entity', id]).
- Invite mutations:
  - Create: invalidate ['community', id, 'userInvites'] and optionally ['community', id, 'members'].
  - Cancel: invalidate ['community', id, 'userInvites'] and ['users', 'invites'].
  - Redeem: invalidate ['users', 'invites'], ['communities', 'search'], and ['community', id, 'members'].

8) Avoid manual refetch anti-patterns
- ❌ DON'T expose refetch() from contexts and call manually in components
- ❌ DON'T add onChanged props to components that call refetch()
- ✅ DO rely on automatic invalidation from mutations
- Trust TanStack Query to auto-refetch when you invalidate

9) Defensive enabled checks
- For accessors, compute id first and validate (e.g., UUID regex) before enabling queries.

10) Testing checklists before merging
- Navigate to page without cached data: no "stuck" states; primary content renders when primary query resolves.
- Perform each mutation: related lists/details refresh without manual reload.
- Switch tabs within a feature: secondary data loads independently; primary content stays rendered.
- Switch between communities: data updates immediately, no stale content
- After logout: all cached data is cleared

Code snippets:

- Mutation with onSuccess invalidations
```ts
import { createMutation, useQueryClient } from '@tanstack/solid-query';

const queryClient = useQueryClient();
const updateCommunity = createMutation(() => ({
  mutationFn: (vars: { id: string; dto: UpdateCommunityDto }) =>
    communitiesService.updateCommunity(vars.id, vars.dto),
  onSuccess: (_data, vars) => {
    void queryClient.invalidateQueries({ queryKey: ['community', vars.id] });
    void queryClient.invalidateQueries({ queryKey: ['communities'], exact: false });
  },
}));
```

- Navigation gate using a single primary query
```tsx
// In context/provider:
const communityQuery = useCommunityQuery(() => communityId);
// Only this query controls page-level isLoading
const isLoading = () => communityQuery.isLoading;
```
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

## Authentication Implementation with Keycloak

### Auth Store

```typescript
// src/stores/auth.store.ts
import { createStore } from 'solid-js/store';
import type { User } from '@/types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const [authStore, setAuthStore] = createStore<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});
```

### Keycloak Service (v26.2.1)

```typescript
// src/services/keycloak.service.ts
import Keycloak from 'keycloak-js';

export interface KeycloakUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

class KeycloakService {
  private keycloak: Keycloak | null = null;
  private initialized: boolean = false;

  /**
   * Initialize Keycloak instance (v26.2.1)
   */
  init(): Keycloak {
    if (this.keycloak) {
      return this.keycloak;
    }

    this.keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8081',
      realm: import.meta.env.VITE_KEYCLOAK_REALM || 'share-app',
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'share-app-frontend',
    });

    // Set up token refresh callback
    this.keycloak.onTokenExpired = () => {
      console.log('Token expired, refreshing...');
      this.refreshToken();
    };

    return this.keycloak;
  }

  /**
   * Initialize authentication (v26.2.1 features)
   */
  async initAuth(options?: {
    onLoad?: 'login-required' | 'check-sso';
    checkLoginIframe?: boolean;
  }): Promise<boolean> {
    if (!this.keycloak) {
      this.init();
    }

    try {
      const authenticated = await this.keycloak!.init({
        onLoad: options?.onLoad || 'check-sso',
        checkLoginIframe: options?.checkLoginIframe !== false,
        checkLoginIframeInterval: 5,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',  // v26 recommendation: use PKCE
        flow: 'standard',     // Authorization Code flow
      });

      this.initialized = true;

      // Set up automatic token refresh
      if (authenticated) {
        this.setupTokenRefresh();
      }

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      throw error;
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    // Refresh token when it expires in 30 seconds or less
    setInterval(() => {
      this.refreshToken();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.keycloak) return false;

    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        console.log('Token refreshed successfully');
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Token refresh failed - likely session expired
      this.logout();
      return false;
    }
  }

  /**
   * Login (redirect to Keycloak)
   */
  async login(options?: {
    redirectUri?: string;
    prompt?: 'none' | 'login' | 'consent' | 'select_account';
    maxAge?: number;
    loginHint?: string;
    scope?: string;
  }): Promise<void> {
    if (!this.keycloak) {
      this.init();
    }

    await this.keycloak!.login({
      redirectUri: options?.redirectUri || window.location.origin,
      prompt: options?.prompt,
      maxAge: options?.maxAge,
      loginHint: options?.loginHint,
      scope: options?.scope,
    });
  }

  /**
   * Logout
   */
  async logout(redirectUri?: string): Promise<void> {
    if (!this.keycloak) return;

    await this.keycloak.logout({
      redirectUri: redirectUri || window.location.origin,
    });
  }

  /**
   * Register new user (redirect to registration page)
   */
  async register(redirectUri?: string): Promise<void> {
    if (!this.keycloak) {
      this.init();
    }

    await this.keycloak!.register({
      redirectUri: redirectUri || window.location.origin,
    });
  }

  /**
   * Get current user information
   */
  getUser(): KeycloakUser | null {
    if (!this.keycloak || !this.keycloak.authenticated) {
      return null;
    }

    const tokenParsed = this.keycloak.tokenParsed;
    const realmAccess = tokenParsed?.realm_access || {};
    const resourceAccess = tokenParsed?.resource_access || {};
    const clientId = this.keycloak.clientId || '';
    const clientAccess = resourceAccess[clientId] || {};

    return {
      id: tokenParsed?.sub || '',
      email: tokenParsed?.email || '',
      username: tokenParsed?.preferred_username || '',
      firstName: tokenParsed?.given_name,
      lastName: tokenParsed?.family_name,
      roles: [...(realmAccess.roles || []), ...(clientAccess.roles || [])],
    };
  }

  /**
   * Get access token
   */
  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.keycloak?.authenticated || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.keycloak?.hasRealmRole(role) ||
           this.keycloak?.hasResourceRole(role) ||
           false;
  }

  /**
   * Get account management URL
   */
  getAccountUrl(): string {
    return this.keycloak?.createAccountUrl() || '';
  }
}

export const keycloakService = new KeycloakService();
```

### Auth Hook Implementation

```typescript
// src/hooks/useAuth.ts
import { onCleanup } from 'solid-js';
import { useQueryClient } from '@tanstack/solid-query';
import { authStore, setAuthStore } from '@/stores/auth.store';
import { usersService } from '@/services/api/users.service';
import { keycloakService } from '@/services/keycloak.service';
import type { User } from '@/types/user.types';

let __authChecking = false;

export const useAuth = () => {
  const queryClient = useQueryClient();

  const checkSession = async () => {
    if (__authChecking) return;
    __authChecking = true;
    setAuthStore('isLoading', true);
    try {
      const isAuthenticated = keycloakService.isAuthenticated();
      if (isAuthenticated) {
        const keycloakUser = keycloakService.getUser();
        if (keycloakUser) {
          try {
            // Fetch full user profile from backend
            const fullUser = await usersService.getUser(keycloakUser.id);
            setAuthStore({ user: fullUser as User, isAuthenticated: true, isLoading: false });
          } catch (fetchError) {
            console.error('Failed to fetch user details:', fetchError);
            // Fallback to basic user from Keycloak token
            const basicUser: User = {
              id: keycloakUser.id,
              email: keycloakUser.email,
              username: keycloakUser.username,
              firstName: keycloakUser.firstName,
              lastName: keycloakUser.lastName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setAuthStore({ user: basicUser, isAuthenticated: true, isLoading: false });
          }
        } else {
          setAuthStore({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setAuthStore({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthStore({ user: null, isAuthenticated: false, isLoading: false });
    } finally {
      __authChecking = false;
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      // Redirect to Keycloak registration page
      // Note: Keycloak doesn't support direct API signup from frontend
      // User will be redirected to Keycloak's registration form
      await keycloakService.register(window.location.origin + '/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { success: false, error: 'Sign up failed' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Redirect to Keycloak login page
      // Note: With standard OIDC flow, we don't handle credentials directly
      // User will be redirected to Keycloak's login form
      await keycloakService.login({
        redirectUri: window.location.origin + '/dashboard',
        prompt: 'login',
        loginHint: email,
      });
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      // Clear all cached queries to prevent data leakage between users
      queryClient.clear();

      setAuthStore({ user: null, isAuthenticated: false, isLoading: false });

      // Redirect to Keycloak logout
      await keycloakService.logout(window.location.origin);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  onCleanup(() => {
    // Cleanup if necessary
  });

  return {
    user: () => authStore.user,
    isAuthenticated: () => authStore.isAuthenticated,
    isLoading: () => authStore.isLoading,
    signUp,
    login,
    logout,
    checkSession,
  };
};
```

### Protected Route Guard

```typescript
// src/guards/auth.guard.tsx
import { Show } from 'solid-js';
import { Navigate, type RouteSectionProps } from '@solidjs/router';
import { useAuth } from '@/hooks/useAuth';

export const AuthGuard = (props: RouteSectionProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <Show
      when={!isLoading()}
      fallback={<div class="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <Show when={isAuthenticated()} fallback={<Navigate href="/login" />}>
        {props.children}
      </Show>
    </Show>
  );
};
```

### Protected Route Usage

```typescript
// src/pages/protected/Profile.tsx
import { Component } from 'solid-js';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

const Profile: Component = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Profile</h1>
      <Show when={user()}>
        <div>
          <p>Email: {user()!.email}</p>
          <p>Username: {user()!.username}</p>
          <Button onClick={logout}>Logout</Button>
        </div>
      </Show>
    </div>
  );
};

export default Profile;
```

### Application Initialization with Keycloak

Initialize Keycloak when your app starts:

```typescript
// src/app.tsx or src/index.tsx
import { Component, createEffect, createSignal, Show } from 'solid-js';
import { Router } from '@solidjs/router';
import { keycloakService } from './services/keycloak.service';

const App: Component = () => {
  const [initialized, setInitialized] = createSignal(false);
  const [authenticated, setAuthenticated] = createSignal(false);

  createEffect(async () => {
    try {
      // Initialize Keycloak
      const auth = await keycloakService.initAuth({
        onLoad: 'check-sso',  // Check for existing session without forcing login
        checkLoginIframe: true,  // Enable silent token refresh
      });

      setAuthenticated(auth);
      setInitialized(true);

      console.log('Keycloak initialized:', auth ? 'authenticated' : 'not authenticated');
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      setInitialized(true);
    }
  });

  return (
    <Show when={initialized()} fallback={<div>Loading...</div>}>
      <Router>
        {/* Your routes */}
      </Router>
    </Show>
  );
};

export default App;
```

### Login Page Example

```typescript
// src/pages/public/Login.tsx
import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { keycloakService } from '@/services/keycloak.service';

const LoginPage: Component = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);

  // Redirect to Keycloak hosted login (Recommended)
  const handleKeycloakLogin = async () => {
    setLoading(true);
    try {
      await keycloakService.login({
        redirectUri: `${window.location.origin}/dashboard`,
        prompt: 'login',
      });
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const handleKeycloakRegister = async () => {
    setLoading(true);
    try {
      await keycloakService.register(
        `${window.location.origin}/dashboard`
      );
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
      <div class="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
            Powered by Keycloak SSO
          </p>
        </div>

        <div class="mt-8 space-y-6">
          <button
            onClick={handleKeycloakLogin}
            disabled={loading()}
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 disabled:opacity-50"
          >
            {loading() ? 'Redirecting...' : 'Sign in with Keycloak'}
          </button>

          <button
            onClick={handleKeycloakRegister}
            disabled={loading()}
            class="group relative w-full flex justify-center py-3 px-4 border border-stone-300 dark:border-stone-600 text-sm font-medium rounded-md text-stone-700 dark:text-stone-100 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 disabled:opacity-50"
          >
            Create new account
          </button>

          <div class="text-center text-xs text-stone-500 dark:text-stone-400">
            <p>You'll be redirected to a secure login page</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

### API Client Integration

Configure your API client to include Keycloak tokens:

```typescript
// src/services/api/client.ts
import axios from 'axios';
import { keycloakService } from '../keycloak.service';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Keycloak token
apiClient.interceptors.request.use(
  (config) => {
    const token = keycloakService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshed = await keycloakService.refreshToken();
        if (refreshed) {
          // Retry the original request
          const token = keycloakService.getToken();
          error.config.headers.Authorization = `Bearer ${token}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await keycloakService.logout(window.location.origin);
      }
    }
    return Promise.reject(error);
  }
);
```

### Key Authentication Patterns

1. **Redirect-Based Flow**: Keycloak uses OAuth2/OIDC redirect flow, not form-based authentication
2. **Automatic Token Refresh**: Tokens refresh automatically every 30 seconds if expiring
3. **Silent SSO**: Check for existing session without forcing login using `check-sso`
4. **Token in Headers**: Always send tokens via `Authorization: Bearer <token>` header
5. **Cache Clearing**: Clear all TanStack Query cache on logout to prevent data leakage
6. **PKCE Flow**: Use PKCE (Proof Key for Code Exchange) for enhanced security
7. **Session Monitoring**: Keycloak uses iframes for session monitoring across tabs

### Environment Variables

```bash
# .env.local
VITE_KEYCLOAK_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=share-app
VITE_KEYCLOAK_CLIENT_ID=share-app-frontend
VITE_API_URL=http://localhost:3000
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

feat(auth): add Keycloak integration
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

#### Keycloak Token Refresh Issues
```typescript
// Token automatically refreshes via keycloakService
// To manually check/refresh:
const isAuth = keycloakService.isAuthenticated();
if (isAuth) {
  // Force refresh if token expires in less than 30 seconds
  await keycloakService.refreshToken();
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

### Keycloak Setup
```bash
# Configure Keycloak in .env.local
VITE_KEYCLOAK_URL="http://localhost:8081"
VITE_KEYCLOAK_REALM="share-app"
VITE_KEYCLOAK_CLIENT_ID="share-app-frontend"
VITE_API_URL="http://localhost:3000"
```

### Silent SSO Check Page

Create a silent SSO check page for Keycloak's iframe-based session checking:

```html
<!-- public/silent-check-sso.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Silent SSO Check</title>
</head>
<body>
    <script>
        // This page is used by Keycloak for silent SSO checks
        parent.postMessage(location.href, location.origin);
    </script>
</body>
</html>
```

## Image Handling

### CredentialedImage Component
**Location**: `src/components/common/CredentialedImage.tsx`

**Purpose**: Fetches authenticated images from the backend API endpoint (`/api/v1/images/:filename`) using `fetch` with `credentials: 'include'` to send httpOnly auth cookies. Converts the response to a blob URL for secure `<img src>` usage. Handles loading errors and cleanup of object URLs.

**Key Features**:
- **Authentication**: Automatically includes session cookies for protected images.
- **Error Handling**: Shows fallback text on failure (e.g., 401/403/404).
- **Performance**: Revokes previous blob URLs on re-fetch to prevent memory leaks.
- **Usage**: Replace direct `<img src="/uploads/...">` with `<CredentialedImage src="/api/v1/images/filename.webp" />` for any authenticated image.

**Example**:
```tsx
import { CredentialedImage } from '@/components/common/CredentialedImage';

<CredentialedImage
src={`${baseUrl}/api/v1/images/${imageFilename}`}
alt="Profile"
class="w-20 h-20 rounded-full object-cover"
fallbackText="Image failed to load"
/>
```

**Props**:
- `src`: Absolute URL to the images API endpoint.
- `fallbackText`: Optional error message.
- Standard `<img>` props (e.g., `alt`, `class`, `width`).

### Images Service
**Location**: `src/services/api/images.service.ts`

**Purpose**: Centralized API client for image uploads and URL generation. Integrates with backend `/api/v1/images` for processing (resize, WebP conversion via Sharp) and storage.

**Key Methods**:
- `upload(file: File)`: Multipart upload, returns `UploadedImage` metadata (id, filename, dimensions).
- `url(filename?: string)`: Generates authenticated URL: `${baseUrl}/api/v1/images/${filename}`.

**Integration**:
- Use in mutations: `const saved = await imagesService.upload(file);`
- For display: `imagesService.url(saved.filename)` passed to CredentialedImage.
- Backend stores images in `uploads/images/<uuid>.webp`; frontend never accesses direct paths.

**Example** (Upload in a form):
```tsx
import { imagesService } from '@/services/api/images.service';
import { useUploadMutation } from '@/hooks/queries/useUploadMutation';

const uploadMutation = useUploadMutation();

const handleUpload = async (file: File) => {
try {
    const saved = await imagesService.upload(file);
    // Update state/UI with saved.filename
    setImageFilename(saved.filename);
} catch (error) {
    console.error('Upload failed:', error);
}
};
```

**Best Practices**:
- Always pair with CredentialedImage for retrieval to ensure auth.
- Validate file types/sizes client-side before upload.
- Use in features like profiles, shares, communities: Upload → Store filename in DB → Retrieve via service/component.
- For public images (future), add optional public endpoint; currently all require auth.
groups:
- read
- edit
- browser
- command
- mcp
source: project
