---
id: FT-15
title: Disputes System
status: partial
version: 1.1
last_updated: 2025-11-14
related_features: [FT-01, FT-02, FT-03, FT-13]
---

# Disputes System

## Overview
The disputes system enables community members to resolve conflicts through mediation. Disputes are private by default, with access restricted to participants and accepted mediators. Only members with sufficient trust can see dispute titles and propose to mediate. Resolutions can be either closed (private) or open (community-visible) based on mediator decision.

## Key Concepts

### Privacy Protection
- **Dispute information is protected** - only participants and accepted mediators can view details
- **Trust threshold for visibility** - only members with sufficient trust (default: 20) can see dispute titles
- **Participants cannot view dispute details** until they are accepted as participants
- **Mediators cannot view details** until accepted by participants

### Mediation Process
1. **Dispute Creation** - Participants create dispute with title and details
2. **Mediator Proposals** - Members with sufficient trust can propose to mediate
3. **Mediator Acceptance** - Participants must accept mediator proposals
4. **Mediation** - Accepted mediators help facilitate resolution
5. **Resolution** - Mediator decides resolution type (closed or open)

### Resolution Types
- **Closed Resolution** - Private, only visible to participants and mediators
- **Open Resolution** - Public, visible to entire community for transparency/learning

## Configuration

### Trust Thresholds
Stored in `communities` table as JSONB with structure `{ type: 'number', value: X }`:

- `minTrustForDisputeVisibility` (default: 20) - View dispute titles and propose mediation
- `minTrustForDisputeParticipation` (default: 10) - Create disputes as participant

### Dispute Settings
Stored in `communities` table as JSONB:

- `allowOpenResolutions` (default: true) - Allow mediators to create open resolutions
- `requireMultipleMediators` (default: false) - Require more than one mediator
- `minMediatorsCount` (default: 1) - Minimum number of mediators required

## Use Cases

### Use Case 1: Resource Sharing Dispute
1. Alice and Bob have dispute about shared tool
2. Alice creates dispute with title "Tool borrowing disagreement"
3. Carol (trust score 25) sees dispute title and proposes to mediate
4. Alice and Bob both accept Carol as mediator
5. Carol can now see full dispute details and help mediate
6. Carol decides resolution should be closed (private)
7. Resolution recorded, only Alice, Bob, and Carol can see it

### Use Case 2: Community Transparency Through Open Resolution
1. Dispute about community resource allocation
2. Multiple participants involved
3. David (trust score 30) mediates
4. David decides this should be open resolution for community learning
5. Resolution published, entire community can view outcome
6. Helps set precedent for future similar situations

### Use Case 3: Mediator Proposal Rejection
1. Dispute created between participants
2. Eve (trust score 15) cannot see dispute title (below threshold)
3. Frank (trust score 25) can see title and proposes to mediate
4. Participants reject Frank (conflict of interest)
5. Grace (trust score 30) proposes to mediate
6. Participants accept Grace

## Permissions

### OpenFGA Roles & Permissions

#### Viewer Role
- Regular: `dispute_viewer`
- Trust-based: `trust_dispute_viewer`
- Permission: `can_view_dispute`
- Default trust threshold: 20 (`minTrustForDisputeVisibility`)

#### Handler Role
- Regular: `dispute_handler`
- Trust-based: `trust_dispute_handler`
- Permission: `can_handle_dispute`
- Default trust threshold: 20 (`minTrustForDisputeVisibility`)

#### Participant Role
- Regular: `dispute_participant`
- Trust-based: `trust_dispute_participant`
- Permission: `can_create_dispute`
- Default trust threshold: 10 (`minTrustForDisputeParticipation`)

### Permission Checks
```
can_view_dispute = admin OR dispute_viewer OR trust_dispute_viewer
can_handle_dispute = admin OR dispute_handler OR trust_dispute_handler
can_create_dispute = admin OR dispute_participant OR trust_dispute_participant
```

### Access Control Rules

#### View Dispute Titles
- Member must have `can_view_dispute` permission
- Member must meet trust threshold (`minTrustForDisputeVisibility`)

#### View Dispute Details
- Member must be accepted participant OR
- Member must be accepted mediator OR
- Member must be admin

#### Propose Mediation
- Member must have `can_handle_dispute` permission
- Member must meet trust threshold (`minTrustForDisputeVisibility`)

#### Accept Mediator
- Member must be dispute participant

#### Create Resolution
- Member must be accepted mediator OR admin

#### View Open Resolution
- Member must have `can_view_dispute` permission (any community member with threshold)

#### View Closed Resolution
- Member must be participant OR mediator OR admin

## Related Database Tables

### Implementing
- `disputes` - Core dispute information
  - `id` (uuid, primary key)
  - `communityId` (uuid, foreign key to communities)
  - `title` (varchar)
  - `description` (text)
  - `status` (enum: 'open', 'in_mediation', 'resolved', 'closed')
  - `createdBy` (uuid, foreign key to app_users)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)
  - `resolvedAt` (timestamp, nullable)

- `dispute_participants` - Dispute participants
  - `id` (uuid, primary key)
  - `disputeId` (uuid, foreign key to disputes)
  - `userId` (uuid, foreign key to app_users)
  - `role` (enum: 'initiator', 'participant')
  - `addedAt` (timestamp)
  - `addedBy` (uuid, foreign key to app_users)

- `dispute_mediators` - Mediator proposals and acceptances
  - `id` (uuid, primary key)
  - `disputeId` (uuid, foreign key to disputes)
  - `userId` (uuid, foreign key to app_users)
  - `status` (enum: 'proposed', 'accepted', 'rejected', 'withdrawn')
  - `proposedAt` (timestamp)
  - `respondedAt` (timestamp, nullable)
  - `respondedBy` (uuid, foreign key to app_users, nullable)

- `dispute_resolutions` - Resolution records
  - `id` (uuid, primary key)
  - `disputeId` (uuid, foreign key to disputes)
  - `resolutionType` (enum: 'open', 'closed')
  - `resolution` (text)
  - `createdBy` (uuid, foreign key to app_users - mediator)
  - `createdAt` (timestamp)
  - `isPublic` (boolean - derived from resolutionType)

- `dispute_messages` - Communication between participants and mediators
  - `id` (uuid, primary key)
  - `disputeId` (uuid, foreign key to disputes)
  - `userId` (uuid, foreign key to app_users)
  - `message` (text)
  - `createdAt` (timestamp)
  - `visibleToParticipants` (boolean)
  - `visibleToMediators` (boolean)

- `dispute_history` - Audit log of dispute actions
  - `id` (uuid, primary key)
  - `disputeId` (uuid, foreign key to disputes)
  - `action` (varchar - e.g., 'created', 'mediator_proposed', 'mediator_accepted', 'resolved')
  - `performedBy` (uuid, foreign key to app_users)
  - `performedAt` (timestamp)
  - `metadata` (jsonb - action-specific data)

## Implementation Notes

### Security Considerations
1. **Privacy First** - Default to private, explicit opt-in for open resolutions
2. **Access Control** - Use OpenFGA for all permission checks
3. **Audit Trail** - Log all dispute actions for transparency
4. **Data Protection** - Encrypt sensitive dispute details at rest

### Workflow States
- `open` - Dispute created, seeking mediators
- `in_mediation` - At least one mediator accepted, mediation in progress
- `resolved` - Resolution created (open or closed)
- `closed` - Dispute withdrawn or cancelled

### Trust Integration
- Trust threshold changes recalculate all user dispute permissions
- Mediator acceptance creates temporary access grant (tracked separately)
- Resolution type affects community trust dynamics

### UI Considerations
- Show dispute titles only to members with sufficient trust
- Clear indication of mediation status (proposed/accepted/rejected)
- Separate views for open vs closed resolutions
- Mediator dashboard for pending proposals

## Related Features
- [FT-01: Communities](./01-communities.md) - Community context and configuration
- [FT-02: Members & Permissions](./02-members-permissions.md) - Participant and mediator roles
- [FT-03: Trust System](./03-trust-system.md) - Trust-based visibility and mediation access
- [FT-13: Security & Access Control](./13-security-access-control.md) - OpenFGA permission model
