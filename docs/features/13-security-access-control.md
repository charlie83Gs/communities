---
id: FT-13
title: Security & Access Control
status: implemented
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-02, FT-03]
---

# Security & Access Control

## Permission Model Architecture

### OpenFGA (Relationship-Based Access Control)
The system uses **OpenFGA** for all authorization decisions. **NO authorization logic exists in application code.**

### Key Principle
All permission checks are performed by OpenFGA, ensuring:
- Consistent authorization across the application
- Auditable permission changes
- Separation of authorization logic from business logic
- Centralized permission management

## Permission Evaluation Methods

### 1. Admin Bypass
- Admins have `community#admin` relation
- Bypass all trust requirements
- Full access to all community features

### 2. Role-Based Access
- Users are assigned explicit relations
- Examples: `community#poll_creator`, `council#member`, `community#forum_manager`
- Stored directly in OpenFGA

### 3. Trust-Based Access
- Users are assigned to `trust_level_X` relations matching their trust score
- Automatic access when threshold is met
- No manual grant needed

### 4. Hybrid Evaluation
- OpenFGA checks for role OR trust threshold in a single permission check
- Provides flexibility in access control
- Example: Poll creation via role OR trust >= 15

## How Trust Thresholds Work

### Trust Score Calculation
Based on number of community members who trust the user.

### Trust Level Assignment
User is assigned to `community#trust_level_X` relation (where X = their trust score).

### Permission Check
OpenFGA verifies if user has required `trust_level_Y` or higher (Y = configured threshold).

### Real-Time Updates
Trust level relations are updated immediately when trust is awarded/removed.

## Example Permission Flow

### Scenario: Creating a Poll

1. User has trust score of 17
2. User is assigned to `community#trust_level_17` relation in OpenFGA
3. To create a poll (default threshold: 15), OpenFGA checks:
   - Does user have `community#poll_creator` role? OR
   - Does user have `community#trust_level_15` or higher? (Yes - they have trust_level_17)
4. Permission granted

## Permission Levels Summary

### 1. Admin Level
- Relation: `community#admin`
- Access: Full community management, bypasses all trust checks

### 2. Role-Based Level
- Explicit relations: `community#forum_manager`, `pool#manager`, `council#member`
- Access: Specific feature permissions

### 3. Trust-Based Level
- Relations: `community#trust_level_X`
- Access: Automatic access when threshold is met

### 4. Hybrid Level
- Both methods evaluated simultaneously (role OR trust)
- Most flexible approach

## Trust System Integrity

### Audit Trail
- **All trust awards are stored** in `trust_awards` table and auditable
- **Admin-granted trust is tracked separately** in `admin_trust_grants` table
- **Trust history is maintained** in `trust_history` table for transparency

### Real-Time Sync
- **Trust levels in OpenFGA are updated in real-time** when trust changes
- Ensures permission checks always use current trust score

### Manipulation Prevention
- **Complete audit trail** prevents trust manipulation
- **Transparency** - all trust changes are visible
- **Immutable history** - trust changes cannot be deleted

## Authorization Storage

### OpenFGA (External Authorization Service)
- Roles and relations
- Trust level assignments
- Permission rules and policies

### PostgreSQL (Application Database)
- Trust scores (calculated from `trust_awards` table)
- Configuration (trust thresholds in `communities` table)
- Audit logs (trust history, moderation logs, etc.)

### Sync Mechanism
- Application syncs trust scores to OpenFGA trust_level relations
- Triggered on trust award/removal
- Ensures OpenFGA permissions reflect current trust state

## Security Best Practices

### 1. Never Check Permissions in Application Code
- Always delegate to OpenFGA
- Use OpenFGA API for all permission checks

### 2. Trust Score Synchronization
- Keep OpenFGA trust_level relations in sync with database
- Update immediately on trust changes

### 3. Audit Everything
- Log all permission changes
- Track all trust awards and removals
- Record all role assignments

### 4. Principle of Least Privilege
- Grant minimum necessary permissions
- Use trust thresholds to gradually increase access
- Regular review of role assignments

### 5. Transparency
- Make permission rules visible to community members
- Provide clear documentation of trust thresholds
- Show audit logs to admins

## Related Database Tables

### Implemented
- `trust_awards` - Peer-to-peer trust (auditable)
- `admin_trust_grants` - Admin-granted trust (auditable)
- `trust_history` - Audit log of trust changes
- `trust_levels` - Trust level relations for OpenFGA
- `community_members` - User memberships (roles in OpenFGA)
- `council_managers` - Council management assignments
- OpenFGA - All role assignments and trust-based relations

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
