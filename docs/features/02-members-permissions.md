---
id: FT-02
title: Members & Permissions
status: implemented
version: 1.0
last_updated: 2025-01-06
related_features: [FT-01, FT-03, FT-04, FT-05, FT-06, FT-07, FT-10, FT-13]
---

# Members & Permissions

## Permission System Overview
This system uses a **dual permission model**: members can gain access to features either through **explicit role assignment** OR by reaching a **trust threshold**. This provides flexibility while maintaining security and transparency.

**Two Paths to Permission:**
1. **Role-Based**: Admin explicitly grants a role to a member
2. **Trust-Based**: Member automatically gains access by reaching a configured trust score

**Example**: To create a poll, a member can either:
- Be explicitly granted the "Poll Creator" role by an admin, OR
- Reach the configured trust threshold (default: 15)

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

## Trust Threshold Configuration Summary

Communities can configure the following trust thresholds to control feature access:

| Feature | Config Field | Default | Access Via Role | Access Via Trust |
|---------|-------------|---------|-----------------|------------------|
| Award Trust to Others | `minTrustToAwardTrust` | 15 | Admin | Trust >= threshold |
| Publish/Share Wealth | `minTrustForWealth` | 10 | N/A | Trust >= threshold |
| Create Polls | `minTrustForPolls` | 15 | Poll Creator role | Trust >= threshold |
| Handle Disputes | `minTrustForDisputes` | 20 | Dispute Resolver role | Trust >= threshold |
| Create Pools | `minTrustForPoolCreation` | 20 | Pool Manager role | Trust >= threshold |
| Create Councils | `minTrustForCouncilCreation` | 25 | Admin | Trust >= threshold |
| Forum Moderation | `minTrustForForumModeration` | 30 | Forum Manager role | Trust >= threshold |
| Create Forum Threads | `minTrustForThreadCreation` | 10 | N/A | Trust >= threshold |
| Upload Forum Attachments | `minTrustForAttachments` | 15 | N/A | Trust >= threshold |
| Flag Forum Content | `minTrustForFlagging` | 15 | N/A | Trust >= threshold |
| Review Flagged Content | `minTrustForFlagReview` | 30 | Forum Manager role | Trust >= threshold |

**Key Points:**
- **Admins bypass all trust requirements** for all features
- **Council Managers** are assigned per council (not community-wide)
- **Pool Managers and Council Managers** automatically inherit poll creation access
- **All thresholds are configurable** per community
- **Trust-based access is automatic** - no manual grant needed when threshold is reached

## Role Hierarchy
1. **Admin** - Highest level, can manage all roles and features, bypasses all trust requirements
2. **Feature-Specific Managers** - Forum Manager, Pool Manager, Council Manager, Dispute Resolver
3. **Trust-Based Automatic Access** - Wealth Publisher, Poll Creator, Thread Creator (when trust threshold met)
4. **Basic Member** - Can post in forums, request wealth, vote on initiatives, comment

## Role Assignment Methods
- **Direct Assignment**: Admin explicitly grants role to member (stored in OpenFGA)
- **Trust-Based**: Automatic access when member reaches trust threshold (evaluated via trust_level_X relations)
- **Council-Based**: Access granted through council membership (council#member relation)
- **Hybrid**: Community can use both methods simultaneously (e.g., Poll Creator via role OR trust >= 15)

## Permission Principles
- **Roles are additive** - Members can have multiple roles simultaneously
- **Trust-based access is automatic** - No manual grant needed when threshold is reached
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
