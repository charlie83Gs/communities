# Needs System - Timeline/Activity Feed TODO

## Summary
The Needs tab has been successfully added to the community navigation. However, the "Trust Timeline" feature mentioned in the requirements currently shows **trust milestones** (permissions unlocked at different trust scores), not an **activity feed** of community events.

## Completed Tasks

### 1. Added Needs Tab to Community Navigation
- **File**: `/frontend/src/pages/protected/community/[id].tsx`
- **Changes**:
  - Added `NeedsList` import
  - Added 'needs' to `SidebarTab` type in `/frontend/src/components/features/communities/CommunitySidebar.tsx`
  - Added Needs sidebar item with 'list' icon
  - Visible to all community members (`role() !== undefined`)
  - Added Match case for 'needs' tab displaying `<NeedsList />`

### 2. Updated i18n Dictionary
- **File**: `/frontend/src/pages/protected/community/[id].i18n.ts`
- **Added Keys**:
  - `tabNeeds`: "Needs" (en), "Necesidades" (es), "आवश्यकताएं" (hi)
  - `disclaimerNeeds`: Description of needs feature in all 3 languages

### 3. Existing Needs Pages
The following pages already exist and work:
- `/frontend/src/pages/protected/community/needs/index.tsx` - List needs
- `/frontend/src/pages/protected/community/needs/create.tsx` - Create new need
- `/frontend/src/pages/protected/community/needs/aggregate.tsx` - View aggregated needs
- `/frontend/src/pages/protected/council/needs/index.tsx` - Council needs list
- `/frontend/src/pages/protected/council/needs/create.tsx` - Create council need

## Pending Tasks: Activity Timeline/Event Feed

### Current State
The existing **Trust Timeline** component (`/frontend/src/components/features/communities/TrustTimeline.tsx`) shows:
- User's current trust score
- Trust milestones (thresholds: 0, 10, 15, 20, 25, 30)
- Permissions unlocked at each milestone
- Visual progress toward next milestone

This is **NOT** an activity feed showing recent events.

### What's Needed: Community Activity Timeline

To track needs-related events (and wealth events) as mentioned in the requirements, we need to create a **new component**: Community Activity Feed/Timeline.

#### Events to Track

**Needs Events:**
1. **Need Published** - When a member publishes a new need
   - Icon: 📋
   - Message: "[User] published a need for [Item Name]"
   - Priority badge: need/want
   - Link to need (if still active)

2. **Need Fulfilled** - When a need is marked as fulfilled
   - Icon: ✅
   - Message: "[User]'s need for [Item Name] was fulfilled"
   - Show fulfillment date

3. **Need Updated** - When a member updates their need
   - Icon: ✏️
   - Message: "[User] updated their need for [Item Name]"

4. **Need Removed** - When a member removes their need
   - Icon: 🗑️
   - Message: "[User] removed their need for [Item Name]"

**Wealth Events (for reference - similar pattern):**
1. Wealth Published - "[User] shared [Item/Service]"
2. Wealth Fulfilled - "[User]'s [Item/Service] was claimed"
3. Wealth Expired - "[Item/Service] offer expired"

#### Implementation Plan

1. **Backend: Create Activity/Event Tracking**
   - New table: `community_activity_events` or similar
   - Columns: id, communityId, eventType, userId, resourceType, resourceId, metadata, createdAt
   - Event types: 'need_published', 'need_fulfilled', 'need_updated', 'need_removed', 'wealth_published', etc.
   - Trigger events in needs/wealth services when actions occur

2. **Backend: API Endpoint**
   - `GET /api/v1/communities/:id/activity` - Get recent community events
   - Support pagination (limit, offset)
   - Support filtering by event type
   - Return: array of events with user details, item details, timestamps

3. **Frontend: Create Components**
   - `/frontend/src/components/features/communities/CommunityActivityFeed.tsx`
   - `/frontend/src/components/features/communities/ActivityEventCard.tsx`
   - Use similar styling to `TrustEventsList.tsx` (trust awards list)

4. **Frontend: Add Query Hook**
   - `/frontend/src/hooks/queries/useCommunityActivityQuery.ts`
   - Fetch activity events for a community
   - Auto-refresh periodically (e.g., every 30 seconds)

5. **Frontend: Add to Community Page**
   - Either:
     - Option A: Add as new tab "Activity" in community sidebar
     - Option B: Add to existing "Trust Timeline" tab below milestones
     - Option C: Show as a sidebar widget on all tabs

6. **Frontend: i18n Support**
   - Create `/frontend/src/components/features/communities/CommunityActivityFeed.i18n.ts`
   - Event descriptions in English, Spanish, Hindi
   - Relative timestamps ("2 hours ago", "yesterday")

#### Example Component Structure

```tsx
// CommunityActivityFeed.tsx
export const CommunityActivityFeed: Component<{ communityId: string }> = (props) => {
  const t = makeTranslator(activityFeedDict, 'activityFeed');
  const activityQuery = useCommunityActivityQuery(() => props.communityId);

  return (
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">{t('title')}</h2>
      <For each={activityQuery.data}>
        {(event) => (
          <ActivityEventCard event={event} />
        )}
      </For>
    </div>
  );
};
```

#### Event Icons Mapping

```typescript
const getEventIcon = (type: string): string => {
  switch (type) {
    case 'need_published': return '📋';
    case 'need_fulfilled': return '✅';
    case 'need_updated': return '✏️';
    case 'need_removed': return '🗑️';
    case 'wealth_published': return '🎁';
    case 'wealth_fulfilled': return '🤝';
    case 'wealth_expired': return '⏰';
    default: return '•';
  }
};
```

### Alternative: Use Existing Pattern

If you want a simpler implementation without a new backend table, you could:

1. Query recent needs with `status` changes
2. Query recent wealth with `status` changes
3. Combine and sort by `updatedAt` timestamp
4. Display as activity feed

This would be less comprehensive but faster to implement.

## References

- **Similar Component**: `/frontend/src/components/features/trust/TrustEventsList.tsx` - Shows trust awards/removals
- **Trust Milestone Component**: `/frontend/src/components/features/communities/TrustTimeline.tsx` - NOT an activity feed
- **Needs Schema**: `/api/src/db/schema/needs.schema.ts` - Has status field for tracking
- **Wealth Schema**: `/api/src/db/schema/wealth.schema.ts` - Has status field for tracking

## Next Steps

1. Clarify with stakeholders: Do we need a full activity feed or just status tracking?
2. If activity feed is needed, start with backend event tracking table
3. Create API endpoints for fetching events
4. Build frontend components following the TrustEventsList pattern
5. Add to community page (decide on placement: new tab vs sidebar widget vs inline)

## Notes

- The current implementation successfully adds the Needs tab to navigation
- Needs can be viewed, created, and managed through the tab
- Activity tracking would be a separate feature enhancement
- Consider performance: activity feeds can grow large, need pagination and caching
