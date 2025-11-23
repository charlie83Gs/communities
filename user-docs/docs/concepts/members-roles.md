# Members and Roles

## Understanding Community Membership

When you join a community in Communities, you become a **member**—a participant in that community's gift economy, trust network, and decision-making processes. Membership is the foundation of everything else.

## Member Types

### Regular Members
Most people in a community are **regular members**:

- Can view community resources and discussions
- Build trust through participation and reliability
- Earn permissions as trust grows
- Can receive role assignments from admins

Your experience as a regular member evolves based on your trust score and any roles you're granted.

### Admins
Every community has one or more **admins**:

- Full control over community configuration
- Can manage all roles and permissions
- Can grant seed trust to bootstrap the community
- Access to all analytics and audit logs
- Can override actions when necessary

**Admins are not "better" members**—they're members with specific responsibilities. In healthy communities, admins serve the community rather than ruling over it.

**Admin status is role-based only**—you cannot earn admin through trust. This is intentional. Admin powers are significant enough that they should be explicitly granted by existing admins, not automatically unlocked.

### Community Actors (Councils)
**Councils** are a special member type—they're groups that function like members:

- Have trust scores (representing community confidence)
- Can share wealth and express needs
- Create initiatives and write reports
- Managed by designated council managers

Councils bridge individual and collective action. Example: A "Food Council" manages food resources, but individual members still manage that council and the community trusts the council through trust awards.

## Roles in Depth

### What Roles Actually Are

A **role** is a label that grants permissions. Think of roles as keys that unlock specific capabilities:

- **Forum Manager** role → Can moderate forum, manage categories, review flags
- **Pool Creator** role → Can create resource pools
- **Dispute Handler** role → Can mediate conflicts

Roles are **not status symbols**. They're functional—they exist to enable specific work.

### The Two Paths to Roles

Communities has a unique **dual-path system**. For most roles, there are two ways to get them:

#### Path 1: Admin Assignment (Regular Roles)
An admin explicitly grants you the role through the member management interface.

**Example:** Admin makes Alice a "Forum Manager"
- Admin action: Check the "Forum Manager" box in Alice's role settings
- Result: Alice gains the `forum_manager` role
- Permission unlocked: `can_manage_forum`

**Use cases:**
- Grant temporary responsibilities
- Recognize someone who's trusted but below the trust threshold
- Emergency access needs
- Test whether someone can handle a responsibility

#### Path 2: Trust Achievement (Trust Roles)
You automatically receive the role when your trust reaches the configured threshold.

**Example:** Bob reaches 30 trust in a community where `minTrustForForumModeration = 30`
- Automatic action: System grants Bob the `trust_forum_manager` role
- Result: Bob gains forum moderation permissions
- No admin intervention needed

**Use cases:**
- Democratic access progression
- Transparent permission granting
- Scalable as community grows
- Reduces admin bottleneck

**Both paths grant the same permission.** Alice (admin-assigned) and Bob (trust-earned) both have `can_manage_forum`. The system doesn't care how they got it.

### Role Categories

Roles are organized by the capabilities they grant:

#### Viewer Roles
**Purpose**: Read-only access to features

- `trust_viewer` / `trust_trust_viewer` → Can view trust information
- `wealth_viewer` / `trust_wealth_viewer` → Can view wealth shares
- `forum_viewer` / `trust_forum_viewer` → Can read forum
- `analytics_viewer` / `trust_analytics_viewer` → Can view analytics

**Use case**: Gating access to sensitive content. A privacy-focused community might make the forum members-only by requiring the `forum_viewer` role.

#### Action Roles
**Purpose**: Perform specific operations

- `trust_granter` / `trust_trust_granter` → Can award trust
- `wealth_creator` / `trust_wealth_creator` → Can publish wealth
- `poll_creator` / `trust_poll_creator` → Can create polls
- `thread_creator` / `trust_thread_creator` → Can create forum threads
- `pool_creator` / `trust_pool_creator` → Can create pools
- `council_creator` / `trust_council_creator` → Can create councils

**Use case**: Unlocking participation. As you build trust, you can contribute more to the community.

#### Manager Roles
**Purpose**: Full control over specific features

- `forum_manager` / `trust_forum_manager` → Full forum moderation
- `item_manager` / `trust_item_manager` → Manage community items
- Council Manager (special, see below) → Manage specific council

**Use case**: Handling moderation and curation work. These roles come with significant responsibility.

#### Handler Roles
**Purpose**: Specialized community work

- `dispute_handler` / `trust_dispute_handler` → Mediate conflicts
- `content_flagger` / `trust_content_flagger` → Flag inappropriate content
- `flag_reviewer` / `trust_flag_reviewer` → Review flagged content

**Use case**: Community maintenance and conflict resolution.

### Special Role: Council Manager

**Council Manager** is different from other roles:

- **Scope**: Per-council, not community-wide
- **Assignment**: Admin assigns you to manage a *specific* council
- **Capabilities**: Manage that council's resources, members, reports, and initiatives
- **Multiple**: You can manage multiple councils (each assignment is separate)

**Example:**
- Alice manages the "Food Council"
- Bob manages the "Tool Library Council"
- Carol manages both

Neither Alice nor Bob can manage each other's councils. Council Manager is scoped.

**Note:** *Creating* a new council requires either admin or reaching the trust threshold (default: 25). But *managing* an existing council is assigned per-council.

## Role Assignment in Practice

### For Admins: When to Assign Roles

**Use admin-assigned roles when:**
- Member is reliable but slightly below trust threshold (close call)
- Temporary responsibility (event coordination, short-term moderation)
- Testing if member can handle the role before they earn it via trust
- Emergency need (crisis requires immediate access)
- Member has off-platform credibility not yet reflected in trust

**Avoid admin-assigned roles when:**
- You're bypassing trust requirements for friends (creates perception of unfairness)
- Member is far below trust threshold (wait for trust to build)
- It would become the norm (undermines trust-based model)
- You're avoiding conflict about trust (have the conversation instead)

**Best practice:** Use admin-assigned roles sparingly. Let the trust system do most of the work. When you do assign roles, communicate transparently about why.

### For Members: Understanding Your Roles

Check your profile to see:
- **Base role**: Member or Admin
- **Feature roles**: List of all your role assignments
- **Trust-based roles**: Which roles you've earned through trust (shown with trust score)
- **Admin-assigned roles**: Which roles were explicitly granted

This transparency helps you understand your permissions and see progression paths.

### Role Removal

**Admin-assigned roles** can be revoked:
- Admin removes the role assignment
- You immediately lose the associated permission
- Useful for ending temporary assignments or addressing misuse

**Trust-based roles** cannot be directly revoked:
- To remove a trust-based role, trust must drop below threshold
- This happens when members remove their trust awards
- Or when the community raises the trust threshold for that role

This asymmetry is intentional. Admin grants should be reversible. Trust-earned access should reflect current trust reality.

## Role Transitions and Progression

### Typical Member Journey

**Week 1 (New Member, Trust: 0):**
- Join via invite link
- Can view community (depending on configuration)
- Can participate in forums if threshold is 0
- Cannot share wealth, create polls, or award trust
- Building initial relationships

**Month 1 (Known Member, Trust: 12):**
- Several members have awarded trust
- Can now share wealth (threshold: 10)
- Can create forum threads (threshold: 10)
- Starting to contribute resources and ideas
- Trust network expanding

**Month 3 (Trusted Member, Trust: 28):**
- Active participant with established relationships
- Can award trust to others (threshold: 15)
- Can create polls (threshold: 15)
- Can create councils (threshold: 25)
- Taking on leadership in specific areas

**Month 6 (Advanced Member, Trust: 45):**
- Highly connected, trusted for reliability
- Can moderate forum (threshold: 30) if needed
- May be managing one or more councils
- Active in dispute resolution
- Contributing to community governance

**Year 1+ (Community Expert, Trust: 100+):**
- Long-term, deeply trusted member
- All permissions unlocked
- Often mentoring newer members
- May have some admin-assigned roles for specific work
- Core part of community fabric

This is a **typical** journey, not a prescribed one. Some members build trust faster, some slower. Some reach plateaus. Some leave and return. All paths are valid.

### Non-Linear Progression

Not everyone wants maximum trust or all permissions. Some members:
- **Participate casually**: Comfortable at 10-15 trust, just sharing resources
- **Specialize**: Focus on one area (e.g., forum participation) without pursuing others
- **Observe**: Maintain low trust intentionally, preferring to watch rather than lead
- **Cycle**: Build trust, step back, return, rebuild

The system accommodates all these patterns. High trust is not "better"—it's just different participation.

### Trust Fluctuation

Trust scores **can decrease**:
- Members remove their trust awards
- You become less active and relationships fade
- You handle a conflict poorly
- You break commitments

If your trust drops below a threshold, you lose the associated role and permissions. This is not punishment—it's the system reflecting current reality.

**How to respond to trust loss:**
1. Reflect on what changed
2. Communicate with the community if appropriate
3. Rebuild through reliable participation
4. Accept that trust must be maintained, not just earned once

## Hybrid Member Types

### Council Managers
You're both a regular member (with your own trust score and roles) AND a manager of one or more councils.

**Example:** Alice, Trust Score 35
- Regular roles: Can create threads, polls, councils
- Council Manager for: Food Council, Garden Council
- Can share wealth on behalf of both councils
- Creates usage reports for council activities
- Manages council membership and initiatives

Her regular member permissions and council manager permissions coexist.

### Admin Who's Also a Regular Member

Admins don't bypass the trust system—they participate in it:

**Example:** Bob is Admin, Trust Score 52
- Admin powers: Full community management
- Trust-based roles: Has forum manager, pool creator, etc. via trust
- Community engagement: Awards and receives trust like any member

Being admin doesn't mean "I have infinite trust." It means "I have admin responsibilities." Bob's trust score reflects his relationships, separate from his admin authority.

**Best practice for admins:** Build trust alongside your admin work. Don't rely solely on admin powers. Model the trust-building you want to see.

## Role Visibility and Transparency

### What You Can See
- Your own roles (admin-assigned and trust-based)
- Your current trust score and title
- What permissions each role grants
- Trust threshold requirements for each role
- History of role assignments (in audit logs for admins)

### What Others Can See
Depending on community configuration:
- Your trust score and title (usually visible)
- Which roles you hold (may be visible)
- Your trust history (may be visible to admins only)

This visibility creates accountability—members can see who has which permissions and why.

## Roles and Community Culture

### High-Trust Communities (Lower Thresholds)
- More members reach action and manager roles quickly
- Distributed leadership and responsibility
- Faster moving, more experimental
- Requires strong culture and conflict resolution

**Role configuration example:**
- Forum Manager: 20 trust (vs. default 30)
- Pool Creator: 15 trust (vs. default 20)
- Council Creator: 20 trust (vs. default 25)

### Cautious Communities (Higher Thresholds)
- Fewer members have advanced roles
- More concentrated leadership
- Slower to change, more stable
- Less risk of disruption

**Role configuration example:**
- Forum Manager: 40 trust (vs. default 30)
- Pool Creator: 30 trust (vs. default 20)
- Council Creator: 40 trust (vs. default 25)

### Viewer-Gated Communities (Privacy-Focused)
- Even viewing requires roles
- New members observe before participating
- Tight-knit, private community feel

**Role configuration example:**
- Forum Viewer: 5 trust (must be trusted to read)
- Wealth Viewer: 10 trust (must be trusted to see shares)
- Analytics Viewer: 15 trust (health data is semi-private)

Your threshold configuration **encodes your values**. There's no single "correct" configuration—it depends on your community's context and needs.

## Common Role Questions

### "Why can't I do X?"
Check:
1. What's your current trust score?
2. What's the trust threshold for X in your community?
3. Do you need an admin-assigned role?
4. Is the feature gated behind a viewer role you don't have?

### "Why did my permissions change?"
Reasons:
1. Your trust score changed (awards or removals)
2. Community adjusted trust thresholds
3. Admin revoked an assigned role
4. Temporary role assignment expired (if implemented)

### "How do I get role X?"
Two paths:
1. **Build trust:** Participate reliably, contribute, build relationships until you reach the threshold
2. **Ask admin:** Explain why you need the role and ask for admin assignment (they may say yes, no, or "build more trust first")

### "Can I decline a role?"
Currently not implemented, but this is a reasonable future feature. For now:
- Admin-assigned: Ask admin to remove the role
- Trust-based: No way to decline (it's automatic), but you can choose not to use the permissions

### "Do roles expire?"
Currently:
- Admin-assigned: No expiration (stays until revoked)
- Trust-based: No expiration, but lost if trust drops

Future versions may implement:
- Time-limited role assignments
- Periodic review/renewal
- Activity-based role retention

## Roles as Service, Not Status

The healthiest communities treat roles as **responsibilities, not rewards**:

- **Forum Manager** = "I'm handling moderation work" (not "I'm important")
- **Council Manager** = "I'm coordinating this domain" (not "I'm in charge")
- **Dispute Handler** = "I'm mediating conflicts" (not "I'm a judge")

When roles become status symbols, communities develop unhealthy dynamics:
- Members seek roles for prestige rather than to contribute
- Role holders defend territory instead of serving community
- Members without roles feel disempowered

**Practices that help:**
- Rotate council managers periodically
- Share dispute handling among multiple members
- Create opportunities for members to contribute without formal roles
- Recognize contribution publicly, separate from role assignment
- Frame roles as work, not achievement

## Becoming a Council Manager

Since council management is a common aspiration, here's the typical path:

### Option 1: Create Your Own Council
1. Reach trust threshold for council creation (default: 25)
2. Identify a domain needing coordination (food, tools, education, etc.)
3. Create the council through the UI
4. You're automatically the first council manager

### Option 2: Join an Existing Council
1. Participate in the council's domain (contribute to initiatives, engage in discussions)
2. Build relationships with current council managers
3. Ask to be added as a manager, or be invited
4. Current managers or admins can add you

### Option 3: Admin Assignment
1. Admin recognizes your contribution in a domain
2. Admin assigns you as manager of relevant council
3. You begin managing that council

**Being a council manager means:**
- Managing council resources transparently
- Writing usage reports with evidence
- Coordinating with community members
- Creating initiatives that serve community needs
- Being accountable to community trust

It's meaningful work, not just a title.

## Role Design Principles

Understanding why the role system works this way:

### Additive, Not Hierarchical
Roles stack—you can have many simultaneously. This creates **breadth** of contribution rather than **hierarchy** of status.

### Permission-Based, Not Role-Checked
Application code checks permissions (`can_manage_forum`), never roles directly. This means the path to the permission doesn't matter—trust-based and admin-assigned are treated identically.

### Transparent, Not Hidden
All role assignments are visible (to appropriate audiences). This prevents "shadow hierarchies" and makes power visible.

### Earned and Granted, Not Bought or Born
You cannot pay for roles. They come through contribution (trust) or explicit recognition (admin). This keeps the system gift-based rather than transactional.

### Revocable, Not Permanent
Both admin-assigned and trust-based roles can be lost. This creates accountability—permissions must be maintained through ongoing trustworthiness.

---

**Related Concepts:**
- [Communities](./communities.md) - Understanding community structure
- [Trust System](./trust-system.md) - How trust scores work
- [Permissions](./permissions.md) - How roles grant capabilities
