---
id: FT-04
title: Community Wealth & Resource Sharing
status: partial
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02, FT-03, FT-05, FT-06]
---

# Community Wealth & Resource Sharing

## Overview
The wealth system enables members to share products, services, and resources with the community, councils, or pools without monetary transactions.

## Wealth Sharing

### Sharing Targets
1. **Public (Community)**: Available to all members based on trust requirements
2. **Council**: Direct transfer to a specific council
3. **Pool**: Instant transfer to a pool (automatically fulfilled, cannot be cancelled)

## Wealth Publications
- Access is trust-gated: admins configure the minimum trust score required
- Wealth publications support comments
- Members with sufficient trust can publish wealth items

## Trust-Capped Wealth
- **Purpose**: Allow members to restrict valuable or sensitive resources to highly trusted members only
- **Minimum Trust Requirement**: Members can set a minimum trust score required to request their wealth item
  - Example: "Power tools available only to members with trust score >= 30"
  - Example: "Car sharing available only to members with trust score >= 50"
- **Visibility**: All members can see trust-capped items, but only those meeting the requirement can request them
- **Owner Control**: Overrides community-wide wealth access configuration for specific items

## Resource Discovery

### Categories & Subcategories
Wealth items are organized hierarchically for easy browsing:
- Example: Food > Vegetables > Carrots
- Example: Tools > Gardening > Shovels

### Expiration Dates
- Members can set time limits on their shares
- Example: "Fresh tomatoes available until Friday"
- Expired shares are automatically removed or hidden

### Filtering
Users can filter available resources by:
- Category/Subcategory
- Expiration date (available now, available this week, etc.)
- Location (if configured)
- Sharing type (public, council, pool)
- Trust requirement (items I can access, all items, items requiring 20+, etc.)
- Availability status (available, pending, fulfilled)

## Wealth Requests
- Members and councils can request publicly shared wealth items
- The owner (creator of the wealth item) decides whether to accept or reject requests
- Pool shares bypass the request system (instant fulfillment)

## Disputes

### Purpose
Address situations where an accepted wealth request is not fulfilled.

### Creating a Dispute
Available when delivery of accepted wealth is not completed.

### Dispute Handling Configuration (per community)
- Minimum trust requirement to handle disputes
- Specific role assignment for dispute resolution
- Specific council(s) designated to handle disputes

### Resolution Process
1. System records the dispute details
2. Assigned handler(s) review the dispute
3. Handler reaches out to involved parties outside the system to understand the situation
4. System records the resolution outcome for transparency

**Simplicity**: The system only tracks disputes and outcomes; actual mediation happens externally.

## Related Database Tables

### Implemented
- `items` - Standardized resource/service names
- `wealth` - Shared resources and services (includes status, duration, distribution types)
- `wealth_requests` - Requests for publicly shared wealth items
- `wealth_comments` - Comments on wealth

### Planned
- `wealth_categories` - Hierarchical resource categorization
- `wealth_fulfillments` - Tracking of fulfilled wealth requests
- `disputes` - Records of unfulfilled wealth request disputes
- `dispute_resolutions` - Outcomes and notes for resolved disputes

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-05: Pools](./05-pools.md)
- [FT-06: Councils](./06-councils.md)
