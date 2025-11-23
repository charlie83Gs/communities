# Understanding Trust

Trust is the foundation of Communities's permission system. This guide explains how trust works and why it matters.

## What is Trust?

In Communities, **trust** replaces traditional hierarchical permissions. Instead of only admins granting access:

- **Community members award trust** to people they trust
- **Your trust score** = number of members who trust you
- **Higher trust unlocks permissions** automatically

## Why Trust Matters

Trust enables:

- **Decentralized Governance**: Community validates members, not just admins
- **Earned Permissions**: Prove yourself through participation
- **Accountability**: Lose permissions if trust is removed
- **Community Safety**: Trusted members have more capabilities

## How Trust Works

### Trust Score

Your trust score is simple:

```
Trust Score = Number of Members Who Trust You
```

**Example**: If 17 community members have awarded you trust, your score is 17.

### Trust Levels

Communities configure trust levels with titles:

| Trust Level | Default Title | Typical Score |
|-------------|---------------|---------------|
| Level 0 | New Member | 0-9 |
| Level 1 | Known Member | 10-24 |
| Level 2 | Trusted Member | 25-49 |
| Level 3 | Advanced Member | 50-99 |
| Level 4 | Community Expert | 100-199 |
| Level 5 | Community Benefactor | 200+ |

!!! note "Community Customization"
    Communities can customize level names and thresholds to match their values.

### Trust Thresholds

Different actions require minimum trust:

| Action | Default Threshold |
|--------|-------------------|
| Award trust to others | 15 |
| Share wealth/resources | 10 |
| Create polls | 15 |
| Create forum threads | 10 |
| Create councils | 25 |
| Moderate forum | 30 |
| View disputes | 20 |

!!! tip "Check Your Permissions"
    Your profile shows which permissions you've unlocked at your current trust level.

## Gaining Trust

### Ways to Earn Trust

Members typically award trust when you:

1. **Participate Actively**: Contribute to discussions and decisions
2. **Share Resources**: Help others with what you have
3. **Fulfill Requests**: Deliver on commitments
4. **Show Up Consistently**: Build relationships over time
5. **Align with Values**: Demonstrate community principles
6. **Help Others Succeed**: Support fellow members

### Requesting Trust

You cannot directly request trust awards. Instead:

- **Engage authentically** in community life
- **Ask for feedback** on how to be more helpful
- **Offer your skills** where they're needed
- **Be patient** - trust builds over time

### Admin-Granted Trust

Community admins can bootstrap trust:

- **Purpose**: Help new communities get started
- **Auditable**: All admin grants are tracked
- **Temporary**: Should transition to peer trust over time
- **Transparent**: Members can see admin-granted trust

!!! warning "Admin Trust Should Be Rare"
    Over-reliance on admin grants undermines the trust system. Use sparingly.

## Losing Trust

### Trust Removal

Members can **remove trust** they previously awarded:

- **Immediate effect**: Your score decreases instantly
- **Automatic permission loss**: May lose access to features
- **No explanation required**: Members decide autonomously
- **Fully tracked**: All changes are auditable

### Why Trust Gets Removed

Common reasons:

- Broke commitments (unfulfilled requests)
- Violated community agreements
- Harmful behavior
- Inactivity (member left or stopped participating)
- Changed relationship or perspective

### Rebuilding Trust

If you lose trust:

1. **Reflect**: Understand what happened
2. **Communicate**: Talk with community members
3. **Make amends**: Address harm if you caused it
4. **Demonstrate change**: Show new patterns
5. **Be patient**: Rebuilding takes time

## Trust and Permissions

### Two Permission Paths

Communities uses **dual permissions**:

1. **Role-Based**: Admin assigns roles (admin, member, moderator)
2. **Trust-Based**: Automatic based on trust score

You get access if you meet **either** criteria.

**Example**:
- Creating councils requires trust score ≥ 25 **OR** admin role
- You can create councils at trust score 15 if an admin grants you the admin role

### Hybrid Approach Benefits

This dual system:

- **Bootstraps new communities**: Admins can assign roles initially
- **Scales to peer governance**: Trust-based access takes over
- **Handles edge cases**: Manual role assignment when needed
- **Prevents single points of failure**: Multiple paths to permissions

## Trust Anti-Patterns

### What NOT to Do

❌ **Trust trading**: "I'll trust you if you trust me"

- Creates hollow trust without genuine relationships
- Undermines community safety

❌ **Gaming the system**: Artificial score inflation

- Communities notice and remove trust
- Damages your reputation

❌ **Demanding trust**: "Why don't people trust me?"

- Trust is earned, not owed
- Pressure creates resentment

❌ **Trust hoarding**: Never removing trust

- Keep trust awards current with relationships
- Outdated trust misleads the community

### Best Practices

✅ **Award trust honestly**: Only trust people you actually trust

✅ **Remove trust when appropriate**: Keep the system accurate

✅ **Communicate expectations**: Help new members understand norms

✅ **Focus on contribution**: Trust follows authentic participation

✅ **Be patient**: Meaningful trust builds slowly

## Trust Visibility

### What You Can See

- **Your own trust score** in each community
- **Who has trusted you** (optional, based on community settings)
- **Trust thresholds** for different permissions
- **Community trust levels** and titles

### What's Private

Depending on community settings:

- Who specific members trust (may be private)
- Exact trust scores of others (may show levels only)
- Trust history details (may be admin-only)

## Trust Across Communities

### Independent Trust

Trust is **community-specific**:

- Score in Community A doesn't affect Community B
- Each community has different norms and thresholds
- You might be highly trusted in one, new in another

### Why Separate Trust?

- **Different contexts**: Work community vs. neighborhood
- **Different values**: Each community defines trust differently
- **Local knowledge**: Trust is based on direct experience
- **Community autonomy**: Each group governs itself

## Advanced Trust Features

### Council Trust

Councils have their own trust system:

- **Council members award internal trust**
- **Separate from community trust**
- **Unlocks council-specific permissions**
- **Tracks council-level reputation**

### Trust Analytics

Community admins can view:

- Trust distribution graphs
- Trust velocity (rate of change)
- New member onboarding metrics
- Trust network visualization

## Common Questions

### "How much trust do I need?"

Check your community's trust thresholds in **Community Settings**. Focus on participating authentically rather than chasing numbers.

### "Why was my trust removed?"

Trust removal is autonomous. If concerned, you can:

- Ask trusted community members for feedback
- Reflect on recent interactions
- Request mediation if there's conflict

### "Can I see who trusts me?"

This depends on community privacy settings. Some communities show trust relationships, others keep them private.

### "What if I don't gain trust?"

- Participate more actively
- Ask how you can be more helpful
- Give it time - trust builds slowly
- Consider if this community is the right fit

## Next Steps

Now that you understand trust:

1. [**Award Trust**](../guides/award-trust.md) - Learn to trust others
2. [**Share Resources**](../guides/share-resources.md) - Build trust through contribution
3. [**Join a Council**](../guides/join-council.md) - Participate in governance

## Related Topics

- [Permissions System](../concepts/permissions.md)
- [Trust Thresholds Configuration](../admin/trust-thresholds.md)
- [Members & Roles](../concepts/members-roles.md)
