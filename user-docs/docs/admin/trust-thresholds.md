# Understanding and Configuring Trust Thresholds

This guide explains trust thresholds in depth and helps you configure them for your community.

## What Are Trust Thresholds?

Trust thresholds are the minimum trust scores required to perform different actions in your community. They're the primary way you balance accessibility with community protection.

## Core Philosophy

### Trust as Earned Access

Unlike traditional systems where admins grant permissions, this platform uses **peer-validated access**:

- Members earn trust from other members
- Trust score reflects community confidence
- Higher trust = more permissions and capabilities
- Trust thresholds ensure features remain accessible to trusted members

### Two Paths to Access

Members can gain access to features through:

**1. Trust-based access**: Automatically granted when trust score reaches threshold
**2. Role-based access**: Explicitly granted by admins

**Both paths** lead to the same permissions. This creates:
- **Democratic access** via trust (community validates)
- **Rapid access** via roles (admin decides)
- **Flexibility** for different situations

## Understanding Trust Scores

### How Trust Scores Work

A member's trust score comes from two sources:

**Peer Trust** (democratic):
- Each community member who trusts you = +1 point
- Example: 15 members trust you = 15 peer trust points
- Reflects actual community relationships
- Members can remove their trust anytime

**Admin Trust** (bootstrap):
- Manually granted by admins
- Used to seed new communities
- Visible and auditable
- Should decrease as peer trust grows

**Total Trust** = Peer Trust + Admin Trust

### Trust Is Not Reputation

**Trust is relational**, not transactional:
- It measures: "Do community members trust this person?"
- It does NOT measure: "How much have they contributed?"
- It's about: Relationship, reliability, integration
- It's NOT about: Value created, resources shared, activity level

**Why this matters**: Someone can contribute a lot but not be trusted (behavioral issues), or contribute little but be highly trusted (deep relationships).

### Trust Distribution in Healthy Communities

Typical trust distribution:
- **0-5**: New members, not yet integrated (30-40%)
- **5-15**: Establishing members, building relationships (25-35%)
- **15-30**: Trusted members, full participation (20-30%)
- **30+**: High-trust members, leadership capacity (5-15%)

**Red flags**:
- Everyone stuck at 0-5: Trust not flowing, system blocked
- Everyone at 30+: No distinction, thresholds irrelevant
- Extreme inequality: Few members control access

## All Trust Thresholds Explained

### Viewer Access Thresholds

These control who can **see** different features and information.

#### View Trust Information (default: 0)

**What it controls**: Who can see trust scores and trust relationships

**0 = Full transparency**:
- All members see all trust scores
- Complete visibility into trust relationships
- Maximum accountability

**5-10 = Partial privacy**:
- Only established members see trust details
- Protects new members from scrutiny
- Reduces gaming incentives

**15+ = High privacy**:
- Only trusted members see trust scores
- Maximum privacy around trust
- May reduce accountability

**Recommended**: 0 for most communities (transparency builds trust)

**Raise if**: Privacy concerns outweigh accountability benefits

#### View Wealth (default: 0)

**What it controls**: Who can see what resources are being shared

**0 = Public wealth**:
- All members see all shared resources
- Encourages participation
- Makes generosity visible

**5-10 = Member wealth**:
- Only active members see sharing
- Creates more intimate sharing space
- Reduces pressure on sharers

**15+ = Trusted member wealth**:
- Only established members see resources
- Maximum privacy for sharers
- May reduce accessibility

**Recommended**: 0 for open communities, 5-10 for privacy-focused

**Raise if**: Sharers want more privacy about what they have

#### View Needs (default: 0)

**What it controls**: Who can see expressed community needs

**0 = Public needs**:
- All members see all needs
- Encourages awareness and response
- Makes vulnerability visible

**5+ = Member needs**:
- Only established members see needs
- More privacy around asking
- May reduce need fulfillment

**Recommended**: 0 (making needs visible helps fulfill them)

**Raise if**: Need expression feels too vulnerable publicly

#### View Forum/Pools/Councils/Items/Polls (default: 0)

**What they control**: Who can see these features

**0 = Public access**:
- All community members can view
- Maximum transparency
- Encourages participation

**5-15 = Restricted access**:
- Only established members can view
- Creates more exclusive space
- May reduce engagement

**Recommended**: 0 for most features (visibility encourages participation)

**Raise if**: Feature should be restricted to active members only

### Action Thresholds

These control who can **perform actions** in the community.

#### Award Trust to Others (default: 15)

**What it controls**: Who can grant trust to other members

**Why it matters**: This is the most critical threshold. It controls who can expand the trust network.

**10-12 = Open trust growth**:
- Relatively easy to start awarding trust
- Trust network grows quickly
- More risk of premature or manipulated trust
- Good for: Small, known communities

**15-18 = Balanced trust growth** (recommended):
- Members need to earn some trust before granting it
- Prevents immediate gaming
- Allows growth while maintaining integrity
- Good for: Most communities

**20-25 = Controlled trust growth**:
- Only well-established members grant trust
- Slower growth but more protected
- May create bottleneck if too few can grant
- Good for: Large or vulnerable communities

**Warning**: If too high, trust network can't grow. If too low, trust loses meaning.

**Watch for**: Trust growing too fast (raise threshold) or not at all (lower threshold)

#### Share Wealth Publicly (default: 10)

**What it controls**: Who can share resources with the community

**5-8 = Easy sharing**:
- New members can share quickly
- Encourages generosity
- May get lower-quality or uncommitted shares
- Good for: Communities building sharing culture

**10-15 = Moderate sharing** (recommended):
- Members establish themselves before sharing
- More committed, quality shares
- Still accessible to active members
- Good for: Most communities

**15-20 = Restricted sharing**:
- Only trusted members can share
- High-quality, reliable shares
- May discourage new members
- Good for: High-value resource communities

**Balance**: Lower threshold encourages participation, higher threshold ensures quality.

#### Create Forum Threads (default: 10)

**What it controls**: Who can start new discussion topics

**5-8 = Open discussion**:
- New members can start conversations
- Vibrant, active forum
- May get lower-quality or spam threads
- Good for: Discussion-focused communities

**10-15 = Moderate discussion** (recommended):
- Established members start threads
- Higher-quality discussions
- Still encourages participation
- Good for: Most communities

**15-20 = Controlled discussion**:
- Only trusted members start topics
- Very high-quality threads
- May feel too restrictive
- Good for: Professional or formal communities

**Note**: This only controls thread creation. All members can reply (default: 0).

#### Upload Attachments (default: 15)

**What it controls**: Who can upload images, files, documents

**Why higher**: Prevents spam, inappropriate content, abuse of storage

**10-12 = Open attachments**:
- Active members can share media
- More dynamic discussions
- Higher moderation burden

**15-20 = Moderate attachments** (recommended):
- Trusted members can upload
- Balanced access and protection
- Most communities' sweet spot

**20-25 = Restricted attachments**:
- Only highly trusted members
- Maximum protection
- May limit valuable sharing

**Balance**: File uploads have more potential for abuse than text.

#### Flag Content (default: 15)

**What it controls**: Who can report posts as inappropriate

**Why higher**: Prevents abuse of flagging system

**10-12 = Open flagging**:
- More members can flag issues
- Quicker community response
- Risk of flag abuse

**15-20 = Moderate flagging** (recommended):
- Established members flag content
- Reduces frivolous flags
- Still allows community moderation

**20+ = Restricted flagging**:
- Only trusted members flag
- Maximum protection from abuse
- May miss legitimate issues

**Pair with**: Flag review threshold (who reviews flagged content)

#### Review Flags (default: 30)

**What it controls**: Who can moderate flagged content

**Why high**: Significant responsibility, requires judgment and trust

**25-30 = Moderate review** (recommended):
- Multiple members can review
- Distributes moderation work
- Still requires high trust

**30-40 = Restricted review**:
- Only most trusted members
- Maximum judgment quality
- May create bottleneck

**Consider**: Also assigning explicit Forum Manager roles for moderation.

#### Create Polls (default: 15)

**What it controls**: Who can create community polls and votes

**10-12 = Open polling**:
- Active members can poll community
- Lots of decision-making
- May get frivolous polls

**15-20 = Moderate polling** (recommended):
- Established members create polls
- More meaningful questions
- Still democratic

**20-25 = Restricted polling**:
- Only trusted members poll
- Very considered polls
- May limit democratic participation

**Balance**: Polls shape community decisions. Too open = noise, too restricted = not democratic.

#### Create Pools (default: 20)

**What it controls**: Who can create resource aggregation pools

**Why higher**: Pools involve coordination and responsibility

**15-18 = Open pool creation**:
- More members can create pools
- More experimentation
- May get abandoned pools

**20-25 = Moderate pool creation** (recommended):
- Trusted members create pools
- More committed management
- Still accessible

**25-30 = Restricted pool creation**:
- Only highly trusted members
- Very stable pools
- May limit useful experiments

**Consider**: Pools require ongoing management, so creators should be committed.

#### Create Councils (default: 25)

**What it controls**: Who can create specialized working groups

**Why high**: Councils are significant community structures

**20-23 = Open council creation**:
- More councils, more experimentation
- Risk of fragmentation
- Good for: Large, diverse communities

**25-30 = Moderate council creation** (recommended):
- Trusted members create councils
- More stable structures
- Good for: Most communities

**30-40 = Restricted council creation**:
- Only most trusted members
- Very deliberate councils
- Good for: Small or formal communities

**Balance**: Councils create sub-structures. Too many = fragmentation, too few = centralization.

#### Full Forum Moderation (default: 30)

**What it controls**: Who has complete moderation powers (edit, delete, lock, manage categories)

**Why very high**: Enormous power over community discourse

**25-30 = Moderate moderation**:
- Several members can moderate
- Distributes power
- Allows accountability

**30-40 = Restricted moderation** (recommended):
- Only most trusted members
- Maximum judgment quality
- Still enough moderators

**40+ = Very restricted**:
- Tiny moderation team
- May create bottleneck
- Only for small communities

**Important**: Also use explicit Forum Manager role assignments.

#### View Health Analytics (default: 20)

**What it controls**: Who can see community health metrics and statistics

**0-10 = Public analytics**:
- Full transparency
- All members see patterns
- Maximum accountability

**15-20 = Member analytics**:
- Active members see health data
- Balance transparency and privacy

**20-30 = Restricted analytics** (recommended):
- Only trusted members see metrics
- Privacy for community patterns
- Still accountable leadership

**Balance**: Transparency builds trust, but some metrics may be sensitive.

#### Publish Needs (default: 5)

**What it controls**: Who can express resource needs publicly

**Why lower**: Encourages need expression, vulnerability should be safe

**0-3 = Open needs**:
- Anyone can express needs
- Maximum accessibility
- Encourages asking

**5-10 = Moderate needs** (recommended):
- Basic integration before asking
- Reduces frivolous requests
- Still very accessible

**10+ = Restricted needs**:
- Only established members ask
- May discourage legitimate needs
- Usually too high

**Philosophy**: Asking for help should be easier than giving help.

## Configuring Trust Thresholds

### The Configuration Interface

Access: Community Settings > Trust Thresholds tab

For each threshold you can set:

**Type: Number or Level**
- **Number**: Specific score (e.g., 15)
- **Level**: Named trust level (e.g., "Trusted Member")

**Value**:
- If Number: Enter the score
- If Level: Select from dropdown

### Using Numbers vs. Levels

**Numbers** (e.g., 15):
- **Pros**: Direct, precise, easy to understand
- **Cons**: Feel arbitrary, hard to communicate to members
- **Use when**: Fine-tuning, specific scores needed

**Levels** (e.g., "Trusted Member"):
- **Pros**: Meaningful, communicates intent, flexible
- **Cons**: Adds abstraction layer
- **Use when**: Want semantic meaning, may adjust level thresholds later

**Recommended**: Use levels for major features, numbers for fine-tuning.

**Example**:
```
Award Trust: "Trusted Member" level (threshold: 15)
Create Pools: "Advanced Member" level (threshold: 25)
Create Councils: "Community Expert" level (threshold: 40)
```

### Trust Level Configuration

You can define custom trust levels for your community:

**Default levels**:
- New Member: 0+
- Known Member: 10+
- Trusted Member: 25+
- Advanced Member: 50+
- Community Expert: 100+
- Community Benefactor: 200+

**Customization**:
1. Go to Settings > Trust Levels
2. Edit level names and thresholds
3. Create levels that match your community's culture

**Examples**:
- Gardening community: Seedling, Sprout, Blooming, Flourishing, Fruit-Bearing
- Tech community: User, Contributor, Maintainer, Core Team, Steward
- Care community: Newcomer, Neighbor, Family, Elder

## Recommended Configurations by Community Type

### Small, Close-Knit Community (5-20 members)

```
Award Trust: 10
Share Wealth: 5
Create Threads: 5
Create Pools: 15
Create Councils: 20
Forum Moderation: 25
```

**Why**: Low barriers, trust most members, can address issues personally.

### Medium, Mixed-Trust Community (20-100 members)

```
Award Trust: 15
Share Wealth: 10
Create Threads: 10
Create Pools: 20
Create Councils: 25
Forum Moderation: 30
```

**Why**: Balanced access and protection, democratic participation, clear structure.

### Large, Public Community (100+ members)

```
Award Trust: 20
Share Wealth: 15
Create Threads: 10
Create Pools: 25
Create Councils: 35
Forum Moderation: 40
```

**Why**: Higher barriers for resources, lower for discussion, protects from scale.

### Resource-Focused Community

```
Award Trust: 15
Share Wealth: 15 (higher)
Create Threads: 10
Create Pools: 20
Create Councils: 25
```

**Why**: Emphasizes quality of resource sharing over quick access.

### Discussion-Focused Community

```
Award Trust: 15
Share Wealth: 10
Create Threads: 5 (lower)
Create Pools: 20
Forum Moderation: 25 (lower)
```

**Why**: Prioritizes open conversation and diverse moderation.

### Privacy-Focused Community

```
View Trust: 10 (higher)
View Wealth: 10 (higher)
Award Trust: 20 (higher)
Share Wealth: 15
Other defaults
```

**Why**: More privacy around trust and sharing while maintaining access for trusted members.

## Adjusting Thresholds Over Time

### When to Lower Thresholds

**Signs you should lower**:
- Members complain about barriers
- Trust scores are growing but members still can't participate
- New features aren't being used
- Community feels stagnant or restricted

**Process**:
1. Identify specific threshold causing issue
2. Lower by 3-5 points
3. Announce change and reasoning
4. Monitor impact
5. Adjust further if needed

**Example**: "We're lowering the pool creation threshold from 25 to 20 because several trusted members have great pool ideas but just under the threshold."

### When to Raise Thresholds

**Signs you should raise**:
- Too much low-quality content
- Features being abused
- Trust growing too quickly (gaming suspected)
- Community feels chaotic or overwhelmed

**Process**:
1. Identify specific problem
2. Confirm threshold adjustment will help
3. Raise by 3-5 points
4. **Announce change with clear reasoning before implementing**
5. Monitor impact

**Important**: Raising thresholds affects current members. Communicate clearly and give notice.

**Example**: "We're raising the thread creation threshold from 10 to 15 next week to address the large number of low-effort threads. Existing members at 10-14 trust will still be able to post replies."

### Seasonal Adjustments

Some communities adjust thresholds seasonally:

**Growth periods**:
- Lower thresholds during recruitment drives
- Make it easier for new members to integrate
- Raise back after growth stabilizes

**Stabilization periods**:
- Raise thresholds when community needs consolidation
- Focus on depth over growth
- Lower when ready to grow again

### Emergency Adjustments

In crisis situations:
- **Spam attack**: Temporarily raise affected thresholds
- **Trust manipulation**: Raise "Award Trust" threshold
- **Conflict**: May adjust as needed for safety

**Process**: Make change immediately, announce afterward, review regularly, restore when safe.

## Common Threshold Configurations Mistakes

### Setting All Thresholds the Same

**Problem**: No gradation, features don't reflect different responsibilities

**Example**: Everything at 15
- Award Trust: 15
- Share Wealth: 15
- Create Pools: 15
- Create Councils: 15
- Forum Moderation: 15

**Why it's bad**: Creates artificial barriers with no logic.

**Fix**: Vary thresholds based on responsibility and impact.

### Making Thresholds Too High Initially

**Problem**: New community, no one can do anything

**Example**: New community with Create Threads: 25
- No one has 25 trust yet
- Can't build trust through participation
- Community feels dead

**Fix**: Start moderate, raise only if needed.

### Forgetting About Trust Bootstrapping

**Problem**: Set thresholds but don't grant initial admin trust

**Example**:
- Award Trust: 15
- Share Wealth: 10
- No admin trust granted to founding members
- Members at 0 trust can't do anything

**Fix**: Always bootstrap with admin trust or role assignments.

### Setting "Award Trust" Too Low

**Problem**: Trust loses meaning, grows too fast

**Example**: Award Trust: 5
- Members reach 5 trust easily
- Immediately start awarding trust to others
- Trust inflates rapidly

**Fix**: Keep Award Trust at 15+ to maintain integrity.

### Setting "Award Trust" Too High

**Problem**: Trust can't grow, system blocked

**Example**: Award Trust: 30
- Very few members reach 30
- Those few control all trust growth
- New members can't integrate

**Fix**: Keep Award Trust at 10-20 for healthy growth.

### Ignoring Viewer Thresholds

**Problem**: Everything is visible or everything is hidden

**Example**: All viewer thresholds at 0 or all at 20

**Fix**: Set viewer thresholds based on privacy needs per feature.

## Monitoring Threshold Effectiveness

### Metrics to Watch

**Trust distribution**:
- Are members progressing through trust levels?
- Is trust concentrated or distributed?
- Are new members earning trust?

**Feature usage**:
- Are members using features when they reach thresholds?
- Are useful features blocked by thresholds?
- Are problematic features being abused?

**Member feedback**:
- What do members say about access?
- Are barriers frustrating or protective?
- Do thresholds make sense to members?

**Community health**:
- Is participation growing or declining?
- Is quality maintained?
- Are conflicts increasing or decreasing?

### Analytics to Review

Go to Community Health Analytics (if enabled) and check:

**Trust Analytics**:
- Trust score distribution histogram
- Trust award patterns
- Admin trust vs peer trust ratio
- Trust growth rate

**Participation Analytics**:
- Feature usage by trust level
- Threshold crossing times (how long to reach thresholds)
- Blocked actions (members trying to act without threshold)

**Community Health**:
- Member retention by trust level
- Content quality by trust threshold
- Conflict rates by trust level

### Quarterly Review Process

Every 3 months:

1. **Review metrics**: Check trust distribution and feature usage
2. **Gather feedback**: Poll members about threshold experience
3. **Consult admins**: Discuss what's working and what's not
4. **Identify issues**: Any thresholds too high/low?
5. **Make adjustments**: Change 1-2 thresholds if needed
6. **Communicate**: Announce changes with reasoning
7. **Monitor impact**: Check if adjustments help

## Advanced Topics

### Graduated Thresholds

Some communities use viewer and action thresholds together:

```
View Wealth: 5 (can see what's shared)
Share Wealth: 15 (can share)
```

**Effect**: Members can see sharing happening before they can participate. Builds desire to earn trust.

### Threshold Gaps

Intentional gaps between thresholds:

```
Award Trust: 15
Create Pools: 20
Create Councils: 25
```

**Effect**: Clear progression, members move through stages, natural leadership emergence.

### Trust-Role Combinations

Using both trust thresholds and explicit roles:

```
Create Pools: Trust 20 OR Pool Creator role
Forum Moderation: Trust 30 OR Forum Manager role
```

**Effect**: Most members use trust path, admins can grant roles for special cases.

### Community-Specific Thresholds

Some communities create unique thresholds:

```
Access Secret Garden Pool: Trust 40
See Elder Care Council: Trust 25
Post in Conflict Resolution Forum: Trust 30
```

**Effect**: Fine-grained control over special community features.

## Troubleshooting

### Problem: No One Can Award Trust

**Symptoms**: Trust scores stuck, members frustrated

**Diagnosis**: Award Trust threshold too high OR no one has been bootstrapped

**Solutions**:
- Lower Award Trust threshold to 10-15
- Grant admin trust to active members
- Assign Trust Granter role to select members

### Problem: Trust Inflating Rapidly

**Symptoms**: Everyone at 30+ trust within weeks

**Diagnosis**: Award Trust threshold too low OR coordinated gaming

**Solutions**:
- Raise Award Trust threshold to 20+
- Investigate suspicious patterns
- Review admin trust grants
- Consider trust decay if available

### Problem: Good Members Stuck Below Threshold

**Symptoms**: Active, trusted members can't access features

**Diagnosis**: Thresholds too high OR specific members not being awarded trust

**Solutions**:
- Lower specific thresholds
- Grant admin trust to affected members
- Encourage existing trusted members to award trust
- Review if trust culture is healthy

### Problem: Features Not Being Used

**Symptoms**: Pools, councils, forum inactive despite members having access

**Diagnosis**: May not be threshold issue - could be cultural, educational, or need-based

**Solutions**:
- Check if thresholds are blocking (lower if so)
- If thresholds not issue, focus on education and culture
- Create examples and guides
- Model feature usage yourself

## Best Practices Summary

1. **Start moderate**: Use defaults, adjust based on experience
2. **Bootstrap trust**: Grant admin trust to seed members
3. **Vary thresholds**: Different features = different thresholds
4. **Communicate clearly**: Explain threshold changes
5. **Review regularly**: Quarterly check-ins
6. **Watch metrics**: Let data inform decisions
7. **Listen to members**: Their experience matters
8. **Balance access and protection**: Neither extreme works
9. **Use levels meaningfully**: Name levels to match culture
10. **Document decisions**: Record why you set thresholds

## Next Steps

- **Apply**: [Configuring Settings](./configuring-settings.md) - Adjust thresholds for your community
- **Manage**: [Managing Members](./managing-members.md) - Bootstrap trust and assign roles
- **Monitor**: [Analytics & Health](./analytics-health.md) - Track threshold effectiveness
- **Create**: [Creating Community](./creating-community.md) - Review bootstrap process

## Conclusion

Trust thresholds are powerful tools for shaping community culture and access. Key principles:

- **Thresholds encode values**: Low = open and trusting, high = protected and careful
- **Balance is essential**: Too low = chaos, too high = restriction
- **Context matters**: Different communities need different configurations
- **Iteration is normal**: Expect to adjust as community evolves
- **Communication is critical**: Members deserve to understand access logic

Remember: Thresholds are means, not ends. The goal is a healthy, thriving community where trusted members have access to participate fully while the community remains protected from harm.
