# FT-16: Community Value Recognition System - Implementation Summary

## Overview

This document summarizes the implementation of the Community Value Recognition System with **integration to the existing items table** instead of creating a separate `community_value_categories` table.

## Key Design Decision: Items Table Integration

**Instead of:** Separate `community_value_categories` table for contribution categories
**We use:** Existing `items` table which serves dual purpose for both wealth sharing AND contribution tracking

### Benefits of This Integration

1. **Unified Value System**: Same items used for wealth sharing AND contribution recognition
2. **Single Source of Truth**: One place to manage item values (`items.wealthValue`)
3. **Auto-Tracking**: When wealth is fulfilled, can automatically log as contribution
4. **Simplified Admin**: Manage items once, use everywhere
5. **Cross-Feature Analytics**: Statistics can aggregate wealth AND contributions together

### How It Works

```typescript
// Same item used for both purposes:
const elderCareItem = {
  id: 'item-uuid',
  communityId: 'community-uuid',
  translations: { en: { name: 'Elder Care', description: 'Care for elderly members' } },
  kind: 'service', // service for time-based contributions
  wealthValue: 15.0, // Value per unit (hour)
  contributionMetadata: {
    categoryType: 'care',
    examples: ['Assisting with daily tasks', 'Companionship', 'Medical support']
  }
};

// Used for wealth sharing:
const wealthShare = {
  itemId: 'item-uuid', // References same item
  title: 'Elder Care Available',
  unitsAvailable: 10 // hours available
};

// Used for contribution tracking:
const contribution = {
  itemId: 'item-uuid', // References same item!
  units: 3, // 3 hours contributed
  valuePerUnit: 15.0, // Snapshot from items.wealthValue
  totalValue: 45.0 // 3 * 15
};
```

## Database Changes Implemented

### 1. Modified Schema: `valueRecognition.schema.ts`

**Removed:**
- `communityValueCategories` table
- `categoryTypeEnum` (care, community_building, etc.)
- `unitTypeEnum` (hours, sessions, etc.)

**Updated:**
- `recognizedContributions` now references `items.id` instead of `category_id`
- `valueCalibrationHistory` now references `items.id` to track value changes

**Kept:**
- `recognizedContributions` table (with `itemId` foreign key)
- `contributionSummary` table (aggregated stats per user)
- `peerRecognitionGrants` table (peer-to-peer recognition)
- `valueCalibrationHistory` table (tracks changes to `items.wealthValue`)
- `verificationStatusEnum` (auto_verified, pending, verified, disputed)
- `sourceTypeEnum` (system_logged, peer_grant, self_reported)

### 2. Extended Schema: `items.schema.ts`

**Added:**
```typescript
contributionMetadata: jsonb('contribution_metadata')
// Structure: {
//   categoryType: 'care' | 'community_building' | 'creative' | 'knowledge' | 'maintenance' | 'material' | 'invisible_labor',
//   examples: ['Example activity 1', 'Example activity 2']
// }
```

**Updated Documentation:**
- Clarified dual purpose of `items` table
- Explained `wealthValue` now serves both wealth AND contribution recognition

### 3. Migration: `0016_integrate_contributions_with_items.sql`

**What it does:**
1. Drops old foreign key constraints from `recognized_contributions` and `value_calibration_history`
2. Renames `category_id` to `item_id` in both tables
3. Adds new foreign key constraints referencing `items` table
4. Adds `contribution_metadata` column to `items` table
5. Drops the `community_value_categories` table (no longer needed)
6. Drops unused enums (`category_type`, `unit_type`)
7. Adds comments explaining the integration

**Migration registered in:** `meta/_journal.json`

### 4. Updated `communities.schema.ts`

No changes needed - trust threshold configuration fields were already added in previous migration (`0015_value_recognition.sql`):

- `minTrustToViewRecognition` (default: 0)
- `minTrustToLogContributions` (default: 5)
- `minTrustToGrantPeerRecognition` (default: 10)
- `minTrustToVerifyContributions` (default: 15)
- `minTrustForRecognitionManagement` (default: 25)
- `minTrustForCouncilVerification` (default: 20)
- `minTrustForDisputeReview` (default: 30)
- `valueRecognitionSettings` (JSONB with system configuration)

## Repository Changes Implemented

### 1. Updated: `recognizedContribution.repository.ts`

**Changes:**
- Import `items` instead of `communityValueCategories`
- `CreateRecognizedContributionDto` now uses `itemId` instead of `categoryId`
- All joins updated from `communityValueCategories` to `items`
- Method renamed: `findByCategoryAndDateRange()` → `findByItemAndDateRange()`
- Method renamed: `getCategoryBreakdownByUser()` → `getItemBreakdownByUser()`
- Breakdown now returns `itemTranslations`, `itemKind`, `contributionMetadata` instead of category fields

**Key Methods:**
- `create()` - Create new contribution
- `findById()` - Get single contribution
- `findByContributor()` - Get user's contributions with item data
- `findPendingVerificationByBeneficiary()` - Pending verifications for a user
- `findRecentByCommunity()` - Recent contributions in community
- `findByItemAndDateRange()` - Contributions for specific item in date range
- `findVerifiedSince()` - Verified contributions since date
- `update()` - Update contribution (typically verification status)
- `delete()` - Soft delete contribution
- `getAggregateStatsByCommunity()` - Community-wide statistics
- `getItemBreakdownByUser()` - User's contributions broken down by item

### 2. Existing Repositories (No Changes Needed)

These repositories already exist and should work with the new schema:

- `contributionSummary.repository.ts` - Aggregated stats per user
- `peerRecognitionGrant.repository.ts` - Peer recognition grants
- `valueCalibration.repository.ts` - Value calibration history (now references items)

Note: These may need review to ensure they work with `itemId` instead of `categoryId`.

## Still To Implement

### Phase 1: Core Backend (REMAINING)

1. **Review Existing Repositories**
   - Check `contributionSummary.repository.ts`
   - Check `peerRecognitionGrant.repository.ts`
   - Check `valueCalibration.repository.ts`
   - Update if they reference old `categoryId` field

2. **Service Layer** (`services/contribution.service.ts`)
   - Log contributions (self-reported, system-logged, peer-grant)
   - Verify contributions (beneficiary/witness verification)
   - Calculate/update contribution summaries
   - Grant peer recognition (with monthly limits)
   - Calibrate item values (update `items.wealthValue`)
   - Auto-track from wealth fulfillment
   - All with proper OpenFGA permission checks

3. **Validators** (`api/validators/contribution.validator.ts`)
   - `createContributionSchema` - Log new contribution
   - `verifyContributionSchema` - Verify contribution
   - `grantPeerRecognitionSchema` - Grant peer recognition
   - `calibrateValueSchema` - Adjust item value
   - `getContributionSummarySchema` - Get user summary

4. **Controller** (`api/controllers/contribution.controller.ts`)
   - `logContribution()` - POST /contributions
   - `getContribution()` - GET /contributions/:id
   - `verifyContribution()` - PUT /contributions/:id/verify
   - `getUserSummary()` - GET /communities/:id/contributions/summary/:userId
   - `grantPeerRecognition()` - POST /communities/:id/contributions/peer-recognition
   - `calibrateItemValue()` - PUT /items/:id/calibrate-value

5. **Routes** (`api/routes/contribution.routes.ts`)
   - Wire up all endpoints with proper middleware
   - Apply `verifyToken` for authenticated endpoints
   - Apply validation middleware

6. **Tests**
   - `recognizedContribution.repository.test.ts`
   - `contribution.service.test.ts`
   - Integration tests

7. **HTTP Test File** (`tests/http/contributions.http`)
   - Example requests for all endpoints
   - With sample Keycloak tokens

### Phase 2: Frontend Integration

(Not part of this backend implementation, but for reference)

- Display contribution summaries with item names
- Log contribution form (select from items)
- Verify contributions UI
- Peer recognition grant UI
- Item value calibration UI (admin)

## API Response Format (As Specified)

### GET /communities/:id/contributions/summary/:userId

```typescript
{
  userId: string;
  totalValue6Months: number;
  totalValueLifetime: number;
  categoryBreakdown: { [itemName: string]: number }; // Item names from translations
  recentContributions: Array<{
    id: string;
    itemId: string;
    itemName: string; // From items.translations (current locale)
    itemKind: 'object' | 'service';
    units: number;
    valuePerUnit: number; // From items.wealthValue at time of contribution
    totalValue: number;
    description: string;
    verificationStatus: 'auto_verified' | 'pending' | 'verified' | 'disputed';
    testimonial?: string;
    createdAt: string;
  }>;
}
```

## Integration Points

### 1. Wealth Fulfillment → Auto-Contribution

When a wealth request is fulfilled:

```typescript
// In wealth.service.ts fulfillRequest():
if (wealthRequest.status === 'fulfilled') {
  // Optional: Auto-log as contribution
  await contributionService.logSystemContribution({
    communityId: wealth.communityId,
    contributorId: wealth.createdBy,
    itemId: wealth.itemId, // Same item!
    units: wealthRequest.unitsRequested,
    sourceType: 'system_logged',
    sourceId: wealthRequest.id
  });
}
```

### 2. Item Value Calibration → Contribution Value

When an item's `wealthValue` is updated:

```typescript
// In item.service.ts or contribution.service.ts:
await valueCalibrationHistoryRepository.create({
  communityId,
  itemId,
  oldValuePerUnit: oldValue,
  newValuePerUnit: newValue,
  reason: 'Community decision: Increase elder care value',
  proposedBy: userId,
  decidedThrough: 'community_poll',
  effectiveDate: new Date()
});
```

## Testing Strategy

### Unit Tests

1. **Repository Tests** (with mock DB)
   - CRUD operations
   - Join queries return correct item data
   - Aggregations work correctly

2. **Service Tests** (with mocked repositories)
   - Permission checks via OpenFGA
   - Business logic validation
   - Monthly limits for peer grants
   - Auto-tracking from wealth

### Integration Tests

- Full flow: Create item → Log contribution → Verify → Check summary
- Calibrate item value → Verify history recorded
- Peer recognition with limits

## Next Steps

1. **Review existing repositories** for `categoryId` → `itemId` compatibility
2. **Implement service layer** with all business logic
3. **Create validators** for request validation
4. **Implement controller** for HTTP handling
5. **Define routes** with proper middleware
6. **Write tests** for repositories and services
7. **Create .http test file** for manual testing
8. **Test migration** by restarting dev server
9. **Verify OpenFGA permissions** are correctly configured

## Files Modified

### Schema Files
- `/api/src/db/schema/valueRecognition.schema.ts` - Removed categories table, updated to use items
- `/api/src/db/schema/items.schema.ts` - Added contributionMetadata field

### Migration Files
- `/api/src/db/migrations/0016_integrate_contributions_with_items.sql` - New migration
- `/api/src/db/migrations/meta/_journal.json` - Added migration entry

### Repository Files
- `/api/src/repositories/recognizedContribution.repository.ts` - Updated for items integration

## Files To Create/Update

### Repositories (Review)
- `/api/src/repositories/contributionSummary.repository.ts` - Check compatibility
- `/api/src/repositories/peerRecognitionGrant.repository.ts` - Check compatibility
- `/api/src/repositories/valueCalibration.repository.ts` - Update to use itemId

### Services (Create)
- `/api/src/services/contribution.service.ts` - Main business logic
- `/api/src/services/contribution.service.test.ts` - Unit tests

### API Layer (Create)
- `/api/src/api/validators/contribution.validator.ts` - Request validation
- `/api/src/api/controllers/contribution.controller.ts` - HTTP handlers
- `/api/src/api/routes/contribution.routes.ts` - Route definitions

### Tests (Create)
- `/api/src/repositories/recognizedContribution.repository.test.ts` - Repository tests
- `/api/tests/http/contributions.http` - Manual API testing

## Notes

- Migration will apply automatically on next server restart
- All value recognition settings already exist in `communities` table
- Trust-based permissions already configured in OpenFGA model
- Items table now serves dual purpose - document this clearly in API docs
- Frontend will need to filter items by `contributionMetadata` to show only contribution categories vs wealth items
