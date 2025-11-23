---
id: FT-05
title: Pools
status: implemented
version: 2.4
last_updated: 2025-11-19
related_features: [FT-01, FT-02, FT-04, FT-06, FT-07, FT-08]
---

# Pools

## Purpose
Resource aggregation mechanism for collective initiatives and logistics coordination. Pools serve as "logistics endpoints" where producers can contribute resources and consumers can receive them, simplifying many-to-many resource distribution.

**Key Design Principle:** Pools are built on top of the existing wealth sharing infrastructure. All contributions to pools and distributions from pools use the same `wealth` and `wealth_requests` tables, enabling unified statistics, aggregation, and tracking across the entire community.

## Pool Creation
Pools can **only** be created by councils (not individual members):
1. Council managers can create pools for their council
2. Only users with sufficient trust can create councils (see `minTrustForCouncilCreation`)
3. Each pool is owned and managed by a single council

## Pool Architecture

### Logistics Endpoint Model
Pools solve the logistics problem of many producers sharing with many consumers:

**Without Pools:**
- 8 tomato producers → 20 consumers = 160 individual share transactions
- Each consumer receives from 8 different sources
- Complex coordination and pickup logistics

**With Pools:**
- 8 tomato producers → 1 Pool → 20 consumers = 28 transactions
- Producers share to one location
- Consumers receive from one location
- Council manages aggregation and distribution

### Integration with Wealth System
Pools leverage the existing wealth sharing tables:
1. **Contributions to Pools**: Standard wealth shares where `sharingTarget = 'pool'` and `targetPoolId` is set
2. **Distributions from Pools**: Standard wealth shares where `createdBy` is a council (acting on behalf of pool)
3. **Same Infrastructure**: Uses `wealth` table for both contributions and distributions
4. **Unified Analytics**: All shares (individual, council, pool) tracked in same system
5. **Future Statistics**: Can aggregate how much users contributed to pools vs community vs councils

### Distribution Methods
Council managers can distribute from pools using either method:
1. **Manual Distribution**: Individual wealth shares created one at a time
2. **Mass Distribution**: Multiple wealth shares created at once based on published needs

## Pool Contribution Process

### Permission Model
- **No trust requirement to contribute**: Any community member can contribute to pools
- **Philosophy**: Same as wealth sharing - giving is unrestricted
- **Permission**: Requires `can_view_wealth` (basic community membership)
- **Council approval**: All contributions must be confirmed by pool managers before inventory updates

### Share to Pool Flow
Pool contributions are **standard wealth shares** with special configuration:

1. **User Creates Wealth Share**:
   - User can use regular wealth share UI OR dedicated pool contribution UI
   - Sets `sharingTarget = 'pool'`
   - Sets `targetPoolId` to the desired pool
   - Selects existing community item (e.g., "Tomatoes")
   - Specifies quantity (`unitsAvailable`)
   - Creates wealth share entry in `wealth` table
   - **No trust check required** - anyone can give

2. **Council Confirmation**:
   - Wealth share appears in `wealth_requests` as request to pool (or auto-created request)
   - Pool manager council reviews pending pool contributions
   - Council confirms item was physically received
   - Status changes from 'pending' → 'accepted' → 'fulfilled'

3. **Inventory Update**:
   - When contribution is fulfilled, pool inventory (`pool_inventory`) increases
   - Original wealth share remains in `wealth` table for tracking
   - Can track total community contributions to pools via queries

### Item Requirement
- All pool shares must be based on existing community items
- Ensures standardization and aggregation
- Links to the same `items` table used by wealth and needs systems

### Benefits of Wealth Table Integration
- **Unified History**: All contributions visible in community activity feed
- **Statistics**: Can aggregate total wealth shared to pools vs community
- **Transparency**: Standard wealth share tracking and auditing
- **Consistency**: Same validation, authorization, and business logic

## Pool Distribution

### Distribution as Wealth Shares
All distributions from pools are **standard wealth shares** created by the council:

**Key Principle:** Council creates wealth shares on behalf of the pool, just like a regular member would share wealth. The only difference is the creator is a council.

### Manual Distribution
Council managers can create individual wealth shares from pool inventory:

1. **Create Wealth Share**:
   - Council (acting as creator) creates new entry in `wealth` table
   - Sets `createdBy` to council ID (not user ID)
   - Sets `sourcePoolId` to indicate this came from a pool
   - Selects item from pool inventory
   - Sets quantity (`unitsAvailable`)
   - Optionally sets `sharingTarget = 'community'` or targets specific user

2. **Inventory Deduction**:
   - Pool inventory (`pool_inventory`) decreases by distributed amount
   - Wealth share is immediately available/fulfilled
   - Members can see it in regular wealth listings

3. **Standard Request Flow**:
   - If shared to community, members can request as usual
   - Council (as owner) accepts/rejects requests
   - OR wealth is pre-assigned to specific recipient (auto-fulfilled)

### Needs-Based Mass Distribution

#### On-Demand Distribution
Pool managers can initiate mass distribution at any time:
- No scheduling built into the system
- Council coordinates distribution timing through external means (meetings, messages, etc.)
- Pool managers decide when to distribute based on inventory and needs

#### Mass Share Creation
Pool managers create multiple wealth shares at once:

1. **View Aggregated Needs**: See all users who published need for that item
2. **Configure Mass Distribution**:
   - Select fulfillment strategy (full, partial, equal)
   - Set limit per user (e.g., max 5 units per person)
   - Optionally select specific recipients

3. **Create Batch Wealth Shares**:
   System creates multiple entries in `wealth` table- 
   - Each share: `createdBy` = council ID, `sourcePoolId` = pool ID
   - Each share auto-assigned to specific recipient (pre-fulfilled)
   - If limit applied: creates share for min(userNeed, limit)
   - All shares marked as `status = 'fulfilled'` (no confirmation needed to avoid spam)

4. **Inventory Deduction**:
   - Pool inventory decreases by total distributed amount
   - Transaction recorded for transparency

#### Mass Distribution Rules
- Pool can satisfy all needs fully (if inventory allows)
- Pool can satisfy all needs partially (up to configured limit)
- Pool can select specific users from need list


































































































































































































































































































































































































































































































































































































































































- All distributions visible as wealth shares in community feed
- Each recipient sees standard wealth share (just from council/pool)
- Council coordinates timing externally (not system-scheduled)

### Benefits of Wealth Table Integration
- **Unified View**: All shares (pool and non-pool) in same listings
- **Standard UI**: Recipients see pool distributions in their wealth shares
- **Statistics**: Can track total distributed from pools vs individuals
- **Consistency**: Same request/fulfillment logic
- **Aggregation**: Future analytics can show pool impact on community

## Pool Settings

### Basic Settings
- **Name**: Pool identifier (e.g., "Community Tomatoes Pool")
- **Description**: Pool purpose and details
- **Council ID**: Owning council
- **Note**: Pools can contain multiple different items in their inventory (tracked via `pool_inventory` table)

### Distribution Settings
- **Distribution Location**: Physical pickup/delivery location (informational only)
- **Max Units Per User**: Cap on individual share amounts

### Contribution Settings
- **Minimum Contribution**: Minimum units to contribute to pool (optional)

### Item Whitelist
- **Allowed Items**: List of item IDs that can be contributed to this pool (optional)
- If no items are specified, pool accepts any community item
- If items are specified, only those items can be contributed
- Contributions and distributions are validated against the whitelist
- Useful for specialized pools (e.g., "Fresh Produce Pool" only accepts vegetables/fruits)

### Needs Integration
- **Priority Mode**: How to prioritize when distributing (needs before wants, equal distribution, etc.)
- **Note**: Pools can distribute any items from their inventory to fulfill community needs
- **Pool Needs View**: Council members can view aggregated community needs for whitelisted items

## Visibility

### Pool Discovery
- Pools are filterable by council
- All community members can see:
  - Pool inventory levels
  - Recent contributions
  - Distribution history
  - Associated council
  - Distribution location (if configured)

### Transparency
- All contributions are visible (who, what, when, how much)
- All distributions are visible (who received, what, how much)
- Transaction history fully auditable
- Council reports explain usage

## Wealth Share Integration

### Unified Wealth View
All wealth shares appear in the same table and UI:

1. **Regular Shares**: `createdBy` = user ID, no pool fields
2. **Contributions to Pool**: `createdBy` = user ID, `sharingTarget = 'pool'`, `targetPoolId` set
3. **Distributions from Pool**: `createdBy` = council ID, `sourcePoolId` set

### Filtering
Users can filter wealth shares by:
- Source: Individual member vs Council/Pool
- Pool name (for contributions to or distributions from pools)
- Item type
- Status
- Sharing target (community, council, pool)
- **Pool Contributions**: Advanced filter to show/hide contributions to pools (disabled by default in UI)

### Statistics and Analytics (Future)
Because all shares use the same table:
- **User Contributions**: Total wealth shared by user (to community + councils + pools)
- **Pool Impact**: Total wealth distributed from pools to community
- **Pool Efficiency**: Contributions received vs distributions made
- **Community Health**: Pool-mediated vs direct sharing ratio
- **Item Flow**: Track items from producers → pools → consumers

## Use Cases

### Tomato Aggregation Example
1. **Setup**:
   - Food Council creates "Community Tomatoes Pool"
   - Links pool to "Tomatoes" need item
   - Sets distribution location: "Community Center"
   - Sets limit: 5 tomatoes per person

2. **Production Phase** (Ongoing):
   - 8 producers submit share requests to pool throughout the week
   - Producer A: 10 tomatoes
   - Producer B: 15 tomatoes
   - ... (total: 80 tomatoes)
   - Council confirms each delivery as received
   - Pool inventory: 80 tomatoes

3. **Needs Collection** (Ongoing):
   - 20 users publish weekly need for tomatoes
   - User X: needs 10 tomatoes
   - User Y: needs 3 tomatoes
   - ... (total need: 120 tomatoes)

4. **Distribution** (Council decides when):
   - Council announces via external means: "Tomato distribution Friday at Community Center"
   - Council manager opens pool interface
   - Reviews needs (120 tomatoes needed, 80 available)
   - Chooses partial fulfillment strategy with limit of 5
   - Initiates mass distribution
   - System creates 20 share events, 5 tomatoes each (auto-fulfilled)
   - Council manages pickup at Community Center on Friday
   - User X receives 5 (out of 10 needed) - marked partial
   - User Y receives 3 (full need satisfied)

5. **Transparency**:
   - All users see: "Received 5 tomatoes from Community Tomatoes Pool"
   - Transaction history shows: "Distributed 80 tomatoes to 20 members on 2025-11-15"
   - Inventory updated: 0 tomatoes remaining

## Related Database Tables

### Implemented

#### New Pool Tables
- `pools` - Pool definitions and settings (includes location, limits, linked item)
- `pool_inventory` - Current resources held by pools (aggregated from confirmed contributions)
- `pool_allowed_items` - Junction table for item whitelist (poolId, itemId pairs)

#### Enhanced Wealth Tables (Modified)
- `wealth` - **Extended to support pool contributions and distributions**
  - New field: `sharingTarget` - now includes 'pool' option (existing: 'community', 'council')
  - New field: `targetPoolId` - UUID reference to pools table (nullable)
  - New field: `sourcePoolId` - UUID reference to pools table (nullable, indicates distribution from pool)
  - New field: `createdBy` - can now be council ID (for pool distributions)
- `wealth_requests` - **Used for pool contribution confirmations** (no changes needed)
  - Existing flow works: request created when contributing to pool
  - Council confirms → status changes to fulfilled → inventory updated

### Table Relationships

**Contributions to Pools:**
```
User → creates wealth entry → sharingTarget='pool', targetPoolId=X
Council → confirms via wealth_request
System → updates pool_inventory
```

**Distributions from Pools:**
```
Council → creates wealth entry → createdBy=councilId, sourcePoolId=X
System → decrements pool_inventory
User → receives wealth (standard flow)
```

### Why This Design?

1. **Single Source of Truth**: All wealth activity in `wealth` table
2. **Unified Analytics**: One query to see all sharing activity
3. **Consistent Logic**: Same validation, authorization, tracking
4. **Future-Proof**: Easy to add pool-related statistics
5. **Transparent**: All pool contributions and distributions visible in activity feed
6. **Simple**: Reuses existing infrastructure rather than duplicating it

## Configuration
- `minTrustForPoolCreation` - Minimum trust score to create pools (default: 20)
  - Note: Only applies to council creation, as only councils can create pools
- Pool Manager role - Council managers automatically have pool management rights

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-06: Councils](./06-councils.md)
- [FT-07: Voting & Polling](./07-voting-polling.md)
- [FT-08: Needs System](./08-needs-system.md)
