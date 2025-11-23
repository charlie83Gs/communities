---
id: FT-06
title: Councils
status: implemented
version: 1.1
last_updated: 2025-11-18
related_features: [FT-01, FT-02, FT-03, FT-04, FT-05, FT-07, FT-08]
---

# Councils

## Purpose
Councils are **community actors** (similar to members) focused on specific domains (e.g., "Community Food Council"). They serve as specialized groups that can manage resources and coordinate activities.

## Council Trust System

### Similar to Member Trust
- Councils have trust scores based on community member confidence
- Trust score represents member confidence in the council's mission and operations

### Awarding Council Trust
- Members can trust councils to indicate confidence in their mission and operations
- Example: "Food Council" trusted by 25 members = trust score of 25

### Removing Council Trust
- Members can remove their trust from a council at any time
- Example: If a council mismanages resources, members can withdraw trust

### Trust Impact
Council trust scores can determine:
- Access to certain community resources
- Eligibility to handle disputes
- Visibility and prominence in community listings
- Ability to create certain types of pools

### Transparency
All council trust awards and removals are tracked.

## Council Capabilities

Councils function like members and can:
1. **Share wealth**: Publish resources from their inventory
2. **Publish needs**: Express resource requirements
3. **Create initiatives**: Propose community actions

## Council Resource Management

### Transparent Inventory
- Councils display their current resources
- Example: "Food Council has 5 carrots"
- All members can view council inventory

### Auditable Transactions
All resource movements are tracked:
- Example: "Moved 5 carrots to Garden Pool"
- Example: "Received 10 carrots from User A"

### Usage Reports
- Councils can write reports explaining resource usage
- Example: "5 carrots used to feed community rabbits"

### Evidence Uploads
Reports can include images and documents:
- Photos of completed projects
- Receipts or documentation
- Before/after images
- Activity documentation

## Receiving Wealth
- Members can share wealth directly to a council (targeted sharing)
- This is a standard wealth share that automatically transfers to the council
- Councils accumulate resources for their initiatives

## Initiatives
- Councils can create initiatives to propose community actions
- Members can upvote or downvote initiatives
- Initiatives support comments
- Highly supported initiatives guide community action

## Related Database Tables

### Implemented
- `councils` - Council definitions
- `council_managers` - Members managing councils
- `council_trust_scores` - Trust scores for councils
- `council_trust_awards` - Member-to-council trust (has removedAt field)
- `council_trust_history` - Audit log of council trust
- `council_inventory` - Council resource inventory
- `council_transactions` - Council resource movements
- `initiatives` - Council proposals with status, voting
- `initiative_votes` - Votes on initiatives
- `initiative_comments` - Comments on initiatives
- `initiative_reports` - Progress reports on initiatives
- `initiative_report_comments` - Comments on reports
- `council_usage_reports` - Council-written explanations of resource usage
- `report_attachments` - Images and documents attached to council reports

### Planned
- `council_needs` - Resource requirements published by councils

## Frontend Implementation

The council details page uses a tabbed layout with the following sections:

### Overview Tab
- Council description and trust score
- Trust actions (award/remove trust)
- Managers list

### Inventory Tab
- Current inventory display
- Transaction history

### Pools Tab
- List of pools owned by this council
- Shows pool name, description, inventory summary
- Links to pool detail pages
- Link to create new pool

### Initiatives Tab
- List of council initiatives with voting (upvote/downvote)
- Initiative status badges (active, completed, cancelled)
- Create initiative functionality for managers
- Links to initiative detail page

### Usage Reports Tab
- List of usage reports documenting resource usage
- Expandable reports showing markdown content
- Attachment support (images, documents)
- Create/edit/delete for council managers

### Initiative Detail Page
Route: `/communities/:id/councils/:councilId/initiatives/:initiativeId`
- Full initiative view with title, description (markdown), status
- Voting functionality
- Comments section
- Progress reports with comments

## Configuration
- `minTrustForCouncilCreation` - Minimum trust score to create councils (default: 25)
- Council Manager assignment - Per-council role assignment for management

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-05: Pools](./05-pools.md)
- [FT-07: Voting & Polling](./07-voting-polling.md)
- [FT-08: Needs System](./08-needs-system.md)
