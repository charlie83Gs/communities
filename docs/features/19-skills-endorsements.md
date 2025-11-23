---
id: FT-19
title: Skills & Endorsements
status: implemented
version: 2.0
last_updated: 2025-11-22
related_features: [FT-01, FT-02, FT-03, FT-04, FT-13]
---

# Skills & Endorsements

## Overview
The skills system allows members to declare their abilities and receive endorsements from other community members. Unlike trust which is a general reputation metric, skills provide specific capability validation. Endorsements are community-specific, building local reputation for particular competencies.

Skills follow the dual-path permission model: endorsing requires either admin-assigned role OR reaching trust threshold.

## Core Concepts

### Skills as Simple Tags
- Skills are free-form text strings (e.g., "Carpentry", "JavaScript", "Gardening", "First Aid")
- Max 50 characters (couple of words recommended)
- Allowed characters: letters, numbers, spaces, hyphens, ampersands
- Users add skills to their profile through user preferences
- No predefined skill taxonomy - communities organically develop their own skill vocabulary
- Skills are user-scoped (global to the user across all communities)

### Community-Specific Endorsements
- Endorsements are given per community
- A user's endorsement count for "Carpentry" in Community A is independent from Community B
- This builds local, contextual reputation
- Endorsement counts shown are always for the current community context
- **Self-endorsement is allowed** - provides 1 point representing self-assessed competency

## User Experience

### Adding Skills (User Preferences)
- Users manage their skills in their profile/preferences
- Add new skills by typing the skill name
- Remove skills at any time
- Skills persist across all communities the user belongs to
- No limit on number of skills a user can add

### Viewing Skills (Member Lists)
- Member list table shows top 3 skills for each member
- Skills displayed with endorsement count badges
- "Skills" button opens detailed modal/panel showing:
  - All user skills with endorsement counts
  - Ability to endorse (+ button) any skill
  - Visual indicator for skills you've already endorsed

### Endorsing Skills
- Click the + button next to a skill to endorse it
- Each member can endorse each skill only once per community
- Endorsements can be removed (toggle behavior)
- **Requires trust threshold** (default: 10) OR admin-assigned skill_endorser role
- Self-endorsement is permitted (1 point for self-assessment)

### Skills in Wealth Request Flow
- When viewing a detailed wealth request, show sharer's skills
- After confirming receipt of an item/service, offer skill endorsement
- **Context-aware suggestions based on item's related skills**:
  - Items can have a `relatedSkills` array configured by admins
  - Example: "Handmade Table" item has relatedSkills: ["Carpentry", "Woodworking"]
  - If sharer has these skills, they appear as suggestions
  - If no valid suggestions, show all skills with search option
- Makes feedback natural and immediate after positive interactions

## Permission Model

This feature follows the dual-path permission model (role-based + trust-based).

### Viewing Skills
- Any community member can view any other member's skills
- No trust requirement
- Permission: `can_view_member_profiles` (inherited from basic membership)

### Adding Own Skills
- Any user can add skills to their own profile
- No community membership required (user-level setting)
- No permission check (own profile management)

### Endorsing Skills
**Dual-Path Permission Model:**

**Path 1: Role-Based Access**
- Admin can assign `skill_endorser` role to specific members
- Grants `can_endorse_skills` permission

**Path 2: Trust-Based Access**
- Members automatically gain `trust_skill_endorser` role at trust threshold
- Default threshold: `minTrustToEndorseSkills = 10`
- Configurable per community
- Grants `can_endorse_skills` permission

**Authorization:**
- Permission checked: `can_endorse_skills`
- Evaluates to: admin OR skill_endorser OR trust_skill_endorser
- Self-endorsement is allowed (no additional check)

### Removing Endorsements
- Users can remove their own endorsements at any time
- No permission check (removing own action)
- Prevents permanent incorrect endorsements

## Display Rules

### Member List Table
- Show maximum 3 skills per member
- Sort by endorsement count (highest first)
- If user has fewer than 3 skills, show all
- Format: "Skill (N)" where N is endorsement count

### Skills Detail Panel
- Full list of user's skills
- Each skill shows endorsement count
- Visual indicator for "you endorsed this"
- + button to add endorsement (or - to remove if already endorsed)
- Sorted by endorsement count descending

### Wealth Request Detail
- Show sharer's top 3 skills (same as member list)
- After confirming receipt, show endorsement prompt
- Suggest relevant skills based on item category
- Allow endorsing any skill, not just suggestions

## Configuration

### Community Settings (Stored in `communities` table JSONB)

**Trust Threshold:**
```typescript
minTrustToEndorseSkills: { type: 'number', value: 10 }
```
- Controls when `trust_skill_endorser` role is auto-granted
- Default: 10 (same as wealth sharing threshold)
- Members below threshold can still endorse if admin grants `skill_endorser` role

**Display Settings:**
- `maxSkillsDisplayed` - Number of skills to show in member list (default: 3)
- (Note: This is a UI constant, not a database setting currently)

### Future Configuration Options (Deferred)
- `enableSkillSuggestions` - Toggle skill suggestions in wealth flow (default: true)
- `allowSelfEndorsement` - Toggle self-endorsement (default: true, currently hardcoded)
- `skillSearchEnabled` - Enable member search by skill (future enhancement)

## Use Cases

### Building Capability Visibility
1. Maria joins community and adds skills: "Plumbing", "HVAC", "Electrical"
2. She shares "Plumbing repair services" as wealth
3. After successful completions, recipients endorse her "Plumbing" skill
4. New members can see Maria has 15 endorsements for Plumbing
5. They feel confident requesting her plumbing services

### Skill Discovery
1. Community needs someone who knows "Welding"
2. Members browse member list looking for welding skills
3. They find 3 members with the skill, with different endorsement counts
4. Higher endorsement count suggests more community validation
5. Easy to identify who has actually demonstrated the skill

### Feedback After Resource Sharing
1. Admin configures "Handmade Furniture" item with relatedSkills: ["Carpentry", "Woodworking", "Furniture Making"]
2. Alex adds these skills to their profile and shares a handmade bookshelf
3. Jordan requests and receives the bookshelf
4. Jordan confirms receipt (must have minTrustToEndorseSkills = 10)
5. System prompts: "Would you like to endorse Alex's skills?"
6. Shows Alex's skills with related skills highlighted first: "Carpentry", "Woodworking"
7. Jordan endorses "Carpentry" with one click
8. Alex's carpentry endorsement count increases in this community

### Self-Assessment
1. Maria adds "Plumbing" skill to her profile
2. She has sufficient trust (>= 10) to endorse skills
3. She can endorse her own "Plumbing" skill (self-assessment)
4. This adds 1 point to her plumbing endorsement count
5. Represents "I know I'm good at plumbing" self-confidence
6. Other members can also endorse her plumbing skill as they work with her

### Cross-Community Reputation
1. Sam has "JavaScript" skill endorsed 20 times in Community A
2. Sam joins Community B
3. In Community B, JavaScript shows 0 endorsements (starts fresh)
4. As Sam helps members in B, they build endorsements there
5. Each community has its own validation of Sam's skills

## Related Database Tables

### Planned
- `user_skills` - User's declared skills (user-scoped)
  - `id` - UUID primary key
  - `userId` - TEXT, reference to app_users.id
  - `name` - VARCHAR(50), skill name (max 50 characters)
  - `createdAt` - TIMESTAMP, when skill was added
  - `deletedAt` - TIMESTAMP, soft delete for removed skills
  - Unique constraint on (userId, name) - prevents duplicate skills per user
  - Index on userId for fast user skill lookups
  - Index on name for search functionality

- `skill_endorsements` - Community-specific endorsements
  - `id` - UUID primary key
  - `skillId` - UUID, reference to user_skills.id (CASCADE on delete)
  - `endorserId` - TEXT, reference to app_users.id (user giving endorsement)
  - `communityId` - UUID, reference to communities.id (CASCADE on delete)
  - `createdAt` - TIMESTAMP, when endorsement was given
  - `deletedAt` - TIMESTAMP, soft delete for removed endorsements
  - Unique constraint on (skillId, endorserId, communityId) - one endorsement per skill per person per community
  - Index on (skillId, communityId) for counting endorsements
  - Index on communityId for community queries
  - Index on endorserId for user query optimization

### Modified
- `items` - Add related skills for contextual suggestions
  - `relatedSkills` - TEXT[], array of skill names
  - Example: `["Carpentry", "Woodworking", "Furniture Making"]`
  - No limit on array size
  - Used to suggest skills in wealth request endorsement flow

### Views (Optional for Performance)
- `skill_endorsement_counts` - Materialized view (optional)
  - Aggregated endorsement counts per skill per community
  - Refreshed on endorsement create/delete
  - Alternative: compute counts in real-time via query

## API Endpoints

### Planned

**User Skills Management:**
- `GET /api/users/:userId/skills?communityId=xxx`
  - Get user's skills with endorsement counts for specified community
  - Returns: `{ skills: [{ id, name, endorsementCount, isEndorsedByMe }] }`
  - Auth: Any authenticated user (public profile data)

- `POST /api/users/skills`
  - Add a skill to current user's profile
  - Body: `{ name: string }` (max 50 chars, alphanumeric + space/hyphen/ampersand)
  - Returns: `{ skill: { id, userId, name, createdAt } }`
  - Auth: Authenticated user (own profile)

- `DELETE /api/users/skills/:skillId`
  - Remove (soft delete) a skill from current user's profile
  - Auth: Authenticated user, must own the skill

**Skill Endorsements:**
- `POST /api/skills/:skillId/endorse`
  - Endorse a skill in specified community
  - Body: `{ communityId: string }`
  - Permission: `can_endorse_skills` (trust >= 10 OR skill_endorser role OR admin)
  - Self-endorsement allowed
  - Returns: `{ success: true }`

- `DELETE /api/skills/:skillId/endorse`
  - Remove endorsement for a skill in specified community
  - Body: `{ communityId: string }`
  - Auth: Must be the endorser
  - Returns: `{ success: true }`

**Contextual Suggestions:**
- `GET /api/skills/suggestions/:userId?communityId=xxx&itemId=xxx`
  - Get skill suggestions for endorsement flow
  - If itemId provided: prioritize skills matching item's relatedSkills
  - Returns: `{ suggestions: [{ skillId, skillName, isRelated, endorsementCount, isEndorsedByMe }] }`
  - Auth: Authenticated community member

## Integration Points

### Member List Component
- Add skills column showing top 3 skills
- Add "View Skills" action button
- Skills detail modal/panel

### Wealth Request Detail
- Show sharer's top 3 skills in request view
- Post-confirmation endorsement prompt modal
- Skill suggestions based on item's relatedSkills field
- If item has relatedSkills configured and sharer has matching skills, show as suggestions
- If no matches or no relatedSkills configured, show all skills with search option

### User Preferences
- Skills management section
- Add/remove skills
- View own skills across communities

## Relationship to Other Features

### Trust System (FT-03)
- Trust is general reputation ("I trust this person")
- Skills are specific reputation ("This person can do X")
- Independent systems that complement each other
- High trust + many skill endorsements = highly validated member

### Value Contribution (FT-16)
- Value contribution tracks economic activity
- Skills endorsements track capability validation
- A member might have high contribution score and few endorsements (active but specialized)
- Or many endorsements but modest contribution (validated skills, less active sharing)

### Wealth Sharing (FT-04)
- Skills naturally relate to services shared
- Endorsement prompts after successful wealth transfers
- Helps requesters evaluate service providers

## Implementation Notes

### OpenFGA Authorization Model Updates
Add to community type in `openfga.model.ts`:
```typescript
// Regular Roles
skill_endorser: { this: {} },

// Trust Roles
trust_skill_endorser: { this: {} },

// Permissions
can_endorse_skills: {
  union: [
    { computedUserset: { relation: 'admin' } },
    { computedUserset: { relation: 'skill_endorser' } },
    { computedUserset: { relation: 'trust_skill_endorser' } },
  ],
},
```

### Trust Score Synchronization
When trust changes, `trust.service.ts` must sync `trust_skill_endorser` role:
- Check if trustScore >= community.minTrustToEndorseSkills.value
- Add/remove `trust_skill_endorser` relation in OpenFGA accordingly

### Skill Normalization (Repository Layer)
- Case-insensitive duplicate prevention on skill creation
- Trim whitespace from skill names
- Validate allowed characters: `^[a-zA-Z0-9\s\-&]+$`
- Max 50 characters

### Contextual Suggestion Logic
1. Fetch all user's skills with endorsement data
2. If itemId provided, get item's relatedSkills array
3. Mark skills as `isRelated: true` if name matches (case-insensitive)
4. Sort: related skills first, then by endorsement count descending
5. Return all skills with isRelated flag for UI rendering

### Search and Filtering (Future Enhancement)
- Search members by skill name
- Filter member list to show only members with specific skill
- "Find members with X skill" feature
- Deferred to Phase 6 / future iteration

## Related Features
- [FT-01: Communities](./01-communities.md)
- [FT-02: Members & Permissions](./02-members-permissions.md)
- [FT-03: Trust System](./03-trust-system.md)
- [FT-04: Wealth Sharing](./04-wealth-sharing.md)
