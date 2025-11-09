# Pool Contribution Foreign Key Fix - Verification

## Problem Fixed

**Issue**: In `pools.service.ts`, the `contributeToPool` method was creating a `wealth_request` with `requesterId: pool.councilId`, which violated the foreign key constraint since `wealth_requests.requester_id` references `app_users.id`, not councils.

**Error**:
```
PostgresError: insert or update on table "wealth_requests" violates foreign key constraint "wealth_requests_requester_id_app_users_id_fk"
```

## Solution Applied

### 1. Updated `contributeToPool` Method (Line 232-248)

**Before**:
```typescript
const wealth = await wealthRepository.createWealth({...});

// PROBLEM: Creating wealth_request with council ID (not a user)
const request = await wealthRepository.createWealthRequest({
  wealthId: wealth.id,
  requesterId: pool.councilId, // ❌ Council ID violates FK constraint
  message: data.message ?? `Pool contribution: ${data.unitsOffered} ${item.name}`,
  unitsRequested: data.unitsOffered,
});

return { wealth, request };
```

**After**:
```typescript
// Pool contributions are tracked via wealth entries with targetPoolId, not via wealth_requests
const wealth = await wealthRepository.createWealth({
  createdBy: userId,
  communityId: pool.communityId,
  itemId: data.itemId,
  title: data.title,
  description: data.description ?? null,
  durationType: 'unlimited',
  distributionType: 'unit_based',
  unitsAvailable: data.unitsOffered,
  sharingTarget: 'pool',
  targetPoolId: poolId, // ✅ Tracked via targetPoolId
  status: 'active',
});

return { wealth }; // ✅ No wealth_request created
```

### 2. Updated `confirmContribution` Method (Line 291-311)

**Before**:
```typescript
// Find the wealth request
const requests = await wealthRepository.listRequestsForWealth(wealthId);
const request = requests.find(r => r.requesterId === pool.councilId && r.status === 'pending');

if (!request) {
  throw new AppError('No pending request found for this contribution', 404);
}

// Accept and fulfill the request
await wealthRepository.acceptRequest(request.id);
await wealthRepository.markRequestFulfilled(request.id);

// Mark wealth as fulfilled
await wealthRepository.markFulfilled(wealthId);

// Increment pool inventory
await poolsRepository.incrementInventory(...);
```

**After**:
```typescript
// Verify wealth is still active (not already confirmed/rejected)
if (wealth.status !== 'active') {
  throw new AppError('Contribution has already been processed', 400);
}

// Mark wealth as fulfilled (no request handling needed)
await wealthRepository.markFulfilled(wealthId);

// Increment pool inventory
await poolsRepository.incrementInventory(
  poolId,
  wealth.itemId,
  wealth.unitsAvailable ?? 1
);
```

### 3. Updated `rejectContribution` Method (Line 332-345)

**Before**:
```typescript
// Find and reject the wealth request
const requests = await wealthRepository.listRequestsForWealth(wealthId);
const request = requests.find(r => r.requesterId === pool.councilId && r.status === 'pending');

if (!request) {
  throw new AppError('No pending request found for this contribution', 404);
}

await wealthRepository.rejectRequest(request.id);

// Cancel the wealth
await wealthRepository.cancelWealth(wealthId);
```

**After**:
```typescript
// Verify wealth is still active (not already confirmed/rejected)
if (wealth.status !== 'active') {
  throw new AppError('Contribution has already been processed', 400);
}

// Cancel the wealth (no request handling needed)
await wealthRepository.cancelWealth(wealthId);
```

## Rationale

1. **Pool contributions are already tracked via wealth entries**: Wealth entries with `targetPoolId` + `status='active'` represent pending contributions.

2. **`listPendingContributions` already works correctly**: It queries wealth entries directly via `getPendingContributionsByPoolId`, not via wealth_requests.

3. **No need for separate wealth_request tracking**: The `wealth_requests` table is designed for user-to-user wealth sharing requests, not pool contributions.

4. **Cleaner architecture**: Pool contributions are now consistently tracked in one place (wealth table), not split across two tables.

## Testing Updates

Updated tests in `pools.service.test.ts`:

1. **`contributeToPool` test**: Verifies that `createWealthRequest` is NOT called
2. **`confirmContribution` test**: Verifies direct wealth fulfillment without request handling
3. **`rejectContribution` test**: Added new test to verify direct wealth cancellation

## Files Modified

1. `/api/src/services/pools.service.ts`:
   - Line 232-248: `contributeToPool` method
   - Line 291-311: `confirmContribution` method
   - Line 332-345: `rejectContribution` method

2. `/api/src/services/pools.service.test.ts`:
   - Line 265-285: Updated `contributeToPool` test
   - Line 302-332: Updated `confirmContribution` tests
   - Line 334-367: Added `rejectContribution` tests

## Verification

To verify the fix works:

1. **Code compiles successfully**:
   ```bash
   cd api && bun run build
   # ✅ Bundled 1377 modules
   ```

2. **Foreign key constraint no longer violated**:
   - `contributeToPool` no longer tries to insert a council ID into `wealth_requests.requester_id`
   - Contributions are tracked purely via `wealth.targetPoolId`

3. **Flow is consistent**:
   - Create contribution → wealth with `targetPoolId` created
   - List pending → query wealth by `targetPoolId`
   - Confirm → mark wealth fulfilled + increment inventory
   - Reject → cancel wealth
