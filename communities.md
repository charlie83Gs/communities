# Community Management System

## Overview
This system enables communities to manage shared resources, trust relationships, and collaborative decision-making without monetary transactions.

## Core Features

### 1. Communities
The foundational entity of the application. Each community operates independently with its own configuration, members, and resources.

### 2. Members & Permissions

#### Permission System Overview
This system uses a **dual permission model**: members can gain access to features either through **explicit role assignment** OR by reaching a **trust threshold**. This provides flexibility while maintaining security and transparency.

**Two Paths to Permission:**
1. **Role-Based**: Admin explicitly grants a role to a member
2. **Trust-Based**: Member automatically gains access by reaching a configured trust score

**Example**: To create a poll, a member can either:
- Be explicitly granted the "Poll Creator" role by an admin, OR
- Reach the configured trust threshold (default: 15)

#### Member Roles
Members are users who belong to a community, managed through this flexible permission system.

#### Available Roles & Trust Thresholds

##### Admin
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

##### Forum Manager
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

##### Pool Manager
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

##### Council Manager
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

##### Dispute Resolver
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

##### Poll Creator
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

##### Wealth Publisher
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

#### Trust Threshold Configuration Summary

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

#### Role Hierarchy
1. **Admin** - Highest level, can manage all roles and features, bypasses all trust requirements
2. **Feature-Specific Managers** - Forum Manager, Pool Manager, Council Manager, Dispute Resolver
3. **Trust-Based Automatic Access** - Wealth Publisher, Poll Creator, Thread Creator (when trust threshold met)
4. **Basic Member** - Can post in forums, request wealth, vote on initiatives, comment

#### Role Assignment Methods
- **Direct Assignment**: Admin explicitly grants role to member (stored in OpenFGA)
- **Trust-Based**: Automatic access when member reaches trust threshold (evaluated via trust_level_X relations)
- **Council-Based**: Access granted through council membership (council#member relation)
- **Hybrid**: Community can use both methods simultaneously (e.g., Poll Creator via role OR trust >= 15)

#### Permission Principles
- **Roles are additive** - Members can have multiple roles simultaneously
- **Trust-based access is automatic** - No manual grant needed when threshold is reached
- **All role assignments are logged** - Stored in OpenFGA and auditable
- **Admins can revoke roles** - But cannot revoke trust-based access (must adjust trust score)
- **Role actions are tracked** - In relevant logs (moderation log, transaction history, trust history, etc.)
- **Trust levels are evaluated in real-time** - Permission checks always use current trust score

### 3. Trust System

#### Trust Scores & Titles
- Each member has a **trust score** representing how many community members trust them
- Trust titles are configurable at the community management level
- **Default trust levels:**
  - **New**: Score < 10
  - **Stable**: Score >= 10
  - **Trusted**: Score >= 50

#### Awarding Trust
- Members can award trust to other members once they reach a configurable threshold (default: 15)
- A member's score reflects the number of community members who trust them
  - Example: Score of 17 = trusted by 17 community members

#### Removing Trust
- **Members can remove their trust at any point** if they no longer trust a user
- Trust removal immediately decreases the recipient's trust score
- All trust changes (awards and removals) are tracked for transparency

#### Admin-Granted Trust
- Admins can manually add trust to users to bootstrap the community
- All admin-granted trust is stored and auditable
- Any admin can review and modify trust granted by other admins
  - Example: If Admin A grants 10 trust, Admin B can review and update this value

### 4. Community Wealth

#### Wealth Sharing
- Members and councils can share products, services, or resources
- **Sharing Targets:**
  1. **Public (Community)**: Available to all members based on trust requirements
  2. **Council**: Direct transfer to a specific council
  3. **Pool**: Instant transfer to a pool (automatically fulfilled, cannot be cancelled)

#### Wealth Publications
- Access is trust-gated: admins configure the minimum trust score required
- Wealth publications support comments

#### Trust-Capped Wealth
- **Purpose**: Allow members to restrict valuable or sensitive resources to highly trusted members only
- **Minimum Trust Requirement**: Members can set a minimum trust score required to request their wealth item
  - Example: "Power tools available only to members with trust score >= 30"
  - Example: "Car sharing available only to members with trust score >= 50"
- **Visibility**: All members can see trust-capped items, but only those meeting the requirement can request them
- **Owner Control**: Overrides community-wide wealth access configuration for specific items

#### Resource Discovery
- **Categories & Subcategories**: Wealth items are organized hierarchically for easy browsing
  - Example: Food > Vegetables > Carrots
  - Example: Tools > Gardening > Shovels
- **Expiration Dates**: Members can set time limits on their shares
  - Example: "Fresh tomatoes available until Friday"
  - Expired shares are automatically removed or hidden
- **Filtering**: Users can filter available resources by:
  - Category/Subcategory
  - Expiration date (available now, available this week, etc.)
  - Location (if configured)
  - Sharing type (public, council, pool)
  - Trust requirement (items I can access, all items, items requiring 20+, etc.)
  - Availability status (available, pending, fulfilled)

#### Wealth Requests
- Members and councils can request publicly shared wealth items
- The owner (creator of the wealth item) decides whether to accept or reject requests
- Pool shares bypass the request system (instant fulfillment)

#### Disputes
- **Purpose**: Address situations where an accepted wealth request is not fulfilled
- **Creating a Dispute**: Available when delivery of accepted wealth is not completed
- **Dispute Handling Configuration** (per community):
  - Minimum trust requirement to handle disputes
  - Specific role assignment for dispute resolution
  - Specific council(s) designated to handle disputes
- **Resolution Process**:
  - System records the dispute details
  - Assigned handler(s) review the dispute
  - Handler reaches out to involved parties outside the system to understand the situation
  - System records the resolution outcome for transparency
- **Simplicity**: The system only tracks disputes and outcomes; actual mediation happens externally

### 5. Pools

#### Purpose
Resource aggregation mechanism for collective initiatives and planning.

#### Pool Creation
Pools can be created by:
1. Users with sufficient trust permissions
2. Users with specific pool role
3. Users acting on behalf of a council

#### Pool Shares
- Users can share wealth directly to a pool when publishing
- Pool shares are **automatically fulfilled** and **cannot be cancelled**
- Instant transfer mechanism for committed resources

#### Visibility
- Pools are filterable by council association
- Pool resources and contributions are transparent

### 6. Councils

#### Purpose
Councils are **community actors** (similar to members) focused on specific domains (e.g., "Community Food Council").

#### Council Trust System
- **Similar to Member Trust**: Councils have trust scores based on community member confidence
- **Awarding Council Trust**: Members can trust councils to indicate confidence in their mission and operations
  - Example: "Food Council" trusted by 25 members = trust score of 25
- **Removing Council Trust**: Members can remove their trust from a council at any time
  - Example: If a council mismanages resources, members can withdraw trust
- **Trust Impact**: Council trust scores can determine:
  - Access to certain community resources
  - Eligibility to handle disputes
  - Visibility and prominence in community listings
  - Ability to create certain types of pools
- **Transparency**: All council trust awards and removals are tracked

#### Council Capabilities
Councils function like members and can:
1. **Share wealth**: Publish resources from their inventory
2. **Publish needs**: Express resource requirements
3. **Create initiatives**: Propose community actions

#### Council Resource Management
- **Transparent Inventory**: Councils display their current resources
  - Example: "Food Council has 5 carrots"
- **Auditable Transactions**: All resource movements are tracked
  - Example: "Moved 5 carrots to Garden Pool"
  - Example: "Received 10 carrots from User A"
- **Usage Reports**: Councils can write reports explaining resource usage
  - Example: "5 carrots used to feed community rabbits"
  - **Evidence Uploads**: Reports can include images and documents
    - Photos of completed projects
    - Receipts or documentation
    - Before/after images
    - Activity documentation

#### Receiving Wealth
- Members can share wealth directly to a council (targeted sharing)
- This is a standard wealth share that automatically transfers to the council
- Councils accumulate resources for their initiatives

#### Initiatives
- Councils can create initiatives to propose community actions
- Members can upvote or downvote initiatives
- Initiatives support comments

### 7. Voting & Polling

#### Permissions
Multiple permission models:
1. **User-based**: Admins grant individual users access to create polls
2. **Trust threshold**: Any member above a specified trust level can create polls
3. **Pool role**: Users with specific pool management roles
4. **Council representative**: Users acting on behalf of a council

#### Features
- Polls support comments

### 8. Needs System

#### Purpose
Enable community members to express and aggregate resource requirements for planning purposes.

#### Features
- Members can publish their needs (e.g., "5 carrots per week")
- Needs are **quantitative** to support planning
- **Need Types:**
  - **Recurring**: Ongoing needs (e.g., "5 carrots per week")
  - **One-time**: Single-instance needs (e.g., "1 coffee table")

#### Aggregation
- Multiple members can add their own needs with the same name/type
- System displays both individual needs and total community needs
- Members can remove their needs when no longer required

#### Example
- User A: 5 carrots per week
- User C: 8 carrots per week
- Community total: 13 carrots per week

### 9. Statistics & Analytics

#### User Statistics
- **Fulfillment Tracking**: Display how many times each user has fulfilled wealth share requests
  - Fulfillment rate percentage
  - Total fulfilled vs. total accepted requests
  - Recent fulfillment history
- **Contribution Metrics**: Track member activity and contributions
  - Number of wealth shares published
  - Number of needs published
  - Participation in councils and initiatives
  - Trust awards given/received

#### Admin Analytics
- **Non-Contributing Member Identification**: Tools to identify inactive or low-contribution members
  - Members who haven't shared wealth in X days/months
  - Members with zero fulfillments
  - Members with low participation scores
  - Trust score vs. contribution analysis
- **Filters and Reports**:
  - Sort by last contribution date
  - Filter by contribution type
  - Export member activity reports

#### Community Dashboard
- **Community Health Metrics**: Visualize overall community vitality
  - **Active Members**: Number of members active this week/month
  - **Wealth Generation**: Total wealth items shared per month
  - **Wealth Shared**: Volume of wealth transactions per month
  - **Trust Network**: Total trust awards and average member trust score
  - **Council Activity**: Number of active councils and initiatives
  - **Council Trust**: Average council trust scores and trust distribution
  - **Needs Fulfillment**: Percentage of published needs being met
  - **Dispute Rate**: Number of disputes vs. total transactions
  - **Trust-Capped Items**: Number of high-trust items and usage statistics
- **Trends and Graphs**:
  - Monthly wealth sharing trends
  - Member growth over time
  - Member trust score distribution
  - Council trust score distribution
  - Category-based wealth distribution
  - Council participation rates
  - Trust-capped wealth usage patterns

### 10. Forum System

#### Purpose
Community discussion platform enabling members to create threads, share ideas, ask questions, and engage in structured conversations.

#### Forum Structure
- **Categories**: Top-level organizational units (e.g., "General Discussion", "Resource Sharing", "Events")
  - Admins and Forum Admins can create, edit, and delete categories
  - Categories can be reordered for better organization
- **Threads**: Discussion topics within categories
  - Any member can create threads (subject to trust requirements)
  - Thread creators can edit/delete their own threads
- **Posts**: Individual messages within threads
  - Members reply to threads with posts
  - Posts can be edited by their authors
  - Posts support rich text formatting and attachments

#### Forum Admin Role
- **Purpose**: Dedicated moderators who manage forum content and ensure healthy discussions
- **Capabilities**:
  - Create, edit, and delete categories
  - Pin/unpin threads (featured threads appear at top)
  - Lock/unlock threads (prevent new posts)
  - Move threads between categories
  - Edit or delete any post/thread (with moderation log)
  - View moderation reports and take action
  - Assign temporary post restrictions to members
  - Access moderation analytics and reports
- **Assignment**: Community admins can grant Forum Admin role to trusted members

#### Trust-Based Moderation

##### Creating Content
- **Thread Creation**: Requires minimum trust score (configurable, default: 10)
- **Posting**: All members can reply to threads (no trust requirement)
- **Attachments**: Uploading images/files requires minimum trust score (configurable, default: 15)

##### Peer Moderation (Community-Driven)
- **Flagging System**: Members can flag inappropriate posts/threads
  - Flag types: Spam, Off-topic, Harassment, Misinformation, Other
  - Flagging requires minimum trust score (configurable, default: 15)
- **Flag Threshold**: Posts with multiple flags (configurable, default: 5) are automatically hidden pending review
- **Review Queue**: Forum Admins and designated high-trust members review flagged content
  - Reviewers need minimum trust score (configurable, default: 30)

##### Moderation Actions
- **Warning**: Notify member about rule violations (visible to member only)
- **Post Removal**: Delete specific post with reason logged
- **Thread Lock**: Prevent new replies while keeping thread visible
- **Thread Removal**: Delete entire thread with reason logged
- **Post Restriction**: Temporarily prevent member from posting (time-based)
- **All actions are logged** in moderation history for transparency

##### Moderation Log
- Records all moderation actions (who, what, when, why)
- Visible to Forum Admins and Community Admins
- Includes: Action type, moderator, target user, affected content, reason, timestamp

#### Thread Features
- **Pinned Threads**: Stay at top of category (Forum Admin only)
- **Locked Threads**: Visible but cannot receive new posts
- **Thread Tags**: Optional labels for filtering (e.g., "Question", "Announcement", "Resolved")
- **Upvotes/Downvotes**: Members can vote on threads and posts
  - Vote visibility based on community configuration
  - High-quality content rises to prominence
- **Best Answer**: Thread creator can mark a post as "best answer" for questions
- **Thread Following**: Members can subscribe to thread notifications

#### Search & Discovery
- **Full-Text Search**: Search across thread titles and post content
- **Filtering**:
  - By category
  - By tag
  - By date range
  - By activity (newest, most popular, most upvoted)
  - By status (open, locked, with best answer)
  - By posts from specific users
- **Trending Threads**: Automatically surface active discussions

#### User Profiles & Forum Stats
- **Profile Information**:
  - Total threads created
  - Total posts made
  - Total upvotes received
  - Number of "best answers" received
  - Forum join date
- **Trust Impact**: Trust score affects moderation capabilities and privileges

#### Notifications
- New replies to threads you created
- Replies to your posts
- @mentions in posts
- Moderation actions affecting your content
- Flagged content requiring review (for moderators)

### 11. Invite System

#### Direct User Invites
- Existing users can be invited to join a community
- Invitees must accept the invitation to become members
- Users are not part of the community until they accept

#### Invite Links
- Time-limited shareable links
- Contain a secret token for access control
- Anyone with the link and valid secret can join
- System validates expiration and rejects expired links

## Data Model Summary

### Core Tables
1. **Communities** - Community definitions and configuration
2. **Members** - User memberships in communities
3. **Member_Roles** - Role assignments for members (Admin, Forum Manager, Pool Manager, etc.)
4. **Council_Managers** - Members who manage specific councils
5. **Trust_Scores** - Member trust levels
6. **Trust_Awards** - Peer-to-peer trust relationships (includes removals)
7. **Trust_History** - Audit log of all trust changes (awards and removals)
8. **Admin_Trust_Grants** - Admin-granted trust (auditable)
9. **Wealth_Categories** - Hierarchical resource categorization
10. **Wealth** - Shared resources and services (supports multiple target types, expiration dates, trust requirements)
11. **Wealth_Requests** - Requests for publicly shared wealth items
12. **Wealth_Fulfillments** - Tracking of fulfilled wealth requests
13. **Disputes** - Records of unfulfilled wealth request disputes
14. **Dispute_Resolutions** - Outcomes and notes for resolved disputes
15. **Polls** - Community voting/polling
16. **Pools** - Resource aggregation containers
17. **Pool_Resources** - Resources contributed to pools
18. **Councils** - Specialized community groups (act as community members)
19. **Council_Trust_Scores** - Council trust levels from community members
20. **Council_Trust_Awards** - Member-to-council trust relationships (includes removals)
21. **Council_Trust_History** - Audit log of council trust changes
22. **Council_Inventory** - Current resources held by councils
23. **Council_Transactions** - Auditable record of council resource movements
24. **Council_Usage_Reports** - Council-written explanations of resource usage
25. **Report_Attachments** - Images and documents attached to council reports
26. **Council_Needs** - Resource requirements published by councils
27. **Initiatives** - Council proposals for community action
28. **Initiative_Votes** - Member votes on initiatives
29. **Needs** - Member resource requirements
30. **Comments** - Comments on wealth, initiatives, and polls
31. **Member_Statistics** - Aggregated statistics for member contributions and activity
32. **Community_Metrics** - Dashboard metrics for community health tracking
33. **Forum_Categories** - Top-level forum organization
34. **Forum_Threads** - Discussion topics within categories
35. **Forum_Posts** - Individual messages within threads
36. **Forum_Thread_Tags** - Optional labels for thread categorization
37. **Forum_Votes** - Upvotes/downvotes on threads and posts
38. **Forum_Flags** - Member reports of inappropriate content
39. **Forum_Moderation_Log** - Audit trail of all moderation actions
40. **Forum_Post_Restrictions** - Temporary posting restrictions on members
41. **Forum_Thread_Subscriptions** - Thread notification preferences
42. **Invites** - Direct user invitations
43. **Invite_Links** - Time-limited invite links

## Configuration Options (Per Community)

### Trust System Configuration
- **Trust Title Names and Thresholds**: Customizable trust level names (e.g., "New", "Stable", "Trusted")
- **minTrustToAwardTrust**: Minimum trust score to award trust to others (default: 15)

### Wealth Access Configuration
- **minTrustForWealth**: Minimum trust score to publish/share wealth (default: 10)
- **Wealth Categories**: Hierarchical resource categorization structure
- **Trust-Capped Items**: Individual wealth items can set their own trust requirements

### Pool Configuration
- **minTrustForPoolCreation**: Minimum trust score to create pools (default: 20)
- **Pool Manager Role**: Explicit role assignment for pool management

### Council Configuration
- **minTrustForCouncilCreation**: Minimum trust score to create councils (default: 25)
- **Council Manager Assignment**: Per-council role assignment for management

### Dispute Handling Configuration
- **minTrustForDisputes**: Minimum trust score to handle disputes (default: 20)
- **Dispute Resolver Role**: Explicit role assignment for dispute resolution
- **Designated Councils**: Specific council(s) with sufficient trust can handle disputes

### Polling Permissions
- **minTrustForPolls**: Minimum trust score to create polls (default: 15)
- **Poll Creator Role**: Explicit role assignment for poll creation
- **Inherited Access**: Pool Managers and Council Managers can create polls

### Forum Configuration
- **minTrustForThreadCreation**: Minimum trust score to create threads (default: 10)
- **minTrustForReplies**: Minimum trust score to post replies (default: 0, all members)
- **minTrustForAttachments**: Minimum trust score to upload attachments (default: 15)
- **minTrustForFlagging**: Minimum trust score to flag content (default: 15)
- **minTrustForFlagReview**: Minimum trust score to review flagged content (default: 30)
- **minTrustForForumModeration**: Minimum trust score for full forum moderation (default: 30)
- **Forum Manager Role**: Explicit role assignment for forum moderation
- **Flag Threshold**: Number of flags to auto-hide content (default: 5)
- **Voting Settings**: Enable/disable thread and post upvoting/downvoting
- **Vote Visibility**: Configure who can see votes
- **Notifications**: Enable/disable @mentions and notifications

### Analytics Configuration
- **Non-contribution Threshold**: Days/months of inactivity (default: 30 days)
- **Dashboard Refresh Interval**: Metric update frequency (default: 3600 seconds)
- **Metric Visibility Settings**: Configure which metrics are visible to non-admins

## Security & Access Control

### Permission Model Architecture
The system uses **OpenFGA (Relationship-Based Access Control)** for all authorization decisions. NO authorization logic exists in application code.

### Permission Evaluation Methods
1. **Admin Bypass**: Admins have `community#admin` relation and bypass all trust requirements
2. **Role-Based Access**: Users are assigned explicit relations (e.g., `community#poll_creator`, `council#member`)
3. **Trust-Based Access**: Users are assigned to `trust_level_X` relations matching their trust score
4. **Hybrid Evaluation**: OpenFGA checks for role OR trust threshold in a single permission check

### How Trust Thresholds Work
1. **Trust Score Calculation**: Based on number of community members who trust the user
2. **Trust Level Assignment**: User is assigned to `community#trust_level_X` relation (where X = their trust score)
3. **Permission Check**: OpenFGA verifies if user has required `trust_level_Y` or higher (Y = configured threshold)
4. **Real-Time Updates**: Trust level relations are updated immediately when trust is awarded/removed

**Example Permission Flow:**
- User has trust score of 17
- User is assigned to `community#trust_level_17` relation in OpenFGA
- To create a poll (default threshold: 15), OpenFGA checks:
  - Does user have `community#poll_creator` role? OR
  - Does user have `community#trust_level_15` or higher? (Yes - they have trust_level_17)
- Permission granted

### Permission Levels Summary
1. **Admin**: `community#admin` relation - full community management, bypasses all trust checks
2. **Role-Based**: Explicit relations (e.g., `community#forum_manager`, `pool#manager`, `council#member`)
3. **Trust-Based**: `community#trust_level_X` relations - automatic access when threshold is met
4. **Hybrid**: Both methods evaluated simultaneously (role OR trust)

### Trust System Integrity
- **All trust awards are stored** in `trust_awards` table and auditable
- **Admin-granted trust is tracked separately** in `admin_trust_grants` table
- **Trust history is maintained** in `trust_history` table for transparency
- **Trust levels in OpenFGA are updated in real-time** when trust changes
- **Prevents trust manipulation** through complete audit trail and transparency

### Authorization Storage
- **Roles and Relations**: Stored in OpenFGA (external authorization service)
- **Trust Scores**: Calculated from `trust_awards` table in PostgreSQL
- **Configuration**: Trust thresholds stored in `communities` table in PostgreSQL
- **Sync Mechanism**: Application syncs trust scores to OpenFGA trust_level relations

## Use Cases

### Bootstrapping a New Community
1. Admin creates community
2. Admin invites initial members via invite links or direct invites
3. Admin grants initial trust to seed members
4. Members begin awarding trust to each other
5. Trusted members start sharing wealth and creating councils

### Resource Sharing (Public)
1. Member with sufficient trust publishes wealth item to community
2. Other members with sufficient trust request the item
3. Owner approves/rejects based on need and availability
4. Transaction is recorded for community records

### Resource Sharing (Council Direct)
1. Member harvests 10 carrots
2. Member shares carrots directly to "Food Council"
3. Carrots automatically transfer to council inventory
4. Council inventory shows: "Food Council has 10 carrots"
5. Council uses carrots for an initiative and writes report: "10 carrots used in community meal preparation"
6. Transaction history shows: "Received 10 carrots from User A" → "Used 10 carrots for community meal"

### Resource Sharing (Pool)
1. Council creates "Garden Project Pool" for a community garden initiative
2. Multiple members share resources directly to the pool:
   - User A: 5 seed packets
   - User B: 3 tools
   - User C: fertilizer
3. All shares are instantly fulfilled and cannot be cancelled
4. Pool displays total contributed resources
5. Council uses pool resources for the garden project

### Council Resource Management
1. Food Council receives donations from members
2. Council inventory displays all resources
3. Council confirms the resources are received
5. Council writes usage report: "Carrots used to feed community rabbits" 5 carrots are substracted from the inventory
6. All transactions are auditable by community members

### Collaborative Decision Making
1. Council creates an initiative
2. Members review and vote (upvote/downvote)
3. Comments facilitate discussion
4. Highly supported initiatives guide community action

### Community Planning
1. Members and councils publish their needs
2. System aggregates by need type
3. Community sees individual and total requirements
4. Councils and members coordinate to meet needs
5. Pools can be created to aggregate resources for specific needs

### Trust Management Lifecycle
1. User A awards trust to User B (Score increases from 14 to 15)
2. User B gains access to new features based on trust threshold
3. Six months later, User A observes problematic behavior from User B
4. User A removes their trust from User B (Score decreases from 15 to 14)
5. User B loses access to trust-gated features
6. Trust history shows: "User A awarded trust (Date 1)" and "User A removed trust (Date 2)"

### Dispute Resolution
1. User A accepts User C's request for 10 apples
2. User C reports the apples were never delivered
3. User C creates a dispute: "Wealth request accepted but not fulfilled"
4. System notifies the "Conflict Resolution Council" (configured as dispute handler)
5. Council member reviews dispute details
6. Council member contacts both parties externally to understand the situation
7. Council member records resolution: "Miscommunication resolved, delivery rescheduled"
8. Dispute marked as resolved
9. Transaction history shows dispute and resolution for transparency

### Resource Discovery & Filtering
1. User D wants to find fresh vegetables
2. User D navigates to Wealth > Food > Vegetables
3. User D applies filters:
   - Available now (not expired)
   - Within 5km radius
   - Public shares only
4. System displays:
   - 5 carrots (expires in 2 days)
   - 10 tomatoes (expires tomorrow)
   - Lettuce (expires in 5 days)
5. User D requests the tomatoes before they expire

### Council Accountability with Evidence
1. Garden Council receives 50 seed packets and 10 tools from members
2. Council inventory shows all resources
3. Council completes community garden project
4. Council writes usage report: "Created 20-bed community garden using donated seeds and tools"
5. Council uploads evidence:
   - Photos of completed garden beds
   - Before/after images
   - List of crops planted
6. Council inventory updated: Seeds and tools marked as used
7. Community members view transparent report with visual evidence

### Community Health Monitoring
1. Admin reviews community dashboard
2. Dashboard shows:
   - Active members: 45 (up 5 from last month)
   - Wealth shared this month: 120 items (down 10 from last month)
   - Average trust score: 22 (stable)
   - Dispute rate: 2% (healthy)
3. Admin notices User E has 0% fulfillment rate (5 accepted, 0 fulfilled)
4. Admin uses non-contributing member report
5. Admin identifies User E hasn't fulfilled any requests in 3 months
6. Admin reaches out to User E to understand situation
7. Admin may adjust User E's trust or provide support

### Trust-Capped Wealth Sharing
1. User F owns a professional power drill (high-value item)
2. User F shares the drill publicly but sets minimum trust requirement: 35
3. System shows drill in wealth listings with "Requires Trust: 35" badge
4. User G (trust score: 20) views the drill but cannot request it
5. User H (trust score: 40) can request the drill
6. User H requests the drill, User F approves
7. User H returns the drill in good condition
8. Transaction reinforces that high-trust members have access to valuable resources

### Council Trust Management
1. Community creates "Housing Council" to manage shared housing resources
2. 15 members immediately trust the Housing Council (score: 15)
3. Council successfully completes first housing initiative with full transparency
4. 10 more members award trust to the council (score: 25)
5. Six months later, council misses deadlines on a project
6. 5 members remove their trust from the council (score: 20)
7. Council reviews internal processes and improves communication
8. Over time, members re-award trust as council demonstrates improvement
9. Council trust score is displayed on council profile for transparency

### Council Trust-Based Permissions
1. Community configures dispute handling: "Only councils with trust >= 20 can handle disputes"
2. Housing Council (trust: 25) is eligible to handle disputes
3. New "Tech Council" is created (trust: 5)
4. Tech Council cannot handle disputes until it reaches trust threshold
5. Tech Council successfully completes several initiatives
6. Members award trust to Tech Council (score reaches 22)
7. Tech Council gains access to dispute handling capabilities
8. Dashboard shows all councils with their trust scores and capabilities

### Forum Discussion & Self-Organization
1. Member A creates thread in "Events" category: "Summer Community Picnic Planning"
2. Multiple members reply with ideas, suggestions, and volunteer offers
3. Thread receives 15 upvotes showing strong community interest
4. Member A marks Member B's post as "best answer" for venue suggestion
5. Council creates related initiative based on forum discussion
6. Thread tagged as "Resolved" once event is planned

### Forum Moderation (Trust-Based)
1. New member with low trust posts promotional content
2. 3 members with trust >= 15 flag the post as "Spam"
3. 2 more members flag the post, reaching the threshold of 5 flags
4. Post is automatically hidden pending review
5. Forum Admin reviews the flagged post
6. Forum Admin removes the post and logs reason: "Commercial spam, violates community guidelines"
7. Forum Admin sends warning to the posting member
8. Moderation log records: Admin name, action, timestamp, and reason

### Community Knowledge Building
1. Member with trust score 25 creates thread: "Best Practices for Composting"
2. Multiple experienced members share detailed advice
3. Thread becomes highly upvoted (50+ upvotes)
4. Forum Admin pins the thread to "Gardening" category
5. New members reference the thread when starting their own composting
6. Thread accumulates valuable community knowledge over time

### Role Assignment and Permission Flow
1. New community is created by Admin A
2. Admin A invites 10 initial members via invite link
3. Admin A grants initial trust (5 points each) to bootstrap the community
4. Members begin awarding trust to each other
5. Member B reaches trust score of 15, automatically gains Wealth Publisher abilities
6. Admin A assigns Forum Manager role to Member C (trust score 22)
7. Member C creates forum categories: "General", "Resources", "Events"
8. Admin A creates "Food Council" and assigns Member D as Council Manager
9. Member D (as Council Manager) can now share wealth and create initiatives on behalf of Food Council
10. Community configures Poll Creator with hybrid access: Role-based OR trust >= 20
11. Member E (trust score 25) can create polls via trust threshold
12. Member F (trust score 12) is explicitly granted Poll Creator role by Admin A
13. Both Member E and F can create polls despite different trust scores
14. All role assignments are logged and visible in admin panel

### Dual Permission System in Action (Trust-Based + Role-Based)
1. New member joins community with trust score of 0
2. Member can post forum replies (threshold: 0) but cannot create threads (threshold: 10)
3. After 2 weeks, 8 members award trust, member reaches score of 8
4. Still cannot create threads (needs 10) but can now request wealth (threshold: 10 not met)
5. 3 more members award trust, score reaches 11
6. **Automatic access granted**: Member can now create threads and publish wealth
7. Admin notices member is very active in forum and helpful
8. Admin explicitly grants "Forum Manager" role to member (even though trust < 30)
9. Member can now moderate forum via role, despite not meeting trust threshold
10. Over next month, member gains more trust, reaches score of 35
11. Member now has forum moderation access via BOTH paths (role + trust)
12. If admin revokes the Forum Manager role, member STILL has moderation access via trust score