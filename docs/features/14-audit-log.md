---
id: FT-14
title: Audit Log
status: partial
version: 1.0
last_updated: 2025-11-08
related_features: [FT-01, FT-04, FT-06, FT-07, FT-08, FT-10]
---

# Audit Log

## Purpose
Track and log all significant actions happening within a community to provide an immutable audit trail, transparency, and accountability for community activities.

## Overview
The Audit Log is an immutable record of all significant actions within a community. It logs events like publishing needs, sharing wealth, creating polls, posting in forums, and awarding trust. This creates transparency, accountability, and provides a complete audit trail for compliance and dispute resolution.

**Note:** This is also displayed to users as an "Activity Timeline" in the frontend for engagement and transparency.

## Key Concepts

### Event Tracking
Every significant action in the community creates an immutable event record containing:
- **Who**: The user who performed the action
- **What**: The type of action (need_created, wealth_shared, poll_created, etc.)
- **When**: Timestamp of the action
- **Where**: Which entity was affected (need ID, wealth ID, poll ID, etc.)
- **Details**: Additional metadata about the action (item names, priorities, quantities, etc.)

### Event Types

Currently tracked events are organized by feature:

#### Needs Events (Implemented)
- `need_created` - Member publishes a new need
- `need_updated` - Member modifies their need
- `need_fulfilled` - Need status changes to fulfilled
- `need_deleted` - Member removes their need

#### Wealth Events (Planned)
- `wealth_created` - Member shares a resource
- `wealth_updated` - Wealth item is modified
- `wealth_fulfilled` - Wealth request is completed
- `wealth_deleted` - Wealth item is removed

#### Poll Events (Planned)
- `poll_created` - Member creates a poll
- `poll_completed` - Poll voting period ends
- `poll_deleted` - Poll is removed

#### Forum Events (Planned)
- `forum_thread_created` - New discussion thread
- `forum_post_created` - New comment/reply
- `forum_thread_deleted` - Thread removed
- `forum_post_deleted` - Post removed

#### Council Events (Planned)
- `council_created` - New council formed
- `council_updated` - Council details changed
- `council_deleted` - Council disbanded

#### Trust Events (Planned)
- `trust_awarded` - Member awards trust to another
- `trust_removed` - Trust award is revoked

### Event Metadata

Each event stores relevant context in a flexible JSONB field. Examples:

**Need Created Event:**
```json
{
  "itemName": "Carrots",
  "itemKind": "object",
  "priority": "need",
  "unitsNeeded": 5,
  "isRecurrent": true,
  "recurrence": "weekly"
}
```

**Wealth Created Event (planned):**
```json
{
  "itemName": "Bread",
  "itemKind": "object",
  "unitsAvailable": 10,
  "durationType": "timebound",
  "endDate": "2025-11-15"
}
```

**Poll Created Event (planned):**
```json
{
  "question": "What should we plant this season?",
  "optionCount": 4,
  "endDate": "2025-11-20"
}
```

## Features

### Activity Timeline UI (Frontend Display)
Visual audit log showing recent community events in chronological order:
- **Vertical timeline** with gradient connecting line
- **Event icons** representing different action types
  - 📋 Needs
  - 💰 Wealth
  - 📊 Polls
  - 💬 Forum
  - 🏛️ Councils
  - 🤝 Trust
- **Event descriptions** in natural language
  - Example: "Alice published a need for Carrots"
- **Relative timestamps** ("2 hours ago", "1 day ago")
- **Priority badges** for needs/wealth (red for needs, blue for wants)
- **Links to entities** (if still active and accessible)

### Event Filtering
Members can filter events by:
- Event type (show only needs, only wealth, etc.)
- Date range
- Specific user activities

### Pagination
Large communities can have many events:
- Default: Show 50 most recent events
- Load more: Fetch additional pages
- Query parameters: `limit` and `offset`

## Benefits

### Transparency
- All community actions are visible and auditable
- Members can see what's happening in real-time
- Creates accountability and trust
- No hidden actions or secret decisions

### Audit Trail
- Complete history of all community actions
- Immutable records for compliance
- Can review past decisions and changes
- Helps resolve disputes with factual record
- Tracks who did what and when

### Engagement
- Members stay informed about community activity
- Discover new needs, resources, and discussions
- Feel connected to community happenings
- Encourages participation

### Notifications (Future)
- Foundation for notification system
- Can notify users of relevant events
- Example: "Someone shared bread (you need this!)"
- Example: "New poll about gardening (you're interested)"

## Privacy & Visibility

### Who Can View Events?
- **Community members only** - Events are not public
- Authorization checked via `communityMemberRepository.isMember()`
- Non-members cannot see community activity

### What's Tracked?
Only **public actions** within the community:
- Publishing needs/wealth (visible to all members)
- Creating polls/forums (public by design)
- Council creation (public within community)
- Trust awards (already visible in trust system)

**NOT tracked:**
- Private messages
- Draft content
- Deleted user accounts
- Personal profile changes

## Configuration

No community-specific configuration currently.

### ⚠️ CRITICAL TODO: Audit Log Retention Policy

**Problem:** Without retention limits, the `community_events` table will grow indefinitely and eventually fill the database, causing performance issues and storage problems.

**Required Implementation:**
- [ ] Add `auditLogRetentionDays` configuration setting (default: 90 days)
- [ ] Create automated cleanup job to delete events older than retention period
- [ ] Schedule job to run daily (e.g., 3 AM) via cron
- [ ] Add monitoring/alerts for audit log table size
- [ ] Document retention policy in community settings
- [ ] Consider archival to cold storage instead of deletion for compliance

**Example Configuration:**
```json
{
  "auditLogRetentionDays": {
    "type": "number",
    "value": 90,
    "description": "Number of days to retain audit log events before automatic deletion"
  }
}
```

**Cleanup Job Implementation:**
```typescript
// File: api/src/jobs/auditLogCleanup.job.ts
export async function runAuditLogCleanup(): Promise<void> {
  // For each community:
  // 1. Get retention period from community config (default 90 days)
  // 2. Delete events older than (current date - retention days)
  // 3. Log cleanup results (how many events deleted per community)
}

// Add to server.ts cron schedule:
cron.schedule('0 3 * * *', async () => {
  try {
    await runAuditLogCleanup();
  } catch (err) {
    console.error('Audit log cleanup job failed:', err);
  }
});
```

**Estimated Growth (per community):**
- Active community (100 members, 50 actions/day): ~1,500 events/month
- Database size: ~150 KB/month (assumes 100 bytes/event avg)
- Without cleanup: ~1.8 MB/year per community
- With 100 communities: ~180 MB/year
- **With 1,000 communities: ~1.8 GB/year** ⚠️

**Performance Considerations:**
- Add index on `(community_id, created_at)` for efficient cleanup queries
- Add index on `created_at` for global retention queries
- Consider partitioning by date for very large installations

Potential future settings:
- Enable/disable audit logging per event type
- Different retention periods per event type (e.g., trust events kept longer)
- Archive old events to cold storage instead of deletion
- Who can view audit log (all members vs. admins only)
- Audit log export for compliance (CSV, JSON)

## Related Database Tables

### Implemented
- `community_events` - Event records with metadata
  - Fields: id, communityId, userId, eventType, entityType, entityId, metadata, createdAt
  - Immutable records (never updated, only created)
  - JSONB metadata for flexible event data
  - **No automatic cleanup** - requires retention job (TODO)

## Implementation Status

### Currently Implemented
✅ Database schema and migration
✅ Repository layer (create, list, filter)
✅ Service layer (authorization, business logic)
✅ Controller and routes (REST API)
✅ Event tracking for **needs only**
✅ Activity Timeline UI component
✅ Frontend hooks and API services

### Planned (Not Yet Implemented)
⏳ Event tracking for wealth
⏳ Event tracking for polls
⏳ Event tracking for forums
⏳ Event tracking for councils
⏳ Event tracking for trust awards
⏳ Notification system based on events
⏳ Event filtering UI
⏳ User-specific activity pages
⏳ **Audit log retention policy and cleanup job** (CRITICAL - required for production)
⏳ Audit log size monitoring and alerts
⏳ Database indexes for performance (created_at, community_id + created_at)

## API Endpoints

### List Community Events
```
GET /api/v1/communities/:communityId/events
```

Query parameters:
- `eventType` (optional) - Filter by event type
- `limit` (optional, default: 50) - Number of events to return
- `offset` (optional, default: 0) - Pagination offset

Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "communityId": "uuid",
      "userId": "user-id",
      "eventType": "need_created",
      "entityType": "need",
      "entityId": "uuid",
      "metadata": {
        "itemName": "Carrots",
        "priority": "need",
        "unitsNeeded": 5
      },
      "createdAt": "2025-11-08T10:00:00Z"
    }
  ]
}
```

### List User Events
```
GET /api/v1/communities/:communityId/events/user/:userId
```

Returns only events for a specific user within a community.

## Related Features
- [FT-01: Communities](./01-communities.md) - Base community structure
- [FT-04: Wealth Sharing](./04-wealth-sharing.md) - Wealth events (planned)
- [FT-06: Councils](./06-councils.md) - Council events (planned)
- [FT-07: Voting & Polling](./07-voting-polling.md) - Poll events (planned)
- [FT-08: Needs System](./08-needs-system.md) - Needs events (implemented)
- [FT-10: Forum System](./10-forum-system.md) - Forum events (planned)

## Use Cases

### Audit Trail for Compliance
1. Member reports wealth request was never fulfilled
2. Admin reviews Audit Log (Activity Timeline)
3. Sees events: "Request created", "Request accepted", but no "Request fulfilled"
4. Timeline shows clear record of what happened and when
5. Can resolve dispute based on immutable factual event log
6. Events cannot be altered or deleted (immutability guarantees)

### Community Transparency
1. Member Alice publishes a need for carrots
2. Event logged: "Alice published a need for Carrots (5 units, weekly)"
3. All community members can see this in Activity Timeline
4. Member Bob sees it and shares carrots from his garden
5. Both actions are visible to everyone
6. Community sees the connection and coordination happening

### Community Engagement
1. New member joins community
2. Views Activity Timeline to learn what's happening
3. Sees recent needs: "Bread (daily)", "Gardening services (monthly)"
4. Sees recent wealth: "Tomatoes shared", "Lawn mower available"
5. Quickly understands community activity and needs
6. Feels informed and ready to participate

### Notification Foundation (Future)
1. Member Alice publishes need for bread daily
2. System logs `need_created` event
3. Notification system (future) detects relevant event
4. Finds members who share bread
5. Notifies them: "Alice needs bread daily (you share this!)"
6. Creates automatic matching and coordination

## Technical Architecture

### Event Creation Flow
```
1. User action (e.g., create need)
   ↓
2. Service method executes business logic
   ↓
3. Service calls communityEventsService.createEvent()
   ↓
4. Event saved to community_events table (immutable)
   ↓
5. Event appears in Activity Timeline (auto-refreshes)
```

### Event Retrieval Flow
```
1. User opens Activity tab
   ↓
2. Frontend calls GET /api/v1/communities/:id/events
   ↓
3. Controller checks community membership
   ↓
4. Service fetches events from repository
   ↓
5. Events returned with user details populated
   ↓
6. Frontend renders timeline with icons and descriptions
```

## Future Enhancements

### Near-term
1. **Implement retention policy cleanup job** (CRITICAL)
2. Add event tracking to wealth service
3. Add event tracking to polls service
4. Event filtering UI (filter by type, date range)
5. User activity pages (view all events by specific user)
6. Database indexes for performance

### Medium-term
7. Real-time updates via WebSocket/SSE
8. Event search functionality
9. Export audit log to CSV/JSON for compliance
10. Configurable event retention period per community
11. Monitoring dashboard for audit log growth

### Long-term
12. Notification system based on events
13. Event-based analytics and insights
14. Activity summaries (daily/weekly digests)
15. Smart matching (connect needs with wealth based on events)
16. Community health metrics from activity patterns
17. Archival to cold storage for long-term retention

## Notes

- Events are **immutable** - never updated, only created
- Events are **currently permanent** - no automatic deletion implemented yet (⚠️ CRITICAL TODO)
- All events require **community membership** to view
- Event metadata structure is **flexible** (JSONB) to accommodate different event types
- Only **currently implemented for needs** - other features pending

## Important Warnings

⚠️ **Database Growth**: Without retention policy, the audit log will grow indefinitely. **Implement cleanup job before deploying to production with multiple communities.**

⚠️ **Performance**: Large audit log tables can slow down queries. Add indexes on `community_id`, `created_at`, and composite `(community_id, created_at)` for better performance.

⚠️ **Storage Costs**: Retaining all events forever can become expensive, especially with many active communities. Recommended retention: 90 days for most events, 180-365 days for critical events like trust awards and council actions.

⚠️ **Compliance**: If audit logs are used for legal/compliance purposes, consider archival instead of deletion. Consult with legal team before implementing deletion policy.
