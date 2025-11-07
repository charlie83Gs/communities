---
id: FT-09
title: Statistics & Analytics
status: planned
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02, FT-03, FT-04, FT-06]
---

# Statistics & Analytics

## User Statistics

### Fulfillment Tracking
Display how many times each user has fulfilled wealth share requests:
- Fulfillment rate percentage
- Total fulfilled vs. total accepted requests
- Recent fulfillment history

### Contribution Metrics
Track member activity and contributions:
- Number of wealth shares published
- Number of needs published
- Participation in councils and initiatives
- Trust awards given/received

## Admin Analytics

### Non-Contributing Member Identification
Tools to identify inactive or low-contribution members:
- Members who haven't shared wealth in X days/months
- Members with zero fulfillments
- Members with low participation scores
- Trust score vs. contribution analysis

### Filters and Reports
- Sort by last contribution date
- Filter by contribution type
- Export member activity reports

## Community Dashboard

### Community Health Metrics
Visualize overall community vitality:

- **Active Members**: Number of members active this week/month
- **Wealth Generation**: Total wealth items shared per month
- **Wealth Shared**: Volume of wealth transactions per month
- **Trust Network**: Total trust awards and average member trust score
- **Council Activity**: Number of active councils and initiatives
- **Council Trust**: Average council trust scores and trust distribution
- **Needs Fulfillment**: Percentage of published needs being met
- **Dispute Rate**: Number of disputes vs. total transactions
- **Trust-Capped Items**: Number of high-trust items and usage statistics

### Trends and Graphs
- Monthly wealth sharing trends
- Member growth over time
- Member trust score distribution
- Council trust score distribution
- Category-based wealth distribution
- Council participation rates
- Trust-capped wealth usage patterns

## Configuration

### Analytics Settings
- **Non-contribution Threshold**: Days/months of inactivity (default: 30 days)
- **Dashboard Refresh Interval**: Metric update frequency (default: 3600 seconds)
- **Metric Visibility Settings**: Configure which metrics are visible to non-admins

## Related Database Tables

### Planned
- `member_statistics` - Aggregated statistics for member contributions and activity
- `community_metrics` - Dashboard metrics for community health tracking
- `wealth_fulfillments` - Tracking of fulfilled wealth requests (for fulfillment metrics)

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-06: Councils](./06-councils.md)

## Use Cases

### Community Health Monitoring
1. Admin reviews community dashboard
2. Dashboard shows:
   - Active members: 45 (up 5 from last month)
   - Wealth shared this month: 120 items (down 10 from last month)
   - Average trust score: 22 (stable)
   - Dispute rate: 2% (healthy)
3. Admin notices User E has 0% fulfillment rate (5 accepted, 0 fulfilled)
4. Admin uses non-contributing member report
5. Admin identifies User E hasn't fulfilled any requests in 3 months
6. Admin reaches out to User E to understand situation
7. Admin may adjust User E's trust or provide support
