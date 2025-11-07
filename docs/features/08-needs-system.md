---
id: FT-08
title: Needs System
status: planned
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-04, FT-06]
---

# Needs System

## Purpose
Enable community members to express and aggregate resource requirements for planning purposes.

## Features

### Publishing Needs
- Members can publish their needs (e.g., "5 carrots per week")
- Needs are **quantitative** to support planning
- Both members and councils can publish needs

### Need Types

1. **Recurring**: Ongoing needs
   - Example: "5 carrots per week"
   - Used for regular resource planning

2. **One-time**: Single-instance needs
   - Example: "1 coffee table"
   - Used for specific item requests

## Aggregation

### Community Totals
- Multiple members can add their own needs with the same name/type
- System displays both individual needs and total community needs
- Members can remove their needs when no longer required

### Example
- User A: 5 carrots per week
- User C: 8 carrots per week
- **Community total: 13 carrots per week**

## Benefits

### Planning
- Helps coordinate resource production and sharing
- Councils and members can see total community demand
- Enables proactive resource allocation

### Transparency
- Everyone can see what the community needs
- Individuals can see who shares similar needs
- Facilitates resource pooling and bulk coordination

## Related Database Tables

### Planned
- `needs` - Member resource requirements
- `council_needs` - Resource requirements published by councils

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-06: Councils](./06-councils.md)

## Use Cases

### Community Food Planning
1. 10 members publish weekly vegetable needs
2. System aggregates: "Community needs 50 carrots, 30 tomatoes, 20 heads of lettuce per week"
3. Garden Council uses this data to plan planting
4. Members with garden space coordinate to meet needs

### Tool Sharing Coordination
1. 5 members publish need for "lawn mower" (one-time, different dates)
2. System shows temporal needs distribution
3. Community purchases one shared lawn mower
4. Schedule created based on published needs
