# Councils Feature Implementation

## Overview
This document describes the implementation of the Councils feature for the Share-8 community platform backend API.

## Database Schema

### Tables Created

#### 1. `councils`
Main table for council entities.
- `id` (UUID, primary key)
- `community_id` (UUID, FK to communities)
- `name` (VARCHAR 100, not null)
- `description` (TEXT, not null)
- `created_by` (TEXT, FK to app_users)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, soft delete)

#### 2. `council_managers`
Council-specific managers (per-council role assignment).
- `id` (UUID, primary key)
- `council_id` (UUID, FK to councils)
- `user_id` (TEXT, FK to app_users)
- `added_at` (TIMESTAMP)

#### 3. `council_trust_scores`
Trust scores for councils.
- `id` (UUID, primary key)
- `council_id` (UUID, FK to councils, unique)
- `trust_score` (INTEGER, default 0)
- `updated_at` (TIMESTAMP)

#### 4. `council_trust_awards`
Member-to-council trust relationships.
- `id` (UUID, primary key)
- `council_id` (UUID, FK to councils)
- `user_id` (TEXT, FK to app_users)
- `awarded_at` (TIMESTAMP)
- `removed_at` (TIMESTAMP, nullable)

#### 5. `council_trust_history`
Audit log of trust changes.
- `id` (UUID, primary key)
- `council_id` (UUID, FK to councils)
- `user_id` (TEXT, FK to app_users)
- `action` (VARCHAR 20: 'awarded' | 'removed')
- `timestamp` (TIMESTAMP)

#### 6. `council_inventory`
Current resources held by councils.
- `id` (UUID, primary key)
- `council_id` (UUID, FK to councils)
- `item_id` (UUID, FK to items)
- `quantity` (INTEGER, default 0)
- `unit` (VARCHAR 50, nullable)
- `updated_at` (TIMESTAMP)

#### 7. `council_transactions`
Auditable record of council resource movements.
- `id` (UUID, primary key)
- `council_id` (UUID, FK to councils)
- `type` (VARCHAR 20: 'received' | 'used' | 'transferred')
- `item_id` (UUID, FK to items)
- `quantity` (INTEGER)
- `description` (TEXT)
- `related_user_id` (TEXT, FK to app_users, nullable)
- `related_pool_id` (UUID, nullable)
- `created_at` (TIMESTAMP)

## API Endpoints

All endpoints are prefixed with `/api/v1/communities/:communityId`

### Council Management

#### GET `/councils`
List all councils in a community.
- **Query params**: `page`, `limit`, `sortBy` (trustScore|createdAt), `order` (asc|desc)
- **Auth**: Required (any community member)
- **Response**: `{ councils: Array<Council>, total: number, page: number, limit: number }`

#### GET `/councils/:councilId`
Get council details including managers and inventory.
- **Auth**: Required (community member)
- **Response**: Council object with managers and inventory arrays

#### POST `/councils`
Create a new council.
- **Body**: `{ name: string, description: string }`
- **Auth**: Required (admin OR trust >= 25)
- **Validation**:
  - Name: 3-100 characters, unique within community
  - Description: 10-1000 characters
- **Response**: Created council object

#### PUT `/councils/:councilId`
Update council details.
- **Body**: `{ name?: string, description?: string }`
- **Auth**: Required (admin OR council manager)
- **Response**: Updated council object

#### DELETE `/councils/:councilId`
Delete a council (soft delete).
- **Auth**: Required (admin only)
- **Response**: `{ success: true }`

### Council Trust System

#### GET `/councils/:councilId/trust-status`
Check if current user trusts this council.
- **Auth**: Required (community member)
- **Response**: `{ userHasTrusted: boolean, trustScore: number }`

#### POST `/councils/:councilId/trust`
Award trust to a council.
- **Body**: `{ award: true }` (optional)
- **Auth**: Required (community member)
- **Response**: `{ trustScore: number, userHasTrusted: true }`
- **Error**: 400 if already awarded

#### DELETE `/councils/:councilId/trust`
Remove trust from a council.
- **Auth**: Required (user must have previously trusted)
- **Response**: `{ trustScore: number, userHasTrusted: false }`
- **Error**: 400 if not previously awarded

### Council Managers

#### POST `/councils/:councilId/managers`
Add a manager to a council.
- **Body**: `{ userId: string }`
- **Auth**: Required (admin only)
- **Validation**: User must be community member
- **Response**: `{ success: true, managers: Array<Manager> }`

#### DELETE `/councils/:councilId/managers/:userId`
Remove a manager from a council.
- **Auth**: Required (admin only)
- **Response**: `{ success: true }`

### Council Inventory & Transactions

#### GET `/councils/:councilId/inventory`
Get council inventory.
- **Auth**: Required (community member)
- **Response**: `{ inventory: Array<InventoryItem> }`

#### GET `/councils/:councilId/transactions`
Get council transaction history.
- **Query params**: `page`, `limit`
- **Auth**: Required (community member)
- **Response**: `{ transactions: Array<Transaction>, total: number }`

## Authorization

### Permission Model

1. **Create Council**:
   - Community admin (bypasses trust requirement), OR
   - User with trust >= 25 (default threshold)

2. **View Council**:
   - Any community member

3. **Update Council**:
   - Community admin, OR
   - Council manager for that specific council

4. **Delete Council**:
   - Community admin only

5. **Manage Managers**:
   - Community admin only

6. **Award/Remove Trust**:
   - Any community member (for their own trust)

## Trust System

### How It Works

1. **Trust Score Calculation**:
   - Count of distinct users who have awarded trust
   - Excludes removed awards (`removed_at IS NULL`)
   - Automatically recalculated on award/remove

2. **Trust Awards**:
   - One award per user per council
   - Can be removed and re-awarded
   - All changes logged to `council_trust_history`

3. **Trust-Based Permissions**:
   - Councils with high trust scores can be designated for dispute handling
   - Trust scores visible to all community members
   - Transparent history of all trust changes

## File Structure

```
api/src/
├── db/
│   ├── schema/
│   │   └── councils.schema.ts          # Drizzle schema definitions
│   └── migrations/
│       └── 0003_majestic_vampiro.sql   # Generated migration
├── repositories/
│   └── council.repository.ts           # Data access layer
├── services/
│   └── council.service.ts              # Business logic layer
└── api/
    ├── controllers/
    │   └── council.controller.ts       # HTTP request handlers
    ├── routes/
    │   └── council.routes.ts           # Route definitions
    └── middleware/
        └── auth.middleware.ts          # Authentication (Keycloak)

tests/
└── http/
    └── councils.http                   # Manual HTTP test cases
```

## Testing

### Manual Testing

Use the provided HTTP test file: `tests/http/councils.http`

1. Update variables:
   - `@authToken`: Your Keycloak JWT token
   - `@communityId`: Community UUID
   - `@councilId`: Council UUID (after creation)
   - `@userId`: User ID for manager operations

2. Test scenarios covered:
   - Council CRUD operations
   - Trust award/removal
   - Manager assignment
   - Inventory and transactions
   - Permission checks
   - Validation errors
   - Unauthorized access

### Unit Tests

Unit tests should be added for:
- `CouncilService` - Business logic validation
- Trust calculation logic
- Permission checks

## Migration

The migration has been generated and is located at:
```
api/src/db/migrations/0003_majestic_vampiro.sql
```

To apply:
```bash
cd api
bun dev  # Migrations run automatically on server startup
```

Or manually:
```bash
cd api
bun run db:generate  # Generate migration (already done)
# Restart server to apply
```

## Integration with Frontend

### API Contract Summary

The frontend can expect the following response structures:

**Council List Response**:
```typescript
{
  councils: Array<{
    id: string;
    name: string;
    description: string;
    trustScore: number;
    memberCount: number;
    createdAt: string;
    createdBy: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

**Council Detail Response**:
```typescript
{
  id: string;
  name: string;
  description: string;
  trustScore: number;
  memberCount: number;
  createdAt: string;
  createdBy: string;
  managers: Array<{
    userId: string;
    userName: string;
    addedAt: string;
  }>;
  inventory: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string | null;
  }>;
}
```

## Future Enhancements

1. **Council Needs**: Endpoint for councils to publish resource needs
2. **Council Initiatives**: Endpoint for councils to create proposals
3. **Council Usage Reports**: Evidence-based reporting system
4. **Pool Association**: Link councils to resource pools
5. **Wealth Sharing**: Allow councils to share/receive wealth directly
6. **Trust-Based Permissions**: Use council trust scores for permissions (e.g., dispute handling)

## Notes

- All councils are soft-deleted (deletedAt timestamp)
- Trust scores are denormalized for performance (stored in council_trust_scores)
- Council managers are per-council (separate from community admin role)
- Inventory and transactions tables prepared for future wealth integration
- All endpoints require authentication via Keycloak JWT

## Configuration

Add to community schema in the future:
```typescript
minTrustForCouncilCreation: jsonb('min_trust_for_council_creation')
  .default({ type: 'number', value: 25 })
```

Currently hardcoded to 25 in `CouncilService.canCreateCouncil()`.
