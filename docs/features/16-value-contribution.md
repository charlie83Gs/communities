---
id: FT-16
title: Community Value Recognition System
status: partial
version: 2.2
last_updated: 2025-11-19
related_features: [FT-01, FT-02, FT-03, FT-04, FT-09, FT-13]
---

# Community Value Recognition System

## Overview
The Community Value Recognition System enables communities to collectively define, track, and recognize all forms of valuable work—especially work that is traditionally invisible or undervalued. Unlike market-based systems that impose universal pricing, this system allows each community to democratically determine what they value and how much. Unlike the trust system (which measures peer relationships), the value recognition system makes tangible and intangible contributions visible for community appreciation and awareness.

**Key Principle:** Value recognition is for social appreciation and visibility, NOT for access control or feature gating. Access control remains trust-based to preserve gift economy principles.

## Core Philosophy

### Making Invisible Work Visible
Traditional economic systems fail to recognize:
- **Care work** (elder care, child care, emotional support)
- **Community building** (welcoming, organizing, conflict resolution)
- **Creative/cultural work** (art, music, storytelling, ritual)
- **Maintenance work** (cleaning, organizing, beautifying spaces)
- **Emotional labor** (noticing needs, creating safety, remembering)

This system explicitly names and values these contributions alongside material sharing and technical work.

### Community Sovereignty Over Value
- No predetermined market values
- Communities define their own value categories
- Democratic calibration and adjustment
- Different communities can value the same work differently
- **What matters is what the community decides matters**

### Recognition, Not Currency
**Value units are social currency (appreciation), not access currency (payment).**
- Cannot be spent or exchanged
- Cannot buy access to features
- Cannot be transferred between members
- Pure recognition and visibility

## Key Concepts

### Value Recognition vs Trust vs Access Control

The system maintains three distinct but related dimensions:

#### **Trust Score** (Relationship-Based)
- **Measures:** Peer relationships and community confidence
- **Source:** Explicit trust endorsements from other members
- **Purpose:** Access control, permissions, social capital
- **Nature:** Relational, interpersonal, reputation-based

#### **Value Recognition** (Contribution-Based)
- **Measures:** Recognized contributions to community wellbeing
- **Source:** Logged activities verified by peers
- **Purpose:** Visibility, appreciation, pattern awareness
- **Nature:** Informational, cultural, recognition-based

#### **Access Control** (Trust + Time Based)
- **Determines:** What resources can be requested, what features can be accessed
- **Based on:** Trust score + time in community + community standing
- **NOT based on:** Value recognition units
- **Purpose:** Protection from extraction while allowing genuine need

**Example Scenarios:**

**High Recognition + High Trust = Alice**
- Contributes care work, community building, material sharing
- Trusted by many community members
- **Result:** Full receiving capacity, recognized and appreciated

**High Recognition + Low Trust = Bob**
- Logs many contributions but behaviors raise concerns
- Community doesn't trust him despite logged activity
- **Result:** Limited receiving capacity (trust determines access, not recognition)

**Low Recognition + High Trust = Carol**
- Limited capacity to contribute (disability, crisis, caregiving)
- Deeply trusted through relationships
- **Result:** Full receiving capacity (trust allows receiving even with low recognition)

**Low Recognition + Low Trust = Dave**
- New member still integrating, or problematic member
- **Result:** Limited receiving capacity until trust develops through relationship

## Integration with Items System

**IMPLEMENTATION NOTE:** The value recognition system integrates with the existing **items table** (FT-04) rather than creating a separate categories system. This provides several benefits:

- **Single source of truth**: Item values (`items.wealthValue`) serve both wealth sharing statistics AND contribution recognition
- **Unified experience**: Same items used for sharing wealth and logging contributions
- **Simplified management**: Communities manage one set of items, not separate categories
- **Cross-feature analytics**: Can correlate wealth sharing with contribution recognition
- **Automatic tracking**: When wealth is fulfilled, can optionally auto-log as contribution

### Items as Contribution Categories

Communities use **existing items** from the wealth sharing system as contribution categories:

1. **Services** (e.g., "Childcare", "Elder Care", "Tutoring"):
   - `kind = 'service'`
   - Units typically measured in hours or sessions
   - Perfect for time-based contributions

2. **Objects** (e.g., "Garden Tools", "Baking Supplies", "Books"):
   - `kind = 'object'`
   - Units typically measured in items, days (for loans), or portions
   - Used for material sharing contributions

3. **Item Metadata** for Contributions:
   - Items can include `contributionMetadata` JSONB field:
     ```json
     {
       "categoryType": "care",
       "examples": ["Elder care sessions", "Childcare hours"]
     }
     ```
   - This metadata helps categorize contributions by type (care, community building, etc.)

### Default Starting Items (All Equal by Default)

Communities begin with 400+ default items (from FT-04) with equal valuation (10 value units per standard unit) and adjust based on their own priorities:

#### **Example Service Items** (Care Work, Teaching, etc.)
```
These items exist in the items table with kind='service':

- "Childcare" (wealthValue: 10, contributionMetadata: { categoryType: 'care' })
- "Elder Care" (wealthValue: 10, contributionMetadata: { categoryType: 'care' })
- "Tutoring" (wealthValue: 10, contributionMetadata: { categoryType: 'knowledge' })
- "Conflict Mediation" (wealthValue: 10, contributionMetadata: { categoryType: 'community_building' })
- "Music Lessons" (wealthValue: 10, contributionMetadata: { categoryType: 'creative' })
- "Garden Maintenance" (wealthValue: 10, contributionMetadata: { categoryType: 'maintenance' })
- "Emotional Support" (wealthValue: 10, contributionMetadata: { categoryType: 'care' })

Units are typically hours or sessions.
```

#### **Example Object Items** (Material Sharing)
```
These items exist in the items table with kind='object':

- "Garden Tools" (wealthValue: 10, contributionMetadata: { categoryType: 'material' })
- "Books" (wealthValue: 10, contributionMetadata: { categoryType: 'knowledge' })
- "Fresh Vegetables" (wealthValue: 10, contributionMetadata: { categoryType: 'material' })
- "Musical Instruments" (wealthValue: 10, contributionMetadata: { categoryType: 'creative' })

Units are typically item-days (for loans) or portions (for food).
```

#### **Contribution-Specific Items**
Communities can create items specifically for contribution tracking that may not be shared as wealth:

```
- "Community Event Organizing" (service, wealthValue: 10)
- "Welcoming New Members" (service, wealthValue: 10)
- "Atmosphere Creation" (service, wealthValue: 10)
- "Memory Keeping" (service, wealthValue: 10)

These make "invisible labor" explicitly visible and valued.
```

### Item Value Calibration Process

Communities periodically review and adjust item values (the `wealthValue` field) through democratic processes:

#### Quarterly Value Review
```
1. Council or working group proposes item value adjustments
2. Rationale provided based on observations:
   - Scarcity/abundance of certain contributions
   - Effort required vs current valuation
   - Community priorities and needs
3. Community discussion and feedback
4. Decision through consensus, council vote, or community poll
5. Changes documented in value_calibration_history table
6. Item's wealthValue updated (affects future wealth shares AND contributions)
7. Past contributions retain their snapshot value (valuePerUnit at time of contribution)
```

**Example Calibration:**
```
Item: "Elder Care" (service)
Proposal: Increase wealthValue from 10 to 15 units/hour

Reasoning:
- Elder care is becoming scarce
- Community has aging population with growing needs
- Current caregivers report high effort/impact
- Community values intergenerational care highly

Discussion: 2 weeks
Decision: Community poll (78% support)
Effective: Next quarter

Result:
- items.wealthValue updated: 10 → 15
- value_calibration_history entry created
- Future contributions and wealth shares use new value
- Past contributions keep original valuePerUnit=10 (snapshot)
```

## Contribution Recognition Workflow

### 1. How Contributions Are Created

Contributions are created through two primary pathways:

#### **A. Automatic from Wealth Fulfillment (Primary)**
When a wealth share request is fulfilled, a contribution is automatically created for the sharer:
```
Automatic Contribution Flow:
1. Member A shares wealth (e.g., "Garden Tools" for 3 days)
2. Member B requests to borrow
3. Member A fulfills the request
4. System automatically creates contribution for Member A:
   - Item: Garden Tools
   - Units: 3 (days)
   - Value: 3 × wealthValue = total contribution value
   - Status: auto_verified (system has proof)
   - Source: wealth_fulfillment
   - Description: Auto-generated from wealth share

[No manual logging needed - sharing IS contributing]
```

This approach:
- Reduces friction (no double-entry)
- Ensures accuracy (system tracks actual fulfillment)
- Aligns incentives (sharing wealth = building contribution profile)
- Makes contribution tracking effortless

#### **B. Peer Recognition Grants (Limited, Trust-Based)**
Any member can grant recognition to another for contributions they witnessed:
```
Peer Recognition:
- Each member can grant up to [X] value units per month (community configures)
- Must include description of what was done
- Cannot grant to same person >3 times per month
- Effective immediately, no verification needed

Example:
Bob grants 10 units to Alice:
"Alice provided emotional support during my difficult week.
Her presence and listening made a huge difference."

[Trust-based spontaneous appreciation with anti-gaming limits]
```

This captures contributions that don't flow through the wealth system:
- Emotional support
- Informal help
- Community building activities
- Any valuable work not tracked as wealth shares

### 2. Verification Status (Simplified)

Since self-reported contributions have been removed, verification is greatly simplified:

#### Auto-Verified (Immediate)
- Wealth fulfillment (system tracks the transaction)
- Peer recognition grants (trust-based, within limits)

#### Disputed (Error Correction)
- Either party can mark a contribution as disputed
- Used for error correction, not fraud prevention
- Council or mediator reviews and resolves

#### Removed States
- ~~Pending~~ - No longer needed (no self-reported contributions requiring verification)
- ~~Verified~~ - No longer needed (everything is auto-verified)

**Rationale for Simplification:**
Since contributions now come only from:
1. **System-logged wealth fulfillment** - System has proof, auto-verified
2. **Peer recognition grants** - Trust-gated with limits, auto-verified

There's no need for a pending verification queue or manual verification workflow. The dispute mechanism remains for error correction (e.g., wrong quantity, duplicate entry).

**Planned Removals:**
- Pending verifications queue and UI
- Manual verification endpoints
- Verification reminder settings
- beneficiary/witness verification workflow

### 3. Anti-Gaming Mechanisms

#### Pattern Detection (Flags for Community Review)
```
System flags patterns for community attention:

⚠️ Unusual volume of self-reports without verification
⚠️ Peer grants concentrated among small group
⚠️ Claims that seem inconsistent with time available
⚠️ Multiple members flagging false claims

[Flags prompt human review, not automatic penalties]
```

#### Verification Disputes
```
If beneficiary disputes a claim:
1. Claim marked as disputed
2. Both parties provide their account
3. Council or mediator reviews
4. Decision documented
5. Pattern of false claims reduces trust

[Social resolution, not algorithmic punishment]
```

## Display & Visibility

### Individual Recognition Profile

**What Each Member Sees About Themselves:**

```
Your Recognized Contributions (Last 6 Months)

Total Value Units: 450
Lifetime Recognition: 1,847 units

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Care Work (180 units, 40%)

Elder Care (9 sessions, 90 units)
├─ Bob: "Alice stayed with my mother while I went 
│  to work. She's patient and caring." (3 hours)
├─ Carol: "Alice helped my father with physical 
│  therapy exercises." (2 hours)
└─ [7 more sessions...]

Emotional Support (6 sessions, 90 units)
├─ Dave: "Alice helped me process grief after my 
│  loss. Her presence was healing." (1 session)
└─ [5 more sessions...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Community Building (120 units, 27%)

Welcoming New Members (8 members, 120 units)
├─ Eve: "Alice showed me around and introduced me 
│  to everyone. I felt immediately welcomed."
└─ [7 more members...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Material Sharing (90 units, 20%)

Tools Loaned (12 times, 60 units)
├─ Frank: "Borrowed woodworking tools for shed project"
└─ [11 more loans...]

Space Provided (6 times, 30 units)
├─ Garden Initiative: "Alice let us use backyard 
│  for seedling starting"
└─ [5 more uses...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skills Shared (60 units, 13%)

Teaching (6 sessions, 60 units)
├─ Guitar lessons for teens (3 hours)
└─ Bread baking workshop (3 hours)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Community Members Have Said:
├─ "Always generous with time"
├─ "Creates warm, welcoming environment"
├─ "Patient teacher"
└─ "Her care work is invaluable"

[Quantitative + qualitative, with testimonials preserved]
```

### Community Analytics

**What Community Admins and Members See (Aggregate):**

```
Community Value Recognition Overview

Total Value Recognized (Last Quarter): 45,678 units
Active Contributors: 84 members (70% of community)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Value Distribution by Category

Care Work:         35% ████████████████
Material Sharing:  25% ████████████
Community Building: 20% ██████████
Skills/Teaching:   15% ████████
Creative Work:      5% ███

Insights:
✓ Care work is our largest recognized category
✓ Creative work may be undervalued or underclaimed
⚠ Consider: Are we recognizing all art/music/culture?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Participation Patterns

High Contributors (500+ units):   12 members
Regular Contributors (100-499):   45 members
Occasional (10-99):               27 members
New/Learning (0-9):               16 members

Note: Some valued members contribute in ways not yet 
captured by the system. Recognition units are one 
signal among many.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recognition vs Trust Correlation

[Scatter plot showing trust score vs value units]

Observations:
- Most members have both trust and recognition
- Some high-trust members have low recognition (capacity limits)
- Some high-recognition, low-trust (new or behavioral concerns)
- Both dimensions matter; neither tells full story

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verification Health

Pending verifications: 23 (avg 2.1 days to verify)
Disputed claims (last quarter): 2 (both resolved)
Peer grants usage: 68% of members used at least once

System health: Good ✓

[Aggregate patterns, no individual rankings]
```

### No Leaderboards or Rankings

**Explicitly NOT included:**
- ❌ Top contributors list
- ❌ Ranking by value units
- ❌ Competition for "most valuable"
- ❌ Badges/levels based on units
- ❌ Percentile rankings

**Why:** These create status competition and gaming incentives that corrupt the recognition purpose.

**Instead:** 
- ✓ Aggregate patterns
- ✓ Category distributions
- ✓ Participation awareness
- ✓ Individual appreciation

## Relationship to Access Control

### What Value Recognition Does NOT Do

**Value recognition units are NOT used for:**
- ❌ Gating access to requesting resources
- ❌ Gating council creation
- ❌ Gating initiative creation
- ❌ Gating any community features
- ❌ Determining permissions
- ❌ Influencing trust scores directly

**Why:** Using value units as gates corrupts recognition into currency and violates gift economy principles.

### Access Control Remains Trust-Based

**Access to requesting resources is determined by:**

```
Trust + Time Based Receiving Capacity

New Member (Trust: 0-5, Time: 0-1 month)
├─ Can request: Low-value items only
├─ Max requests per month: 2-3
├─ Requires: Community member vouches or sponsors
└─ Exception: Emergency needs with vouching

Establishing Member (Trust: 5-15, Time: 1-3 months)
├─ Can request: Medium-value items
├─ Max requests per month: 5
└─ Building relationships and trust

Trusted Member (Trust: 15+, Time: 3+ months)
├─ Can request: Most items
├─ Max requests per month: 10
└─ Integrated into community

High-Trust Member (Trust: 30+, Time: 6+ months)
├─ Can request: Unlimited
├─ Emergency access: Immediate response
└─ Can vouch for others

[Access based on relationship and time, not value units]
```

### Soft Encouragement for Reciprocity (Optional)

Communities can enable gentle nudges without hard blocks:

```
When member with low value recognition requests high-value item:

┌──────────────────────────────────────────────┐
│ 🤝 Building Reciprocity                      │
│                                              │
│ You're requesting a high-value item.         │
│                                              │
│ Consider contributing to the community       │
│ before requesting significant resources:     │
│                                              │
│ Ways to contribute:                          │
│ • Share tools or items you have             │
│ • Offer skills, time, or care               │
│ • Welcome new members                       │
│ • Participate in initiatives                │
│                                              │
│ Community members often prioritize requests  │
│ from active participants.                   │
│                                              │
│ [Continue with request anyway]              │
│ [See contribution opportunities]            │
└──────────────────────────────────────────────┘

[Educational nudge, not block]
```

**Then the resource owner (Bob) decides:**
- Sees requester is new with low recognition
- Makes human judgment: "I'll share anyway to help them integrate" OR "I'll wait for more established member"
- **Human decision, not algorithmic enforcement**

### How Value Recognition Influences Trust (Indirectly)

**Value recognition doesn't automatically grant trust, but:**

1. **Visibility enables trust formation:**
   - Members see what someone contributes
   - Provides context for trust decisions
   - **Recognition makes trust-worthy behavior visible**

2. **Patterns inform community:**
   - Extractive pattern (all taking, no giving) becomes visible
   - Community can address through conversation
   - Trust naturally adjusts based on behavior
   - **Social awareness enables social regulation**

3. **Contribution is one signal among many:**
   - High recognition + concerning behaviors ≠ automatic trust
   - Low recognition + deep relationships = trust develops
   - **Trust is holistic judgment, recognition is one input**

## Permissions & Access Control

### OpenFGA Roles & Permissions

While value recognition itself does NOT gate access to features, managing the recognition system requires specific permissions:

#### View Contribution Role
- Regular: `contribution_viewer`
- Trust-based: `trust_contribution_viewer`
- Permission: `can_view_contributions`
- Default trust threshold: 0 (all community members can view)

#### Grant Recognition Role
- Regular: `recognition_granter`
- Trust-based: `trust_recognition_granter`
- Permission: `can_grant_peer_recognition`
- Default trust threshold: 10 (trusted members can grant peer recognition)

#### Removed Roles (No Longer Needed)
- ~~Log Contribution Role~~ - Self-reported contributions removed; contributions auto-created from wealth fulfillment
- ~~Verify Contribution Role~~ - No pending verification queue; all contributions auto-verified

#### Manage Recognition System Role (Admin)
- Regular: `recognition_manager`
- Permission: `can_manage_recognition`
- Admin-only: Configure categories, adjust values, review disputes

### Permission Checks

```
can_view_contributions = admin OR contribution_viewer OR trust_contribution_viewer
can_grant_peer_recognition = admin OR recognition_granter OR trust_recognition_granter
can_manage_recognition = admin OR recognition_manager
can_dispute_contributions = admin OR community member (for own contributions or those received)
```

Note: `can_log_contributions` and `can_verify_contributions` have been removed as self-reported contributions are no longer supported.

### Trust Thresholds for Recognition System Actions

Stored in `communities` table as JSONB with structure `{ type: 'number', value: X }`:

#### Recognition System Participation
- `minTrustToViewRecognition` (default: 0) - View contribution profiles and community statistics
- `minTrustToGrantPeerRecognition` (default: 10) - Grant peer recognition to others
- `minTrustForRecognitionManagement` (default: 25) - Manage recognition categories and values (typically admin/council)
- `minTrustForDisputeReview` (default: 30) - Review and mediate disputed contributions

#### Removed Thresholds (No Longer Needed)
- ~~`minTrustToLogContributions`~~ - Self-reported contributions removed
- ~~`minTrustToVerifyContributions`~~ - Manual verification removed
- ~~`minTrustForCouncilVerification`~~ - No verification queue to process

### Access Control Rules

#### View Contribution Profiles
- Member must have `can_view_contributions` permission OR
- Member must be viewing their own profile
- Respects individual privacy settings (members can restrict visibility)

#### Grant Peer Recognition
- Member must have `can_grant_peer_recognition` permission
- Member must meet trust threshold (`minTrustToGrantPeerRecognition`)
- Subject to monthly limits (configurable per community)
- Cannot grant to same person more than X times per month (anti-gaming)

#### Dispute a Contribution
- Member must be the contributor (disputing their own contribution) OR
- Member must be the recipient of the contribution (for wealth fulfillment) OR
- Member must have `can_manage_recognition` permission

#### Adjust Item/Category Values
- Member must have `can_manage_recognition` permission
- Typically admin or designated council members
- Changes documented with reasoning in calibration history

#### Review Disputed Contributions
- Member must have `can_manage_recognition` permission OR
- Member must have dispute review permission
- Must meet trust threshold (`minTrustForDisputeReview`)

#### Removed Access Controls
- ~~Log Self-Reported Contribution~~ - No longer supported
- ~~Verify Contribution~~ - No verification queue

### Important Note: Recognition Does NOT Gate Resource Access

**The following permissions are NOT affected by value recognition:**
- ❌ Requesting wealth/resources (trust-based only)
- ❌ Creating councils (trust-based only)
- ❌ Creating pools (trust-based only)
- ❌ Creating initiatives (trust-based only)
- ❌ Participating in polls (trust-based only)
- ❌ Forum access (trust-based only)

**Access to community features remains purely trust-based to preserve gift economy principles.**

## Privacy & Visibility Settings

### Member Privacy Controls

```
Your Value Recognition Privacy

Who can see your recognized contributions?

○ Everyone in community (default)
  All community members can see your contributions
  
○ Trusted members only (trust threshold: 15+)
  Only members you trust or who are highly trusted
  
○ Council/Admins only
  Contributions visible to community leadership only
  
○ Private
  Only you can see your recognition
  Note: Admins retain access for community health monitoring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testimonials & Details:

☑ Show qualitative testimonials from others
☐ Show only quantitative totals
☐ Anonymize testimonials (show content but not names)

[Members control their own visibility]
```

### Community Settings

```
Value Recognition Community Settings

Recognition Visibility:
☑ Enable value recognition system
☑ Show aggregate community statistics
☑ Allow peer recognition grants
☐ Show individual recognition profiles by default
  (Members can opt-in to share publicly)

Peer Grant Limits:
- Members can grant up to [20] value units per month
- Maximum [3] grants to same person per month
- Must include description

Dispute Settings:
- Allow disputes for error correction: ☑ Yes

Soft Reciprocity Nudges:
☐ Suggest contribution before high-value requests (optional)
☐ Show contribution opportunities to new members

Removed Settings (No Longer Needed):
- Verification settings (no verification queue)
- Verification reminder days
- Council verification settings

[Community configures based on their values and needs]
```

## Related Database Tables

### Integration with Existing Tables

#### `items` (Extended from FT-04)
The existing items table is reused for contribution categories. Extended with optional metadata:

```sql
-- Existing fields (from FT-04):
-- id, community_id, translations (JSONB), kind (enum: 'object'|'service'),
-- wealthValue (NUMERIC), isDefault, createdBy, createdAt, updatedAt, deletedAt

-- NEW field added for FT-16:
ALTER TABLE items ADD COLUMN contribution_metadata JSONB;

-- Example contribution_metadata structure:
{
  "categoryType": "care",  -- 'care', 'community_building', 'creative', etc.
  "examples": ["Elder care sessions", "Childcare hours"]
}

-- The wealthValue field serves dual purpose:
-- 1. Wealth sharing statistics (original use from FT-04)
-- 2. Contribution recognition value per unit (new use from FT-16)
```

### New Tables

#### `recognized_contributions`
Tracks individual contributions, referencing items (not separate categories):

```sql
CREATE TABLE recognized_contributions (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id) NOT NULL,
  contributor_id UUID REFERENCES app_users(id) NOT NULL,
  item_id UUID REFERENCES items(id) NOT NULL,  -- References items, not categories!

  units NUMERIC NOT NULL,
  value_per_unit NUMERIC NOT NULL, -- Snapshot of items.wealthValue at time of contribution
  total_value NUMERIC GENERATED ALWAYS AS (units * value_per_unit) STORED,

  description TEXT NOT NULL,

  -- Verification (Simplified)
  verification_status VARCHAR(20) DEFAULT 'auto_verified',
    -- 'auto_verified', 'disputed' (pending/verified removed)
  -- Note: verified_by and verified_at no longer needed since everything is auto-verified

  -- Related parties (optional)
  beneficiary_ids UUID[], -- Array of users who benefited (for reference)
  witness_ids UUID[], -- Array of users who witnessed (for reference)

  testimonial TEXT, -- From peer recognition description

  -- Source tracking
  source_type VARCHAR(50),
    -- 'system_logged', 'peer_grant', 'self_reported', 'wealth_fulfillment'
  source_id UUID, -- Reference to wealth, initiative, council, etc.

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT positive_units CHECK (units > 0),
  CONSTRAINT positive_value CHECK (value_per_unit > 0)
);

CREATE INDEX idx_contributions_contributor
  ON recognized_contributions(contributor_id);
CREATE INDEX idx_contributions_community
  ON recognized_contributions(community_id);
CREATE INDEX idx_contributions_item
  ON recognized_contributions(item_id);
CREATE INDEX idx_contributions_status
  ON recognized_contributions(verification_status);
CREATE INDEX idx_contributions_created
  ON recognized_contributions(created_at DESC);
```

#### `contribution_summary`
```sql
CREATE TABLE contribution_summary (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id) NOT NULL,
  user_id UUID REFERENCES app_users(id) NOT NULL,
  
  total_value_6months NUMERIC DEFAULT 0,
  total_value_lifetime NUMERIC DEFAULT 0,
  
  -- Item breakdowns (JSONB for flexibility)
  item_breakdown JSONB,
    -- { "Childcare": 180, "Garden Tools": 90, ... }
    -- Item names from items.translations
  
  last_contribution_at TIMESTAMP,
  last_calculated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_summary_per_user_community
    UNIQUE(community_id, user_id)
);

CREATE INDEX idx_summary_community 
  ON contribution_summary(community_id);
CREATE INDEX idx_summary_user 
  ON contribution_summary(user_id);
```

#### `peer_recognition_grants`
```sql
CREATE TABLE peer_recognition_grants (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id) NOT NULL,
  from_user_id UUID REFERENCES app_users(id) NOT NULL,
  to_user_id UUID REFERENCES app_users(id) NOT NULL,
  
  value_units NUMERIC NOT NULL,
  description TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  month_year VARCHAR(7), -- 'YYYY-MM' for monthly limit tracking
  
  CONSTRAINT different_users CHECK (from_user_id != to_user_id),
  CONSTRAINT positive_grant CHECK (value_units > 0)
);

CREATE INDEX idx_peer_grants_from 
  ON peer_recognition_grants(from_user_id, month_year);
CREATE INDEX idx_peer_grants_to 
  ON peer_recognition_grants(to_user_id);
```

#### `value_calibration_history`
Tracks changes to item values (items.wealthValue):

```sql
CREATE TABLE value_calibration_history (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id) NOT NULL,
  item_id UUID REFERENCES items(id) NOT NULL,  -- References items, not categories!

  old_value_per_unit NUMERIC NOT NULL,
  new_value_per_unit NUMERIC NOT NULL,

  reason TEXT,
  proposed_by UUID REFERENCES app_users(id),
  decided_at TIMESTAMP DEFAULT NOW(),

  effective_date TIMESTAMP NOT NULL
);

CREATE INDEX idx_calibration_community
  ON value_calibration_history(community_id);
CREATE INDEX idx_calibration_item
  ON value_calibration_history(item_id);
```

### Modified Tables

#### `communities` (Add value recognition settings)
```sql
ALTER TABLE communities ADD COLUMN value_recognition_settings JSONB DEFAULT '{
  "enabled": true,
  "show_aggregate_stats": true,
  "allow_peer_grants": true,
  "peer_grant_monthly_limit": 20,
  "peer_grant_same_person_limit": 3,
  "soft_reciprocity_nudges": false
}'::jsonb;

-- Removed settings (no longer needed):
-- "require_verification": true,        -- All contributions auto-verified
-- "auto_verify_system_actions": true,  -- Default behavior now
-- "allow_council_verification": true,  -- No verification queue
-- "verification_reminder_days": 7,     -- No pending verifications
```

## Implementation Phases

### Phase 1: Foundation (MVP) - **COMPLETED**
- [x] Database schema (integrated with items table)
- [x] Database migration created
- [x] Repository layer (contribution repository with items joins)
- [x] Frontend components (view profile, peer recognition, contribution logs)
- [x] Frontend integration with existing queries
- [x] Service layer (business logic)
- [x] Validators (request validation)
- [x] Controllers (HTTP endpoints)
- [x] Routes (with authorization)
- [x] Auto-create contributions from wealth fulfillment
- [x] Basic individual recognition display (quantitative)
- [x] Combined log view (contributions + peer recognition received)
- [ ] Tests (unit and integration)

### Phase 2: Peer Recognition - **IN PROGRESS**
- [x] Peer recognition UI (frontend completed)
- [x] Peer recognition backend (with monthly limits)
- [x] Notification on peer recognition received
- [ ] Aggregate community statistics
- [ ] Anti-gaming pattern detection (flags only, no penalties)

### Phase 3: Calibration & Refinement
- [ ] Item value calibration UI and workflow
- [ ] Value calibration history tracking (table created, logic pending)
- [ ] Enhanced analytics (item distributions, patterns)
- [ ] Privacy controls for individual profiles

### Phase 4: Integration & Polish
- [ ] Soft reciprocity nudges (optional)
- [ ] Trust-contribution correlation insights
- [ ] Comprehensive documentation for communities

### Simplified/Removed Features
The following features were removed to simplify the system:
- ❌ Self-reported contributions (replaced by auto-creation from wealth fulfillment)
- ❌ Pending verification queue (no pending state needed)
- ❌ Manual verification workflow (all contributions auto-verified)
- ❌ Verification reminders (no pending verifications)
- ❌ Council verification for unclaimed work (no verification queue)

Remaining for error correction:
- ✓ Dispute mechanism (for correcting errors in auto-created contributions)

## Usage Guidelines for Communities

### Getting Started

**Week 1: Enable System**
1. Enable value recognition in community settings
2. Review default value categories (all start at 10 units)
3. Add any custom categories specific to your community
4. Announce system to members with clear explanation

**Month 1-3: Learn and Observe**
1. Encourage members to log contributions
2. Practice peer verification
3. Observe what gets logged vs what doesn't
4. Notice which categories are active

**Quarter 1 Review: First Calibration**
1. Gather feedback from members
2. Review category distribution
3. Identify undervalued or overvalued categories
4. Propose and decide on value adjustments
5. Document reasoning for changes

**Ongoing: Quarterly Calibration**
1. Regular review cycles
2. Adjust values based on community learning
3. Add new categories as needs emerge
4. Maintain documentation of decisions

### Best Practices

**DO:**
- ✓ Make invisible labor explicitly valued
- ✓ Trust peer verification process
- ✓ Review and calibrate values regularly
- ✓ Emphasize recognition, not competition
- ✓ Celebrate diverse forms of contribution
- ✓ Use aggregate data for community health awareness
- ✓ Keep access control trust-based, not recognition-based

**DON'T:**
- ❌ Create leaderboards or rankings
- ❌ Use value units for feature gating
- ❌ Let recognition replace relationship
- ❌ Punish low recognition automatically
- ❌ Import market values as defaults
- ❌ Make verification burdensome
- ❌ Treat value units as currency

### When Things Go Wrong

**Problem: False claims or gaming**
- Response: Community conversation, not automatic penalty
- Process: Council reviews, member explains, pattern addressed
- Focus: Restore trust through dialogue

**Problem: Verification burden too high**
- Response: Adjust settings to auto-verify more actions
- Process: Increase peer grant limits, enable council verification
- Focus: Reduce friction while maintaining integrity

**Problem: Certain work stays invisible**
- Response: Create explicit categories for that work
- Process: Community discussion about what's being missed
- Focus: Expand recognition to include all valuable work

**Problem: Recognition creating status competition**
- Response: Hide individual totals, emphasize qualitative stories
- Process: Remind community of recognition vs currency distinction
- Focus: Shift culture back to appreciation

## Related Features
- [FT-01: Communities](./01-communities.md) - Community context and configuration
- [FT-02: Members & Permissions](./02-members-permissions.md) - Member roles and access
- [FT-03: Trust System](./03-trust-system.md) - Trust-based access control (separate from recognition)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md) - Source of some contribution data
- [FT-09: Analytics & Statistics](./09-analytics-statistics.md) - Community health monitoring
- [FT-13: Security & Access Control](./13-security-access-control.md) - Trust-based permission model

## Frequently Asked Questions

**Q: Why not use value units for access control?**
A: Because it corrupts recognition into currency. Access should be based on trust (relationship) not value units (transaction). This preserves gift economy principles.

**Q: Won't people game the system for recognition?**
A: Peer verification and pattern detection make gaming visible. Community conversation addresses problems. Unlike access gates, recognition gaming doesn't give power, just visibility—which community can address socially.

**Q: What about people who can't contribute much?**
A: That's exactly why access is trust-based, not recognition-based. Someone with disability, crisis, or caregiving responsibilities may have low recognition but high trust—and that's fine. Trust allows receiving, recognition is just appreciation.

**Q: How is this different from reputation systems?**
A: Reputation systems typically gate access or create hierarchy. This is pure recognition and visibility. Also, communities define their own values rather than having universal market values imposed.

**Q: What if someone contributes a lot but has problematic behavior?**
A: Recognition units show contribution. Trust shows relationship. Both matter. High recognition + low trust = community can see the pattern and address it. Trust determines access, not recognition.

**Q: Why equal starting values instead of "realistic" market values?**
A: Because markets systematically undervalue care work, creative work, and community building. Starting equal lets communities discover what they actually value, not replicate market distortions.

**Q: Can value units be transferred or traded?**
A: No. They're recognition, not currency. Cannot be spent, transferred, or exchanged. They exist purely for visibility and appreciation.

**Q: What about communities that want to use this for access control?**
A: We strongly discourage this as it undermines gift economy principles. However, communities have sovereignty. If they insist, we recommend trust + contribution hybrid (must meet BOTH thresholds) rather than contribution-only gates, and soft nudges rather than hard blocks.
