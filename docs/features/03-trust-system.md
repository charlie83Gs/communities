---
id: FT-03
title: Trust System
status: implemented
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02, FT-04, FT-06, FT-13]
---

# Trust System

## Overview
The trust system is the foundation of community-based access control, allowing members to earn permissions through peer validation rather than just administrative assignment.

## Trust Scores & Titles
- Each member has a **trust score** representing how many community members trust them
- Trust titles are configurable at the community management level
- **Default trust levels:**
  - **New**: Score < 10
  - **Stable**: Score >= 10
  - **Trusted**: Score >= 50

## Awarding Trust
- Members can award trust to other members once they reach a configurable threshold (default: 15)
- A member's score reflects the number of community members who trust them
  - Example: Score of 17 = trusted by 17 community members

## Removing Trust
- **Members can remove their trust at any point** if they no longer trust a user
- Trust removal immediately decreases the recipient's trust score
- All trust changes (awards and removals) are tracked for transparency

## Admin-Granted Trust
- Admins can manually add trust to users to bootstrap the community
- All admin-granted trust is stored and auditable
- Any admin can review and modify trust granted by other admins
  - Example: If Admin A grants 10 trust, Admin B can review and update this value

## Trust System Integrity
- **All trust awards are stored** in `trust_awards` table and auditable
- **Admin-granted trust is tracked separately** in `admin_trust_grants` table
- **Trust history is maintained** in `trust_history` table for transparency
- **Trust levels in OpenFGA are updated in real-time** when trust changes
- **Prevents trust manipulation** through complete audit trail and transparency

## Related Database Tables

### Implemented
- `trust_awards` - Peer-to-peer trust (simple award model, removals tracked via deletedAt)
- `admin_trust_grants` - Admin-granted trust (auditable)
- `trust_history` - Audit log of trust changes
- `trust_levels` - Trust level relations for OpenFGA
- `trust_view` - View for trust aggregation
- `trust_events` - Trust event tracking

### Deprecated
- `trust_postures` - Old trust system (replaced by current model)

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-06: Councils](./06-councils.md)
- [FT-13: Security & Access Control](./13-security-access-control.md)
