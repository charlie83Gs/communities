# How to Create a Pool

This guide walks you through creating and managing resource pools.

## Before You Start

**What you'll need:**
- Council manager role (only councils can create pools)
- Understanding of what pools do and how they work
- Clear vision for what resources you'll aggregate
- Distribution plan

**Time required:** 15-20 minutes to plan and create

!!! note "Council Requirement"
    Only council managers can create pools. If you're not on a council, start with [How to Join a Council](join-council.md).

## Quick Start

Pools are logistics endpoints that simplify many-to-many resource distribution. Instead of 8 producers coordinating with 20 consumers (160 individual transactions), producers share to one pool and consumers receive from one pool (28 transactions total). Pools solve coordination and logistics problems.

## Understanding Pools

### What Pools Do

**Problem pools solve:**
```
WITHOUT POOL:
8 tomato growers → 20 households = 160 individual coordination points
- Each household gets tomatoes from 8 different sources
- Each grower coordinates with 20 different households
- Complex logistics, many pickups, high overhead

WITH POOL:
8 tomato growers → Pool → 20 households = 28 coordination points
- Growers deliver to one central location
- Households pick up from one central location
- Council manages aggregation and distribution
- Simple, efficient logistics
```

### Pool Architecture

**Built on wealth system:**
- Contributions to pools = standard wealth shares
- Distributions from pools = standard wealth shares
- Same infrastructure, unified tracking
- Transparent and auditable

**Integration benefits:**
- All activity visible in community feed
- Statistics track pool vs. direct sharing
- Consistent validation and authorization
- One system for all resource flows

### When to Create a Pool

**Good use cases:**
- Multiple producers, multiple consumers
- Regular/recurring resource flow
- Logistics coordination needed
- Aggregation adds value
- Distribution from central location

**Examples:**
- Weekly produce from multiple gardens
- Tool library with many donors/borrowers
- Community pantry with various contributors
- Shared equipment pool
- Skill-sharing time bank

**Don't create pool if:**
- Only one or two producers
- One-time distribution
- Direct coordination works fine
- Overhead not worth it

_[Screenshot placeholder: Pool concept diagram]_

## Planning Your Pool

### 1. Define Pool Purpose

**What will this pool do?**
- Aggregate what resources?
- Serve what need?
- How often distribute?
- Who are producers and consumers?

**Example - Community Garden Pool:**
```
Purpose: Aggregate produce from 12 community garden plots
and distribute to households weekly.

Resources: Fresh vegetables and herbs
Frequency: Weekly distribution on Saturdays
Producers: Garden plot holders
Consumers: Any community member
```

**Example - Tool Library Pool:**
```
Purpose: Centralize tool donations and coordinate lending
to reduce individual tool ownership needs.

Resources: Hand tools, power tools, garden equipment
Frequency: On-demand lending
Producers: Members donating or lending tools
Consumers: Members borrowing tools
```

### 2. Determine Allowed Items

**Open vs. Restricted pools:**

**Open (no item restrictions):**
- Accept any community item
- Flexible and simple
- Works for general-purpose pools
- Risk: Harder to manage diverse inventory

**Restricted (item whitelist):**
- Only accept specific items
- Focused and organized
- Better for specialized pools
- Example: "Fresh Produce Pool" only accepts vegetables/fruits

**Recommendation:** Start focused, expand later if needed.

### 3. Plan Distribution Strategy

**How will resources get to people?**

**Central pickup:**
- Set distribution location
- Schedule pickup times
- Members come to you
- Works for: Food, tools, equipment

**Delivery:**
- Council delivers to members
- More work but more accessible
- Works for: Elderly, disabled, limited mobility

**Mixed approach:**
- Pickup available
- Delivery for those who need it
- Flexible and inclusive

### 4. Set Contribution Rules

**Who can contribute?**
- Anyone (typical default)
- Only council members
- Only approved producers

**Minimum contribution amount:**
- No minimum (easiest)
- Small minimum to reduce overhead
- Example: "Minimum 2 kg for produce"

**Approval process:**
- Council confirms all contributions (recommended)
- Auto-accept (risky for quality control)

### 5. Configure Distribution Limits

**Max units per person:**
- Cap individual allocations
- Ensures fair distribution
- Example: "Max 5 kg per household"

**Priority rules:**
- Fulfill published needs first
- First-come-first-served
- Equal distribution
- Council discretion

_[Screenshot placeholder: Pool planning worksheet]_

## Step-by-Step Creation

### 1. Navigate to Pool Creation

**From council dashboard:**
1. Go to your council page
2. Find **Pools** section
3. Click **Create Pool** button

_[Screenshot placeholder: Council dashboard with create pool button]_

### 2. Basic Pool Information

**Pool Name (Required):**
- Clear and descriptive
- Indicates purpose
- 5-50 characters recommended

**Examples:**
- ✓ "Community Garden Produce Pool"
- ✓ "Shared Tool Library Pool"
- ✓ "Weekly Fresh Food Pool"
- ✗ "Stuff Pool" (too vague)
- ✗ "The Best Pool Ever Created in the History of Pools" (too long)

**Pool Description (Required):**
- Explain purpose
- Who can contribute
- How distribution works
- Any special rules or requirements

**Example:**
```
This pool aggregates fresh produce from community garden plots
and distributes it weekly to community members.

CONTRIBUTIONS:
- Any plot holder can contribute surplus produce
- Council confirms contributions at drop-off
- Drop-off location: Community Center, Saturdays 9-11am

DISTRIBUTION:
- Pickup: Saturdays 1-3pm at Community Center
- Distribution based on published needs and availability
- Max 5 kg per household per week
- Bring your own bags/containers
```

_[Screenshot placeholder: Pool creation form - basic info]_

### 3. Configure Council

**Owning Council (Required):**
- Select your council
- Only councils you manage appear
- Pool belongs to this council

**Council responsibilities:**
- Confirm contributions
- Manage inventory
- Distribute resources
- Maintain pool

### 4. Set Distribution Location

**Location (Optional but Recommended):**
- Physical address or description
- Where people pick up
- Where people drop off

**Examples:**
```
"Community Center, 123 Main St, Room 5"

"Sarah's garage, 456 Oak Ave (access from alley)"

"Mobile distribution - location announced weekly via forum"
```

**Why it matters:**
- Helps contributors know where to bring items
- Helps consumers know where to pick up
- Reduces confusion and coordination overhead

_[Screenshot placeholder: Pool location field]_

### 5. Define Allowed Items (Optional)

**Item Whitelist:**

**Leave empty for open pool:**
- Accepts any community item
- Most flexible
- Good for general-purpose pools

**Add specific items for focused pool:**
1. Click **Add Allowed Item**
2. Search and select item from community catalog
3. Repeat for each allowed item
4. Pool only accepts these items

**Example - Produce Pool:**
- Tomatoes
- Lettuce
- Cucumbers
- Peppers
- Zucchini
- Herbs
- (All produce items from catalog)

**Example - Tool Pool:**
- Hammers
- Saws
- Drills
- Wrenches
- Garden Tools
- (All tool items from catalog)

**Benefits of whitelist:**
- Focused inventory
- Easier to manage
- Clear expectations for contributors
- Better organization

_[Screenshot placeholder: Item whitelist configuration]_

### 6. Set Contribution Settings

**Minimum Contribution Amount (Optional):**
- Leave at 0 for no minimum
- Set minimum to reduce overhead
- Example: "2" for minimum 2 kg/units

**Approval Process:**
- **Require confirmation** (recommended): Council must confirm
- **Auto-accept** (risky): Immediately accepted

!!! warning "Recommendation: Require Confirmation"
    Council confirmation ensures quality control and accurate inventory. Auto-accept only if you trust all contributors completely.

_[Screenshot placeholder: Contribution settings]_

### 7. Configure Distribution Rules

**Max Units Per Person (Optional):**
- Cap on individual allocations
- Ensures fair distribution
- Example: 5 (max 5 kg/units per person)
- Leave empty for no limit

**Distribution Priority (Informational):**
- Document how you'll prioritize distribution
- Not enforced by system (council manages this)
- Helps set expectations

**Examples:**
```
"Needs-based: Published needs fulfilled first, then FCFS"

"Equal distribution: Available inventory split equally among requesters"

"Council discretion: Managers decide based on circumstances"
```

_[Screenshot placeholder: Distribution settings]_

### 8. Review and Create

1. Preview all settings
2. Check for errors
3. Verify item whitelist (if used)
4. Click **Create Pool**

**What happens:**
- Pool created and visible in community
- Appears in council's pool list
- Members can see it and contribute
- Inventory starts at zero

_[Screenshot placeholder: Pool creation confirmation]_

## Managing Pool Inventory

### Receiving Contributions

**Contribution flow:**
1. Member creates wealth share to pool
2. Appears in council's pending contributions
3. Council confirms physical receipt
4. Inventory updates automatically

**Steps to confirm contribution:**
1. Go to **Pool Contributions** tab
2. See pending contributions
3. Verify physical item received
4. Click **Confirm** or **Accept**
5. Inventory increases

**Quality control:**
- Check quantity matches
- Verify quality/condition
- Refuse if inappropriate
- Document issues

_[Screenshot placeholder: Pending contributions panel]_

### Tracking Inventory

**Inventory dashboard shows:**
- Current quantity for each item
- Total value (if configured)
- Recent contributions
- Recent distributions
- Inventory history

**Monitor for:**
- Low stock situations
- Excess inventory
- Perishable items expiring
- Distribution opportunities

_[Screenshot placeholder: Pool inventory dashboard]_

### Distribution Methods

**Option 1: Manual Distribution**
- Create individual wealth shares
- From pool to specific members
- Good for: Custom allocations, special cases

**Option 2: Needs-Based Mass Distribution**
- View published needs for pool items
- Select fulfillment strategy
- Create multiple wealth shares at once
- Good for: Regular distributions, high volume

**Recommended:** Use mass distribution for regular scheduled distributions.

## Needs-Based Distribution

### View Community Needs

**Access needs dashboard:**
1. Go to pool detail page
2. Click **View Community Needs**
3. See aggregated needs for pool items

**Needs table shows:**
- Who needs what item
- How many units needed
- Total need across community
- Member trust scores (if relevant)

_[Screenshot placeholder: Community needs for pool items]_

### Configure Distribution

**Select items to distribute:**
- Choose which items from inventory
- Can distribute multiple items at once

**Set fulfillment strategy:**

**Full fulfillment:**
- Give each person their full requested amount
- If inventory allows
- Most generous

**Partial with limit:**
- Cap per person (e.g., max 5 kg each)
- Distribute to more people
- Fairer when inventory is limited

**Equal split:**
- Divide available inventory equally
- Everyone gets same amount
- Simplest approach

**Custom selection:**
- Choose specific recipients
- Assign amounts manually
- Most control, most work

_[Screenshot placeholder: Mass distribution configuration]_

### Execute Distribution

1. Review distribution plan
2. See preview of who gets what
3. Confirm quantities
4. Click **Distribute**

**What happens:**
- Multiple wealth shares created
- One for each recipient
- Auto-fulfilled (no confirmation spam)
- Inventory decreases
- Recipients notified
- Pickup coordinated via messages

**After distribution:**
- Manage pickup logistics
- Coordinate timing
- Track who picked up
- Handle no-shows

_[Screenshot placeholder: Distribution confirmation screen]_

## Pool Communication

### Announcing Distributions

**Forum post template:**
```
[POOL DISTRIBUTION] Fresh Produce Available - Saturday Pickup

The Community Garden Produce Pool has fresh vegetables ready
for pickup this Saturday!

WHEN: Saturday, June 10, 1-3pm
WHERE: Community Center, Room 5
BRING: Your own bags/containers

AVAILABLE:
- Tomatoes (15 kg total, ~1 kg per household)
- Lettuce (20 heads, ~1 head per household)
- Cucumbers (25, ~1-2 per household)
- Herbs (bunches - take what you need)

If you published a need for these items, you'll receive a
notification. Others welcome on FCFS basis while supplies last.

See you Saturday!
- Garden Council
```

### Coordinating Contributions

**Message to potential contributors:**
```
Reminder: Garden Pool Drop-Off This Saturday

Hi garden plot holders! Just a reminder that you can drop
off surplus produce at the Community Center this Saturday
morning, 9-11am.

We'll be there to receive contributions and confirm them in
the app. We especially need:
- Tomatoes
- Summer squash
- Herbs

Thanks for sharing your harvest with the community!
```

### Managing Requests

**Use pool messages for:**
- Pickup confirmation
- Location clarifications
- Timing coordination
- Special accommodations
- No-show follow-up

## Best Practices

### For Pool Creation

✓ **Start focused**
- Begin with specific items
- Expand scope later if needed
- Easier to manage initially

✓ **Set clear expectations**
- Document how pool works
- Explain contribution process
- Describe distribution method
- Communicate location and timing

✓ **Choose good location**
- Accessible to contributors
- Accessible to consumers
- Adequate space
- Appropriate for items (refrigeration, shelter, etc.)

✓ **Plan for logistics**
- Who will be present for drop-offs?
- Who manages pickups?
- How to handle perishables?
- Backup plan for no-shows?

### For Pool Management

✓ **Confirm contributions promptly**
- Don't let pending contributions accumulate
- Verify quality and quantity
- Update inventory accurately
- Thank contributors

✓ **Distribute regularly**
- Don't hoard inventory
- Perishables especially
- Match distribution to contribution rhythm
- Communicate schedule

✓ **Communicate clearly**
- Announce distributions in advance
- Remind people of timing
- Follow up on logistics
- Thank participants

✓ **Track and report**
- Monitor inventory levels
- Report to community periodically
- Celebrate successes
- Share statistics

### For Contributors

✓ **Follow pool guidelines**
- Respect item whitelist
- Meet minimum quantities
- Drop off during designated times
- Confirm in the app

✓ **Quality control**
- Only contribute good quality items
- Don't dump trash
- Clean/prepare items appropriately
- Be honest about condition

✓ **Communicate**
- Let council know you're coming
- Message if plans change
- Ask questions if uncertain

### For Recipients

✓ **Publish needs**
- Use needs system for regular wants
- Helps pool plan distribution
- Increases chance of fulfillment

✓ **Pick up on time**
- Come during designated hours
- Bring appropriate containers
- Don't be late or no-show
- Communicate if you can't make it

✓ **Take what you need**
- Don't hoard
- Leave for others
- Be mindful of limits
- Express gratitude

## Common Scenarios

### Weekly Produce Distribution

**Setup:**
- Pool: Community Garden Produce
- Items: All vegetables and herbs
- Drop-off: Saturday mornings
- Distribution: Saturday afternoons
- Max per household: 5 kg total

**Weekly rhythm:**
1. Monday: Announce Saturday distribution
2. Friday: Remind contributors to bring produce
3. Saturday 9-11am: Receive contributions
4. Saturday 11am-12pm: Sort and prepare
5. Saturday 12pm: Run mass distribution based on needs
6. Saturday 1-3pm: Pickup window
7. Sunday: Follow up with no-shows, report to community

### Ongoing Tool Library

**Setup:**
- Pool: Community Tool Library
- Items: All tools (whitelist of 50+ tools)
- Location: Council member's garage
- Distribution: On-demand by request
- No max per person

**Process:**
1. Member donates tool → adds to pool
2. Council confirms receipt → inventory increases
3. Member needs tool → requests from pool shares
4. Council creates individual wealth share
5. Coordinate pickup/return
6. Return → inventory increases again

### Seasonal Resource Pool

**Setup:**
- Pool: Winter Clothing Pool
- Items: Coats, boots, gloves, hats
- Drop-off: Ongoing
- Distribution: As needed, especially November-February
- No max per person

**Seasonal flow:**
1. September: Announce pool for winter preparation
2. October-November: Collect contributions
3. November: First mass distribution
4. December-February: Ongoing distribution as needs arise
5. March: Final distribution
6. April: Collect returns, store for next year

## Troubleshooting

### "Contributors not confirming in app"

**Problem:** People drop off items but don't create wealth shares

**Solutions:**
1. Educate contributors on process
2. Have someone at drop-off to help
3. Create checklist/instructions at drop-off location
4. Follow up after drop-off to confirm in app
5. Consider having council create shares on contributors' behalf (with permission)

### "Inventory inaccurate"

**Problem:** App inventory doesn't match physical inventory

**Solutions:**
1. Recount physical inventory
2. Review contribution history
3. Check for unconfirmed contributions
4. Adjust inventory manually (if permitted)
5. Implement better receiving process

### "Low participation in distributions"

**Problem:** Inventory building up, few people picking up

**Solutions:**
1. Promote more actively (forum, announcements)
2. Check if timing works for community
3. Consider delivery option
4. Adjust distribution days/times
5. Survey community about barriers
6. Reduce distribution frequency if low demand

### "Contributors gaming the system"

**Problem:** Poor quality contributions, inflated quantities, inappropriate items

**Solutions:**
1. Implement stricter confirmation process
2. Reject inappropriate contributions
3. Communicate quality standards
4. Talk with contributor directly
5. Consider removing contributor access (last resort)

### "Distribution logistics overwhelming"

**Problem:** Too much coordination work for council

**Solutions:**
1. Recruit more council members
2. Simplify distribution process
3. Reduce frequency
4. Limit pool scope
5. Create self-serve pickup (if appropriate)
6. Consider closing pool if unsustainable

## Next Steps

Now that you understand pools:

1. **[Join a Council](join-council.md)** - First step if you're not on a council
2. **[Share Resources](share-resources.md)** - Contribute to pools
3. **[Log Contributions](log-contributions.md)** - Track pool impacts

## Related Topics

- [Pools](../features/pools.md) - Complete feature documentation
- [Councils](../features/councils.md) - Council roles and permissions
- [Wealth Sharing](../features/wealth-sharing.md) - How pools integrate with wealth
- [Needs System](../features/needs-system.md) - Needs-based distribution

---

**Remember:** Pools solve logistics problems by centralizing coordination. Start focused, communicate clearly, and adjust based on what works for your community.
