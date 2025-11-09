---
id: FT-12
title: Configuration Options
status: implemented
version: 1.1
last_updated: 2025-11-08
related_features: [FT-01, FT-02, FT-03, FT-04, FT-05, FT-06, FT-07, FT-08, FT-10]
---

# Configuration Options

## Per-Community Configuration
Each community can customize these settings to match their governance model and values.

## Trust System Configuration

### Trust Title Names and Thresholds
- Customizable trust level names (e.g., "New Member", "Known Member", "Trusted Member")
- Configure score thresholds for each title
- Default levels:
  - **New Member**: Score >= 0
  - **Known Member**: Score >= 10
  - **Trusted Member**: Score >= 25
  - **Advanced Member**: Score >= 50
  - **Community Expert**: Score >= 100
  - **Community Benefactor**: Score >= 200

### Trust Award Threshold
- `minTrustToAwardTrust` - Minimum trust score to award trust to others (default: 15)

## Wealth Access Configuration

### Publishing Access
- `minTrustForWealth` - Minimum trust score to publish/share wealth (default: 10)

### Categories
- Hierarchical resource categorization structure
- Community-specific categories and subcategories
- Example: Food > Vegetables > Carrots

### Trust-Capped Items
- Individual wealth items can set their own trust requirements
- Overrides community-wide settings for specific items

## Needs System Configuration

### Publishing Access
- `minTrustForNeeds` - Minimum trust score to publish needs (default: 5)
  - Lower than wealth threshold to encourage need expression
  - Helps community understand resource requirements early

## Pool Configuration

### Creation Permissions
- `minTrustForPoolCreation` - Minimum trust score to create pools (default: 20)
- Pool Manager role - Explicit role assignment for pool management

## Council Configuration

### Creation Permissions
- `minTrustForCouncilCreation` - Minimum trust score to create councils (default: 25)

### Management
- Council Manager assignment - Per-council role assignment for management

## Dispute Handling Configuration

### Dispute Resolution Access
- `minTrustForDisputes` - Minimum trust score to handle disputes (default: 20)
- Dispute Resolver role - Explicit role assignment for dispute resolution
- Designated councils - Specific council(s) with sufficient trust can handle disputes

## Polling Permissions

### Poll Creation Access
- `minTrustForPolls` - Minimum trust score to create polls (default: 15)
- Poll Creator role - Explicit role assignment for poll creation
- Inherited access - Pool Managers and Council Managers can create polls

## Forum Configuration

### Content Creation
- `minTrustForThreadCreation` - Minimum trust score to create threads (default: 10)
- `minTrustForReplies` - Minimum trust score to post replies (default: 0, all members)
- `minTrustForAttachments` - Minimum trust score to upload attachments (default: 15)

### Moderation
- `minTrustForFlagging` - Minimum trust score to flag content (default: 15)
- `minTrustForFlagReview` - Minimum trust score to review flagged content (default: 30)
- `minTrustForForumModeration` - Minimum trust score for full forum moderation (default: 30)
- Forum Manager role - Explicit role assignment for forum moderation
- Flag threshold - Number of flags to auto-hide content (default: 5)

### Features
- Voting settings - Enable/disable thread and post upvoting/downvoting
- Vote visibility - Configure who can see votes
- Notifications - Enable/disable @mentions and notifications

## Analytics Configuration

### Reporting Thresholds
- Non-contribution threshold - Days/months of inactivity (default: 30 days)
- Dashboard refresh interval - Metric update frequency (default: 3600 seconds)

### Visibility
- Metric visibility settings - Configure which metrics are visible to non-admins

## Summary Table

| Category | Setting | Default | Purpose |
|----------|---------|---------|---------|
| Trust | minTrustToAwardTrust | 15 | Award trust to others |
| Wealth | minTrustForWealth | 10 | Publish/share wealth |
| Needs | minTrustForNeeds | 5 | Publish needs |
| Polls | minTrustForPolls | 15 | Create polls |
| Disputes | minTrustForDisputes | 20 | Handle disputes |
| Pools | minTrustForPoolCreation | 20 | Create pools |
| Councils | minTrustForCouncilCreation | 25 | Create councils |
| Forum | minTrustForThreadCreation | 10 | Create threads |
| Forum | minTrustForAttachments | 15 | Upload attachments |
| Forum | minTrustForFlagging | 15 | Flag content |
| Forum | minTrustForFlagReview | 30 | Review flags |
| Forum | minTrustForForumModeration | 30 | Full moderation |
| Analytics | Non-contribution threshold | 30 days | Inactivity tracking |
| Analytics | Dashboard refresh | 3600 sec | Metric updates |

## Related Database Tables

### Implemented
- `communities` - All configuration stored in community record (trust thresholds, forum settings, etc.)

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-05: Pools](./05-pools.md)
- [FT-06: Councils](./06-councils.md)
- [FT-07: Voting & Polling](./07-voting-polling.md)
- [FT-08: Needs System](./08-needs-system.md)
- [FT-10: Forum System](./10-forum-system.md)
