# Configuring Community Settings

This guide explains all configuration options available to community administrators.

## Overview

Community settings control how your community operates. This guide covers:

- General community settings
- Trust threshold configuration
- Forum settings
- Value recognition settings
- Feature toggles
- Privacy and visibility options

## Accessing Settings

1. Navigate to your community
2. Click "Settings" (admin-only tab)
3. You'll see four main tabs:
   - **General**: Basic community information
   - **Trust Thresholds**: Access control configuration
   - **Contributions**: Value recognition system settings
   - **Feature Flags**: Enable/disable features

## General Settings

### Community Name and Description

**Community Name**
- Displayed throughout the platform
- Keep it clear and memorable
- Can be changed anytime

**Description**
- Explains your community's purpose and values
- Shown to potential members
- Supports basic text formatting
- Recommended: 2-4 sentences explaining what the community is about

**Example**:
```
Name: River Valley Mutual Aid
Description: A community dedicated to sharing resources, skills, and support among neighbors in the River Valley area. We practice gift economy principles and build resilience through cooperation.
```

## Trust Threshold Configuration

Trust thresholds determine what trust score members need to perform various actions. See the [Trust Thresholds Guide](./trust-thresholds.md) for detailed explanations.

### Threshold Types

Each threshold can be set as:
1. **Number**: Specific trust score (e.g., 15)
2. **Level**: Named trust level (e.g., "Trusted Member")

**Using Numbers**:
- Direct and simple
- Easy to understand
- Fixed value

**Using Levels**:
- More meaningful to members
- Can adjust level thresholds without changing feature access
- Better for communication

**Recommendation**: Use levels for main features, numbers for fine-tuning.

### Viewer Access Thresholds

Control who can **view** different features:

**View Trust** (default: 0)
- Who can see trust scores and relationships
- Set higher for privacy-focused communities
- Set to 0 for full transparency

**View Wealth** (default: 0)
- Who can see shared resources
- Raising this creates more privacy around sharing
- Consider 5-10 for selective visibility

**View Needs** (default: 0)
- Who can see community needs
- Usually low to encourage need awareness
- Raise if needs should be limited to active members

**View Pools** (default: 0)
- Who can see resource pools
- Usually accessible to all members
- Raise for specialized pools

**View Councils** (default: 0)
- Who can see council information
- Raise for councils that need privacy
- 0 for full transparency

**View Forum** (default: 0)
- Who can read forum posts
- Usually 0 (all members can read)
- Raise to create more exclusive discussions

**View Items** (default: 0)
- Who can see the item catalog
- Usually 0 for all members
- Rarely needs restriction

**View Polls** (default: 0)
- Who can see community polls
- Usually 0 for democratic participation
- Raise for leadership-only polls

### Action Thresholds

Control who can **perform actions**:

**Award Trust** (default: 15)
- Minimum trust to award trust to others
- Critical threshold - prevents manipulation
- Range: 10-20 for most communities
- Higher = slower trust growth but more protection

**Access Wealth** (default: 10)
- Minimum trust to share resources publicly
- Balance accessibility vs. quality control
- Range: 5-15 for most communities
- Lower = easier participation, higher = more vetted sharers

**Publish Needs** (default: 5)
- Minimum trust to express needs publicly
- Usually low to encourage open need expression
- Range: 0-10
- Lower threshold than wealth sharing intentionally

**Create Threads** (default: 10)
- Minimum trust to create forum threads
- Prevents spam while allowing participation
- Range: 5-15 for most communities

**Upload Attachments** (default: 15)
- Minimum trust to upload images/files
- Higher to prevent abuse
- Range: 10-20

**Flag Content** (default: 15)
- Minimum trust to flag forum posts
- Prevents flag abuse
- Range: 10-20

**Review Flags** (default: 30)
- Minimum trust to moderate flagged content
- High threshold for moderation responsibility
- Range: 25-40

**Create Polls** (default: 15)
- Minimum trust to create community polls
- Balance participation vs. quality
- Range: 10-20

**Create Pools** (default: 20)
- Minimum trust to create resource pools
- Higher because pools involve coordination
- Range: 15-25

**Create Councils** (default: 25)
- Minimum trust to create councils
- High because councils are significant entities
- Range: 20-30

**Full Forum Moderation** (default: 30)
- Minimum trust for complete moderation powers
- Very high for significant responsibility
- Range: 25-40

**View Health Analytics** (default: 20)
- Minimum trust to see community health metrics
- Balance transparency vs. privacy
- Range: 15-25 for member access, 0 for full transparency

### How to Adjust Thresholds

1. Go to Settings > Trust Thresholds tab
2. For each threshold:
   - Select "Number" or "Level" type
   - Choose the value or level
3. Click "Update Community" to save

**When to adjust**:
- Community feels too restrictive: Lower thresholds
- Too much spam/low quality: Raise thresholds
- Trust growing slowly: Lower "Award Trust" threshold
- Trust growing too fast: Raise "Award Trust" threshold

## Feature Flags

Enable or disable entire features for your community.

### Pools (default: enabled)

**What it is**: Resource aggregation for community initiatives

**Enable if**:
- Your community runs projects requiring pooled resources
- You want collective resource management
- You have councils or working groups

**Disable if**:
- You're starting small and pools add complexity
- Direct sharing meets all needs
- You want to simplify member experience

### Needs System (default: enabled)

**What it is**: Members express resource needs, community coordinates fulfillment

**Enable if**:
- Resource planning is important
- You want visibility into community needs
- You coordinate resource gathering

**Disable if**:
- Needs are expressed through other channels
- You prefer informal coordination
- System adds unwanted complexity

### Polls (default: enabled)

**What it is**: Community voting and decision-making

**Enable if**:
- You make collective decisions
- You want member input on questions
- Democratic processes are important

**Disable if**:
- Decisions are made through other means
- You prefer consensus discussion over voting
- Starting small and adding later

### Councils (default: enabled)

**What it is**: Specialized working groups within the community

**Enable if**:
- Your community has sub-groups or committees
- You need specialized resource management
- You have multiple focus areas

**Disable if**:
- Your community is small and informal
- Single group meets all needs
- Adding complexity you don't need yet

### Forum (default: enabled)

**What it is**: Community discussion platform

**Enable if**:
- You want structured discussions
- Members need a place for conversation
- You want documented community knowledge

**Disable if**:
- You use external chat/discussion platforms
- Community doesn't need this feature
- (Rarely recommended to disable)

### Health Analytics (default: enabled)

**What it is**: Community health metrics and statistics

**Enable if**:
- You want insight into community patterns
- You monitor participation and engagement
- Data helps inform decisions

**Disable if**:
- Privacy concerns outweigh benefits
- You prefer informal observation
- Data tracking feels inappropriate

### Disputes (default: enabled)

**What it is**: Formal conflict resolution system

**Enable if**:
- You want structured mediation
- Conflicts need documentation
- Formal processes build trust

**Disable if**:
- Conflicts resolved informally
- Community too small to need formal system
- Adding later when needed

### Contributions (Value Recognition) (default: enabled)

**What it is**: Track and recognize member contributions

**Enable if**:
- You want to make invisible work visible
- Recognition motivates participation
- You track community value creation

**Disable if**:
- Tracking feels transactional
- Gift economy is purely implicit
- Privacy concerns about tracking

## Value Recognition Settings

If you've enabled the value recognition system, configure these settings:

### Enable Value Recognition (default: enabled)

Master switch for the entire system.

### Auto-verify System Actions (default: enabled)

**What it does**: Automatically marks contributions as verified when they come from system-tracked actions (like wealth fulfillment)

**Enable**: For smooth operation, less admin work
**Disable**: If you want manual review of all contributions

### Allow Peer Recognition Grants (default: enabled)

**What it does**: Members can grant recognition value to others for contributions they witnessed

**Enable**: For flexibility in recognizing informal contributions
**Disable**: If you want stricter verification requirements

### Peer Grant Limits

**Monthly Limit** (default: 20 value units)
- How many value units each member can grant per month
- Prevents unlimited granting
- Range: 10-50 depending on community size

**Same Person Limit** (default: 3 times)
- Maximum grants to same person per month
- Prevents favoritism or collusion
- Range: 2-5

### Require Verification (default: enabled)

**What it does**: Contributions need verification from beneficiaries or witnesses

**Enable**: For accuracy and accountability
**Disable**: For trust-based system without verification

**Note**: May be simplified in future versions as system auto-verifies more actions.

### Allow Council Verification (default: enabled)

**What it does**: Council members can verify contributions related to their work

**Enable**: For efficient verification of council-related work
**Disable**: If you prefer individual verification only

### Show Aggregate Statistics (default: enabled)

**What it does**: Display community-wide contribution statistics

**Enable**: For transparency and pattern awareness
**Disable**: For more privacy around contributions

### Verification Reminder Days (default: 7)

**What it does**: How long to wait before reminding people to verify contributions

**Range**: 3-14 days
- Shorter: Faster verification but more notifications
- Longer: Less pressure but slower verification

## Privacy and Visibility Settings

### Trust Visibility

**Considerations**:
- Full transparency (trust scores visible to all) builds accountability
- Partial privacy (scores hidden from low-trust members) reduces gaming
- High privacy (scores only visible to high-trust members) protects vulnerable members

**Recommendation**: Start with full transparency, adjust if problems emerge.

### Contribution Visibility

**Considerations**:
- Public contributions encourage participation
- Private contributions respect member privacy
- Balance recognition benefits vs. privacy concerns

**Settings**: Individual members can set their own contribution visibility in their profile.

## Configuration Best Practices

### Start Conservative, Relax Over Time

**Why**: Easier to lower barriers than raise them
**How**:
- Set moderate-to-high thresholds initially
- Monitor community health
- Lower gradually as community stabilizes

### Use Defaults as Baseline

**Why**: Defaults are tested across communities
**How**:
- Start with defaults
- Adjust only when you see specific problems
- Document why you changed each setting

### Communicate Changes

**Why**: Members need to understand access changes
**How**:
- Announce setting changes in forum
- Explain reasoning
- Give notice before restricting access

### Review Settings Quarterly

**Why**: Communities evolve, settings should too
**How**:
- Schedule quarterly review
- Check if thresholds match current community
- Gather member feedback
- Adjust as needed

### Match Settings to Values

**Why**: Settings encode community values
**How**:
- High trust in members = lower thresholds
- Privacy priority = higher viewer thresholds
- Democratic participation = low poll/forum thresholds
- Quality control = higher action thresholds

## Common Configuration Patterns

### Open and Trusting Community

```
Award Trust: 10
Access Wealth: 5
Create Threads: 5
Create Pools: 15
Create Councils: 20

Philosophy: Low barriers, trust members, address problems as they arise
Best for: Small, tight-knit communities with known members
```

### Balanced Community (Recommended)

```
Award Trust: 15
Access Wealth: 10
Create Threads: 10
Create Pools: 20
Create Councils: 25

Philosophy: Moderate barriers, earn trust through participation
Best for: Most communities, good starting point
```

### Protected Community

```
Award Trust: 20
Access Wealth: 15
Create Threads: 15
Create Pools: 25
Create Councils: 30

Philosophy: Higher barriers, careful integration, strong protection
Best for: Communities with past issues, high-stakes resources, vulnerability
```

### Large Public Community

```
Award Trust: 20
Access Wealth: 15
Create Threads: 5
Create Pools: 30
Create Councils: 40

Philosophy: Easy to read and discuss, harder to access resources and create structure
Best for: Large communities with mixed trust levels
```

## Troubleshooting Common Issues

### Members Can't Participate

**Symptoms**: Members join but can't do anything

**Causes**:
- Thresholds too high
- Forgot to bootstrap trust
- Features disabled

**Solutions**:
- Lower thresholds
- Grant admin trust to new members
- Enable features
- Check member's actual trust score

### Too Much Low-Quality Content

**Symptoms**: Spam, inappropriate posts, poor-quality shares

**Causes**:
- Thresholds too low
- Insufficient moderation
- No community norms

**Solutions**:
- Raise relevant thresholds
- Assign forum managers
- Document community guidelines
- Address specific members

### Trust Not Growing

**Symptoms**: Members stuck at low trust, can't access features

**Causes**:
- "Award Trust" threshold too high
- Members don't know how to award trust
- Inactive founding members

**Solutions**:
- Lower "Award Trust" threshold to 10-12
- Create guide on awarding trust
- Grant admin trust to active members
- Encourage existing trusted members to award trust

### Feature Confusion

**Symptoms**: Members don't understand what features do

**Causes**:
- Too many features enabled at once
- Inadequate onboarding
- Complex configuration

**Solutions**:
- Disable unused features
- Create simple guides
- Start with basic features, add gradually
- Improve member onboarding

## Next Steps

- **Learn**: [Trust Thresholds Guide](./trust-thresholds.md) - Deep dive into trust threshold philosophy
- **Apply**: [Managing Members](./managing-members.md) - Put settings into practice
- **Monitor**: [Analytics & Health](./analytics-health.md) - Track how settings affect community health
- **Moderate**: [Moderation Guide](./moderation.md) - Enforce community standards

## Summary

Community settings are powerful tools for shaping behavior and culture. Key principles:

1. **Start conservative**: Easier to relax than restrict
2. **Use defaults**: They're tested and balanced
3. **Communicate changes**: Members deserve to know why
4. **Review regularly**: Communities evolve, settings should too
5. **Match values**: Settings should reflect community principles
6. **Monitor impact**: Watch how changes affect participation

Remember: Settings are tools, not solutions. Healthy community culture comes from engaged members and good norms, not just configuration.
