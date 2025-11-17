# How to Use the Community Value Recognition System (Contributions)

## Accessing the Feature

1. **Navigate to your community page**
   - Go to any community you're a member of

2. **Click on "Contributions" in the sidebar**
   - The link appears in the left sidebar navigation
   - Icon shows hands with a heart (contributions icon)
   - Visible to all community members (no trust requirement)

## Features Overview

The contributions page has **5 main tabs**:

### 1. 📝 Log Contributions
**Who can access:** Members with trust ≥ 5 (default)

**What you can do:**
- Record your contributions to the community
- Select an item/service you contributed (e.g., "Childcare", "Garden Maintenance")
- Specify how many units (hours, sessions, items, etc.)
- Add a description of what you did
- Identify beneficiaries (who received the benefit)
- Identify witnesses (who observed your work)

**How to log a contribution:**
1. Click the "Log Contributions" tab
2. Select an item from the dropdown (e.g., "Childcare")
   - You can search for items
   - You can create new items if you have permission
3. Enter the number of units (e.g., 3 hours)
4. Write a description (e.g., "Watched Sarah's kids while she was at work")
5. Select beneficiaries from the member list
6. (Optional) Select witnesses
7. Click "Log Contribution"

**Status after logging:**
- Self-reported contributions start as **"Pending"**
- Beneficiaries will be notified to verify
- Once verified, they become **"Verified"** and count toward your total

---

### 2. 👀 My Profile
**Who can access:** All members can view their own profile

**What you see:**
- **6-Month Total**: Total recognition value for last 6 months
- **Lifetime Total**: All-time recognition value
- **Item Breakdown**: Recognition by category (e.g., "Childcare: 45 units", "Garden Tools: 30 units")
- **Recent Contributions**: List of your contributions with:
  - Item name and kind (object/service)
  - Units and total value
  - Description
  - Verification status (pending/verified/disputed)
  - Testimonials from beneficiaries

**Visual indicators:**
- Green checkmark = Verified
- Yellow clock = Pending verification
- Red flag = Disputed
- Blue auto-verify badge = System-verified

---

### 3. ✅ Verify Contributions
**Who can access:** Members with trust ≥ 15 (default)

**What you see:**
- List of contributions where **you are named as a beneficiary or witness**
- Contributions waiting for your verification

**How to verify:**
1. Review the contribution details
2. If accurate, click "Verify"
   - (Optional) Add a testimonial describing the value you received
3. If inaccurate, click "Dispute"
   - Enter a reason for the dispute

**After verification:**
- Verified contributions immediately count toward the contributor's totals
- Your testimonial appears on their profile
- You cannot change your verification later (builds trust)

---

### 4. 💝 Grant Peer Recognition
**Who can access:** Members with trust ≥ 10 (default)

**What you can do:**
- Grant recognition directly to another member
- Useful for **invisible labor** or contributions that aren't item-based
- Subject to monthly limits to prevent gaming

**Monthly limits (default):**
- **20 units total** per month to all members
- **3 units max** per month to the same person

**How to grant recognition:**
1. Search for a member
2. Enter the number of units to grant (within your remaining limit)
3. Write a description of what they contributed
4. Click "Grant Recognition"

**What happens:**
- Recognition is **auto-verified** (you're both granting AND verifying)
- Immediately counts toward their totals
- Your remaining monthly allowance decreases

**View your limits:**
- The page shows your remaining allowance
- Resets on the 1st of each month

---

### 5. ⚙️ Manage Categories (Admin Only)
**Who can access:** Admins or members with trust ≥ 25 (default)

**What it shows:**
- Explanation that **items** are used as contribution categories
- Link to the Items management page
- No separate category management (unified system)

**Why unified with items:**
- Same items for wealth sharing AND contributions
- Single source of truth for item values
- When someone shares "Garden Tools" as wealth, it's the same item used for logging "Garden Tools" contribution
- Simplifies admin experience

**To manage items:**
1. Click "Manage Items" button
2. You'll be taken to the Items page where you can:
   - Create new items (objects or services)
   - Set the value per unit (used for both wealth stats and contribution recognition)
   - Add contribution metadata (category type, examples)
   - Edit/delete items

---

## Key Concepts

### Trust-Based Access vs Recognition Value

**IMPORTANT:** Recognition value is **NOT** currency and does **NOT** grant access.

- **Access to features**: Controlled by **trust score** (peer relationships)
- **Recognition value**: Shows appreciation and makes contributions visible

**Example:**
- Alice has high recognition (180 value) but low trust (8 points)
  - She can view contributions but cannot log new ones (requires trust 5)
  - Her recognition is visible but doesn't unlock features

- Bob has low recognition (20 value) but high trust (30 points)
  - He can log contributions, verify, and grant peer recognition
  - Trust unlocks capabilities; recognition shows appreciation

### Verification Workflow

```
Member logs contribution (self-reported)
         ↓
Status: PENDING
         ↓
Beneficiary verifies (adds testimonial)
         ↓
Status: VERIFIED ✅
         ↓
Counts toward totals and displays on profile
```

### Anti-Gaming Mechanisms

The system includes safeguards:
- **Monthly limits** on peer recognition
- **Verification required** for self-reported contributions
- **Beneficiary/witness** system prevents self-verification
- **Dispute mechanism** for inaccurate contributions
- **Pattern detection** flags suspicious behavior (for admin review)

### Value Calibration

Communities can adjust item values democratically:
- Admins or councils propose value changes
- Community discussion period
- Decision via poll, consensus, or council vote
- Changes documented in calibration history
- **Future contributions** use new values
- **Past contributions** retain original values (fairness)

---

## Common Workflows

### 1. Contributing Time-Based Work (Services)

**Example: Providing childcare**

1. Click "Log Contributions"
2. Search for "Childcare" (or create it if it doesn't exist)
3. Enter hours: `3`
4. Description: "Watched Emma's children during her doctor appointment"
5. Select Emma as beneficiary
6. Submit → Status: Pending
7. Emma receives notification
8. Emma verifies and adds testimonial: "Charlie was wonderful with the kids, very reliable"
9. Status: Verified ✅
10. Your profile now shows: Childcare +3 hours (30 value units)

### 2. Contributing Material Items (Objects)

**Example: Lending tools**

1. Log contribution
2. Select "Garden Tools" (kind: object)
3. Units: `1` (one tool set)
4. Description: "Lent my power drill and saw for community garden shed project"
5. Beneficiaries: Project coordinators
6. Submit → Verified by coordinator
7. Profile shows: Garden Tools +1 item (10 value units)

### 3. Recognizing Invisible Labor

**Example: Someone always welcomes new members**

1. Click "Grant Peer Recognition"
2. Search for the member
3. Units: `5` (within your monthly limit)
4. Description: "Sarah always greets new members, answers questions, and makes people feel welcome. This invisible work is crucial to our community culture."
5. Submit → Auto-verified
6. Sarah's profile shows the recognition with your testimonial

### 4. Viewing Community Contributions

**As a member:**
- View your own profile: See all your contributions and recognition
- View others' profiles (if permitted): See what they've contributed
- Recognize patterns: See what kinds of work are valued
- Make invisible work visible: Understand the full range of contributions

**As an admin:**
- Review disputed contributions
- Calibrate item values based on scarcity/abundance
- View aggregate patterns (when Phase 2 analytics are added)
- Adjust trust thresholds for contribution features

---

## Tips for Community Members

### Building Your Profile
- **Log diverse contributions**: Time, materials, emotional labor, organizing
- **Be specific**: Good descriptions help others understand value
- **Verify promptly**: When you're listed as beneficiary, verify quickly
- **Add testimonials**: Qualitative feedback matters as much as numbers
- **Grant peer recognition**: Acknowledge others' invisible labor

### Using Recognition Wisely
- Recognition is **not** a competition (no leaderboards)
- It's about making **all forms of work visible**
- Focus on appreciation, not accumulation
- Use peer recognition to highlight work that doesn't fit item categories

### Understanding Your Limits
- **Monthly reset**: Peer recognition limits reset on the 1st
- **Same-person limit**: Max 3 grants per month to one person (builds distributed recognition)
- **Verification queue**: Check "Verify Contributions" regularly

---

## Troubleshooting

**"I can't see the Contributions link"**
- You must be a community member
- Check if the feature is enabled for your community
- Contact admin if the link is missing

**"I can't log contributions"**
- Requires trust ≥ 5 (default)
- Check your trust score in the Members tab
- Build trust by engaging with the community

**"My contribution is stuck on 'Pending'"**
- Beneficiaries need to verify
- Reach out to them outside the system to remind them
- After 7 days (default), they receive reminder notifications

**"I ran out of peer recognition units"**
- Monthly limit protects against gaming
- Limit resets on the 1st of each month
- Focus on logging item-based contributions instead

**"The item I need doesn't exist"**
- If you have `can_manage_items` permission, create it in Items page
- Otherwise, ask an admin to create the item
- Provide: name, kind (object/service), and value per unit

---

## For Community Admins

### Initial Setup

1. **Review default items** (400+ items auto-created)
   - Edit values to match community priorities
   - Deactivate items you don't need
   - Add contribution metadata to categorize them

2. **Create contribution-specific items**
   - "Community Event Organizing" (service)
   - "Welcoming New Members" (service)
   - "Emotional Support" (service)
   - "Atmosphere Creation" (service)

3. **Set trust thresholds**
   - `minTrustToViewRecognition`: 0 (everyone can view)
   - `minTrustToLogContributions`: 5 (can log)
   - `minTrustToGrantPeerRecognition`: 10 (can grant)
   - `minTrustToVerifyContributions`: 15 (can verify)
   - `minTrustForRecognitionManagement`: 25 (can calibrate values)

4. **Configure recognition settings**
   - Enable/disable peer recognition
   - Set monthly limits
   - Enable verification reminders
   - Choose dispute handling method

### Ongoing Management

**Review disputes:**
- Check disputed contributions
- Mediate between members
- Document resolutions

**Calibrate values:**
- Quarterly review of item values
- Adjust based on scarcity/abundance
- Community discussion before changes
- Document reasoning in calibration history

**Monitor patterns:**
- Watch for gaming attempts
- Review anti-gaming flags
- Address issues early

**Community education:**
- Explain recognition ≠ access
- Teach how to write good descriptions
- Encourage verification and testimonials
- Model good recognition practices

---

## What's Coming (Future Phases)

**Phase 2: Analytics & Community Stats**
- Aggregate community contribution statistics
- Contribution patterns and insights
- Privacy controls for profiles
- Enhanced anti-gaming with admin review UI

**Phase 3: Advanced Features**
- Auto-tracking from wealth fulfillment
- Soft reciprocity nudges (optional)
- Trust-contribution correlation insights
- Comprehensive admin documentation

---

## Philosophy & Principles

This feature embodies specific values:

**Making Invisible Work Visible**
- Care work, emotional labor, community building are explicitly valued
- No work is "too small" to recognize
- Qualitative testimonials matter as much as numbers

**Recognition, Not Currency**
- Cannot be spent or exchanged
- Does NOT grant feature access (trust does that)
- Pure appreciation and visibility

**Community Sovereignty**
- Each community sets its own values
- Democratic calibration processes
- No universal pricing imposed

**Anti-Competitive**
- No leaderboards or rankings
- Focus on appreciation, not accumulation
- Distributed recognition through peer grants

**Trust Separation**
- Recognition shows work; trust shows relationships
- Both matter, neither is reducible to the other
- Access remains trust-based (gift economy principle)

---

**Questions or feedback?** Contact your community admins or check the community forum!
