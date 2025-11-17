# Backend Changes for Disputes System

## Issue 1: User Data Population (FIXED)

### Changes Made
The repository methods `findParticipantsByDispute` and `findMediatorsByDispute` now return complete user data by joining with the `app_users` table.

### Response Format

**Participants:**
```typescript
{
  id: string;
  disputeId: string;
  userId: string;
  role: 'initiator' | 'participant';
  addedAt: Date;
  addedBy: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
  }
}
```

**Mediators:**
```typescript
{
  id: string;
  disputeId: string;
  userId: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'withdrawn';
  proposedAt: Date;
  respondedAt: Date | null;
  respondedBy: string | null;
  user: {
    id: string;
    username: string;
    displayName: string | null;
  }
}
```

**Messages:**
```typescript
{
  id: string;
  disputeId: string;
  userId: string;
  message: string;
  createdAt: Date;
  visibleToParticipants: boolean;
  visibleToMediators: boolean;
  user: {
    id: string;
    username: string;
    displayName: string | null;
  }
}
```

## Issue 2: Privacy Type Feature (ADDED)

### New Field: `privacyType`

All disputes now have a `privacyType` field with values:
- `'open'` (default) - All identities visible to everyone who can view the dispute
- `'anonymous'` - Identities hidden except to admins, mediators, and participants

### Database Changes
- New enum type: `dispute_privacy_type` with values `['anonymous', 'open']`
- New column: `disputes.privacy_type` (default: `'open'`)
- Migration: `0017_add_dispute_privacy.sql`

### API Changes

#### 1. Create Dispute (POST `/api/v1/communities/:communityId/disputes`)

**New optional field:**
```json
{
  "title": "Dispute title",
  "description": "Description",
  "participantIds": ["user1", "user2"],
  "privacyType": "anonymous" | "open"  // NEW - optional, defaults to 'open'
}
```

#### 2. Get Dispute Details (GET `/api/v1/communities/:communityId/disputes/:disputeId`)

**New response fields:**
```typescript
{
  // ... existing fields
  privacyType: 'anonymous' | 'open',
  canUpdatePrivacy: boolean,  // true if user is admin or accepted mediator
  // participants and mediators may have anonymized user data if privacyType is 'anonymous'
}
```

#### 3. New Endpoint: Update Privacy Type

**PUT `/api/v1/communities/:communityId/disputes/:disputeId/privacy`**

Only admins and accepted mediators can call this endpoint.

**Request:**
```json
{
  "privacyType": "anonymous" | "open"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Privacy type updated successfully",
  "data": {
    // Updated dispute object
  }
}
```

### Privacy Logic

**Who can see identities in anonymous disputes:**
- Admins (always)
- Accepted mediators (always)
- Participants (always)
- All others see anonymized data

**Anonymized user format:**
```typescript
{
  id: 'anonymous',
  username: 'anonymous',
  displayName: 'Anonymous'
}
```

**What gets anonymized:**
- Participants list
- Mediators list
- Message authors

**What remains visible:**
- Dispute title
- Dispute description
- Message content
- Resolutions
- Status changes

### Frontend Implementation Notes

1. **Display Logic:**
   - Check `dispute.privacyType` to show privacy indicator
   - Use `canUpdatePrivacy` to show/hide privacy toggle button
   - Display anonymized users as "Anonymous" in UI

2. **Privacy Toggle:**
   - Only show to users where `canUpdatePrivacy === true`
   - Call PUT `/api/v1/communities/:communityId/disputes/:disputeId/privacy`
   - Refresh dispute data after successful update

3. **User Display:**
   - When `user.id === 'anonymous'`, display "Anonymous" badge
   - Hide profile links for anonymous users
   - Consider showing tooltip explaining privacy mode

4. **Create Dispute Form:**
   - Add optional privacy type selector
   - Default to 'open'
   - Explain what anonymous mode means

### Migration

The migration runs automatically on server startup. No manual intervention needed.

Migration file: `/api/src/db/migrations/0017_add_dispute_privacy.sql`

---

## Agreement for Frontend Team

All disputes now return:
- `participants` array with populated `user` field
- `mediators` array with populated `user` field
- `messages` array with populated `user` field
- `privacyType` field ('anonymous' | 'open')
- `canUpdatePrivacy` boolean permission flag

For anonymous disputes, `user.displayName` will be "Anonymous" and `user.id` will be "anonymous" unless the viewer is an admin, mediator, or participant.
