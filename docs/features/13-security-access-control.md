---
id: FT-13
title: Security & Access Control
status: implemented
version: 2.0
last_updated: 2025-01-08
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

## Role-Based Permission Model

### Architecture: ROLES → PERMISSIONS

The system uses a **role-based permission model** where:
1. **ROLES** are assigned to users (two variants per role)
2. **PERMISSIONS** define what users can do (union of roles)

### Role Variants

Each feature has **two role variants**:

#### 1. Regular Roles (Admin-Assigned)
- Assigned by admins through UI
- Examples: `forum_manager`, `pool_creator`, `dispute_handler`
- Use case: "Make Alice a forum manager"
- Stored as: `user:alice → forum_manager → community:xyz`

#### 2. Trust Roles (Auto-Granted)
- Automatically granted when trust >= threshold
- Examples: `trust_forum_manager`, `trust_pool_creator`
- Use case: "Users with 30+ trust unlock forum manager role"
- Stored as: `user:bob → trust_forum_manager → community:xyz`

### Permission Evaluation

Permissions are **unions** of multiple sources:
```
can_manage_forum = admin OR forum_manager OR trust_forum_manager
```

Application code checks **ONLY** permissions, never roles directly.

## Complete Role & Permission Matrix

### Trust Feature
- **Viewer Role**: `trust_viewer` / `trust_trust_viewer` → `can_view_trust`
- **Action Role**: `trust_granter` / `trust_trust_granter` → `can_award_trust`

### Wealth Feature
- **Viewer Role**: `wealth_viewer` / `trust_wealth_viewer` → `can_view_wealth`
- **Action Role**: `wealth_creator` / `trust_wealth_creator` → `can_create_wealth`

### Polls Feature
- **Viewer Role**: `poll_viewer` / `trust_poll_viewer` → `can_view_poll`
- **Action Role**: `poll_creator` / `trust_poll_creator` → `can_create_poll`

### Disputes Feature
- **Viewer Role**: `dispute_viewer` / `trust_dispute_viewer` → `can_view_dispute`
- **Action Role**: `dispute_handler` / `trust_dispute_handler` → `can_handle_dispute`

### Pools Feature
- **Viewer Role**: `pool_viewer` / `trust_pool_viewer` → `can_view_pool`
- **Action Role**: `pool_creator` / `trust_pool_creator` → `can_create_pool`

### Councils Feature
- **Viewer Role**: `council_viewer` / `trust_council_viewer` → `can_view_council`
- **Action Role**: `council_creator` / `trust_council_creator` → `can_create_council`

### Forum Feature
- **Viewer Role**: `forum_viewer` / `trust_forum_viewer` → `can_view_forum`
- **Manager Role**: `forum_manager` / `trust_forum_manager` → `can_manage_forum`
- **Thread Role**: `thread_creator` / `trust_thread_creator` → `can_create_thread`
- **Attachment Role**: `attachment_uploader` / `trust_attachment_uploader` → `can_upload_attachment`
- **Flagging Role**: `content_flagger` / `trust_content_flagger` → `can_flag_content`
- **Review Role**: `flag_reviewer` / `trust_flag_reviewer` → `can_review_flag`

### Items Feature
- **Viewer Role**: `item_viewer` / `trust_item_viewer` → `can_view_item`
- **Manager Role**: `item_manager` / `trust_item_manager` → `can_manage_item`

### Analytics Feature
- **Viewer Role**: `analytics_viewer` / `trust_analytics_viewer` → `can_view_analytics`

### Value Recognition Feature
- **Viewer Role**: `contribution_viewer` / `trust_contribution_viewer` → `can_view_contributions`
- **Logger Role**: `contribution_logger` / `trust_contribution_logger` → `can_log_contributions`
- **Granter Role**: `recognition_granter` / `trust_recognition_granter` → `can_grant_peer_recognition`
- **Verifier Role**: `contribution_verifier` / `trust_contribution_verifier` → `can_verify_contributions`
- **Manager Role**: `recognition_manager` → `can_manage_recognition` (admin only)

**Note:** Value recognition does NOT gate access to community features (wealth, councils, etc.). These permissions control participation in the recognition system itself.

## Example Permission Flows

### Example 1: Admin Assigns Role via UI

1. Admin clicks "Make Alice a forum manager"
2. System writes: `user:alice → forum_manager → community:xyz`
3. Alice now has `can_manage_forum` permission

### Example 2: User Earns Role via Trust

1. Bob's trust increases from 29 → 30
2. TrustSyncService checks: `minTrustForForumModeration = 30`? ✓
3. System writes: `user:bob → trust_forum_manager → community:xyz`
4. Bob now has `can_manage_forum` permission

### Example 3: Community Changes Trust Threshold

1. Admin changes `minTrustForForumModeration` from 30 → 35
2. TrustSyncService recalculates ALL users' trust roles
3. Users with trust 30-34 lose `trust_forum_manager`
4. Users with trust >= 35 keep `trust_forum_manager`

### Example 4: Gated Content Access

1. Community sets forum as private (only viewers can read)
2. Admin grants: `user:charlie → forum_viewer → community:xyz`
3. Charlie can now read forum (has `can_view_forum`)
4. Charlie cannot moderate (lacks `can_manage_forum`)

## Permission Levels Summary

### 1. Admin Level
- Relation: `community#admin`
- Access: Has ALL permissions automatically

### 2. Regular Role Level
- Admin-assigned roles: `forum_manager`, `pool_creator`, etc.
- Access: Specific feature permissions
- Management: Via admin UI

### 3. Trust Role Level
- Auto-granted roles: `trust_forum_manager`, `trust_pool_creator`, etc.
- Access: Automatic when trust >= threshold
- Management: Via TrustSyncService

### 4. Permission Level
- Final permissions: `can_manage_forum`, `can_create_poll`, etc.
- Access: Union of admin + regular_role + trust_role
- Application code checks: Only permissions, never roles

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
- Role assignments (regular and trust roles)
- Permission rules and policies
- All authorization relations

### PostgreSQL (Application Database)
- Trust scores (calculated from `trust_awards` table)
- Configuration (trust thresholds in `communities` table)
- Audit logs (trust history, moderation logs, etc.)

### Sync Mechanism
- Application syncs trust scores to OpenFGA trust role relations
- Triggered on trust award/removal
- Triggered on trust threshold configuration changes
- Ensures OpenFGA permissions reflect current trust state

## Security Best Practices

### 1. Never Check Permissions in Application Code
- Always delegate to OpenFGA
- Use OpenFGA API for all permission checks

### 2. Trust Role Synchronization
- Keep OpenFGA trust role relations in sync with database trust scores
- Update immediately on trust changes
- Recalculate all users when trust thresholds change

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

## Key Differences from Previous Model

### Old Model (v1.0)
- Used 101 `trust_level_X` relations (0-100)
- Required checking multiple trust levels for thresholds
- Trust scores capped at 100
- Permission checks could require up to 100 relation checks

### New Model (v2.0)
- Uses role-based relations (e.g., `forum_manager`, `trust_forum_manager`)
- Single permission check per action
- No trust score cap (unlimited trust possible)
- Cleaner separation: roles vs permissions
- UI-friendly: roles can be displayed as badges

## Related Database Tables

### Implemented
- `trust_awards` - Peer-to-peer trust (auditable)
- `admin_trust_grants` - Admin-granted trust (auditable)
- `trust_history` - Audit log of trust changes
- `trust_views` - Current trust scores per user
- `community_members` - User memberships
- `communities` - Trust threshold configuration
- OpenFGA - All role assignments (regular and trust roles)

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
