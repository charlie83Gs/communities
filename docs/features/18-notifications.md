---
id: FT-18
title: Notifications System
status: planned
version: 1.0
last_updated: 2025-11-18
related_features: [FT-04, FT-05, FT-06, FT-07, FT-08, FT-15]
---

# Notifications System

## Overview
The notifications system provides users with awareness of activity that requires their attention across the application. It supports both in-app indicators and a centralized notification feed for tracking important events.

## Core Concepts

### Notification Types
Notifications are categorized by the type of activity they represent:

1. **Wealth Request Messages** (`wealth_request_message`)
   - New message in a wealth request thread
   - Recipient: The other party in the request (requester or owner)

2. **Request Status Changes** (`wealth_request_status`)
   - Request accepted, rejected, fulfilled, etc.
   - Recipient: The requester

3. **New Wealth Requests** (`wealth_request_new`)
   - Someone requested your shared wealth
   - Recipient: Wealth owner

4. **Pool Activity** (`pool_activity`) - Planned
   - Distributions, contributions, need fulfillments
   - Recipient: Pool members

5. **Council Activity** (`council_activity`) - Planned
   - New members, decisions, assignments
   - Recipient: Council members

6. **Dispute Updates** (`dispute_update`) - Planned
   - New disputes, resolutions, mediator assignments
   - Recipient: Dispute participants

7. **Trust Changes** (`trust_change`) - Planned
   - Trust awarded or removed
   - Recipient: Trust recipient

8. **Poll/Vote Activity** (`poll_activity`) - Planned
   - New polls, voting reminders, results
   - Recipient: Eligible voters

### Notification States
- **Unread**: New notification, not yet seen
- **Read**: User has acknowledged the notification
- **Dismissed**: User explicitly dismissed (optional future feature)

### Delivery Channels
Initially, notifications are **in-app only**. Future channels may include:
- Email notifications (opt-in)
- Push notifications (mobile app)
- Webhooks (integrations)

## User Interface

### Activity Indicators
Visual indicators appear on relevant UI elements when there's unread activity:

1. **Wealth Request Indicator**
   - Small indicator (e.g., `*` or dot) on requests with new messages
   - Shown in WealthRequestsPanel for owners
   - Shown in request timeline for requesters

2. **Navigation Badge** (Future)
   - Badge on navigation items showing unread count
   - Example: "My Requests (3)" or notification bell icon

### Notification Feed
A centralized view of all notifications:
- Chronological list (newest first)
- Grouped by date
- Filter by notification type
- Mark as read (individual or all)
- Click to navigate to related item

### Notification Item Display
Each notification shows:
- Icon based on notification type
- Brief description of the activity
- Timestamp (relative: "2 hours ago")
- Unread indicator
- Link to related resource

## Data Model

### Notifications Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | TEXT (FK) | Recipient user |
| `community_id` | UUID (FK) | Community context |
| `type` | ENUM | Notification type |
| `title` | VARCHAR(200) | Brief title |
| `message` | TEXT | Detailed message (optional) |
| `resource_type` | VARCHAR(50) | Type of related resource |
| `resource_id` | UUID | ID of related resource |
| `actor_id` | TEXT (FK) | User who triggered notification (optional) |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMP | When notification was created |
| `read_at` | TIMESTAMP | When marked as read (optional) |

### Resource Types
- `wealth_request` - Links to a wealth request
- `wealth` - Links to a wealth item
- `pool` - Links to a pool
- `council` - Links to a council
- `dispute` - Links to a dispute
- `poll` - Links to a poll

## API Endpoints

### List Notifications
```
GET /notifications
Query params:
  - community_id (optional): Filter by community
  - type (optional): Filter by notification type
  - unread_only (optional): Only unread notifications
  - limit (default: 50)
  - offset (default: 0)
Response: { notifications: Notification[], total: number, unreadCount: number }
```

### Get Unread Count
```
GET /notifications/unread-count
Query params:
  - community_id (optional): Filter by community
Response: { count: number }
```

### Mark as Read
```
POST /notifications/:id/read
Response: { success: true }
```

### Mark All as Read
```
POST /notifications/read-all
Query params:
  - community_id (optional): Only for specific community
Response: { success: true, count: number }
```

### Delete Notification
```
DELETE /notifications/:id
Response: { success: true }
```

## Notification Generation

### Event-Driven Creation
Notifications are created as side effects of actions:

```typescript
// Example: When a message is sent in a wealth request thread
async function createRequestMessage(requestId, authorId, content) {
  // 1. Create the message
  const message = await messageRepo.create({ requestId, authorId, content });

  // 2. Determine recipient (the other party)
  const request = await requestRepo.getById(requestId);
  const wealth = await wealthRepo.getById(request.wealthId);
  const recipientId = authorId === wealth.createdBy
    ? request.requesterId
    : wealth.createdBy;

  // 3. Create notification
  await notificationService.create({
    userId: recipientId,
    communityId: wealth.communityId,
    type: 'wealth_request_message',
    title: 'New message in your wealth request',
    resourceType: 'wealth_request',
    resourceId: requestId,
    actorId: authorId,
  });

  return message;
}
```

### Automatic Cleanup
- Notifications older than 90 days can be auto-archived/deleted
- Configurable retention period per community (future)

## Configuration Options

### Community Settings (Future)
Communities may configure:
- `notificationRetentionDays`: How long to keep notifications (default: 90)
- `enabledNotificationTypes`: Which types to generate

### User Preferences (Future)
Users may configure:
- Which notification types they want to receive
- Email notification preferences
- Quiet hours

## Implementation Phases

### Phase 1: Core Infrastructure
- Database schema and migrations
- Notification repository and service
- API endpoints (list, read, delete)
- Basic notification feed component

### Phase 2: Wealth Request Integration
- Generate notifications for new messages
- Activity indicators on requests
- Integration with wealth detail page

### Phase 3: Extended Coverage
- Request status change notifications
- New request notifications
- Trust change notifications

### Phase 4: Enhanced UX
- Real-time updates (WebSocket/polling)
- Navigation badge
- Notification preferences

### Phase 5: Additional Channels (Future)
- Email notifications
- Push notifications

## Security Considerations

1. **Privacy**: Users can only see their own notifications
2. **Community Context**: Notifications respect community membership
3. **No Cross-Leak**: Notifications don't reveal info user shouldn't see
4. **Rate Limiting**: Prevent notification spam (e.g., max per hour per type)

## Use Cases

### Wealth Request Communication
1. Alice shares "Power Drill" with the community
2. Bob requests 1 unit with message "Need for weekend project"
3. Alice sees new request notification
4. Alice sends message: "Sure! When do you need it?"
5. Bob sees message notification (and indicator on request)
6. Bob replies: "Saturday morning works"
7. Alice accepts the request
8. Bob sees acceptance notification

### Trust Change Awareness (Future)
1. Charlie awards trust to Diana
2. Diana sees notification: "Charlie awarded you trust"
3. Diana's trust score increases

### Poll Participation (Future)
1. Admin creates a poll about community hours
2. All eligible members receive notification
3. Members click notification to vote
4. When poll closes, participants see results notification

## Related Database Tables

### Planned
- `notifications` - Core notification storage
- `notification_preferences` - User preferences (future)

## Related Features
- [FT-04: Wealth Sharing](./04-wealth-sharing.md) - Request messages and status changes
- [FT-05: Pools](./05-pools.md) - Pool activity notifications
- [FT-06: Councils](./06-councils.md) - Council activity notifications
- [FT-07: Voting & Polling](./07-voting-polling.md) - Poll notifications
- [FT-08: Needs System](./08-needs-system.md) - Need fulfillment notifications
- [FT-15: Disputes System](./15-disputes-system.md) - Dispute update notifications
