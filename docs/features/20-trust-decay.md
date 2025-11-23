# FT-20: Trust Decay System

## Metadata
- **Feature ID:** FT-20
- **Status:** Implemented
- **Last Updated:** 2025-11-21
- **Related Features:** FT-03 (Trust System), FT-18 (Notifications)

## Overview

Trust endorsements decay over time to ensure trust reflects ongoing relationships rather than historical snapshots. After 6 months, trust begins decaying linearly, reaching 0% at 12 months unless recertified.

## Trust Decay Mechanics

### Decay Timeline

```
Month 0-6:   100% trust value (no decay)
Month 6:    100% → notification sent to grantor
Month 7:    ~83% trust value
Month 8:    ~67% trust value
Month 9:    ~50% trust value
Month 10:   ~33% trust value
Month 11:   ~17% trust value
Month 12:   0% trust value (endorsement effectively expired)
```

### Decay Formula

```typescript
function calculateTrustDecay(lastUpdated: Date): number {
  const now = new Date();
  const monthsElapsed = differenceInMonths(now, lastUpdated);

  if (monthsElapsed <= 6) return 1.0; // 100%
  if (monthsElapsed >= 12) return 0.0; // 0%

  // Linear decay from month 6 to month 12
  const decayMonths = monthsElapsed - 6;
  return 1.0 - (decayMonths / 6);
}
```

### Effective Trust Score

When calculating a user's trust score, each endorsement is weighted by its decay factor:

```typescript
effectiveTrustScore = sum(endorsements.map(e => calculateTrustDecay(e.lastUpdated)))
```

## Recertification

### Notification Flow

1. At 6 months since `last_updated`, system sends notification to grantor
2. Notification: "Your trust endorsement for [User] is starting to decay. Recertify?"
3. Actions from notification:
   - **Recertify** → Updates `last_updated` to now, decay resets
   - **Dismiss** → Notification cleared, decay continues

### Recertification Methods

1. **From Notification** - Click recertify action
2. **Trust Recertification Tab** - Community overview section showing all decaying endorsements
3. **Member List** - Visual indicator for decaying trust

### Member List Visual States

| State | Color | Click Action |
|-------|-------|--------------|
| Active trust (no decay) | Green | Click → Remove trust |
| Decaying trust | Orange | Click → Recertify (turns green) |
| Green (just recertified) | Green | Click → Remove trust |

## Database Changes

### Modified: `trust_awards` table

```sql
-- Existing columns used:
-- - last_updated: timestamp (used for decay calculation)

-- No schema changes needed - last_updated already exists
```

### New: Notification trigger

```sql
-- Scheduled job to check for 6-month decay threshold
-- Sends notification type: 'trust_decay_warning'
```

## API Endpoints (Implemented)

### GET `/api/v1/communities/:communityId/trust/decaying`
Returns all trust endorsements granted by current user that are decaying (> 6 months old).

**Response:**
```typescript
Array<{
  recipientId: string;
  recipientName: string;
  recipientUsername: string;
  lastUpdated: Date;
  decayPercent: number;       // 0-100, how much has decayed
  monthsUntilExpiry: number;
  isDecaying: boolean;
  isExpired: boolean;
}>
```

### POST `/api/v1/communities/:communityId/trust/recertify`
Recertifies trust endorsements (bulk), resetting decay.

**Request Body:**
```typescript
{
  userIds: string[];  // Array of user IDs to recertify
}
```

**Response:**
```typescript
{
  recertified: number;  // Number of endorsements recertified
}
```

### GET `/api/v1/communities/:communityId/trust/status/:toUserId`
Get trust status for a specific endorsement including decay info.

**Response:**
```typescript
{
  hasTrust: boolean;
  lastUpdated: Date;
  decayPercent: number;
  monthsUntilExpiry: number;
  isDecaying: boolean;
  isExpired: boolean;
} | null
```

## Frontend Components

### Trust Recertification Tab
- Location: Community Overview page
- Shows list of decaying endorsements with:
  - User avatar/name
  - Decay progress bar
  - Time until expiry
  - Recertify button

### Member List Enhancement
- Trust indicator shows orange when decaying
- Tooltip shows decay percentage and time remaining
- Click behavior changes based on state

## Configuration

No new community configuration needed. Decay timeline (6-12 months) is system-wide.

## Scheduled Jobs (Implemented)

### Trust Decay Job (`trustDecay.job.ts`)
- **Schedule:** Daily at 3 AM
- **Location:** `api/src/jobs/trustDecay.job.ts`
- **Purpose:**
  1. Send notifications when endorsements hit 6-month decay threshold
  2. Recalculate effective trust scores for users with decaying endorsements
  3. Update OpenFGA roles only when threshold boundaries are crossed

**Optimization:** Rather than recalculating all users, the job:
- Only processes users who have decaying endorsements
- Only syncs OpenFGA when a user's score crosses a permission threshold

## Implementation Notes

### Key Files
- `api/src/utils/trustDecay.ts` - Decay calculation utility functions
- `api/src/repositories/trustAward.repository.ts` - Decay-related queries
- `api/src/repositories/trustView.repository.ts` - `recalculatePoints()` now applies decay
- `api/src/services/trust.service.ts` - `getDecayingEndorsements()`, `recertifyTrust()`, `getTrustStatus()`
- `api/src/api/controllers/trust.controller.ts` - REST endpoints
- `api/src/jobs/trustDecay.job.ts` - Daily cron job

### Implementation Details
1. **Trust score calculation** updated in `trustViewRepository.recalculatePoints()` to use effective (decayed) scores
2. **OpenFGA sync** handled by scheduled job - ensures permissions stay current as trust decays
3. **Real-time vs scheduled:** Recertification triggers immediate OpenFGA update; decay uses daily scheduled sync
4. **Notification type:** `trust_decay_warning` added to `NotificationType`
5. **History action:** `recertify` added to `TrustHistoryAction`

## Scope

- **Applies to:** Peer-to-peer trust (`trust_awards` table)
- **Does NOT apply to:** Admin-granted trust (`admin_trust_grants` table)
