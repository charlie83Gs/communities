# Community Analytics and Health Monitoring

This guide explains how to use analytics and health metrics to understand and improve your community.

## Overview

Community health metrics help you:
- Understand participation patterns
- Identify issues early
- Make informed decisions
- Track community growth
- Celebrate successes

## Accessing Analytics

### For Admins

1. Navigate to your community
2. Click the "Health" or "Analytics" tab
3. View dashboard with key metrics

**Admin access**: Admins always have full access to analytics

### For Members

Members can access analytics if:
- Feature is enabled in settings
- They meet the trust threshold (default: 20)
- Community has enabled member analytics viewing

**Why restricted**: Some metrics may be sensitive; community decides on transparency level.

## Community Health Dashboard

### Overview Panel

**Key Metrics at a Glance**:

**Total Members**:
- Current active member count
- Growth trend (vs. last period)
- Indicates community size

**Active Members**:
- Members who participated recently (defined period, e.g., 30 days)
- Percentage of total members
- Indicates engagement level

**Trust Distribution**:
- Average trust score
- Median trust score
- Distribution across trust levels

**Resource Sharing**:
- Active wealth shares
- Fulfillment rate
- Sharing participation rate

**Community Activity**:
- Forum posts this period
- Polls created/active
- Councils/pools active

### What These Numbers Mean

#### Healthy Indicators

**High active percentage (60-80%)**:
- Most members participate regularly
- Engaged community
- Good sign

**Balanced trust distribution**:
- Members across all trust levels (0-5, 5-15, 15-30, 30+)
- Trust flowing to active members
- Democratic system working

**High fulfillment rate (70-90%)**:
- Needs are being met
- Community cooperation is strong
- Resource sharing is effective

**Steady growth**:
- New members joining
- Existing members staying
- Sustainable expansion

#### Warning Indicators

**Low active percentage (<40%)**:
- Many members not participating
- Possible engagement issues
- Consider: Why are members inactive?

**Concentrated trust**:
- Few members with all the trust
- Trust not flowing
- System may be blocked

**Low fulfillment rate (<50%)**:
- Needs not being met
- Possible resource mismatch
- Consider: Are the right resources being shared?

**Declining membership**:
- Members leaving
- New members not joining
- Investigate causes

## Trust Analytics

### Trust Distribution Chart

**What it shows**: Histogram of member trust scores

**Healthy pattern**:
```
Trust 0-5:   ████████████ (30-40% - new members)
Trust 5-15:  ████████████████ (30-40% - establishing)
Trust 15-30: ██████████ (20-25% - trusted)
Trust 30+:   ████ (5-10% - high trust)
```

**Problem patterns**:

**Everyone at 0-5**:
```
Trust 0-5:   █████████████████████████ (90%)
Trust 5-15:  ██ (5%)
Trust 15-30: █ (3%)
Trust 30+:   ▌ (2%)
```
- Trust not flowing
- Award Trust threshold too high
- Insufficient bootstrapping
- **Fix**: Lower thresholds, grant admin trust

**Everyone at 30+**:
```
Trust 0-5:   █ (5%)
Trust 5-15:  ██ (10%)
Trust 15-30: ████ (15%)
Trust 30+:   ██████████████████ (70%)
```
- Trust inflated
- Award Trust threshold too low
- Possible gaming
- **Fix**: Raise thresholds, review trust awards

**Extreme inequality**:
```
Trust 0-5:   ████████████████████ (70%)
Trust 5-15:  ██ (10%)
Trust 15-30: █ (5%)
Trust 30+:   ████████ (15%)
```
- Trust concentrated in few members
- New members can't integrate
- Possible clique
- **Fix**: Encourage trust awards, bootstrap new members

### Trust Flow Analysis

**What it shows**: Who is awarding trust to whom

**Healthy pattern**:
- Trust awards distributed across members
- Multiple members can award trust
- New members receiving trust from several sources
- Trust reciprocity is balanced

**Problem patterns**:

**One-directional flow**:
- All trust comes from 1-2 members
- Creates dependency
- **Fix**: Encourage more members to award trust

**Clique formation**:
- Small group awards trust only to each other
- Others excluded
- **Fix**: Outreach to integrate all members

**No flow**:
- Trust awards stopped
- Members at thresholds not awarding
- **Fix**: Remind members to award trust, check thresholds

### Trust Growth Rate

**What it shows**: How fast trust is growing in the community

**Healthy rate**:
- Steady, gradual growth
- New members earn trust over weeks/months
- Established members reach higher levels
- Growth matches participation

**Too fast**:
- Members at 30+ within days
- Possible gaming
- Trust losing meaning
- **Fix**: Raise Award Trust threshold, investigate patterns

**Too slow**:
- Members stuck at low trust for months
- Participation but no trust growth
- System blocked
- **Fix**: Lower thresholds, encourage awards, bootstrap

### Admin Trust vs. Peer Trust

**What it shows**: Ratio of admin-granted vs. member-awarded trust

**Healthy ratio**:
- **New community** (0-3 months): 40-60% admin trust (bootstrapping)
- **Establishing** (3-12 months): 20-40% admin trust (transitioning)
- **Mature** (12+ months): 0-20% admin trust (peer-driven)

**Problem ratios**:

**Too much admin trust in mature community**:
- 60%+ admin trust after 12 months
- System not self-sustaining
- **Fix**: Reduce admin trust, encourage peer awards

**Too little admin trust in new community**:
- 0-10% admin trust in first months
- Members can't participate
- **Fix**: Grant admin trust to bootstrap

## Participation Analytics

### Activity Heatmap

**What it shows**: When members are active (by day/time)

**Use this to**:
- Schedule community events
- Post important announcements
- Understand member availability
- Plan meeting times

**Example insights**:
- "Most activity Tuesday-Thursday evenings" → Schedule meetings then
- "Weekends are quiet" → Don't expect immediate responses
- "Morning posts get more engagement" → Time announcements accordingly

### Feature Usage Statistics

**What it shows**: How often different features are used

**Example metrics**:
```
Wealth Sharing:   ████████████████ 85% of members
Forum:            ████████████ 75% of members
Polls:            ██████ 45% of members
Pools:            ███ 25% of members
Councils:         ██ 15% of members
Value Recognition: ████ 35% of members
```

**Insights**:

**High usage features**:
- Core to your community
- Well understood
- Meeting real needs
- **Action**: Maintain and improve

**Low usage features**:
- May not be needed
- May be confusing
- May have access barriers
- **Action**: Investigate why, consider disabling or improving

**Unused features**:
- Definitely not needed or understood
- **Action**: Disable to simplify experience

### Member Lifecycle Analytics

**What it shows**: How members progress through community

**Stages**:
1. **Joined**: New member account created
2. **Active**: First action taken (post, share, award trust)
3. **Integrated**: First trust received
4. **Trusted**: Reached trusted member threshold
5. **Leader**: Reached high-trust threshold

**Healthy progression**:
- Most members reach "Active" within days
- Most members reach "Integrated" within weeks
- Many members reach "Trusted" within months
- Some members reach "Leader" over time

**Problem progression**:

**Stuck at "Joined"**:
- Members join but don't act
- Possible: Confusing onboarding, high barriers, unclear purpose
- **Fix**: Improve onboarding, lower initial barriers, clarify expectations

**Stuck at "Active"**:
- Members act but don't receive trust
- Possible: Trust not flowing, unclear how to earn trust
- **Fix**: Encourage trust awards, explain trust system

**No one reaches "Trusted"**:
- Thresholds too high or trust not growing
- **Fix**: Review thresholds, bootstrap more actively

## Resource Sharing Analytics

### Sharing Participation

**What it shows**: How many members are sharing resources

**Metrics**:
- **Total sharers**: Members with active wealth shares
- **Share rate**: Percentage of members sharing
- **Shares per sharer**: Average number of items shared

**Healthy patterns**:
- 30-60% of members share something
- Multiple shares per sharer (shows commitment)
- New sharers every month (growth)

**Problem patterns**:

**Low participation (<20%)**:
- Most members not sharing
- Possible: Barriers too high, unclear how, nothing to share
- **Fix**: Lower thresholds, create guides, encourage starting small

**Few sharers, many shares**:
- 5-10 members doing all sharing
- Others are only receiving
- **Fix**: Encourage broader participation, address extraction

**High participation but low shares**:
- Many members share one thing then stop
- **Fix**: Recognize sharers, create sharing culture, address quality

### Request and Fulfillment Analytics

**What it shows**: How needs are being met

**Metrics**:
- **Total requests**: Number of wealth requests
- **Fulfillment rate**: Percentage of requests fulfilled
- **Time to fulfillment**: Average time from request to fulfillment
- **Repeat requesters**: Members who request frequently

**Healthy patterns**:
- Fulfillment rate 70-90%
- Time to fulfillment: hours to days
- Balanced requesting across members
- Most requests eventually fulfilled

**Problem patterns**:

**Low fulfillment (<50%)**:
- Needs not being met
- Possible: Mismatch between needs and shares, sharers unresponsive
- **Fix**: Survey needs, encourage responsive sharing, match supply and demand

**Long fulfillment time (weeks)**:
- Requests sitting unanswered
- Possible: Inattentive sharers, complex coordination
- **Fix**: Notification system, reminder culture, simplify process

**Concentrated requesting**:
- Few members make most requests
- Possible: Extraction pattern forming
- **Fix**: Review participation, encourage contribution, have conversation

### Item Category Analytics

**What it shows**: What types of resources are shared and requested

**Example**:
```
Most Shared:
1. Garden Tools (45 shares)
2. Childcare (32 offers)
3. Food/Produce (28 shares)

Most Requested:
1. Tools (67 requests)
2. Transport (45 requests)
3. Childcare (38 requests)
```

**Insights**:

**High supply, high demand**: Core community resources, working well

**High supply, low demand**: May be oversupplied, consider encouraging other sharing

**Low supply, high demand**: Unmet need, opportunity to encourage sharing

**Low supply, low demand**: Not relevant to community, can ignore

## Forum Analytics

### Discussion Activity

**What it shows**: Forum engagement metrics

**Metrics**:
- **Total threads**: Active discussion topics
- **Posts per day**: Discussion volume
- **Unique posters**: How many members participate
- **Response rate**: Threads with >1 reply

**Healthy patterns**:
- Many threads with multiple replies (real discussions)
- High percentage of members posting (participation)
- Quick responses (engaged community)
- Mix of topics (diverse interests)

**Problem patterns**:

**Low response rate**:
- Many threads with 0-1 replies
- Possible: Uninteresting topics, lack of engagement, wrong platform
- **Fix**: Model good discussion, ask engaging questions, ensure forum meets needs

**Few posters**:
- 10% of members create all content
- Possible: Barriers too high, others don't feel welcome
- **Fix**: Lower thresholds, encourage participation, welcome diverse voices

**Very high volume**:
- Overwhelming number of posts
- Possible: Too much noise, quality declining
- **Fix**: Raise thread creation threshold, create categories, moderation

### Content Quality Metrics

**What it shows**: Quality of forum content

**Metrics**:
- **Upvotes**: Popular content
- **Flags**: Problematic content
- **Moderation actions**: Removals, locks
- **Thread length**: How long discussions go

**Healthy patterns**:
- Some highly upvoted content (quality exists)
- Very few flags (respectful)
- Minimal moderation needed (self-regulating)
- Mix of short and long threads (varied depth)

**Problem patterns**:

**Many flags**:
- Frequent problematic content
- Possible: Thresholds too low, toxic culture, unclear norms
- **Fix**: Raise thresholds, clarify guidelines, active moderation

**Heavy moderation needed**:
- Many removals, locks
- Possible: Cultural issues, wrong members, inadequate norms
- **Fix**: Address culture, review membership, strengthen guidelines

**No engagement**:
- No upvotes, short threads
- Possible: Content not resonating, wrong platform
- **Fix**: Survey members, adjust approach, consider alternatives

## Community Health Scores

### Overall Health Score

Some communities use composite health scores:

**Components**:
- Active member percentage (30%)
- Trust distribution balance (20%)
- Resource fulfillment rate (20%)
- Forum participation (15%)
- Member retention (15%)

**Interpretation**:
- **80-100**: Thriving community
- **60-79**: Healthy community with room to grow
- **40-59**: Struggling community, needs attention
- **<40**: Community in crisis, urgent action needed

**Use cautiously**: Numbers don't tell the whole story. Use as one signal among many.

### Red Flags to Watch For

**Immediate attention needed**:
- Sudden drop in active members (>20% in a month)
- Multiple members leaving in short period
- Trust completely stopped flowing
- Conflict increasing significantly
- Fulfillment rate dropping sharply

**Monitor and address**:
- Gradual decline in participation
- Trust concentrating in smaller group
- Same members making all requests
- Forum getting quieter
- New members not integrating

**Proactive opportunities**:
- Participation growing
- New features being adopted
- Trust spreading to new members
- High satisfaction in feedback

## Using Analytics to Make Decisions

### Decision Framework

**1. Identify the question**:
- What do we want to know?
- What decision are we making?
- What data would help?

**2. Gather relevant data**:
- Check analytics dashboard
- Review specific metrics
- Note trends over time

**3. Contextualize**:
- What else is happening?
- Are there external factors?
- What do members say?

**4. Decide and act**:
- What does the data suggest?
- What action makes sense?
- How will we know if it worked?

**5. Monitor impact**:
- Check metrics after change
- Did it work as expected?
- Adjust if needed

### Example Decisions

#### Should we lower the "Share Wealth" threshold?

**Data to check**:
- How many members are between current threshold and proposed lower one?
- What's current sharing participation rate?
- What's wealth quality been like?

**Decision logic**:
- If: Many members just below threshold + low sharing participation + good quality
- Then: Lower threshold
- If: Few members affected + sharing participation already high
- Then: Keep threshold

#### Should we create more forum categories?

**Data to check**:
- How many active threads?
- What topics are being discussed?
- Are threads organized or scattered?

**Decision logic**:
- If: Many threads + clear topic clusters + members complaining about organization
- Then: Create categories
- If: Few threads + topics already organized + no complaints
- Then: Keep simple

#### Is trust growing too fast?

**Data to check**:
- Trust growth rate
- Distribution of trust scores
- Time for new members to reach thresholds
- Who is awarding trust to whom

**Decision logic**:
- If: Members reaching high trust in days + trust very concentrated + suspicious patterns
- Then: Raise Award Trust threshold
- If: Steady growth + distributed awards + takes weeks to earn trust
- Then: Current pace is fine

## Gathering Qualitative Feedback

Analytics tell you *what* is happening. Feedback tells you *why*.

### Methods

**Surveys**:
- Periodic community surveys (quarterly)
- Specific feature feedback requests
- Anonymous satisfaction ratings

**Discussions**:
- Open forum threads for feedback
- Community meetings or calls
- Small group conversations

**Direct outreach**:
- Message members who left (exit interviews)
- Talk to highly active members
- Check in with new members

**Observation**:
- Read forum discussions
- Notice what people complain about
- See what excites people

### Key Questions to Ask

**Overall**:
- How satisfied are you with the community?
- What's working well?
- What needs improvement?
- Would you recommend us?

**Trust system**:
- Do you understand how trust works?
- Are thresholds appropriate?
- Is trust flowing fairly?

**Features**:
- Which features do you use?
- Which do you find confusing?
- What's missing?

**Culture**:
- Do you feel welcome?
- Is the community respectful?
- Do you feel safe sharing?

## Creating Analytics Reports

### Monthly Community Report

Share key metrics with community:

**Template**:
```markdown
# [Community Name] - [Month] Update

## Community Growth
- Total members: [X] (+/- [Y] from last month)
- Active members: [X]% of total
- New members this month: [X]

## Trust & Participation
- Average trust score: [X]
- Members who earned trust this month: [X]
- Members sharing resources: [X]%

## Highlights
- [Notable achievement or milestone]
- [Successful initiative or event]
- [Member recognition]

## Next Month
- [Upcoming event or focus]
- [Goal or priority]
- [Call to action]
```

**Why share**: Transparency, celebration, engagement, accountability

### Quarterly Deep Dive

For admins and interested members:

**Sections**:
1. **Trends**: What's changing over time?
2. **Health**: How is the community doing overall?
3. **Insights**: What have we learned?
4. **Actions**: What should we adjust?
5. **Celebrations**: What's going well?

**Use for**: Strategic planning, major decisions, reflection

## Privacy and Ethics

### What to Share Publicly

**OK to share**:
- Aggregate statistics (totals, averages, percentages)
- Overall trends
- Feature usage rates
- Community health scores

**Don't share publicly**:
- Individual member data
- Specific trust scores (without permission)
- Who requested/shared what
- Private communications

### What to Share with Members

**Full transparency**:
- Overall community metrics
- Trust distribution (without names)
- Participation rates
- Health trends

**Partial transparency**:
- Detailed analytics only to high-trust members
- Some metrics only to admins
- Configurable based on community values

**Consider member consent**:
- Some members may want to opt out of analytics
- Honor privacy preferences
- Be clear about what's tracked

## Tools and Resources

### Built-in Analytics

**Community Health Dashboard**:
- Access via Health/Analytics tab
- Real-time or near-real-time data
- Visualizations and charts
- Exportable data (if enabled)

### External Tools

**Spreadsheets**:
- Export data for deeper analysis
- Create custom visualizations
- Track long-term trends

**Surveys**:
- Google Forms, Typeform, etc.
- Gather qualitative feedback
- Complement quantitative data

## Next Steps

- **Configure**: [Settings](./configuring-settings.md) - Enable analytics features
- **Adjust**: [Trust Thresholds](./trust-thresholds.md) - Use data to inform threshold changes
- **Manage**: [Managing Members](./managing-members.md) - Apply insights to member management
- **Moderate**: [Moderation](./moderation.md) - Use data to guide moderation

## Summary

Effective use of analytics:

1. **Monitor regularly**: Check dashboard weekly or monthly
2. **Look for patterns**: Trends matter more than single data points
3. **Combine data and feedback**: Numbers + stories = full picture
4. **Act on insights**: Data is useless without action
5. **Share appropriately**: Transparency builds trust
6. **Respect privacy**: Aggregate, don't expose individuals
7. **Stay humble**: Data informs but doesn't decide

Remember: Analytics are tools to understand your community better. The goal isn't perfect metrics—it's a healthy, thriving community where people feel connected, supported, and able to participate fully.
