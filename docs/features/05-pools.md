---
id: FT-05
title: Pools
status: planned
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02, FT-04, FT-06, FT-07]
---

# Pools

## Purpose
Resource aggregation mechanism for collective initiatives and planning.

## Pool Creation
Pools can be created by:
1. Users with sufficient trust permissions (reaching `minTrustForPoolCreation` threshold)
2. Users with specific Pool Manager role
3. Users acting on behalf of a council

## Pool Shares
- Users can share wealth directly to a pool when publishing
- Pool shares are **automatically fulfilled** and **cannot be cancelled**
- Instant transfer mechanism for committed resources
- No approval process - resources immediately join the pool

## Visibility
- Pools are filterable by council association
- Pool resources and contributions are transparent
- All members can see what resources are in each pool
- Pool history shows all contributions

## Use Cases

### Garden Project Pool Example
1. Council creates "Garden Project Pool" for a community garden initiative
2. Multiple members share resources directly to the pool:
   - User A: 5 seed packets
   - User B: 3 tools
   - User C: fertilizer
3. All shares are instantly fulfilled and cannot be cancelled
4. Pool displays total contributed resources
5. Council uses pool resources for the garden project

## Related Database Tables

### Planned
- `pools` - Resource aggregation containers
- `pool_resources` - Resources contributed to pools

## Configuration
- `minTrustForPoolCreation` - Minimum trust score to create pools (default: 20)
- Pool Manager role - Explicit role assignment for pool management

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-06: Councils](./06-councils.md)
- [FT-07: Voting & Polling](./07-voting-polling.md)
