# FT-21: Sharing Markets

## Metadata
```yaml
feature_id: FT-21
title: Sharing Markets
status: implemented
created: 2025-01-22
last_updated: 2025-01-22
related_features:
  - FT-04  # Wealth Sharing (shares are created from wealth or pools)
  - FT-05  # Pools (pools can generate permanent market links)
  - FT-01  # Communities (market links are community-scoped)
  - FT-13  # Security & Access Control (OpenFGA authorization)
category: resource_management
```

## Overview

Sharing Markets enable frictionless physical resource sharing through QR codes and shareable links. Resources (carrots, rice, tools, books) are placed in physical locations with QR codes. Community members scan the code, select the amount they need, and complete the transaction digitally - no verification needed because possession = consumption.

This bridges digital trust tracking with physical resource sharing, enabling farmer's markets, community pantries, tool libraries, and free stores to operate without cashiers or manual tracking.

## Core Concepts

### Self-Checkout Links
- **QR Code + URL**: Each link generates both for easy scanning and sharing
- **No Verification**: Taking the item = verification (item is physically present)
- **Immediate Completion**: Scan → Select Amount → Confirm → Done
- **Frictionless**: No approval workflows, no waiting

### Two Link Types

#### 1. Pool Checkout Links (Permanent)
- Created from pools (e.g., "Community Garden Vegetables Pool")
- **Permanent**: Link remains active while pool exists
- **Item-Specific**: Each link tied to one item type (e.g., "carrots")
- **Configurable Limits**: Max units per checkout (e.g., 5kg max per person)
- **Management**: View usage stats, revoke/regenerate links
- **Use Case**: Ongoing sharing locations (weekly farmer's market, tool library)

#### 2. Share Checkout Links (Temporary)
- Created from individual wealth shares
- **Temporary**: Valid until share closes OR units run out
- **Single-Use or Multi-Use**: Depends on units available
- **Auto-Expires**: Link dies when share completed
- **Use Case**: One-time shares (event leftovers, moving sale, harvest surplus)

## User Workflows

### Workflow 1: Pool Market Setup (Farmer's Market)

**Setup Phase:**
1. Council creates "Farmer's Market Pool" with vegetables
2. For each vegetable, council generates checkout link:
   - Carrots: 5kg max per checkout
   - Potatoes: 10kg max per checkout
   - Rice: 2kg max per checkout
3. Print QR codes, laminate, place next to boxes at market

**Market Day:**
1. Member arrives at market, sees carrots
2. Scans QR code → Opens to community checkout page
3. Selects amount: "2kg of carrots"
4. Confirms → Share created, trust awarded (if configured)
5. Takes carrots and leaves
6. Next person scans same QR, repeats

**Council View:**
- Dashboard shows: "Carrots QR: 47 checkouts today, 94kg distributed"
- Can revoke link if spoilage detected
- Can adjust limits if needed

### Workflow 2: Individual Share Market (Event Leftovers)

**Setup:**
1. Member has leftover bread from event (20 loaves)
2. Creates wealth share: "Fresh Bread - 20 units"
3. Generates checkout link with QR
4. Prints QR, tapes to bread box, leaves at community center

**Sharing:**
1. People scan QR throughout the day
2. Each selects 1-3 loaves
3. Share auto-updates: 20 → 17 → 14 → 8 → 3 → 0
4. When 0 units left, link shows "All gone! Thanks for sharing"
5. Share auto-closes

### Workflow 3: Tool Library

**Setup:**
1. Council creates "Tool Library Pool"
2. Each tool gets checkout link (limit: 1 unit per checkout)
3. QR codes on tool handles

**Usage:**
1. Member needs drill, scans QR on drill
2. Confirms "1 drill" checkout
3. Takes drill home
4. Returns after use
5. Council marks return (separate workflow - not in scope for v1)

## Technical Architecture

### Database Schema

#### `pool_checkout_links` (New Table)
```sql
CREATE TABLE pool_checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id),

  -- Link configuration
  link_code VARCHAR(32) UNIQUE NOT NULL, -- Short code for URL
  max_units_per_checkout DECIMAL(10,2), -- NULL = unlimited

  -- Status
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES app_users(id),
  revoke_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES app_users(id),

  -- Stats (denormalized for performance)
  total_checkouts INTEGER DEFAULT 0,
  total_units_distributed DECIMAL(10,2) DEFAULT 0,
  last_checkout_at TIMESTAMPTZ
);

CREATE INDEX idx_pool_checkout_links_pool ON pool_checkout_links(pool_id);
CREATE INDEX idx_pool_checkout_links_code ON pool_checkout_links(link_code);
CREATE INDEX idx_pool_checkout_links_active ON pool_checkout_links(is_active) WHERE is_active = true;
```

#### `share_checkout_links` (New Table)
```sql
CREATE TABLE share_checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES wealth_shares(id) ON DELETE CASCADE,

  -- Link configuration
  link_code VARCHAR(32) UNIQUE NOT NULL,
  max_units_per_checkout DECIMAL(10,2), -- NULL = unlimited (uses share's remaining units)

  -- Auto-managed status
  is_active BOOLEAN DEFAULT true, -- Auto-deactivated when share closes or units = 0
  deactivated_at TIMESTAMPTZ,
  deactivation_reason VARCHAR(50), -- 'share_closed', 'units_depleted', 'manual_revoke'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Stats
  total_checkouts INTEGER DEFAULT 0,
  total_units_distributed DECIMAL(10,2) DEFAULT 0,
  last_checkout_at TIMESTAMPTZ
);

CREATE INDEX idx_share_checkout_links_share ON share_checkout_links(share_id);
CREATE INDEX idx_share_checkout_links_code ON share_checkout_links(link_code);
CREATE INDEX idx_share_checkout_links_active ON share_checkout_links(is_active) WHERE is_active = true;
```

#### Link to Wealth Requests
When someone uses a checkout link, a `wealth_requests` record is created with:
- `source_type`: 'pool_checkout_link' | 'share_checkout_link'
- `source_id`: Link ID
- `status`: 'approved' (auto-approved)
- `auto_approved`: true
- `approved_at`: now()
- Standard wealth request fields (requester, units, item, etc.)

### API Endpoints

#### Pool Checkout Links

**Create Pool Checkout Link**
```
POST /api/pools/:poolId/checkout-links
Body: {
  itemId: UUID,
  maxUnitsPerCheckout?: number | null
}
Auth: Council member or admin
Returns: {
  id: UUID,
  linkCode: string,
  qrCodeUrl: string, // Link to generated QR code image
  checkoutUrl: string, // Full URL for link
  maxUnitsPerCheckout: number | null,
  createdAt: string
}
```

**List Pool Checkout Links**
```
GET /api/pools/:poolId/checkout-links
Auth: Council member or admin
Returns: {
  links: Array<{
    id: UUID,
    item: { id, name, unit },
    linkCode: string,
    checkoutUrl: string,
    maxUnitsPerCheckout: number | null,
    isActive: boolean,
    totalCheckouts: number,
    totalUnitsDistributed: number,
    lastCheckoutAt: string | null,
    createdAt: string
  }>
}
```

**Revoke Pool Checkout Link**
```
POST /api/pools/:poolId/checkout-links/:linkId/revoke
Body: {
  reason?: string
}
Auth: Council member or admin
```

**Regenerate Pool Checkout Link** (Creates new code, revokes old)
```
POST /api/pools/:poolId/checkout-links/:linkId/regenerate
Auth: Council member or admin
Returns: New link with new code
```

#### Share Checkout Links

**Create Share Checkout Link**
```
POST /api/wealth/:shareId/checkout-link
Body: {
  maxUnitsPerCheckout?: number | null
}
Auth: Share owner or admin
Returns: {
  id: UUID,
  linkCode: string,
  qrCodeUrl: string,
  checkoutUrl: string,
  maxUnitsPerCheckout: number | null,
  shareUnitsRemaining: number,
  createdAt: string
}
```

**Get Share Checkout Link Info**
```
GET /api/wealth/:shareId/checkout-link
Auth: Share owner or admin
Returns: Link details + stats
```

**Revoke Share Checkout Link** (Manual early revoke)
```
DELETE /api/wealth/:shareId/checkout-link
Auth: Share owner or admin
```

#### Public Checkout Endpoints

**Get Checkout Link Details** (Public - no auth)
```
GET /api/checkout/:linkCode
Returns: {
  type: 'pool' | 'share',
  community: { id, name, imageUrl },
  item: { id, name, unit, imageUrl },
  maxUnitsPerCheckout: number | null,
  availableUnits: number | null, // For share links
  isActive: boolean,
  message?: string // If inactive: "This share has been completed" / "Link has been revoked"
}
```

**Complete Checkout** (Requires auth - user must be community member)
```
POST /api/checkout/:linkCode
Body: {
  units: number
}
Auth: Community member
Returns: {
  requestId: UUID,
  unitsReceived: number,
  trustAwarded?: number, // If trust configured for item
  message: string
}
```

### QR Code Generation

**Implementation:**
- Use `qrcode` npm package (already common in Node.js)
- Generate on link creation
- Store as base64 or file in storage
- Return URL to frontend for display/download

**QR Code Data:**
- Encodes full checkout URL: `https://app.domain.com/checkout/{linkCode}`
- URL directly usable on scan (no app required)

### Frontend Routes

```
/checkout/:linkCode          # Public checkout page (works logged out, prompts login)
/community/:id/pools/:poolId/checkout-links  # Pool link management
/wealth/:shareId             # Share details with checkout link option
```

## Authorization & Permissions

### OpenFGA Relations

**Pool Checkout Link Creation:**
```
Can create if: council#member OR community#admin
Check: pool->community->admin OR pool->council->member
```

**Share Checkout Link Creation:**
```
Can create if: wealth_share#owner OR community#admin
Check: share->owner OR share->community->admin
```

**Checkout Link Usage:**
```
Can use if: community#member with sufficient trust
Check: community#member AND trust >= minTrustForCheckoutLinks (new config)
```

### Trust Configuration

New community config field:
```json
{
  "minTrustForCheckoutLinks": {
    "type": "number",
    "value": 5
  }
}
```

**Rationale:** Low threshold (5) because physical possession already proves intent, but some minimum trust prevents abuse.

## Security Considerations

### Link Code Security
- **32-character random codes**: Unguessable
- **HTTPS only**: Prevent interception
- **Rate limiting**: Max 5 checkouts per user per hour per link
- **Revocable**: Can disable if abuse detected

### Abuse Prevention
- **Community membership required**: Can't checkout without being member
- **Trust threshold**: Minimum trust to use checkouts
- **Audit trail**: All checkouts logged in wealth_requests
- **Max limits**: Per-checkout limits prevent hoarding
- **Revocation**: Links can be instantly disabled

### Physical Security
- QR codes should be placed in supervised or trusted locations
- Community handles physical security (cameras, attendants, etc.)
- System handles digital tracking and trust

## Configuration

### Community Settings

```json
{
  "checkout_links_enabled": {
    "type": "boolean",
    "value": true
  },
  "minTrustForCheckoutLinks": {
    "type": "number",
    "value": 5
  },
  "checkout_link_cooldown_minutes": {
    "type": "number",
    "value": 5  // Prevent same user spamming same link
  }
}
```

### Item Settings

Items can configure:
- `trust_award_amount`: Trust awarded on checkout (optional)
- `default_checkout_limit`: Default max units per checkout

## UI Components

### Pool Checkout Links Management Page

**Layout:**
```
[Pool: Community Garden Vegetables]

[+ Create Checkout Link]

┌─ Active Links ────────────────────────────────────────┐
│ Carrots                                                │
│ https://app.domain.com/checkout/abc123                │
│ [QR Code] [Copy Link] [Download QR] [View Stats]      │
│ Max per checkout: 5kg                                  │
│ Total: 94kg distributed across 47 checkouts           │
│ Last used: 2 hours ago                                 │
│ [Revoke] [Regenerate]                                  │
├────────────────────────────────────────────────────────┤
│ Potatoes                                               │
│ ... similar ...                                        │
└────────────────────────────────────────────────────────┘
```

### Share Checkout Link (in Share Details)

**Layout:**
```
[Wealth Share: Fresh Bread - 20 loaves]

Checkout Link:
[Generate Checkout Link]

// After generation:
┌─ Checkout Link ───────────────────────────────────────┐
│ https://app.domain.com/checkout/xyz789                │
│ [QR Code Display]                                      │
│ [Download QR] [Copy Link] [Print]                     │
│                                                         │
│ Max per checkout: Unlimited                            │
│ Remaining: 12 loaves                                   │
│ 8 checkouts completed                                  │
│                                                         │
│ [Revoke Link]                                          │
└────────────────────────────────────────────────────────┘
```

### Public Checkout Page

**Layout (Mobile-First):**
```
┌─────────────────────────────────────┐
│  [Community Logo]                   │
│  Community Garden Collective        │
├─────────────────────────────────────┤
│  [Carrot Image]                     │
│                                     │
│  Fresh Carrots                      │
│  From: Community Garden Pool        │
│                                     │
│  How many kilograms?                │
│  [    2    ] kg                     │
│                                     │
│  Max per person: 5kg                │
│                                     │
│  [ Complete Checkout ]              │
│                                     │
│  Not a member? [Join Community]     │
└─────────────────────────────────────┘

// After checkout:
┌─────────────────────────────────────┐
│  ✓ Success!                         │
│                                     │
│  You received 2kg of carrots        │
│  +1 trust awarded                   │
│                                     │
│  Thank you for sharing!             │
│                                     │
│  [Done]                             │
└─────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Infrastructure (MVP)
- [ ] Database schema (tables, indexes)
- [ ] Link code generation (secure random)
- [ ] Basic CRUD endpoints for links
- [ ] QR code generation
- [ ] Public checkout page (basic)
- [ ] Wealth request creation on checkout
- [ ] OpenFGA authorization rules

### Phase 2: Management UI
- [ ] Pool checkout links page
- [ ] Share checkout link component
- [ ] Link stats display
- [ ] Revoke/regenerate functionality
- [ ] QR download/print

### Phase 3: Polish & Security
- [ ] Rate limiting
- [ ] Cooldown enforcement
- [ ] Mobile-optimized checkout UI
- [ ] Error handling (link expired, units depleted)
- [ ] Analytics dashboard for link usage

### Phase 4: Advanced Features (Future)
- [ ] Return tracking (for tools/equipment)
- [ ] Multi-item checkouts (cart-style)
- [ ] Scheduled link activation/deactivation
- [ ] Geofencing (link only works at location)
- [ ] Offline QR mode (validate later when online)

## Use Cases

### Farmer's Market
- Weekly market with 10 vegetable types
- Each vegetable has permanent pool checkout link
- Farmers replenish pools, scan QR codes at home
- Members take what they need throughout week
- Dashboard shows: most popular items, peak times, distribution equity

### Community Pantry
- Shelves with staples (rice, beans, pasta)
- Each shelf has QR code
- Members take what they need, scan on way out
- Trust-based honor system, tracked digitally
- Alerts when items running low

### Tool Library
- Drills, saws, ladders, etc.
- Each tool has QR on handle
- Scan to "check out" (take home)
- Separate workflow for returns (future feature)
- Trust increases with timely returns

### Event Leftovers
- Conference has 50 sandwiches left
- Organizer creates share, prints QR
- Posts in community: "Free lunch at venue entrance"
- Members swing by, scan, take sandwich
- Auto-closes when gone

### Free Store / Give Box
- Box in public space with donations
- Items placed with temporary QR codes
- Anyone can take, some items have multi-use shares
- High-trust members can create shares for items they donate

## Analytics & Reporting

### Pool Link Analytics
- Total units distributed per item
- Checkouts over time (daily/weekly graphs)
- Peak usage times
- Distribution equity (Gini coefficient of units per member)
- Most active links

### Share Link Analytics
- Average time from creation to completion
- Completion rate (how many shares get fully claimed)
- Average units per checkout
- Return rate (for multi-unit shares)

### Community Analytics
- Most shared items via checkout links
- Member participation rate in sharing markets
- Trust earned through checkout system
- Physical location usage (if links tagged with location)

## Edge Cases

### Share Runs Out Mid-Checkout
- Frontend fetches current availability before showing form
- Backend validates units still available
- If depleted between fetch and submit: "Sorry, this share just ran out!"
- Link auto-deactivates

### Pool Depleted
- Pool can go negative (debt) or enforce limits
- If enforcing: Checkout shows "Pool currently empty"
- Link remains active for refill

### Link Revoked Mid-Checkout
- Backend checks `is_active` on submit
- Returns: "This link has been deactivated by the community"

### User Not Community Member
- Checkout page shows: "Join [Community Name] to participate"
- After joining, can immediately checkout

### Insufficient Trust
- Checkout page shows: "You need X more trust to use checkout links"
- Shows how to earn trust

### Concurrent Checkouts (Race Condition)
- Database transaction with row locking
- If units would go negative, last checkout fails gracefully
- Shows: "Only X units remaining, you requested Y"

## Future Enhancements

### Advanced Features
- **Location-Based Links**: QR only works when physically near GPS coordinates
- **Time-Based Links**: Active only during market hours
- **Scheduled Batches**: New batch activates every Saturday 9am
- **Member Preferences**: "Notify me when carrots available"
- **Offline Mode**: Generate signed checkout codes offline, validate when online
- **Multi-Item Carts**: One checkout session for multiple items
- **Return Tracking**: Check-in/check-out for borrowable items
- **Reputation Scoring**: Bonus trust for frequent contributors
- **Link Templates**: Save configurations for recurring markets

### Integration Features
- **Matrix Chat Notifications**: "Fresh bread available at community center!"
- **Calendar Integration**: Market schedule with checkout link in description
- **Mobile App**: Native camera QR scanner
- **Inventory Sync**: Auto-update pool when items scanned
- **External Scales**: Bluetooth scale integration for weight-based items

## Success Metrics

### Adoption Metrics
- % of pools with active checkout links
- % of shares using checkout links vs manual requests
- # of unique members using checkouts per week
- # of physical locations with QR codes deployed

### Efficiency Metrics
- Time from scan to completed checkout (target: <30 seconds)
- Checkout completion rate (target: >90%)
- Trust threshold vs actual trust of users (are we gatekeeping appropriately?)

### Impact Metrics
- Total value distributed through checkout system
- Trust generated through frictionless sharing
- Member satisfaction with sharing markets
- Reduction in food waste / surplus spoilage

## Related Documentation

- **FT-04: Wealth Sharing** - Checkout creates wealth requests
- **FT-05: Pools** - Pool links are permanent
- **FT-13: Security & Access Control** - OpenFGA permission model
- **FT-01: Communities** - Community settings and trust thresholds

## Technical Dependencies

### Backend (API)
- `qrcode` package for QR generation
- Secure random string generation for link codes
- Transaction support for race condition handling
- Rate limiting middleware

### Frontend
- QR code display/download component
- Mobile-optimized checkout flow
- Link management UI components
- Print-friendly layouts for QR codes

### Infrastructure
- Public-facing routes (no auth required for GET)
- CDN for QR code images
- Analytics pipeline for usage stats

---

**Status**: Planned
**Next Steps**:
1. Review and approve feature design
2. Finalize database schema
3. Implement Phase 1 (Core Infrastructure)
4. Test with pilot community (farmer's market use case)
5. Iterate based on real-world usage
