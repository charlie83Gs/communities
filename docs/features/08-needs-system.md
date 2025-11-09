---
id: FT-08
title: Needs System
status: partial
version: 1.2
last_updated: 2025-11-09
related_features: [FT-01, FT-02, FT-03, FT-04, FT-06, FT-09, FT-12, FT-14]
---

# Needs System

## Purpose
Enable community members to express and aggregate resource requirements for planning purposes.

## Features

### Publishing Needs
- Members can publish their needs (e.g., "5 carrots per week")
- Needs are **quantitative** to support planning
- Both members and councils can publish needs
- Needs link to standardized items (same as wealth system)
- Access is trust-gated: admins configure the minimum trust score required

### Need Priority

1. **Need**: Essential requirements
   - Example: "2 loaves of bread daily"
   - Used for critical resource planning

2. **Want**: Desired but not critical
   - Example: "Gardening services monthly"
   - Used for nice-to-have resource coordination

### Need Types

1. **One-time**: Single-instance needs
   - Example: "1 coffee table"
   - Used for specific item requests
   - No recurrence

2. **Recurring**: Ongoing needs
   - **Daily**: "2 units of bread every day"
   - **Weekly**: "5 carrots per week"
   - **Monthly**: "1 gardening service session per month"
   - Used for regular resource planning
   - Automatically tracked and renewed

## Recurring Needs Details

### Configuration
- **Frequency**: Daily, Weekly, or Monthly
- **Units Needed**: Number of units required per cycle
- **Examples**:
  - "I need mobility assistance every day" (daily, service)
  - "I need 2 units of bread every day" (daily, object)
  - "I need rice every week" (weekly, object)
  - "I want gardening services every month" (monthly, service)

### Tracking
- System tracks last fulfilled date
- Next fulfillment date calculated automatically
- Members can see their recurring needs schedule
- Councils can plan based on recurring patterns

## Aggregation

### Community Totals
- Multiple members can add their own needs with the same item
- System displays both individual needs and total community needs
- Aggregation respects priority (needs vs wants)
- Aggregation respects frequency for recurring needs
- Members can update or remove their needs when circumstances change

### Example
- User A: 5 carrots per week (need)
- User C: 8 carrots per week (need)
- User D: 3 carrots per week (want)
- **Community total: 13 carrots per week (needed), 3 carrots per week (wanted)**

## Benefits

### Planning
- Helps coordinate resource production and sharing
- Councils and members can see total community demand
- Enables proactive resource allocation
- Recurring needs allow long-term planning

### Transparency
- Everyone can see what the community needs
- Individuals can see who shares similar needs
- Facilitates resource pooling and bulk coordination
- Distinguishes critical needs from wants

### Coordination
- Wealth sharers can see what's needed most
- Councils can prioritize resource acquisition
- Members with capacity can offer to fulfill specific needs
- Recurring patterns help identify regular contributors

## Related Database Tables

### Implemented
- `items` - Standardized resource/service names (shared with wealth system)
- `needs` - Member resource requirements
- `council_needs` - Resource requirements published by councils

## Activity Tracking

All needs-related actions are tracked in the Community Activity Feed:
- **Need Created** - When a member publishes a new need
- **Need Updated** - When a member modifies their need
- **Need Fulfilled** - When a need's status changes to fulfilled
- **Need Deleted** - When a member removes their need

These events appear in the community Activity Timeline for transparency and engagement. See [FT-14: Audit Log](./14-audit-log.md) for details.

## Analytics Integration

The needs system integrates with the Health Analytics dashboard (FT-09) to provide community-wide insights:

- **Aggregated Needs View**: See what the entire community needs most
- **Priority Breakdown**: Separate views for essential needs vs wants
- **Recurrence Patterns**: Track one-time vs recurring needs
- **Category Analysis**: Objects vs services breakdown
- **Participation Metrics**: How many members are expressing needs
- **Council Needs**: Separate tracking for council-level requirements
- **Time-Series Trends**: How community needs change over time

This helps coordinators and councils understand resource gaps and plan accordingly.

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-06: Councils](./06-councils.md)
- [FT-09: Analytics & Statistics](./09-analytics-statistics.md)
- [FT-12: Configuration](./12-configuration.md)
- [FT-14: Audit Log](./14-audit-log.md)

## Use Cases

### Community Food Planning
1. 10 members publish weekly vegetable needs
2. System aggregates: "Community needs 50 carrots (8 members), 30 tomatoes (6 members), 20 heads of lettuce (5 members) per week"
3. Garden Council uses this data to plan planting
4. Members with garden space coordinate to meet needs

### Daily Assistance Coordination
1. Member A publishes: "I need mobility assistance every day" (recurring daily)
2. Member B publishes: "I need childcare 3 days per week" (recurring weekly)
3. Community Helpers Council sees the recurring patterns
4. They schedule regular volunteers to fulfill these needs

### Tool Sharing Coordination
1. 5 members publish need for "lawn mower" (one-time, different dates)
2. System shows temporal needs distribution
3. Community purchases one shared lawn mower
4. Schedule created based on published needs

### Monthly Service Planning
1. 3 members publish: "I want gardening services every month" (recurring monthly)
2. Gardening Council sees aggregated monthly demand
3. They allocate resources to meet wants after needs are fulfilled
4. Members receive regular service on a rotating schedule
