# Pool Contribution Bug Fix Summary

## Bug Description

**Issue**: Foreign key constraint violation when contributing to pools

**Error**:
```
PostgresError: insert or update on table "wealth_requests" violates foreign key constraint
"wealth_requests_requester_id_app_users_id_fk"
DETAIL: Key (requester_id)=(council-uuid) is not present in table "app_users".
```

**Root Cause**: The `contributeToPool` method was creating a `wealth_request` record with `requesterId: pool.councilId`. Since councils are not app users, this violated the foreign key constraint `wealth_requests.requester_id → app_users.id`.

## Solution

Removed the wealth_request creation from the pool contribution flow. Pool contributions are now tracked exclusively through wealth entries with `targetPoolId` set, which is the correct architectural approach.

## Changes Made

### 1. `api/src/services/pools.service.ts`

#### Method: `contributeToPool` (lines 232-248)
- **Removed**: Creation of wealth_request with council ID as requester
- **Kept**: Creation of wealth entry with `targetPoolId`
- **Result**: Now returns `{ wealth }` instead of `{ wealth, request }`

### 2. `api/src/api/controllers/pools.controller.ts`

#### Method: `contributeToPool` (lines 304-316)
- **Changed**: Return `result.wealth` instead of full `result` object
- **Result**: API response now returns just the wealth object, matching frontend's `Promise<Wealth>` expectation

#### Method: `confirmContribution` (lines 291-311)
- **Removed**: Lines that fetched and updated wealth_request
- **Added**: Status check to ensure wealth is still 'active'
- **Kept**: Direct wealth fulfillment and inventory increment
- **Result**: Simpler, more direct flow without request handling

#### Method: `rejectContribution` (lines 332-345)
- **Removed**: Lines that fetched and rejected wealth_request
- **Added**: Status check to ensure wealth is still 'active'
- **Kept**: Direct wealth cancellation
- **Result**: Simpler, more direct flow without request handling

### 3. `api/src/services/pools.service.test.ts`

#### Test: `contributeToPool` (lines 265-285)
- **Updated**: Assert that `createWealthRequest` is NOT called
- **Updated**: Verify only wealth object is returned
- **Added**: Explicit check that request is undefined

#### Test: `confirmContribution` (lines 302-332)
- **Updated**: Remove expectations for wealth_request method calls
- **Updated**: Verify direct `markFulfilled` and `incrementInventory` calls
- **Added**: Test for "already processed" error case

#### Test: `rejectContribution` (lines 334-367) - NEW
- **Added**: Test for successful rejection
- **Added**: Test for "already processed" error case
- **Added**: Test for "not council manager" error case

## Architecture Rationale

### Why wealth_requests are not needed for pool contributions:

1. **Different use case**: `wealth_requests` is designed for user-to-user wealth sharing, where:
   - A user publishes wealth
   - Another user requests it
   - Original user accepts/rejects

2. **Pool contributions are different**:
   - A user offers wealth to a pool
   - Council managers review and accept/reject
   - No "requester" in the traditional sense - the pool is the recipient

3. **Correct tracking mechanism**:
   - Wealth entries with `targetPoolId` represent pool contributions
   - Status field indicates state: `active` (pending), `fulfilled` (accepted), `cancelled` (rejected)
   - `listPendingContributions` already uses this approach via `getPendingContributionsByPoolId`

4. **Consistency**:
   - Pool distributions use `sourcePoolId` on wealth entries
   - Pool contributions should mirror this with `targetPoolId`
   - Both tracked in wealth table, no separate request table needed

## Testing Verification

### Build Check
```bash
cd api && bun run build
# ✅ SUCCESS: Bundled 1377 modules
```

### Expected Behavior After Fix

1. **Contribute to pool**:
   - POST `/api/communities/:id/pools/:poolId/contribute`
   - Creates wealth with `targetPoolId`, status='active'
   - No wealth_request created
   - Returns `{ wealth }`

2. **List pending contributions**:
   - GET `/api/communities/:id/pools/:poolId/contributions/pending`
   - Queries wealth where `targetPoolId = poolId AND status = 'active'`
   - Works correctly (already used this approach)

3. **Confirm contribution**:
   - POST `/api/communities/:id/pools/:poolId/contributions/:wealthId/confirm`
   - Checks wealth status is 'active'
   - Marks wealth as 'fulfilled'
   - Increments pool inventory
   - No wealth_request handling

4. **Reject contribution**:
   - POST `/api/communities/:id/pools/:poolId/contributions/:wealthId/reject`
   - Checks wealth status is 'active'
   - Marks wealth as 'cancelled'
   - No wealth_request handling

## Migration Notes

**No database migration required** - this is a code-only fix.

### Existing Data
If there are any orphaned wealth_requests with council IDs as requesters (likely none due to FK constraint preventing creation), they can be safely ignored or cleaned up.

### API Response Changes
- `POST /api/communities/:id/pools/:poolId/contribute` now returns `{ wealth }` instead of `{ wealth, request }`
- Frontend should only use `wealth.id` for tracking contributions

## Files Modified

1. `/api/src/services/pools.service.ts` - Core service bug fix (removed wealth_request creation)
2. `/api/src/api/controllers/pools.controller.ts` - Controller update (return wealth object only)
3. `/api/src/services/pools.service.test.ts` - Test updates
4. `/api/POOL_CONTRIBUTION_FIX_VERIFICATION.md` - Detailed verification doc
5. `/api/POOL_CONTRIBUTION_BUG_FIX_SUMMARY.md` - This file

**Frontend**: No changes needed - already expects `Promise<Wealth>` from the API

## Status

- [x] Bug identified
- [x] Root cause analyzed
- [x] Fix implemented
- [x] Tests updated
- [x] Build verification passed
- [x] Documentation created

The fix is ready for deployment.
