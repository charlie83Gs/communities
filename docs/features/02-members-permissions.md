---
id: FT-02
title: Members & Permissions
status: implemented
version: 2.0
last_updated: 2025-11-19
related_features: [FT-01, FT-03, FT-04, FT-05, FT-06, FT-07, FT-10, FT-13]
---

# Members & Permissions

## Permission System Overview
This system uses a **role-based permission model** with **dual access paths**: members can gain roles either through **admin assignment** OR by **earning trust**. Roles grant permissions to perform actions.

**Role → Permission Architecture:**
- **Roles** define HOW you got access (admin-assigned or trust-earned)
- **Permissions** define WHAT you can do (check permissions, not roles)

**Two Paths to Roles:**
1. **Regular Roles**: Admin explicitly assigns role to a member (e.g., `forum_manager`)
2. **Trust Roles**: Member automatically earns role by reaching trust threshold (e.g., `trust_forum_manager`)

**Example**: To manage the forum, a member can either:
- Be explicitly granted the "Forum Manager" role by an admin, OR
- Earn the "Trust Forum Manager" role by reaching the trust threshold (default: 30)

Both paths grant the same permission: `can_manage_forum`

## Role Categories

### Viewer Roles
Viewer roles provide **read-only access** to features. Useful for:
- Gating access to sensitive content
- Allowing observation before participation
- Transparency controls (public vs. member-only content)

**All features have viewer variants:**
- Trust Viewer, Poll Viewer, Dispute Viewer, Pool Viewer, Council Viewer
- Forum Viewer, Item Viewer, Analytics Viewer

### Action Roles
Action roles allow **performing operations** within features:
- Trust Granter, Wealth Creator, Poll Creator, Dispute Handler
- Pool Creator, Council Creator, Thread Creator, Content Flagger

### Manager Roles
Manager roles provide **full control** over specific features:
- Forum Manager, Item Manager

## Member Roles

### Admin
- **Purpose**: Full community management and oversight
- **Access**: Role-based only (no trust threshold alternative)
- **Assignment**: Explicitly granted by community creator or existing admins
- **Capabilities**:
  - Create and configure community settings
  - Manage all roles and permissions
  - Invite and remove members
  - Grant and review admin-granted trust
  - Configure trust thresholds and titles
  - Create and manage wealth categories
  - Configure dispute handling settings
  - Access all analytics and reports
  - Override any community action when necessary
  - Manage community-wide configuration

### Forum Manager
- **Purpose**: Moderate and organize community forum discussions
- **Access Methods**:
  - **Role**: Explicitly granted "Forum Manager" role by admin
  - **Trust Threshold**: Reach configured `minTrustForForumModeration` (default: 30)
- **Capabilities**:
  - Create, edit, and delete forum categories
  - Pin/unpin threads (featured threads appear at top)
  - Lock/unlock threads (prevent new posts)
  - Move threads between categories
  - Edit or delete any post/thread (with moderation log)
  - View moderation reports and take action on flagged content
  - Assign temporary post restrictions to members
  - Access moderation analytics and reports
  - Review and resolve flagged content in the moderation queue

### Pool Manager
- **Purpose**: Create and manage resource aggregation pools
- **Access Methods**:
  - **Role**: Explicitly granted "Pool Manager" role by admin
  - **Trust Threshold**: Reach configured `minTrustForPoolCreation` (default: 20)
- **Capabilities**:
  - Create new pools for community initiatives
  - Configure pool visibility and association (council-linked or independent)
  - View all pool resources and contributions
  - Generate reports on pool usage
  - Close or archive completed pools

### Council Manager
- **Purpose**: Manage council operations and resources
- **Access**: Role-based only, assigned per specific council
- **Assignment**: Granted per council (member can manage specific councils)
- **Scope**: Council-specific (separate from community admin)
- **Capabilities**:
  - Manage council membership and representatives
  - Share wealth on behalf of council
  - Create council initiatives
  - Publish council needs
  - Write usage reports with evidence uploads
  - Manage council inventory
  - View council transaction history
- **Note**: Creating new councils requires admin or trust threshold (default: 25)

### Dispute Resolver
- **Purpose**: Handle disputes between community members regarding unfulfilled wealth requests
- **Access Methods**:
  - **Role**: Explicitly granted "Dispute Resolver" role by admin
  - **Trust Threshold**: Reach configured `minTrustForDisputes` (default: 20)
  - **Council Assignment**: Designated council with sufficient trust can handle disputes
- **Capabilities**:
  - View dispute queue
  - Review dispute details and history
  - Contact involved parties to gather information
  - Record dispute resolutions and outcomes
  - Access dispute analytics
- **Responsibility**: Mediate conflicts and maintain transparent records

### Poll Creator
- **Purpose**: Create community polls and surveys
- **Access Methods**:
  - **Role**: Explicitly granted "Poll Creator" role by admin
  - **Trust Threshold**: Reach configured `minTrustForPolls` (default: 15)
  - **Inherited**: Pool Managers automatically have poll creation access
  - **Inherited**: Council Managers can create polls on behalf of councils
- **Capabilities**:
  - Create new polls with multiple options
  - Configure poll duration and visibility
  - View poll results and analytics
  - Close polls early if needed

### Wealth Publisher
- **Purpose**: Share resources with the community
- **Access Methods**:
  - **Trust Threshold**: Reach configured `minTrustForWealth` (default: 10)
  - **Note**: No explicit role; purely trust-based access
- **Capabilities**:
  - Publish wealth items to community (public sharing)
  - Share directly to councils
  - Share directly to pools
  - Set trust requirements for their wealth items
  - Set expiration dates on shares
  - Accept/reject wealth requests
  - Mark wealth requests as fulfilled

## Complete Role & Permission Matrix

Communities can configure trust thresholds to automatically grant roles. Each role grants specific permissions.

### Trust Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `trust_viewer` | `trust_trust_viewer` | `can_view_trust` | TBD |
| `trust_granter` | `trust_trust_granter` | `can_award_trust` | 15 |

### Wealth Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `wealth_viewer` | `trust_wealth_viewer` | `can_view_wealth` | 10 |
| `wealth_creator` | `trust_wealth_creator` | `can_create_wealth` | 10 |

### Polls Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `poll_viewer` | `trust_poll_viewer` | `can_view_poll` | TBD |
| `poll_creator` | `trust_poll_creator` | `can_create_poll` | 15 |

### Disputes Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `dispute_viewer` | `trust_dispute_viewer` | `can_view_dispute` | TBD |
| `dispute_handler` | `trust_dispute_handler` | `can_handle_dispute` | 20 |

### Pools Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `pool_viewer` | `trust_pool_viewer` | `can_view_pool` | TBD |
| `pool_creator` | `trust_pool_creator` | `can_create_pool` | 20 |

### Councils Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `council_viewer` | `trust_council_viewer` | `can_view_council` | TBD |
| `council_creator` | `trust_council_creator` | `can_create_council` | 25 |

### Forum Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `forum_viewer` | `trust_forum_viewer` | `can_view_forum` | TBD |
| `forum_manager` | `trust_forum_manager` | `can_manage_forum` | 30 |
| `thread_creator` | `trust_thread_creator` | `can_create_thread` | 10 |
| `attachment_uploader` | `trust_attachment_uploader` | `can_upload_attachment` | 15 |
| `content_flagger` | `trust_content_flagger` | `can_flag_content` | 15 |
| `flag_reviewer` | `trust_flag_reviewer` | `can_review_flag` | 30 |

### Items Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `item_viewer` | `trust_item_viewer` | `can_view_item` | TBD |
| `item_manager` | `trust_item_manager` | `can_manage_item` | 20 |

### Analytics Feature
| Role (Regular) | Role (Trust) | Permission | Default Threshold |
|----------------|--------------|------------|-------------------|
| `analytics_viewer` | `trust_analytics_viewer` | `can_view_analytics` | 20 |

**Note**: Viewer role thresholds (marked TBD) are not yet configured as they're new in v2.0. Communities can set these based on their privacy needs.

## Role Assignment Methods

### Regular Role Assignment
- **How**: Admin explicitly grants role via Member Edit UI
- **Storage**: Stored as OpenFGA relation (e.g., `user:alice → forum_manager → community:xyz`)
- **Use Case**: Grant special permissions to specific trusted members
- **Revocable**: Admin can remove the role at any time
- **UI**: Feature roles displayed in collapsible categories in the member edit modal

### Feature Role Management UI
Admins can assign feature roles through the member edit modal:

**Base Role Section:**
- Radio buttons to select between `member` and `admin`
- Only one base role can be active at a time

**Feature Roles Section:**
- Collapsible categories grouped by feature domain:
  - Trust (viewer, granter)
  - Wealth (viewer, creator)
  - Polls (viewer, creator)
  - Disputes (viewer, handler)
  - Pools (viewer, creator)
  - Councils (viewer, creator)
  - Forum (viewer, manager, thread_creator, attachment_uploader, content_flagger, flag_reviewer)
  - Items (viewer, manager)
  - Analytics (viewer)
  - Needs (viewer, publisher)
- Checkboxes for each role within categories
- Multiple feature roles can be assigned simultaneously
- Shows count of active roles per category and total

**API Endpoint:**
```
PUT /api/v1/communities/{id}/members/{userId}/feature-roles
Body: { roles: string[] }
```

### Trust Role Assignment
- **How**: Automatically granted when user's trust >= threshold
- **Storage**: Managed by TrustSyncService, synced to OpenFGA
- **Use Case**: Democratic access based on peer validation
- **Dynamic**: Automatically updated when trust changes or thresholds change

### Hybrid Access
- Communities can use **both methods simultaneously**
- Example: Forum management via `forum_manager` (admin-assigned) **OR** `trust_forum_manager` (trust >= 30)
- Both paths grant the same permission: `can_manage_forum`

## Permission Principles

### Roles Are Additive
- Members can have multiple roles simultaneously
- Example: Alice can be both `forum_manager` (admin-assigned) AND `trust_poll_creator` (trust-earned)
- Roles from different sources (regular + trust) stack

### Permissions Are Inclusive
- Permission granted if user has **ANY** qualifying role
- Formula: `permission = admin OR regular_role OR trust_role`
- Example: `can_manage_forum = admin OR forum_manager OR trust_forum_manager`

### Trust-Based Roles Are Automatic
- No manual grant needed when threshold is reached
- Immediately granted when trust increases above threshold
- Immediately revoked when trust drops below threshold
- Recalculated when community changes threshold configuration

### Application Code Checks Permissions Only
- **Never check roles directly** in application code
- Always check the final permission (e.g., `can_manage_forum`)
- OpenFGA evaluates the role unions automatically
- **All role assignments are logged** - Stored in OpenFGA and auditable
- **Admins can revoke roles** - But cannot revoke trust-based access (must adjust trust score)
- **Role actions are tracked** - In relevant logs (moderation log, transaction history, trust history, etc.)
- **Trust levels are evaluated in real-time** - Permission checks always use current trust score

## Related Database Tables

### Implemented
- `app_users` - User profile data synced from Keycloak
- `community_members` - User memberships (roles stored in OpenFGA, not in database)
- `council_managers` - Members managing specific councils
- `trust_levels` - Trust level relations for permission checks
- OpenFGA - All role assignments and trust-based relations

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
- [FT-05: Pools](./05-pools.md)
- [FT-06: Councils](./06-councils.md)
- [FT-07: Voting & Polling](./07-voting-polling.md)
- [FT-10: Forum System](./10-forum-system.md)
- [FT-13: Security & Access Control](./13-security-access-control.md)
