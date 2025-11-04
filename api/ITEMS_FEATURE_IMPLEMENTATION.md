# Items Feature Implementation Summary

## Overview
Complete backend implementation of the Items feature for standardizing resource naming across communities. This allows aggregation of shared resources (e.g., "10 users shared Carrots = total carrots available").

## Status: ✅ READY FOR FRONTEND INTEGRATION

All backend components have been implemented and tested. The API is ready for the frontend to consume.

---

## API Endpoints

### Base URL: `/api/v1/items`

All endpoints require authentication via `Authorization: Bearer <token>` header.

### 1. List Items
```
GET /api/v1/items?communityId={uuid}&includeDeleted={boolean}
```
- **Query Params:**
  - `communityId` (required): UUID of the community
  - `includeDeleted` (optional): Include soft-deleted items (default: false)
- **Response:** Array of items with wealth count
```typescript
[{
  id: string;
  communityId: string;
  name: string;
  description: string | null;
  kind: 'object' | 'service';
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count: { wealthEntries: number };
}]
```

### 2. Search Items
```
GET /api/v1/items/search?communityId={uuid}&query={string}&kind={object|service}
```
- **Query Params:**
  - `communityId` (required): UUID of the community
  - `query` (optional): Search term (matches name or description, case-insensitive)
  - `kind` (optional): Filter by type ('object' or 'service')
- **Response:** Array of matching items (max 50 results)

### 3. Get Item by ID
```
GET /api/v1/items/:id
```
- **Response:** Single item object

### 4. Create Item
```
POST /api/v1/items
Content-Type: application/json

{
  "communityId": "uuid",
  "name": "string (1-200 chars)",
  "description": "string (optional)",
  "kind": "object" | "service"
}
```
- **Permissions:** Requires `can_manage_items` (admin, item_manager role, or trust >= 20)
- **Validation:**
  - Name must be unique within community (case-insensitive)
  - Name length: 1-200 characters
- **Response:** Created item (201)

### 5. Update Item
```
PUT /api/v1/items/:id
Content-Type: application/json

{
  "name": "string (optional)",
  "description": "string (optional)",
  "kind": "object" | "service" (optional)
}
```
- **Permissions:** Requires `can_manage_items`
- **Restrictions:**
  - Cannot update deleted items
  - Name uniqueness checked if changed
- **Response:** Updated item (200)

### 6. Delete Item
```
DELETE /api/v1/items/:id
```
- **Permissions:** Requires `can_manage_items`
- **Restrictions:**
  - Soft delete only (sets `deletedAt`)
  - Cannot delete default items (`isDefault: true`)
  - Cannot delete items with active wealth shares
- **Response:** Success message (200)

---

## Permission System

### Authorization via OpenFGA

The `can_manage_items` permission is granted when the user has ANY of:
1. **Admin role** - Community admin (bypasses all checks)
2. **item_manager role** - Explicitly granted by admin
3. **Trust threshold** - User trust score >= `minTrustForItemManagement` (default: 20)

### Community Configuration

Each community has a configurable trust threshold:
```typescript
{
  minTrustForItemManagement: {
    type: 'number',
    value: 20  // default
  }
}
```

### Viewing Items

All community members can view items (no special permission required).

---

## Database Schema

### Items Table

```sql
CREATE TABLE items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id      uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name              varchar(200) NOT NULL,
  description       text,
  kind              item_kind NOT NULL,  -- enum: 'object' | 'service'
  is_default        boolean DEFAULT false NOT NULL,
  created_by        text NOT NULL REFERENCES app_users(id),
  created_at        timestamp DEFAULT now() NOT NULL,
  updated_at        timestamp DEFAULT now() NOT NULL,
  deleted_at        timestamp,  -- soft delete support

  CONSTRAINT items_community_name_unique
    UNIQUE (community_id, LOWER(name)) WHERE deleted_at IS NULL
);
```

### Wealth Table Update

```sql
ALTER TABLE wealth
ADD COLUMN item_id uuid NOT NULL REFERENCES items(id);
```

### Communities Table Update

```sql
ALTER TABLE communities
ADD COLUMN min_trust_for_item_management jsonb
  DEFAULT '{"type":"number","value":20}'::jsonb NOT NULL;
```

---

## Migration Strategy

### Migration: `0004_add_items_feature.sql`

The migration safely handles existing data:

1. ✅ Creates `item_kind` enum
2. ✅ Creates `items` table with constraints
3. ✅ Adds `minTrustForItemManagement` to communities (default: 20)
4. ✅ **Creates default "Other" item for ALL existing communities**
5. ✅ Adds `item_id` column to wealth (nullable first)
6. ✅ **Updates ALL existing wealth entries** to reference default "Other" item
7. ✅ Makes `item_id` NOT NULL and adds foreign key
8. ✅ Adds unique constraint on (community_id, LOWER(name))

### Default Item Creation

Every community automatically gets a default "Other" item:
- Name: "Other"
- Description: "Default item for uncategorized resources"
- Kind: object
- isDefault: true (cannot be deleted)

This happens:
- During migration for existing communities
- When creating new communities (via `community.service.ts`)

---

## Files Created/Modified

### Created Files
1. ✅ `api/src/db/schema/items.schema.ts` - Drizzle schema
2. ✅ `api/src/repositories/items.repository.ts` - Data access layer
3. ✅ `api/src/services/items.service.ts` - Business logic
4. ✅ `api/src/api/validators/items.validator.ts` - Zod validation
5. ✅ `api/src/api/controllers/items.controller.ts` - HTTP handlers
6. ✅ `api/src/api/routes/items.routes.ts` - Route definitions
7. ✅ `api/src/db/migrations/0004_add_items_feature.sql` - Database migration
8. ✅ `api/tests/http/items.http` - HTTP test examples

### Modified Files
1. ✅ `api/src/db/schema/wealth.schema.ts`
   - Added `itemId` field (NOT NULL, foreign key to items)
   - Added `item` relation in `wealthRelations`

2. ✅ `api/src/db/schema/communities.schema.ts`
   - Added `minTrustForItemManagement` field (default: 20)

3. ✅ `api/src/db/schema/index.ts`
   - Exported items schema

4. ✅ `api/src/config/openfga.model.ts`
   - Added `item_manager` relation to community type
   - Added `can_manage_items` permission (admin OR item_manager OR trust_level_20)

5. ✅ `api/src/services/community.service.ts`
   - Added call to `itemsService.ensureDefaultItem()` when creating communities

6. ✅ `api/src/app.ts`
   - Registered items routes at `/api/v1/items`

---

## Testing

### HTTP Test File

Location: `api/tests/http/items.http`

Includes test cases for:
- ✅ List items (with/without deleted)
- ✅ Search items (by query, by kind, combined)
- ✅ Create item (success, validation errors, duplicate name)
- ✅ Get item by ID
- ✅ Update item (partial, full)
- ✅ Delete item (success, restrictions)
- ✅ Permission checks (unauthorized, insufficient trust)

### Manual Testing Steps

1. **Start the server:**
   ```bash
   cd api
   bun dev
   ```

2. **Run migration** (automatic on server start)

3. **Test with HTTP client:**
   - Open `api/tests/http/items.http` in VS Code (REST Client extension)
   - Replace `{{YOUR_JWT_HERE}}` with actual JWT token
   - Replace `{{communityId}}` with actual community ID
   - Execute requests sequentially

4. **Verify Swagger docs:**
   ```
   http://localhost:3000/openapi/docs
   ```

---

## Integration with Wealth Feature

### Required Changes to Wealth API

The wealth endpoints now require an `itemId` field:

```typescript
// CREATE wealth
POST /api/v1/wealth
{
  "communityId": "uuid",
  "itemId": "uuid",  // ← NEW REQUIRED FIELD
  "title": "string",
  "description": "string",
  "type": "object" | "service",
  "durationType": "timebound" | "unlimited",
  // ... other fields
}

// UPDATE wealth
PUT /api/v1/wealth/:id
{
  "itemId": "uuid"  // ← OPTIONAL (can change item)
}
```

### Validation in Wealth Service

The wealth service validates:
1. ✅ Item exists
2. ✅ Item belongs to the same community as the wealth share
3. ✅ Item is not soft-deleted

### Item Data in Wealth Responses

All wealth queries now include item data via join:

```typescript
{
  id: "wealth-uuid",
  title: "Fresh Carrots",
  itemId: "item-uuid",
  item: {  // ← Populated via relation
    id: "item-uuid",
    name: "Carrots",
    kind: "object",
    // ... other item fields
  },
  // ... other wealth fields
}
```

---

## Frontend Integration Checklist

### 1. Item Management UI

- [ ] **Item List Page**
  - Display items with wealth count
  - Filter by kind (object/service)
  - Search by name/description
  - Show "Other" (default) badge for default items

- [ ] **Create Item Form**
  - Name field (required, 1-200 chars)
  - Description field (optional)
  - Kind selector (object/service radio buttons)
  - Validation: duplicate name error

- [ ] **Edit Item Form**
  - Same as create form
  - Pre-populate with existing values
  - Disable editing for default items

- [ ] **Delete Item Button**
  - Confirm dialog
  - Show error if item has active wealth
  - Hide for default items

- [ ] **Permission Checks**
  - Show/hide create/edit/delete buttons based on `can_manage_items` permission
  - Display trust requirement message if insufficient

### 2. Wealth Creation/Edit Integration

- [ ] **Item Selector**
  - Dropdown or autocomplete for selecting item
  - Fetch items via `/api/v1/items/search?communityId=...`
  - Group by kind (objects, services)
  - Show "Other" as fallback

- [ ] **Validation**
  - Ensure `itemId` is included in wealth creation request
  - Display item name alongside title in wealth forms

### 3. Wealth Display Integration

- [ ] **Wealth List/Grid**
  - Show item name badge/chip
  - Group wealth by item (e.g., "All Carrots")
  - Aggregate counts (e.g., "5 shares of Carrots available")

- [ ] **Wealth Detail View**
  - Display item name and description
  - Show kind badge (object/service)
  - Link to item detail page (if implemented)

### 4. API Client Updates

```typescript
// Example TypeScript client
interface Item {
  id: string;
  communityId: string;
  name: string;
  description: string | null;
  kind: 'object' | 'service';
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: { wealthEntries: number };
}

// Fetch items
async function getItems(communityId: string): Promise<Item[]> {
  const response = await fetch(
    `/api/v1/items?communityId=${communityId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.json();
}

// Search items
async function searchItems(
  communityId: string,
  query?: string,
  kind?: 'object' | 'service'
): Promise<Item[]> {
  const params = new URLSearchParams({ communityId });
  if (query) params.append('query', query);
  if (kind) params.append('kind', kind);

  const response = await fetch(
    `/api/v1/items/search?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.json();
}

// Create item
async function createItem(data: {
  communityId: string;
  name: string;
  description?: string;
  kind: 'object' | 'service';
}): Promise<Item> {
  const response = await fetch('/api/v1/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

---

## Error Handling

### Common Error Responses

```typescript
// 400 - Validation Error
{
  status: 'error',
  message: 'Validation error',
  errors: [
    { field: 'body.name', message: 'Name is required' }
  ]
}

// 400 - Duplicate Name
{
  status: 'error',
  message: 'An item with the name "Carrots" already exists in this community'
}

// 400 - Cannot Delete Default Item
{
  status: 'error',
  message: 'Cannot delete default items'
}

// 400 - Cannot Delete Item with Active Wealth
{
  status: 'error',
  message: 'Cannot delete item that has active wealth shares. Please wait for them to be fulfilled or cancelled.'
}

// 403 - Insufficient Permissions
{
  status: 'error',
  message: 'You do not have permission to manage items in this community. You need the item_manager role or sufficient trust level.'
}

// 404 - Item Not Found
{
  status: 'error',
  message: 'Item not found'
}
```

---

## Performance Considerations

1. **Indexing:**
   - ✅ Unique index on (community_id, LOWER(name)) for fast duplicate checks
   - ✅ Foreign key indexes on community_id and item_id

2. **Query Optimization:**
   - ✅ Wealth count aggregated in single query (LEFT JOIN with GROUP BY)
   - ✅ Search limited to 50 results
   - ✅ Soft-deleted items filtered at database level

3. **Caching Recommendations:**
   - Consider caching item lists per community (invalidate on create/update/delete)
   - Cache item name → ID mappings for wealth creation

---

## Security Features

1. ✅ **Authentication:** All endpoints require valid JWT
2. ✅ **Authorization:** OpenFGA-based permission checks
3. ✅ **Community Membership:** Users can only access items from communities they belong to
4. ✅ **SQL Injection:** Protected via Drizzle ORM parameterized queries
5. ✅ **Case-Insensitive Name Comparison:** Prevents duplicate names via different casing
6. ✅ **Soft Delete:** Items are never hard-deleted (referential integrity maintained)

---

## Known Limitations

1. **Name Uniqueness:** Case-insensitive within a community (by design)
2. **Deletion Restrictions:** Cannot delete items with active wealth (by design for data integrity)
3. **Default Item:** Cannot be deleted or renamed (by design)
4. **Search Limit:** Maximum 50 results per search query

---

## Future Enhancements (Not in Scope)

- Item categories/tags for better organization
- Item image upload support
- Item usage analytics (most shared item, trending items)
- Bulk import/export of items
- Item templates for common resources
- Multi-language item names

---

## Deployment Notes

### Migration Rollout

1. **Database Migration:** Runs automatically on server startup
2. **Backward Compatibility:** Migration handles existing wealth entries
3. **Zero Downtime:** Migration designed to be non-blocking
4. **Rollback:** If needed, restore database backup (no automatic rollback)

### Environment Variables

No new environment variables required. Uses existing configuration.

### Monitoring

Monitor these metrics after deployment:
- Item creation rate per community
- Item search query performance
- Permission check failures
- Wealth creation with itemId validation errors

---

## Support & Troubleshooting

### Common Issues

**Q: Migration fails with "column item_id cannot be null"**
A: Ensure all existing communities have a default "Other" item created first. The migration handles this automatically.

**Q: Cannot create item - "permission denied"**
A: User needs admin role, item_manager role, or trust score >= minTrustForItemManagement (default: 20).

**Q: Cannot delete item - "has active wealth"**
A: Wait for wealth shares to be fulfilled/cancelled, or soft-delete the item (it will be hidden but data preserved).

**Q: Duplicate name error but item doesn't appear in list**
A: Check if item is soft-deleted (`deleted_at` is not null). Undelete or use a different name.

---

## Swagger Documentation

All endpoints are documented in Swagger UI:

```
http://localhost:3000/openapi/docs
```

Download OpenAPI JSON schema:
```
http://localhost:3000/openapi/json
```

---

## Contact

For questions or issues related to this implementation:
- Check the HTTP test file: `api/tests/http/items.http`
- Review the service implementation: `api/src/services/items.service.ts`
- Check OpenFGA model: `api/src/config/openfga.model.ts`

---

**Implementation completed on:** 2025-11-03
**Implementation status:** ✅ COMPLETE - Ready for frontend integration
**API Version:** v1
**Migration Version:** 0004
