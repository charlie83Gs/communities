---
id: FT-04
title: Community Wealth & Resource Sharing
status: partial
version: 1.3
last_updated: 2025-01-12
related_features: [FT-01, FT-02, FT-03, FT-05, FT-06]
---

# Community Wealth & Resource Sharing

## Overview
The wealth system enables members to share products, services, and resources with the community, councils, or pools without monetary transactions. All wealth sharing is unit-based, with support for recurrent replenishment of services.

## Wealth Sharing

### Sharing Targets
1. **Public (Community)**: Available to all members based on trust requirements
2. **Council**: Direct transfer to a specific council
3. **Pool**: Instant transfer to a pool (automatically fulfilled, cannot be cancelled)

## Wealth Publications
- Access is trust-gated: admins configure the minimum trust score required
- Wealth publications support comments
- Members with sufficient trust can publish wealth items

## Wealth Types
All wealth items are unit-based and categorized as either:
1. **Objects**: Physical items (e.g., tools, food, materials)
   - Units are typically single items or quantities
   - No recurrent replenishment
2. **Services**: Skills, time, or service offerings (e.g., tutoring, repairs, consultations)
   - Units are typically hours or sessions
   - Support for recurrent replenishment (weekly or monthly)

## Recurrent Wealth (Services)
- **Purpose**: Allow members to offer ongoing services that replenish automatically
- **Configuration**:
  - **Frequency**: Weekly or Monthly
  - **Replenish Value**: Number of units to add on each cycle
  - **Example**: "10 hours of electrical engineering services, replenishing 10 hours every month"
- **Automation**: A daily job runs to replenish units for any wealth items due for replenishment
- **Use Cases**:
  - Professional services (consulting, tutoring, design)
  - Regular maintenance services
  - Recurring time commitments

## Trust-Capped Wealth
- **Purpose**: Allow members to restrict valuable or sensitive resources to highly trusted members only
- **Minimum Trust Requirement**: Members can set a minimum trust score required to request their wealth item
  - Example: "Power tools available only to members with trust score >= 30"
  - Example: "Car sharing available only to members with trust score >= 50"
- **Visibility**: All members can see trust-capped items, but only those meeting the requirement can request them
- **Owner Control**: Overrides community-wide wealth access configuration for specific items

## Resource Discovery

### Default Item Catalog
Communities are initialized with 400+ default items across 22 categories to provide a comprehensive starting point for wealth sharing. These items are **starter templates** that communities can freely edit or delete to match their specific needs - they are not restricted in any way:

#### Objects (329 items)
- **Fresh Produce (85+ items)**: Both general categories (Vegetables, Fruits) and specific items (Tomatoes, Potatoes, Carrots, Spinach, Apples, Oranges, etc.)
- **Packaged Food (100+ items)**: Grains, pasta, legumes, canned goods, spices, baking items, snacks, oils, condiments
- **Beverages (60+ items)**: Coffee, tea, juices, soft drinks, milk alternatives, water
- **Clothing (25+ items)**: Adult/children clothing, shoes, accessories
- **Tools (15+ items)**: Hand tools, power tools, garden tools
- **Furniture (12+ items)**: Chairs, tables, beds, sofas, storage
- **Electronics (20+ items)**: Computers, phones, appliances, small appliances
- **Household Items (15+ items)**: Bedding, kitchenware, cleaning supplies, storage
- **Baby & Children (9 items)**: Baby clothing, gear, care products, toys
- **Personal Care (14+ items)**: Toiletries, hygiene products, first aid
- **Books & Media (5 items)**: Books, textbooks, educational materials, games
- **Sports & Recreation (11+ items)**: Bicycles, sports equipment, camping gear, musical instruments

#### Services (71 items)
- **Home Repair & Maintenance (12 services)**: Plumbing, electrical, carpentry, painting, gardening, etc.
- **Care Services (5 services)**: Childcare, eldercare, pet care, special needs care
- **Educational (7 services)**: Tutoring, language instruction, music lessons, test prep, workshops
- **Transportation (4 services)**: Rides, moving help, delivery, airport transportation
- **Professional Services (9 services)**: Tech support, web development, legal advice, accounting, consulting
- **Creative Services (10 services)**: Graphic design, photography, video production, writing, translation
- **Food Services (5 services)**: Cooking, catering, baking, personal chef
- **Health & Wellness (8 services)**: Massage, fitness training, yoga, nutrition counseling, life coaching
- **Cleaning & Organizing (7 services)**: House cleaning, organization, laundry, window/carpet cleaning
- **Event Services (4 services)**: Event planning, DJ services, MC/host, setup/breakdown

### Item Naming Convention
- **No unit references in item names**: Units (kg, hour, liter, etc.) are specified by users when creating wealth items
- **Both specific and general items**: Users can choose "Vegetables" for unspecified produce OR specific items like "Tomatoes"
- **Multilingual support**: All items include translations for English, Spanish, and Hindi
- **Flexible categorization**: Items can be found by browsing categories or searching by name

### Custom Items
Communities can create custom items beyond the default catalog to meet specific needs. The `isDefault` flag in the database is purely for tracking which items were auto-created during community initialization - it does not restrict editing or deletion in any way

### Expiration Dates
- Members can set time limits on their shares
- Example: "Fresh tomatoes available until Friday"
- Expired shares are automatically removed or hidden

### Filtering
Users can filter available resources by:
- **Type**: Filter by object or service
- Category/Subcategory
- Expiration date (available now, available this week, etc.)
- Location (if configured)
- Sharing type (public, council, pool)
- Trust requirement (items I can access, all items, items requiring 20+, etc.)
- Availability status (available, pending, fulfilled)
- Recurrent status (recurrent services only)

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
- `items` - Standardized resource/service names (includes `kind` enum: 'object' | 'service')
- `wealth` - Shared resources and services (unit-based only, includes recurrent fields)
  - `distributionType` - Removed 'request_based', all items are 'unit_based'
  - `unitsAvailable` - Required for all wealth items (default: 1)
  - `maxUnitsPerUser` - Optional limit per requester
  - `isRecurrent` - Boolean flag for recurrent services
  - `recurrentFrequency` - Enum: 'weekly' | 'monthly' (only if isRecurrent)
  - `recurrentReplenishValue` - Number of units to add on replenishment
  - `lastReplenishedAt` - Timestamp of last replenishment
  - `nextReplenishmentDate` - Calculated next replenishment date
- `wealth_requests` - Requests for publicly shared wealth items
  - `unitsRequested` - Required for all requests (default: 1)
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
