# Voting & Polls

Voting & Polls enables your community to make collective decisions through democratic participation. This guide shows you how to create polls, vote on proposals, and use community input to guide decision-making.

## What are Polls?

**Polls** are structured voting mechanisms where community members:

- **Propose questions** - Ask the community to choose between options
- **Vote on choices** - Cast one vote per poll
- **View results** - See how the community is deciding
- **Discuss together** - Comment and deliberate on options

### Why They Matter

Communities need ways to make collective decisions. Polls enable:

- **Democratic participation** - Every member gets a voice
- **Transparent decision-making** - Results visible to all
- **Structured discussion** - Comments focus the conversation
- **Community alignment** - Gauge consensus before action
- **Inclusive governance** - Lower barriers than formal proposals

## Core Concepts

### Poll Types by Creator

Polls can be created by three different types of actors:

**User Polls** - Created by individual members:
- Personal questions to the community
- Informal decision-making
- Testing community sentiment
- Example: "Where should we hold our next community gathering?"

**Council Polls** - Created on behalf of councils:
- Official council proposals
- Resource allocation decisions
- Policy questions
- Example: "Should the Food Council expand our weekly distribution?"

**Pool Polls** - Created on behalf of resource pools:
- Pool management decisions
- Distribution method questions
- Member coordination
- Example: "How should we distribute surplus vegetables this month?"

!!! note "Creator vs. Author"
    When creating on behalf of a council or pool, you're the author (your name shows), but the poll is attributed to that organization.

### Poll Lifecycle

Polls move through these states:

| Status | Meaning | Can Vote? |
|--------|---------|-----------|
| **Active** | Currently accepting votes | Yes |
| **Closed** | No longer accepting votes | No |

**How polls close**:
- **Automatically** - When the duration expires
- **Manually** - Creator or admin closes early

### Poll Duration

When creating a poll, you set how long it runs:

**Time limits**:
- Minimum: 1 hour
- Maximum: 720 hours (30 days)

**Common durations**:
- 24 hours - Quick decisions
- 3 days (72 hours) - Standard questions
- 7 days (168 hours) - Important decisions
- 30 days (720 hours) - Long-term planning

!!! tip "Choose Appropriate Duration"
    Short polls get quick input but may miss people. Longer polls give everyone time to participate but delay decisions. Match duration to importance and urgency.

### Voting Rules

**One vote per person**:
- Each member votes once per poll
- Cannot change your vote after submitting
- Vote is final and recorded

**Results visibility**:
- Results visible in real-time (while poll is active)
- Everyone can see vote counts and percentages
- Your individual vote is visible to you only

### Comments & Discussion

Every poll has a comment thread:

**Use comments to**:
- Explain your reasoning
- Ask clarifying questions
- Propose alternative options
- Discuss implications of choices
- Build consensus through dialogue

**Comment features**:
- Threaded replies (comment on comments)
- Visible to all community members
- Available during and after voting
- Permanent record of discussion

## Creating Polls

### Step 1: Check Permissions

**Who can create polls?**

You can create polls if you meet **any** of these criteria:

1. **Admin role** - Community administrators
2. **Poll Creator role** - Explicit permission from admin
3. **Trust threshold** - Trust score above community minimum (default: 15)
4. **Pool Manager** - Managers of resource pools (for pool polls)
5. **Council Member** - Members of councils (for council polls)

!!! info "Building Trust to Create Polls"
    If you don't have poll creation access yet, participate in your community first. Share resources, engage in discussions, and build trust. The threshold is typically 15 trust points.

### Step 2: Access Poll Creation

1. Navigate to your community page
2. Go to the **Polls** section or tab
3. Click **Create Poll** or **New Poll**

_[Screenshot placeholder: Community page with "Create Poll" button highlighted]_

### Step 3: Choose Creator Type

Select who is creating this poll:

**As myself** (User poll):
- Your name shows as creator
- General community question
- No additional permissions needed

**On behalf of council**:
- Must be a member of the council
- Poll attributed to that council
- Enter the council ID or select from dropdown
- Example: "Food Council asks about distribution schedule"

**On behalf of pool**:
- Must be a manager of the pool
- Poll attributed to that pool
- Enter the pool ID or select from dropdown
- Example: "Tool Pool asks how to organize lending system"

_[Screenshot placeholder: Creator type selector showing three options]_

### Step 4: Write Poll Title

**Title** - The question you're asking (required):

**Good titles are**:
- Clear and specific
- Phrased as questions
- Brief but complete
- Neutral (not biased)

**Examples**:

✅ Good: "Which day works best for our monthly community dinner?"

✅ Good: "Should we establish a tool lending library?"

✅ Good: "What time should weekly distributions happen?"

❌ Poor: "Stuff" (too vague)

❌ Poor: "We obviously need more events" (biased statement)

❌ Poor: "???" (not a question)

_[Screenshot placeholder: Title field with example]_

### Step 5: Add Description (Optional)

**Description** - Provide context and details:

**Use description for**:
- Background information
- Why you're asking
- Implications of each option
- What action will follow the poll
- Relevant constraints or considerations

**Example**:
```
We've had several requests to start a tool lending library. This would
require dedicating storage space and appointing a coordinator. Before
moving forward, we want to gauge community interest.

Vote "Yes, create it" if you'd use the service and support the effort.
Vote "No, not now" if you think we should wait or use a different approach.
Vote "Need more info" if you have questions before deciding.
```

_[Screenshot placeholder: Description field with example text]_

### Step 6: Define Options

**Options** - The choices voters can select:

**Requirements**:
- Minimum: 2 options
- Maximum: 10 options
- Each option max 200 characters

**To manage options**:
- Enter text for each option
- Click **Add Option** to include more
- Click **Remove** to delete an option (must keep at least 2)

**Option best practices**:

✅ **Clear and distinct**:
- "Monday 6pm", "Tuesday 6pm", "Wednesday 6pm"

✅ **Mutually exclusive**:
- "Yes, proceed", "No, don't proceed", "Need more discussion"

✅ **Complete coverage**:
- Include options like "Other" or "Need more info" if relevant

❌ **Avoid overlapping**:
- "Option A or B", "Option B or C" (confusing overlap)

_[Screenshot placeholder: Options section showing multiple option fields]_

### Step 7: Set Duration

**Duration** - How long the poll will run:

**Input fields**:
- Duration value (number)
- Duration unit (hours or days)

**Examples**:
- 24 hours - For quick decisions
- 3 days - For standard questions
- 7 days - For important decisions
- 30 days - For long-term planning

**Calculation**:
- System converts to hours (days × 24)
- End time calculated from submission
- Poll automatically closes at end time

!!! warning "Cannot Extend Duration"
    Once created, you cannot extend the poll duration. Choose wisely! You can close early but not extend.

_[Screenshot placeholder: Duration selector showing value and unit fields]_

### Step 8: Review and Submit

Before submitting, verify:

- ✓ Title asks the right question
- ✓ Description provides necessary context
- ✓ Options are clear and comprehensive
- ✓ Duration gives enough time for participation
- ✓ Creator type is correct

Click **Create Poll** to publish.

The poll immediately appears in the community polls list and members can start voting!

## Voting on Polls

### Step 1: Browse Polls

**Finding polls**:

1. Go to community **Polls** section
2. View list of all polls
3. Filter by:
   - Status (active, closed)
   - Creator type (user, council, pool)

**Poll card shows**:
- Title
- Status badge (active/closed)
- Creator type and name
- Time remaining (for active polls)
- End date (for closed polls)

_[Screenshot placeholder: Polls list showing multiple poll cards]_

### Step 2: Read Poll Details

Click on a poll to see full information:

**Poll header**:
- Full title
- Description (if provided)
- Creator information
- Time remaining or closed status

**Options section**:
- All available choices
- Current vote counts
- Percentage distribution
- Visual progress bars

**Comments section**:
- Community discussion
- Reasoning and questions
- Threaded conversations

_[Screenshot placeholder: Poll detail page]_

### Step 3: Review Options

**Consider each option**:
- Read all choices before voting
- Review percentages to see current consensus
- Read comments for insights and reasoning
- Think about implications

**Check results so far**:
- See how others are voting
- Understand community sentiment
- Note: Results are always visible (no blind voting)

### Step 4: Cast Your Vote

**To vote**:

1. Select one option (radio button)
2. Click **Vote** button
3. Confirm your choice

**Your vote is**:
- Immediate - Recorded instantly
- Final - Cannot be changed
- Private - Only you see which option you chose
- Counted - Results update immediately

!!! warning "Votes Are Final"
    You cannot change your vote after submitting. Choose carefully!

_[Screenshot placeholder: Voting interface with option selected]_

### Step 5: View Your Vote

After voting, you'll see:

**Confirmation message**:
- "You voted for: [option text]"
- Displayed in green above results

**Updated results**:
- Your vote is now counted
- Percentages updated
- Visual bars reflect new totals

**What you can still do**:
- View results as they change
- Add comments
- Share the poll with others

_[Screenshot placeholder: Post-vote view showing confirmation and results]_

## Participating in Poll Discussions

### Adding Comments

**To comment**:

1. Scroll to comments section
2. Type your comment
3. Click **Post Comment**

**Use comments to**:
- Explain why you chose an option
- Raise considerations others may have missed
- Ask questions about the poll
- Propose alternatives or compromises
- Build consensus through dialogue

**Example comments**:

✅ Good: "I voted for Monday because I think more working parents can attend evening events after the weekend."

✅ Good: "Before voting, can someone clarify if 'create tool library' means we need volunteers or paid staff?"

✅ Good: "I see Wednesday is winning. If that becomes official, I can help coordinate!"

❌ Poor: "+1" (not helpful, just vote)

❌ Poor: "This poll is stupid" (unconstructive)

_[Screenshot placeholder: Comment composition area]_

### Reading and Responding

**Comment thread features**:
- Chronological order (newest first or last)
- Threaded replies (comment on comments)
- Author names and timestamps
- Rich text formatting

**Engagement tips**:
- Read comments before voting
- Respond to questions constructively
- Tag people (@username) when relevant
- Stay on topic

### Comment Etiquette

✅ **Do**:
- Share reasoning, not just opinions
- Ask clarifying questions
- Acknowledge good points from others
- Suggest compromises if options are close

❌ **Don't**:
- Attack people who voted differently
- Spam multiple identical comments
- Go off-topic
- Try to manipulate votes through pressure

## Managing Your Polls

### Viewing Poll Status

**Your created polls**:

Navigate to polls you've created to:
- Monitor voting progress
- See current results
- Read incoming comments
- Decide whether to close early

**Real-time updates**:
- Vote counts update as people vote
- Comments appear immediately
- Time remaining counts down

_[Screenshot placeholder: Poll detail for poll creator showing stats]_

### Closing a Poll Early

**Who can close**:
- Poll creator
- Community administrators

**When to close early**:
- Clear consensus reached
- Decision is time-sensitive
- Participation plateaued
- Circumstances changed

**To close**:

1. Open the poll detail page
2. Click **Close Poll** (top right)
3. Confirm the action

**What happens**:
- Status changes to "Closed"
- No more votes accepted
- Results are final
- Comments remain available

!!! warning "Closing Is Permanent"
    You cannot reopen a poll after closing. Make sure the decision is final.

_[Screenshot placeholder: Close Poll button and confirmation]_

### Automatic Closure

**When duration expires**:
- Poll automatically closes
- Final results locked
- Status changes to "Closed"
- No manual action needed

**Example**:
- Created: Monday 9am with 72-hour duration
- Auto-closes: Thursday 9am
- Results finalized at that moment

## Understanding Results

### Vote Counting

**How votes are counted**:
- One vote per member, equal weight
- Total votes = number of members who voted
- Each option shows count and percentage

**Percentage calculation**:
```
Percentage = (Votes for option ÷ Total votes) × 100
```

**Example**:
- Option A: 15 votes (45%)
- Option B: 20 votes (60%)
- Option C: 5 votes (15%)
- Total: 33 votes

_[Screenshot placeholder: Results display showing bars, numbers, and percentages]_

### Visual Representation

**Progress bars**:
- Width represents percentage
- Color indicates option (visual distinction)
- Numbers show exact counts

**Sorting**:
- Options display in the order created
- Not sorted by vote count (maintains original structure)

### Interpreting Results

**Consensus indicators**:
- **Strong consensus**: One option >70%
- **Moderate consensus**: One option 50-70%
- **Split decision**: Close percentages (e.g., 45% vs 40%)
- **No consensus**: Votes distributed evenly

**Using results**:
- Guide decision-making, not dictate it
- Consider participation rate (how many voted)
- Read comments for context
- Combine with other input methods

!!! note "Polls Are Advisory"
    Poll results inform decisions but aren't binding. Community admins and councils consider polls alongside other factors.

## Poll Use Cases

### Community Event Planning

**Question**: "Which Saturday in March works for our community garden kickoff?"

**Options**:
- March 7th
- March 14th
- March 21st
- March 28th
- Can't make any of these

**Result**: See which date works for most people, plan accordingly

### Resource Allocation

**Question**: "How should the Food Council distribute surplus produce?"

**Options**:
- First-come first-served at pickup
- Equal shares to all members
- Based on household size
- Directed to those in most need

**Result**: Understand community values, shape distribution policy

### Policy Decisions

**Question**: "Should we require new members to share something within their first month?"

**Options**:
- Yes, require initial contribution
- No, let people share when ready
- Suggest but don't require
- Need more discussion

**Result**: Gauge support before implementing new rules

### Governance Questions

**Question**: "Should we establish a conflict resolution council?"

**Options**:
- Yes, create it now
- Yes, but wait 3 months
- No, use existing structures
- Need more information

**Result**: Test readiness for new governance structures

### Activity Coordination

**Question**: "What time should our weekly skill-sharing workshops happen?"

**Options**:
- Weekday mornings (10am)
- Weekday evenings (7pm)
- Saturday mornings (10am)
- Sunday afternoons (2pm)
- Rotating schedule

**Result**: Find time that maximizes participation

## Best Practices

### For Poll Creators

✅ **Ask clear, specific questions**:
- One question per poll
- Avoid compound questions
- Frame neutrally, not leading

✅ **Provide comprehensive options**:
- Cover likely answers
- Include "other" or "need more info" when appropriate
- Keep options mutually exclusive

✅ **Give enough time**:
- Match duration to decision importance
- Account for member schedules
- Don't rush critical decisions

✅ **Add context in description**:
- Explain why you're asking
- Note what will happen with results
- Provide relevant background

✅ **Engage with comments**:
- Answer questions promptly
- Acknowledge concerns
- Clarify misunderstandings

### For Voters

✅ **Read everything before voting**:
- Full title and description
- All options
- Existing comments

✅ **Vote thoughtfully**:
- Consider implications
- Think about community impact
- Don't rush

✅ **Participate in discussion**:
- Share your reasoning
- Ask clarifying questions
- Help build consensus

✅ **Vote when you have enough information**:
- Don't vote if you're confused
- Ask questions first
- Choose "need more info" if offered

### For Everyone

✅ **Respect the process**:
- No vote manipulation or pressure
- Accept results gracefully
- Focus on community benefit

✅ **Combine with other input**:
- Polls aren't the only decision tool
- Use with discussions, councils, and trust
- Consider poll as one data point

✅ **Follow through**:
- If poll guides action, take that action
- Report back on outcomes
- Learn from results

## Common Questions

### "Who can see poll results?"

All community members can see:
- Vote counts for each option
- Percentage distribution
- Total number of votes
- Which option you personally voted for (only you see this)

Nobody can see how others voted individually (anonymous voting).

### "Can I change my vote?"

No. Votes are final once submitted. This prevents manipulation and ensures result stability. Choose carefully!

### "What if I pick the wrong option by accident?"

Votes cannot be changed. To prevent accidents:
- Review your selection before clicking "Vote"
- Read the option text carefully
- Take your time

If you genuinely misclicked, you can comment explaining your intended vote.

### "Why can't I create polls?"

You need to meet the trust threshold (default: 15) or have explicit poll creator role. To build trust:
1. Share resources with your community
2. Participate in discussions
3. Award trust to others
4. Engage authentically over time

Admins can also grant you poll creator role directly.

### "Can I delete a poll I created?"

No, you cannot delete polls. You can:
- Close them early
- Add a comment explaining circumstances changed
- Create a new poll if needed

This maintains transparency and record-keeping.

### "What if the poll results are split evenly?"

Split results are valuable information:
- Shows community division
- Indicates need for more discussion
- Suggests compromise or hybrid approach
- May warrant council deliberation

Consider creating discussion threads or smaller working groups to find middle ground.

### "Do poll results bind the community?"

No, polls are **advisory** not **binding**:
- They inform decisions but don't dictate them
- Admins and councils consider polls alongside other factors
- Strong consensus usually guides action
- Split results may require more deliberation

### "How do I know when a new poll is created?"

Check your community's notification settings. Typically:
- Polls appear in community feed
- Some communities notify on new polls
- Check the polls section regularly

### "Can I create polls about anything?"

Generally yes, but community norms apply:
- Polls should be relevant to community
- Avoid spam or frivolous questions
- Respect community values and purpose
- Admins may close inappropriate polls

### "What's the difference between polls and initiatives?"

**Polls** (this feature):
- Community-wide questions
- Multiple choice voting
- Created by users, councils, or pools
- Informal decision-making

**Initiatives** (council feature):
- Formal council proposals
- Upvote/downvote system
- Created by council members
- Tied to specific action plans

Learn more: [Councils Guide](./councils.md)

## Troubleshooting

### "I can't vote on a poll"

Possible reasons:
1. **Already voted** - You can only vote once per poll
2. **Poll closed** - Check status badge
3. **Not a community member** - Must be a member to vote
4. **Technical issue** - Try refreshing the page

### "My vote didn't register"

Check:
- Did you see a confirmation message?
- Is your vote shown in results?
- Try refreshing the page
- If issue persists, contact community admin

### "The poll options don't include my preference"

- Add a comment suggesting your alternative
- Vote for closest option and explain in comments
- Suggest creator make a follow-up poll
- Some polls include "Other" option - choose that

### "Time remaining shows negative numbers"

This is a bug. The poll should have auto-closed:
- Status should be "Closed"
- Contact community admin to manually close
- Don't attempt to vote

### "I created a poll with the wrong duration"

You cannot edit duration after creation. Options:
- Let it run (if mistake isn't critical)
- Close early when you have enough responses
- Create a new poll with correct duration
- Add comment explaining the situation

## Related Topics

- [Communities Overview](../concepts/communities.md) - Understanding community structure
- [Trust System](../concepts/trust-system.md) - How trust enables poll creation
- [Councils](./councils.md) - Formal governance and initiatives
- [Permissions](../concepts/permissions.md) - Who can do what in communities

## Next Steps

Ready to participate in collective decision-making?

1. **[Browse Active Polls](#voting-on-polls)** - Find polls to vote on
2. **[Create Your First Poll](#creating-polls)** - Ask your community a question
3. **[Build Trust](#)** - Unlock poll creation permissions
4. **[Join Councils](#)** - Participate in formal governance
