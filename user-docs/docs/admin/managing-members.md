# Managing Community Members

This guide covers all aspects of member management for community administrators.

## Overview

As an admin, you're responsible for:
- Adding and removing members
- Assigning roles and permissions
- Granting and reviewing admin trust
- Handling member conflicts
- Maintaining healthy community dynamics

## Viewing the Member List

### Accessing Member Management

1. Navigate to your community
2. Click the "Members" tab
3. You'll see a sortable, searchable list of all members

### Member Information Displayed

For each member, you can see:
- **Display name** and profile image
- **Email** (if visible)
- **Current roles** assigned
- **Trust score** (total peer trust + admin trust)
- **Trust breakdown** (hover over score)
- **Skills badges** (if skills system enabled)
- **Actions** available

### Sorting and Searching

**Sort by**:
- Name (alphabetical)
- Trust score (highest to lowest)
- Peer awards only (member-granted trust)

**Search**:
- Filter by name or email
- Type in search box, results update automatically

**Filter**:
- "Needs Recertification" checkbox shows members whose trust endorsements are decaying

## Trust Management

### Understanding Trust Display

Each member's trust score shows:
- **Total**: Overall trust score
- **Breakdown** (hover): Peer awards + Admin grant = Total
- **Trust level**: Named title based on score (e.g., "Trusted Member")

Example: `15 peer + 10 admin = 25 total (Trusted Member)`

### Awarding Trust to Members

As an admin, you can award trust through:

#### Awarding Personal Trust

Like any member (if you have sufficient trust):
1. Find the member in the list
2. Click the thumbs-up icon next to their name
3. Icon turns green/filled when you've awarded trust
4. Click again to remove your trust

**This is peer trust, not admin trust**

#### Granting Admin Trust

To grant trust on behalf of the community (bootstrap):
1. Click the "edit" (pencil) icon next to member's name
2. In the member edit modal, you'll see admin trust field
3. Enter the amount of admin trust to grant (e.g., 15)
4. Click "Save"

**Admin trust is**:
- Visible in trust breakdown
- Separate from peer trust
- Reviewable by all admins
- Useful for bootstrapping new communities

### When to Grant Admin Trust

**Good reasons**:
- **Bootstrapping**: New community, need to seed trust
- **Integration**: Trusted person from outside community joins
- **Recovery**: Member lost trust due to technical issue
- **Recognition**: Acknowledge contributions not yet reflected in peer trust

**Poor reasons**:
- Bypassing peer validation permanently
- Creating privileged class
- Avoiding trust system entirely
- Personal favoritism

### How Much Admin Trust to Grant

**Conservative** (5-10 points):
- Small boost to help integration
- Most access still from peer trust

**Moderate** (10-20 points):
- Meaningful but not overwhelming
- Balanced with peer validation

**Liberal** (20-50 points):
- Significant immediate access
- Use for trusted founding members

**Recommendation**: 10-15 for most situations, 20-30 for founding members.

### Reviewing Admin Trust Grants

As your community matures:

1. Go to Members list
2. Sort by trust score
3. Click edit on members with admin trust
4. Review:
   - How much admin trust was granted?
   - By whom and when?
   - What's their peer trust now?
   - Is admin trust still needed?

**Consider reducing or removing admin trust when**:
- Peer trust has grown to similar level
- Community trust system is established
- Member is well-integrated

**Why**: Ensures community runs on peer validation, not admin authority.

### Trust Decay and Recertification

The system includes trust decay to ensure trust remains current:

**How it works**:
- Trust endorsements are time-limited (default: 18 months)
- After 12 months, endorsement enters "decay period"
- During decay, you're reminded to recertify or remove trust
- After 18 months, endorsement expires if not recertified

**Admin actions**:
1. Check "Needs Recertification" filter to see decaying trust
2. Members with decaying trust show orange warning icons
3. You can:
   - **Recertify**: Confirm trust is still valid (resets timer)
   - **Remove**: Remove your trust if relationship has changed

**Why decay exists**: Ensures trust reflects current relationships, not historical ones.

## Role Management

### Understanding Roles

**Base Role** (one per member):
- **Member**: Standard access
- **Admin**: Full community management access

**Feature Roles** (multiple possible):
Members can have roles like:
- Forum Manager (moderate forums)
- Pool Creator (create resource pools)
- Council Creator (create councils)
- Recognition Manager (manage value recognition)

**Trust Roles** (automatic):
- Members automatically gain trust-based roles when reaching thresholds
- Example: "Trust Forum Manager" granted at 30 trust
- These are automatic and shown in the UI

### Viewing Member Roles

In the members list:
- Roles are shown under each member's name
- Multiple roles displayed as badges
- Hover for role descriptions

### Assigning Roles

1. Find the member in the list
2. Click the "edit" (pencil) icon
3. In the member edit modal:
   - **Base Role**: Choose Member or Admin
   - **Feature Roles**: Expandable categories showing all available roles
4. Check/uncheck roles as needed
5. Click "Save"

### Feature Role Categories

**Trust Roles**:
- Trust Viewer: Can view trust information
- Trust Granter: Can award trust to others

**Wealth Roles**:
- Wealth Viewer: Can view shared resources
- Wealth Creator: Can share resources publicly

**Forum Roles**:
- Forum Viewer: Can read forums
- Forum Manager: Full moderation powers
- Thread Creator: Can create new threads
- Attachment Uploader: Can upload files
- Content Flagger: Can flag inappropriate content
- Flag Reviewer: Can review flagged content

**Poll Roles**:
- Poll Viewer: Can see polls
- Poll Creator: Can create polls

**Pool Roles**:
- Pool Viewer: Can view pools
- Pool Creator: Can create pools

**Council Roles**:
- Council Viewer: Can view councils
- Council Creator: Can create councils

**Other Roles**:
- Item Manager: Can manage item catalog
- Analytics Viewer: Can view health metrics
- Dispute Handler: Can mediate disputes

### When to Assign Roles vs. Rely on Trust

**Assign roles when**:
- Member needs immediate access for specific purpose
- Trust-based threshold is too high for their current trust
- Recognizing specific competency or responsibility
- Bootstrapping new feature usage

**Rely on trust when**:
- Natural integration is preferred
- Member will reach threshold soon
- Democratic access is important
- Avoiding privileged classes

**Hybrid approach** (recommended):
- Trust thresholds for most features
- Explicit roles for special cases or immediate needs
- Both paths lead to same permissions

## Inviting New Members

### Direct User Invites

To invite a specific person:

1. Go to Settings > Members (or Members > Invite)
2. Click "Invite Member"
3. Enter:
   - **Email** or **username** (if they have account)
   - **Personal message** (optional but recommended)
4. Click "Send Invite"

**What happens**:
- User receives invitation notification
- They can accept or decline
- If they accept, they join the community
- You're notified of their acceptance

**Best practices**:
- Include personal message explaining the community
- Explain what to expect
- Offer to help them get started
- Consider pre-granting admin trust if appropriate

### Invite Links

To invite multiple people or share publicly:

1. Go to Settings > Invites
2. Click "Create Invite Link"
3. Configure:
   - **Expiration date**: How long link is valid
   - **Description**: Note for yourself about this link
4. Click "Create Link"
5. Copy the generated link
6. Share via email, messaging, social media, etc.

**Security considerations**:
- Anyone with the link can join
- Set reasonable expiration (7-30 days typical)
- Can deactivate link anytime if needed
- Monitor who joins via link

**Use cases**:
- Sharing on social media
- Email to mailing list
- Onboarding waves of members
- Event-based invitations

### Managing Pending Invites

View and manage sent invites:

1. Go to Settings > Invites
2. See tabs for:
   - **Link Invites**: Active invite links
   - **Direct Invites**: Pending user invitations

**Actions available**:
- View invite status (pending, accepted, expired)
- Resend invite reminder
- Cancel/revoke invite
- Deactivate invite link

## Removing Members

### When to Remove Members

**Appropriate reasons**:
- Member requested to leave
- Repeated violations of community guidelines
- Extractive behavior after multiple conversations
- Trust has broken down irreparably
- Legal or safety concerns

**Inappropriate reasons**:
- Personal conflict without community process
- Single mistake or misunderstanding
- Political disagreement
- Member criticized admin

**Important**: Removal is serious. Use community process when possible.

### How to Remove a Member

1. Find member in members list
2. Click the "trash" icon (only visible to admins)
3. Confirm removal in dialog
4. Member is immediately removed

**What happens**:
- Member loses access to community
- Their content remains (posts, shared wealth, etc.)
- Their trust awards are removed
- They can be re-invited later if appropriate

### Before Removing: Have You...

- [ ] Had direct conversation with the member?
- [ ] Reviewed community guidelines together?
- [ ] Given specific feedback about issues?
- [ ] Consulted other admins or trusted members?
- [ ] Documented the pattern of problems?
- [ ] Considered temporary restriction instead?
- [ ] Offered mediation or conflict resolution?

**If no to multiple**: Consider addressing issue before removal.

### Alternatives to Removal

**Temporary measures**:
- Remove specific roles (e.g., remove Forum Manager role)
- Ask member to take break voluntarily
- Reduce admin trust while issues are addressed
- Implement conflict resolution process

**Long-term solutions**:
- Clear community guidelines
- Mediation process
- Restorative justice approach
- Graduated response system

## Handling Member Conflicts

### Types of Conflicts

**Interpersonal**:
- Arguments between members
- Personal disagreements
- Communication breakdown

**Behavioral**:
- Violation of community norms
- Disruptive behavior
- Quality issues (spam, low-effort)

**Systemic**:
- Disagreement about community direction
- Access/fairness concerns
- Trust system issues

### Admin Role in Conflicts

**Don't**:
- Take sides immediately
- Make unilateral decisions
- Ignore the issue
- React emotionally

**Do**:
- Listen to all parties
- Facilitate communication
- Enforce clear guidelines
- Involve other admins
- Document the process
- Follow community values

### Conflict Resolution Process

#### Step 1: Gather Information

- Talk to involved parties separately
- Review relevant posts, actions, history
- Consult other admins
- Check community guidelines

#### Step 2: Facilitate Dialog

- Bring parties together (if appropriate)
- Create safe space for communication
- Focus on behavior, not character
- Seek mutual understanding

#### Step 3: Find Solution

- Identify what would repair harm
- Define clear expectations going forward
- Document agreements
- Set follow-up check-in

#### Step 4: Follow Up

- Check in after 1-2 weeks
- Ensure agreements are kept
- Adjust if needed
- Celebrate resolution

### Using the Dispute System

If your community has the dispute resolution system enabled:

1. Navigate to Disputes section
2. Create formal dispute if needed
3. Assign mediators
4. Document process and resolution
5. Close dispute when resolved

**Benefits**:
- Structured process
- Clear documentation
- Transparent to community
- Builds dispute resolution capacity

## Common Member Management Scenarios

### Scenario: New Member Can't Participate

**Issue**: Member joined but complains they can't share wealth or create posts

**Diagnosis**:
- Check their trust score (likely 0)
- Check trust thresholds for features
- Check if features are enabled

**Solutions**:
1. Grant 10-15 admin trust to bootstrap participation
2. Explain how trust system works
3. Connect them with existing members who can award trust
4. Lower thresholds if too restrictive for new members

### Scenario: Member Accumulates Trust Too Quickly

**Issue**: New member has 30+ trust within days, seems suspicious

**Diagnosis**:
- Check who awarded trust (in trust breakdown)
- Look for coordinated granting
- Check if member has legitimate contributions

**Solutions**:
1. If legitimate: Celebrate engaged member
2. If suspicious: Talk to members who granted trust
3. If coordinated: Address as trust manipulation
4. Consider raising "Award Trust" threshold

### Scenario: Founding Member Becomes Inactive

**Issue**: Member with high admin trust stopped participating

**Diagnosis**:
- Confirm they're inactive (check last activity)
- Understand why (reach out personally)
- Determine if temporary or permanent

**Solutions**:
1. If temporary: Leave as-is, check back later
2. If permanent: Consider reducing admin trust
3. If gone entirely: May remove to keep active roster
4. If returning: Welcome back, restore trust if needed

### Scenario: Forum Manager Abusing Power

**Issue**: Forum manager deleting posts unfairly or suppressing dissent

**Diagnosis**:
- Review moderation log
- Talk to affected members
- Consult other admins
- Check community guidelines

**Solutions**:
1. Private conversation with forum manager
2. Clarify moderation guidelines
3. Require moderation transparency
4. Remove Forum Manager role if continues
5. Assign multiple moderators for accountability

### Scenario: Member Requests More Access

**Issue**: Member wants higher trust or role but doesn't meet threshold

**Diagnosis**:
- Check their current trust score
- Review their participation level
- Understand what they want to access
- Consider if request is reasonable

**Solutions**:
1. Explain trust system and how to earn trust
2. If reasonable: Grant small admin trust boost (5-10)
3. If role-appropriate: Assign specific role
4. If premature: Encourage patience and participation
5. If thresholds too high: Consider adjusting for all

## Best Practices

### Communication

- **Be transparent**: Explain decisions and reasoning
- **Be consistent**: Apply rules fairly to all members
- **Be responsive**: Address issues promptly
- **Be respectful**: Treat members with dignity

### Trust Management

- **Bootstrap thoughtfully**: Grant admin trust to seed community
- **Review regularly**: Reduce admin trust as peer trust grows
- **Document grants**: Note why admin trust was granted
- **Encourage peer trust**: Let members validate each other

### Role Assignment

- **Use sparingly**: Rely on trust-based access when possible
- **Be intentional**: Each role serves specific purpose
- **Be clear**: Explain roles and responsibilities
- **Be accountable**: Monitor role usage

### Conflict Resolution

- **Address early**: Don't let conflicts fester
- **Stay neutral**: Don't take sides without full information
- **Seek restoration**: Focus on repairing relationships
- **Document process**: Keep records of conflicts and resolutions

### Member Integration

- **Welcome warmly**: First impressions matter
- **Orient thoroughly**: Help members understand community
- **Connect socially**: Facilitate relationship building
- **Support growth**: Help members earn trust and participate

## Warning Signs to Watch For

### Individual Member Issues

- Consistent low-quality contributions
- Pattern of conflicts with multiple members
- Extractive behavior (all taking, no giving)
- Trust manipulation attempts
- Harassment or abuse

### Systemic Issues

- Trust not flowing to active contributors
- Cliques forming around trust granting
- New members can't integrate
- High member turnover
- Declining participation

### Admin Team Issues

- Admins disagree on major decisions
- Inconsistent enforcement of guidelines
- Admin burnout
- Lack of admin communication
- Power struggles

**If you see these**: Address promptly through admin team discussion and community processes.

## Tools and Resources

### Member Management Tools

**Built-in features**:
- Member list with sorting and filtering
- Trust breakdown display
- Role assignment interface
- Invite management
- Moderation tools

**External tools you might need**:
- Communication platform (for admin coordination)
- Document sharing (for policies, decisions)
- Calendar (for admin meetings)

### Documentation to Maintain

**Community guidelines**: Clear expectations for behavior
**Admin procedures**: How admins make decisions
**Onboarding guide**: How new members get started
**Trust policy**: When and how admin trust is granted
**Conflict resolution**: Process for handling disputes

## Getting Help

**When to consult other admins**:
- Major member issues
- Unclear situations
- Conflicts involving you personally
- Significant decisions

**When to involve the community**:
- Changes to guidelines or policies
- Difficult removal decisions
- Systemic issues
- Community direction questions

**When to escalate externally**:
- Legal concerns
- Safety issues
- Platform policy violations
- Technical problems

## Next Steps

- **Learn**: [Trust Thresholds](./trust-thresholds.md) - Understand trust configuration
- **Practice**: [Moderation](./moderation.md) - Enforce community standards
- **Monitor**: [Analytics & Health](./analytics-health.md) - Track community health
- **Plan**: [Creating Community](./creating-community.md) - Review bootstrap process

## Summary

Effective member management balances:

1. **Access and safety**: Welcome new members while protecting community
2. **Democracy and guidance**: Let trust emerge while bootstrapping when needed
3. **Flexibility and consistency**: Adapt to situations while applying fair standards
4. **Intervention and autonomy**: Step in when needed but let community self-organize

Remember: You're a steward, not a ruler. The goal is a healthy, self-governing community where your active management becomes less and less necessary over time.
