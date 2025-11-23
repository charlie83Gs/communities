# Permissions

## What Are Permissions?

**Permissions** are the actual capabilities you have in a community. They answer the question: "Can I do this action?"

Examples:
- **Can I create a forum thread?** → Check `can_create_thread` permission
- **Can I moderate the forum?** → Check `can_manage_forum` permission
- **Can I create a pool?** → Check `can_create_pool` permission

Permissions are the **what you can do**. They're separate from roles (the **how you got access**).

## The Dual Permission Model

Communities uses a unique **dual-path permission model**. For most capabilities, you can gain permission through **either** of two paths:

### Path 1: Role-Based Access
An admin explicitly grants you a role, which grants the permission.

**Example:** Admin makes Alice a Forum Manager
- Role granted: `forum_manager`
- Permission received: `can_manage_forum`
- Access method: Admin assignment

### Path 2: Trust-Based Access
You automatically receive a role when your trust score reaches the threshold.

**Example:** Bob reaches 30 trust
- Role granted: `trust_forum_manager` (automatic)
- Permission received: `can_manage_forum`
- Access method: Trust achievement

**Both paths grant the same permission.** The system evaluates: "Does this user have `can_manage_forum`?" It doesn't care whether it came from admin assignment or trust.

## How Permission Evaluation Works

Under the hood, the system uses **OpenFGA** (a relationship-based access control system) to evaluate all permissions.

### The Evaluation Formula

For any given permission, the system checks:

```
Permission = Admin OR Regular_Role OR Trust_Role
```

**Example: can_manage_forum**
```
can_manage_forum =
  user is admin in community
  OR user has forum_manager role
  OR user has trust_forum_manager role
```

If **any** of these is true, permission is granted.

### Why This Matters

**Inclusive, not exclusive:** You only need ONE path to permission. This makes the system both flexible (admins can grant exceptions) and democratic (trust unlocks access automatically).

**Transparent:** The evaluation rule is the same for everyone. No hidden special cases or backdoor access.

**Scalable:** Admins don't need to manually grant every permission to every person. Trust thresholds handle most access granting automatically.

## Complete Permission List

### Trust Feature Permissions
- **`can_view_trust`** → View trust scores and awards
  - Via: `trust_viewer` or `trust_trust_viewer` or admin

- **`can_award_trust`** → Award/remove trust to other members
  - Via: `trust_granter` or `trust_trust_granter` or admin
  - Default threshold: 15 trust

### Wealth Feature Permissions
- **`can_view_wealth`** → View wealth shares in community
  - Via: `wealth_viewer` or `trust_wealth_viewer` or admin

- **`can_create_wealth`** → Publish wealth shares
  - Via: `wealth_creator` or `trust_wealth_creator` or admin
  - Default threshold: 10 trust

### Poll Feature Permissions
- **`can_view_poll`** → View community polls
  - Via: `poll_viewer` or `trust_poll_viewer` or admin

- **`can_create_poll`** → Create new polls
  - Via: `poll_creator` or `trust_poll_creator` or admin
  - Default threshold: 15 trust

### Dispute Feature Permissions
- **`can_view_dispute`** → View dispute information
  - Via: `dispute_viewer` or `trust_dispute_viewer` or admin

- **`can_handle_dispute`** → Mediate and resolve disputes
  - Via: `dispute_handler` or `trust_dispute_handler` or admin
  - Default threshold: 20 trust

### Pool Feature Permissions
- **`can_view_pool`** → View community pools
  - Via: `pool_viewer` or `trust_pool_viewer` or admin

- **`can_create_pool`** → Create new resource pools
  - Via: `pool_creator` or `trust_pool_creator` or admin
  - Default threshold: 20 trust

### Council Feature Permissions
- **`can_view_council`** → View council information
  - Via: `council_viewer` or `trust_council_viewer` or admin

- **`can_create_council`** → Create new councils
  - Via: `council_creator` or `trust_council_creator` or admin
  - Default threshold: 25 trust

### Forum Feature Permissions
- **`can_view_forum`** → Read forum threads and posts
  - Via: `forum_viewer` or `trust_forum_viewer` or admin

- **`can_create_thread`** → Create new forum threads
  - Via: `thread_creator` or `trust_thread_creator` or admin
  - Default threshold: 10 trust

- **`can_upload_attachment`** → Upload files to forum posts
  - Via: `attachment_uploader` or `trust_attachment_uploader` or admin
  - Default threshold: 15 trust

- **`can_flag_content`** → Flag inappropriate forum content
  - Via: `content_flagger` or `trust_content_flagger` or admin
  - Default threshold: 15 trust

- **`can_review_flag`** → Review and act on flagged content
  - Via: `flag_reviewer` or `trust_flag_reviewer` or admin
  - Default threshold: 30 trust

- **`can_manage_forum`** → Full forum moderation (edit, delete, move, lock threads)
  - Via: `forum_manager` or `trust_forum_manager` or admin
  - Default threshold: 30 trust

### Item Management Permissions
- **`can_view_item`** → View community item catalog
  - Via: `item_viewer` or `trust_item_viewer` or admin

- **`can_manage_item`** → Create and manage item definitions
  - Via: `item_manager` or `trust_item_manager` or admin
  - Default threshold: 20 trust

### Analytics Permissions
- **`can_view_analytics`** → Access community health analytics
  - Via: `analytics_viewer` or `trust_analytics_viewer` or admin
  - Default threshold: 20 trust

### Value Recognition Permissions
- **`can_view_contributions`** → View contribution profiles and statistics
  - Via: `contribution_viewer` or `trust_contribution_viewer` or admin
  - Default threshold: 0 trust (public)

- **`can_log_contributions`** → Log self-reported contributions
  - Via: `contribution_logger` or `trust_contribution_logger` or admin
  - Default threshold: 5 trust

- **`can_grant_peer_recognition`** → Grant peer recognition to others
  - Via: `recognition_granter` or `trust_recognition_granter` or admin
  - Default threshold: 10 trust

- **`can_verify_contributions`** → Verify contributions as beneficiary/witness
  - Via: `contribution_verifier` or `trust_contribution_verifier` or admin
  - Default threshold: 15 trust

- **`can_manage_recognition`** → Manage recognition categories and system
  - Via: `recognition_manager` (admin only, no trust variant)

**Note:** Value recognition permissions control participation in the recognition system itself. They do NOT gate access to community features like wealth sharing, councils, or pools.

## Permission Inheritance

Some permissions imply others:

### Admin Permission
Being an admin grants **all permissions automatically**. Admins don't need individual feature roles.

**Why:** Admins need full access to manage the community, configure settings, and handle edge cases.

### Implicit Permissions
Some roles grant related permissions implicitly:

- **Pool Manager** can create polls (pool coordination requires decision-making)
- **Council Manager** can create polls on behalf of councils
- **Forum Manager** includes all forum permissions (view, create, flag, review, manage)

These relationships reduce configuration complexity—you don't need to assign every single permission individually.

## Permission Scoping

### Community-Scoped Permissions
Most permissions are **per-community**:

- Having `can_manage_forum` in Community A doesn't grant it in Community B
- Trust scores are per-community
- Role assignments are per-community

**Example:** Alice is a forum manager in the "Food Coop" community (30 trust) but a new member in the "Developer Network" community (5 trust). She can moderate the Food Coop forum but not the Developer Network forum.

### Council-Scoped Permissions
**Council Manager** role is **per-council**, not community-wide:

- Being manager of "Food Council" doesn't make you manager of "Tool Council"
- Each council manager assignment is separate
- You can manage multiple councils (each assigned individually)

**Example:** Bob manages the Food Council and Garden Council. He can share wealth and write reports for both, but cannot manage the Tool Council.

### Resource-Scoped Permissions
Some permissions are scoped to specific resources:

- **Wealth share** publisher can accept/reject requests on their own shares
- **Poll** creator can close their own polls early
- **Council manager** can manage their specific council's resources

You don't need community-wide power to manage your own contributions.

## Permission Configuration

### Trust Thresholds
Communities configure trust thresholds for each trust-based role in the community settings:

**Default thresholds (adjustable):**
- Award Trust: 15
- Share Wealth: 10
- Create Threads: 10
- Create Polls: 15
- Upload Attachments: 15
- Flag Content: 15
- Create Pools: 20
- Create Councils: 25
- Review Flags: 30
- Manage Forum: 30
- Manage Items: 20
- View Analytics: 20

**Configuring thresholds encodes community values:**

**Open community** (lower thresholds):
- New members gain permissions quickly
- Encourages participation and experimentation
- Requires strong culture and conflict resolution

**Cautious community** (higher thresholds):
- New members observe longer before participating
- More stable, less chaotic
- May feel slower and more bureaucratic

There's no "correct" configuration—it depends on your community's size, context, and culture.

### Viewer Permissions
Some communities gate even **viewing** certain features:

**Public forum** (no viewer permission needed):
- Anyone can read forum
- Must have trust to post

**Private forum** (viewer permission required):
- Must have `forum_viewer` role to read
- Must have higher trust to post

This gives communities control over privacy and transparency.

## Permission Changes

### When Trust Changes
Trust-based permissions update **automatically** in real-time:

**Scenario 1: Trust Increases**
1. Alice's trust increases from 29 → 30
2. System checks: `minTrustForForumModeration = 30`
3. System grants: `trust_forum_manager` role
4. Alice gains: `can_manage_forum` permission
5. Change is immediate

**Scenario 2: Trust Decreases**
1. Bob's trust decreases from 30 → 29 (someone removed their trust)
2. System checks: `minTrustForForumModeration = 30`
3. System revokes: `trust_forum_manager` role
4. Bob loses: `can_manage_forum` permission (unless he has admin-assigned `forum_manager`)
5. Change is immediate

### When Thresholds Change
If a community adjusts trust thresholds, all members' trust-based roles are recalculated:

**Scenario: Community raises forum moderation threshold**
1. Admin changes `minTrustForForumModeration` from 30 → 35
2. System recalculates ALL members' trust roles
3. Members with trust 30-34 lose `trust_forum_manager`
4. Members with trust 35+ keep `trust_forum_manager`
5. Members with admin-assigned `forum_manager` keep permissions (not affected)

This ensures permissions always reflect current configuration.

### When Roles Are Granted/Revoked
Admin-assigned roles can be added or removed at any time:

**Grant:**
1. Admin assigns `forum_manager` to Alice
2. Alice immediately gains `can_manage_forum`
3. Change is logged in audit trail

**Revoke:**
1. Admin removes `forum_manager` from Alice
2. Alice loses `can_manage_forum` (unless she has it via trust)
3. Change is logged in audit trail

## OpenFGA Integration (User Perspective)

### What is OpenFGA?
OpenFGA is an **external authorization service** that evaluates all permission checks. It's a specialized tool for relationship-based access control.

**You don't interact with OpenFGA directly**—it works behind the scenes.

### Why OpenFGA?
**Consistency:** All permission checks go through the same system, ensuring no bypasses or special cases.

**Performance:** Optimized for fast permission evaluation, even with complex rules.

**Auditability:** All permission grants and checks can be audited.

**Separation:** Authorization logic is separate from business logic, making the system more secure and maintainable.

### What OpenFGA Stores
- **Role assignments:** Your roles in each community
- **Trust-based roles:** Automatically synced when trust changes
- **Permission rules:** Which roles grant which permissions
- **Relationships:** Community membership, council management, etc.

### How Permissions Flow

**Application side (what you see):**
1. You click "Create Forum Thread"
2. UI sends request to API
3. You see thread creation form (or error if no permission)

**Behind the scenes:**
1. API asks OpenFGA: "Does user Alice have `can_create_thread` in Community XYZ?"
2. OpenFGA checks:
   - Is Alice admin? No
   - Does Alice have `thread_creator` role? No
   - Does Alice have `trust_thread_creator` role? Yes (trust = 15, threshold = 10)
3. OpenFGA returns: **Yes, permission granted**
4. API processes thread creation

This happens in milliseconds, invisible to you.

### Trust Synchronization
When your trust changes, the system syncs with OpenFGA:

1. Member awards you trust (trust: 14 → 15)
2. Backend recalculates your trust-based roles
3. Backend updates OpenFGA: Add `trust_trust_granter` role
4. Next permission check includes new role
5. You can now award trust to others

This sync is **automatic and real-time**. You don't wait for batch processing.

## Permission Best Practices

### For Members: Understanding Your Access

**Check your permissions:**
- View your profile to see current roles
- Check trust score vs. thresholds to see what's next
- Review community settings to understand requirements

**When you don't have permission:**
- **Option 1:** Build trust to reach threshold (democratic path)
- **Option 2:** Ask admin for role assignment (exceptional path)
- **Option 3:** Accept limitation and participate in other ways

**Don't game the system:**
- Asking multiple people for trust often backfires
- Trust comes from reliability, not campaigning
- Permissions are tools for contribution, not status symbols

### For Admins: Granting Permissions

**Trust the trust system:**
- Let trust thresholds handle most access granting
- Use admin role assignment sparingly
- Don't create "fast tracks" for friends

**Be transparent:**
- When you grant a role, explain why publicly
- Document your criteria for exceptional grants
- Review role assignments periodically

**Adjust thresholds, not exceptions:**
- If many people need early access, lower the threshold
- If thresholds feel too low, raise them for everyone
- Consistency matters more than individual optimization

### For Communities: Configuring Permissions

**Start conservative:**
- Begin with higher thresholds
- Lower them if participation is blocked
- Easier to open up than to restrict later

**Watch the data:**
- Use analytics to see how many members are hitting thresholds
- If 80% never reach "create thread," threshold is too high
- If everyone has all permissions immediately, thresholds are too low

**Match culture to configuration:**
- High-trust community → lower thresholds
- Privacy-focused → viewer role requirements
- Experiment-friendly → permissive access
- Stable and cautious → higher barriers

**Iterate based on experience:**
- What works for a 20-person coop might not work for a 200-person network
- Revisit thresholds every few months
- Ask members: "Are permissions blocking contribution?"

## Common Permission Scenarios

### Scenario 1: Progressive Access
**Member journey through permission gates:**

Day 1 (Trust: 0):
- ✓ View forum (no viewer role required)
- ✗ Create threads (need 10 trust)
- ✗ Share wealth (need 10 trust)

Week 2 (Trust: 12):
- ✓ Create threads (reached threshold)
- ✓ Share wealth (reached threshold)
- ✗ Award trust (need 15 trust)

Month 1 (Trust: 18):
- ✓ Award trust (reached threshold)
- ✓ Create polls (reached threshold)
- ✗ Create councils (need 25 trust)

Month 3 (Trust: 32):
- ✓ Create councils (reached threshold)
- ✓ Moderate forum (reached threshold)
- ✓ All standard permissions unlocked

### Scenario 2: Admin Exception
**Member needs temporary access:**

Alice has 18 trust, but the Food Council urgently needs a manager. The threshold for council creation is 25, but she doesn't need to create one—just manage the existing one.

Admin solution:
- Assign Alice as Food Council Manager (council-scoped)
- She can now manage that specific council
- No change to her community-wide permissions
- Can be revoked when no longer needed

### Scenario 3: Privacy Configuration
**Community wants semi-private forum:**

Configuration:
- `forum_viewer` required to read forum (viewer role)
- Viewer role granted at 5 trust (low barrier)
- Thread creation at 10 trust (standard)

Result:
- Public can't see forum
- New members who get even minimal trust (5) can read
- Only somewhat established members (10) can post
- Balance between privacy and accessibility

### Scenario 4: Trust Threshold Adjustment
**Community realizes threshold is too high:**

Problem: `minTrustForThreadCreation = 25`, but only 5 of 40 members can post. Forum is dead.

Solution:
1. Community discusses in existing threads
2. Creates poll: "Lower thread creation to 10 trust?"
3. Poll passes
4. Admin adjusts setting
5. 28 members now can post
6. Forum becomes active

This shows thresholds are tools, not values—adjust them to serve community needs.

## Advanced Permission Concepts

### Permission Inheritance Hierarchy
```
Admin
  ↓ (implies all permissions)
Feature Manager Role
  ↓ (implies related permissions)
Specific Action Role
  ↓ (grants single permission)
Viewer Role
  ↓ (grants read-only permission)
```

### Permission Aggregation
You accumulate permissions from all sources:
- Your admin status (if applicable)
- Your admin-assigned roles
- Your trust-based roles
- Your council manager assignments

All these are evaluated together. You have permission if **any** source grants it.

### Permission Revocation
Losing permission requires losing **all** sources:

**Example:** Alice has `can_manage_forum` from:
1. Trust-based `trust_forum_manager` (trust = 35)
2. Admin-assigned `forum_manager`

To lose the permission, she would need:
1. Trust to drop below 30 AND
2. Admin to revoke the assigned role

If either source remains, she keeps the permission.

## The Future of Permissions

### Planned Enhancements

**Time-limited permissions:**
- Grant role for specific duration
- Useful for temporary responsibilities
- Auto-revoke when period ends

**Delegation:**
- Council managers delegate permissions to members
- Creates sub-hierarchies within councils
- More granular permission distribution

**Conditional permissions:**
- Permissions that require multiple conditions
- Example: "Can handle disputes if trust > 20 AND completed mediation training"
- Enables certification or skill-based access

**Permission requests:**
- Members can request specific permissions
- Creates workflow for admin review
- Makes access negotiation transparent

## Understanding Permission Philosophy

The permission system embodies core values:

### Democracy Through Trust
Most permissions can be earned through community validation, not just admin grant. This is **democratic access**.

### Flexibility Through Dual Paths
Communities can use trust-based access as primary with admin-assigned as exception, or vice versa. This is **adaptive governance**.

### Transparency Through Audit
All permission grants are logged and visible (to appropriate audiences). This is **accountable power**.

### Context Through Scoping
Permissions respect boundaries (community, council, resource). This is **appropriate authority**.

### Evolution Through Configuration
Communities can adjust thresholds as they learn and grow. This is **iterative governance**.

**Permissions aren't just access control—they're a framework for distributing power in non-hierarchical communities.**

---

**Related Concepts:**
- [Communities](./communities.md) - Understanding community structure
- [Trust System](./trust-system.md) - How trust scores work
- [Members & Roles](./members-roles.md) - Role types and assignments
