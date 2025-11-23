# Councils User Guide

## What are Councils?

Councils are specialized groups within your community that focus on specific domains or activities. Think of them as semi-autonomous working groups that can manage resources, propose initiatives, and coordinate around shared goals.

For example, a community might have:
- A Food Council that manages shared food resources and coordinates meals
- A Housing Council that manages housing allocations and maintenance
- A Garden Council that oversees community gardens and distributes produce
- A Tools Council that maintains and shares tools and equipment

Councils operate transparently, with all members able to view their activities, trust them based on their performance, and participate in their initiatives.

## Key Characteristics

**Councils are Community Actors**: Like individual members, councils can share resources, express needs, and create initiatives. They function as specialized entities within the community.

**Trust-Based Confidence**: Community members can award or remove trust from councils to express confidence in their mission and operations. Higher trust scores indicate greater community confidence.

**Transparent Operations**: All council activities - resource movements, usage reports, and initiatives - are visible to community members.

**Manager-Led**: Each council has managers (members who oversee council operations). Managers can create reports, manage resources, and propose initiatives.

## Creating a Council

### Requirements

To create a council, you need:
- Membership in the community
- Sufficient trust score (default: 25 trust)
- OR the `council_creator` role assigned by an admin

### Steps to Create

1. Navigate to your community
2. Go to the Councils section
3. Click "Create Council"
4. Fill in the required information:
   - **Council Name**: A clear, descriptive name (3-100 characters)
     - Example: "Community Food Council" not just "Food"
   - **Description**: Explain the council's purpose and scope (10-1000 characters)
     - Example: "Manages shared food resources, coordinates community meals, and distributes surplus produce to members in need."
   - **Additional Managers** (optional): Select other members to help manage the council
5. Click "Create"

You will automatically be added as a manager when you create a council.

### Naming Best Practices

- Use descriptive names that clearly indicate the council's domain
- Keep names professional and mission-focused
- Avoid duplicate names - each council in a community must have a unique name

## Joining a Council

### Becoming a Manager

Only existing council managers or community admins can add new managers to a council.

**To be added as a manager:**
1. Contact an existing council manager or community admin
2. They can add you through the council's Overview tab
3. You must already be a member of the community

**What managers can do:**
- Create and manage usage reports
- Create initiatives on behalf of the council
- Update council information (name and description)
- Add other managers to the council (if you're already a manager)
- Record pool consumptions

### Supporting a Council

Any community member can support a council by:
- Awarding trust to indicate confidence in the council's work
- Voting on council initiatives
- Commenting on initiatives
- Sharing resources with the council
- Participating in discussions

## Council Roles and Permissions

### Community Member (Non-Manager)

**What you can do:**
- View all councils in your community
- View council details, inventory, and activities
- Award or remove trust from councils
- Vote on council initiatives
- Comment on initiatives
- Share resources with councils
- View usage reports

**What you cannot do:**
- Create usage reports
- Manage council resources
- Update council information
- Add/remove managers

### Council Manager

**Everything a community member can do, plus:**
- Create usage reports documenting resource usage
- Upload attachments to reports (photos, documents)
- Create initiatives to propose community actions
- Update council name and description
- Add new managers to the council
- Record pool consumptions when using pool resources
- Delete usage reports

### Community Admin

**Everything a manager can do, plus:**
- Delete councils
- Remove managers from any council
- Create councils regardless of trust requirements
- Assign the `council_creator` role to members

## The Council Trust System

### How Council Trust Works

Council trust represents community confidence in a council's mission and operations. It's similar to member trust but specifically for councils.

**Trust Score**: The number of community members who have awarded trust to the council
- Example: If 25 members trust the "Food Council," its trust score is 25

**Awarding Trust**: Members can award trust to councils they believe are doing good work
**Removing Trust**: Members can remove their trust at any time if they lose confidence

### Why Council Trust Matters

Council trust scores can determine:
- Council visibility and prominence in listings (councils can be sorted by trust)
- Community confidence indicators
- Potential future features (resource access, dispute handling, etc.)

### How to Trust a Council

1. Go to the council's page
2. Click "Award Trust" in the Overview tab
3. Your trust is immediately recorded
4. The council's trust score increases by 1

### How to Remove Trust

1. Go to the council's page (if you've previously trusted it)
2. Click "Remove Trust" in the Overview tab
3. Your trust is immediately removed
4. The council's trust score decreases by 1

## Managing Council Resources

### Viewing Council Inventory

Every council has a transparent inventory showing:
- What resources the council currently has
- Quantity of each resource
- Transaction history (how resources were acquired or used)

**To view inventory:**
1. Go to the council's page
2. Click on the "Inventory" tab

### How Councils Receive Resources

**Direct Sharing**: Community members can share wealth (resources) directly with a council
- When sharing, select the council as the recipient
- The resource transfers immediately to the council's inventory
- The transaction is logged in the council's history

**Pool Contributions**: Councils that manage pools receive resources contributed to those pools

### Creating Usage Reports

Usage reports document how councils have used their resources. They provide transparency and accountability.

**Requirements**: You must be a council manager

**Steps to create a report:**
1. Go to the council's page
2. Click the "Usage Reports" tab
3. Click "Create Report"
4. Fill in the information:
   - **Title**: Brief summary of the activity
     - Example: "Community Meal - March 15th"
   - **Content**: Detailed explanation using Markdown formatting
     - Explain what was done, why, and the impact
     - Include context and outcomes
   - **Items Used** (optional): Select resources and quantities consumed
     - Example: "5 carrots, 2 kg potatoes"
   - **Attachments** (optional): Upload photos or documents
     - Before/after photos
     - Receipts
     - Activity documentation
5. Click "Submit"

**Report Features:**
- Markdown support for rich formatting (headers, lists, links, etc.)
- Live preview to see how your report will look
- Multiple file attachments
- Expandable/collapsible in the list view

**Best Practices:**
- Write clear, descriptive titles
- Include enough detail for transparency
- Add photos when possible - they build trust
- Document both successes and challenges
- Report regularly to maintain community confidence

## Managing Council Pools

Councils can own and manage pools - shared resource collections.

**View council pools:**
1. Go to the council's page
2. Click the "Pools" tab
3. See all pools owned by this council

**Create a pool:**
- Pools are created at the community level
- When creating a pool, select the council as the owner
- See the Pools documentation for detailed instructions

**Record pool consumption:**
When using items from a pool the council owns:
1. Create a consumption record documenting what was used
2. Optionally link it to a usage report for full transparency

## Creating Initiatives and Reports

### What are Initiatives?

Initiatives are proposals for community actions created by councils. They allow councils to:
- Propose projects or activities
- Gather community feedback and support
- Track progress through reports
- Facilitate community-wide coordination

**Examples:**
- "Start a community composting program"
- "Organize weekly shared meals"
- "Build a tool library and sharing system"

### Creating an Initiative

**Requirements**: You must be a council manager

**Steps:**
1. Go to the council's page
2. Click the "Initiatives" tab
3. Click "Create Initiative"
4. Fill in the information:
   - **Title**: Clear, action-oriented title
   - **Description**: Detailed proposal using Markdown
     - What you're proposing
     - Why it matters
     - What resources or participation is needed
     - Timeline if applicable
5. Click "Submit"

The initiative starts with "active" status and is immediately visible to all community members.

### Voting on Initiatives

**Any community member can vote** on council initiatives:

**To vote:**
1. Go to the initiative's page
2. Click "Upvote" if you support the initiative
3. Click "Downvote" if you have concerns
4. Click again to remove your vote

**Vote counts are visible** to show community sentiment. Highly supported initiatives guide community action.

### Initiative Status

Initiatives can have three statuses:
- **Active**: Currently proposed, voting open
- **Completed**: Initiative has been accomplished
- **Cancelled**: Initiative has been abandoned or is no longer relevant

Council managers can update the status as needed.

### Creating Progress Reports

Council managers can create progress reports for initiatives to update the community.

**To create a report:**
1. Go to the initiative's page
2. Scroll to the "Reports" section
3. Click "Create Report"
4. Write your update using Markdown
5. Click "Submit"

**What to include in progress reports:**
- What has been accomplished
- Current status
- Challenges encountered
- Next steps
- Photos or documentation if available

### Commenting

**Any community member can comment** on:
- Initiatives (to ask questions or share thoughts)
- Initiative reports (to respond to updates)

Comments support Markdown formatting and create ongoing discussions.

## Usage Reports and Consumptions

### Usage Reports vs. Pool Consumptions

These are two complementary features for tracking resource use:

**Usage Reports**: Narrative explanations of how resources were used
- Focus: Storytelling and transparency
- Format: Written reports with photos
- When: After activities or projects
- Who: Council managers
- Example: "We used 5 carrots and 2 kg potatoes to cook a community meal for 20 people on March 15th. The meal brought neighbors together and used surplus vegetables."

**Pool Consumptions**: Structured records of items taken from pools
- Focus: Inventory tracking
- Format: Item + quantity + description
- When: Each time items are removed from a pool
- Who: Council managers
- Example: Item "Carrots" - 5 units - "For community meal March 15"

### Linking Them Together

You can link consumption records to usage reports for complete transparency:
1. Create a usage report describing the activity
2. When recording pool consumptions, select the usage report to link to
3. The consumption now references the full story

This creates a full audit trail: "Council took X from pool Y for purpose described in report Z"

### Creating a Pool Consumption

**Requirements**: You must be a council manager

**Steps:**
1. Go to the council's page (or the pool's page)
2. Find the "Consumptions" section
3. Click "Record Consumption"
4. Fill in the information:
   - **Pool**: Select which pool you're taking from
   - **Item**: Select what you're taking
   - **Quantity**: How much
   - **Description**: Brief explanation
   - **Link to Report** (optional): Select an existing usage report
5. Click "Submit"

The pool's inventory automatically decreases, and the consumption is logged.

## Best Practices

### Building Trust

1. **Report regularly**: Create usage reports after significant activities
2. **Be transparent**: Document both successes and challenges
3. **Include photos**: Visual evidence builds confidence
4. **Respond to comments**: Engage with members who have questions
5. **Follow through**: Complete initiatives or update their status

### Effective Council Management

1. **Clear purpose**: Keep your council focused on a specific domain
2. **Regular communication**: Post updates even when there's no dramatic news
3. **Inclusive initiatives**: Propose activities that benefit the whole community
4. **Resource stewardship**: Use shared resources wisely and document usage
5. **Collaborative management**: Add managers with diverse skills

### Creating Good Initiatives

1. **Specific and actionable**: Clearly define what you're proposing
2. **Explain the why**: Help members understand the benefit
3. **Realistic scope**: Start with achievable initiatives
4. **Open to feedback**: Respond to comments and concerns
5. **Report progress**: Keep the community updated

### Writing Effective Reports

1. **Tell the story**: Explain not just what was done, but why and the impact
2. **Be honest**: Report challenges as well as successes
3. **Use formatting**: Headers, lists, and bold text make reports easier to read
4. **Include details**: Specific numbers, dates, and outcomes
5. **Add photos**: Visual documentation is powerful

## Common Questions

### Can I be a member of multiple councils?

Yes, you can be a manager of multiple councils if invited. There's no limit.

### Can I remove myself as a council manager?

Currently, only community admins can remove managers. Contact an admin if you need to step down.

### How do I delete a council?

Only community admins can delete councils. This prevents accidental deletion and ensures accountability.

### What happens to resources when a council is deleted?

Council deletion should be handled carefully by admins. Resources in council inventory should be redistributed before deletion.

### Can councils create their own trust requirements?

No, councils use community-wide trust thresholds. Admins can adjust these in community settings.

### How is council trust different from member trust?

- **Member trust**: Awarded by members to other members, determines feature access
- **Council trust**: Awarded by members to councils, indicates confidence in council operations

They're tracked separately, but both work the same way (can be awarded and removed).

### Can councils award trust to members or other councils?

No, councils don't award trust. Only individual members can award trust to other members or to councils.

### What's the difference between updating council info and creating reports?

- **Update council info**: Changes the name or description (basic council profile)
- **Usage reports**: Documents specific activities and resource usage (ongoing activity log)

### Can anyone see usage reports?

Yes, all community members can view all usage reports. Transparency is a core principle.

### Do I need to record every small use of resources?

Use your judgment. Record significant uses and batch small uses into periodic reports. The goal is transparency, not excessive bureaucracy.

### Can I edit or delete a usage report after creating it?

Council managers can delete reports they created. Editing is currently not supported - create a new report if you need to make corrections.

### How do initiatives differ from polls?

- **Initiatives**: Council proposals for community action, created by councils, support voting and progress tracking
- **Polls**: Community-wide questions, created by any trusted member, focused on gathering opinions

### Can I convert an initiative to completed status?

Yes, council managers can update initiative status through the initiative's page.

---

## Need Help?

If you have questions about councils that aren't answered here:
1. Ask in your community forum
2. Contact your community admins
3. Check the technical documentation for advanced details
