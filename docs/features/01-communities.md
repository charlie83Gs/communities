---
id: FT-01
title: Communities
status: implemented
version: 1.0
last_updated: 2025-01-06
related_features: [FT-02, FT-03, FT-11, FT-12, FT-13]
---

# Communities

## Overview
The foundational entity of the application. Each community operates independently with its own configuration, members, and resources.

## Key Points
- Communities are the base organizational unit
- Each community has its own:
  - Configuration and settings
  - Member roster
  - Resource pool
  - Trust system
  - Permissions structure

## Related Database Tables

### Implemented
- `communities` - Community definitions with all configuration (trust thresholds, forum settings, etc.)
- `community_members` - User memberships (roles stored in OpenFGA, not in this table)
- `resource_memberships` - Resource membership tracking

## Related Features
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-11: Invite System](./11-invite-system.md)
- [FT-12: Configuration Options](./12-configuration.md)
- [FT-13: Security & Access Control](./13-security-access-control.md)
