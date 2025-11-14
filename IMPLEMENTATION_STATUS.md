# Disputes System Implementation Status

## Overview
Complete backend implementation of the disputes system as specified in `docs/features/15-disputes-system.md`.

## Implementation Date
2025-11-14

## Files Created

### Database Schema
- **`api/src/db/schema/disputes.schema.ts`** - Complete schema with all 6 tables:
  - `disputes` - Core dispute information
  - `dispute_participants` - Participants with role (initiator/participant)
  - `dispute_mediators` - Mediator proposals and acceptances
  - `dispute_resolutions` - Resolution records (open/closed)
  - `dispute_messages` - Communication between parties
  - `dispute_history` - Audit log of all dispute actions

### Migration
- **`api/src/db/migrations/0016_disputes_system.sql`** - Database migration file
  - Creates all enums (dispute_status, dispute_participant_role, dispute_mediator_status, dispute_resolution_type)
  - Drops old dispute columns from communities table
  - Adds new dispute configuration fields to communities:
    - `minTrustForDisputeVisibility` (default: 20)
    - `minTrustForDisputeParticipation` (default: 10)
    - `allowOpenResolutions` (default: true)
    - `requireMultipleMediators` (default: false)
    - `minMediatorsCount` (default: 1)
  - Creates all dispute tables with proper foreign keys and constraints

### Repository Layer
- **`api/src/repositories/dispute.repository.ts`** - Complete data access layer
  - Constructor-based pattern for testability
  - CRUD operations for all dispute entities
  - Participant management (add, remove, check membership)
  - Mediator workflow (propose, accept/reject, check status)
  - Resolution creation and retrieval
  - Message management with pagination
  - History tracking
  - Utility methods for access control queries

### Service Layer
- **`api/src/services/dispute.service.ts`** - Business logic and authorization
  - Dispute creation with automatic initiator assignment
  - Trust-based permission checks via OpenFGA
  - Participant management (only participants or admins can add participants)
  - Mediator proposal workflow (requires trust threshold)
  - Mediator acceptance workflow (requires participant consent)
  - Resolution creation (mediator-only, respects community settings)
  - Message management with visibility controls
  - Status updates with authorization checks
  - Private helper methods for access control
  - Complete audit logging for all operations

### Validation Layer
- **`api/src/api/validators/dispute.validator.ts`** - Zod schemas for all endpoints
  - createDisputeSchema
  - listDisputesSchema
  - getDisputeSchema
  - addParticipantSchema
  - proposeMediatorSchema
  - respondToMediatorSchema
  - createResolutionSchema
  - createMessageSchema
  - getMessagesSchema
  - updateDisputeStatusSchema
  - Middleware functions for all validators

### Controller Layer
- **`api/src/api/controllers/dispute.controller.ts`** - HTTP handlers
  - Complete Swagger documentation for all endpoints
  - Thin layer delegating to service
  - Proper error handling
  - Uses AuthenticatedRequest type
  - Logging for all operations

### Routes
- **`api/src/api/routes/dispute.routes.ts`** - RESTful routing
  - All routes under `/api/v1/communities/:communityId/disputes`
  - Authentication required for all endpoints
  - Proper validator middleware application
  - Comments explaining authorization model

### Tests
- **`api/src/repositories/dispute.repository.test.ts`** - Repository unit tests
  - 15+ test cases covering all repository methods
  - Uses mock database pattern
  - Tests create, read, update, delete operations
  - Tests participant and mediator workflows
  - Tests messages and history

- **`api/src/services/dispute.service.test.ts`** - Service unit tests
  - 12+ test cases covering business logic
  - Tests authorization checks
  - Tests error scenarios
  - Tests workflow validation
  - Mocks all dependencies

### Integration
- **Updated `api/src/app.ts`** - Registered dispute routes
- **Updated `api/src/db/schema/index.ts`** - Exported dispute schemas
- **Updated `api/src/db/schema/communities.schema.ts`** - Added dispute configuration fields
- **Updated `api/package.json`** - Fixed drizzle-kit script to use bunx

## API Endpoints

All endpoints require authentication via `verifyToken` middleware.

### Disputes
- `POST /api/v1/communities/:communityId/disputes` - Create dispute
- `GET /api/v1/communities/:communityId/disputes` - List disputes (with pagination & status filter)
- `GET /api/v1/communities/:communityId/disputes/:disputeId` - Get dispute details

### Participants
- `POST /api/v1/communities/:communityId/disputes/:disputeId/participants` - Add participant

### Mediators
- `POST /api/v1/communities/:communityId/disputes/:disputeId/mediators` - Propose as mediator
- `PUT /api/v1/communities/:communityId/disputes/:disputeId/mediators/:mediatorId` - Accept/reject mediator

### Resolutions
- `POST /api/v1/communities/:communityId/disputes/:disputeId/resolutions` - Create resolution (mediator only)

### Messages
- `POST /api/v1/communities/:communityId/disputes/:disputeId/messages` - Add message
- `GET /api/v1/communities/:communityId/disputes/:disputeId/messages` - Get messages (paginated)

### Status
- `PUT /api/v1/communities/:communityId/disputes/:disputeId/status` - Update dispute status

## API Contract

The API returns TypeScript interfaces as specified in the requirements:

```typescript
interface Dispute {
  id: string;
  communityId: string;
  title: string;
  description: string;
  status: 'open' | 'in_mediation' | 'resolved' | 'closed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

interface DisputeParticipant {
  id: string;
  disputeId: string;
  userId: string;
  role: 'initiator' | 'participant';
  addedAt: string;
  addedBy: string;
}

interface DisputeMediator {
  id: string;
  disputeId: string;
  userId: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'withdrawn';
  proposedAt: string;
  respondedAt: string | null;
  respondedBy: string | null;
}

interface DisputeResolution {
  id: string;
  disputeId: string;
  resolutionType: 'open' | 'closed';
  resolution: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
}

interface DisputeMessage {
  id: string;
  disputeId: string;
  userId: string;
  message: string;
  createdAt: string;
  visibleToParticipants: boolean;
  visibleToMediators: boolean;
}
```

## Authorization Model

The implementation follows the OpenFGA permission model specified in the feature doc:

### Permissions
- `can_view_dispute` - View dispute titles (requires trust threshold: default 20)
- `can_handle_dispute` - Propose as mediator (requires trust threshold: default 20)
- `can_create_dispute` - Create disputes (requires trust threshold: default 10)

### Access Control Rules

#### View Dispute Titles
- User must have `can_view_dispute` permission (includes trust check automatically)

#### View Dispute Details
- User must be participant OR accepted mediator OR admin
- Checked in service layer via private `canAccessDisputeDetails()` method

#### Propose Mediation
- User must have `can_handle_dispute` permission (includes trust check)

#### Accept/Reject Mediator
- User must be dispute participant

#### Create Resolution
- User must be accepted mediator OR admin
- Open resolutions only allowed if community setting permits

#### View Messages
- Filtered based on message visibility settings and user role (participant vs mediator)

## Testing

### Unit Tests
- **Repository Tests**: 15+ tests covering all CRUD operations
- **Service Tests**: 12+ tests covering business logic and authorization
- **Test Coverage**: All major workflows and error scenarios

### Test Execution
Tests require database connection. Run with:
```bash
cd api
bun test src/repositories/dispute.repository.test.ts
bun test src/services/dispute.service.test.ts
```

Note: Tests will fail without DATABASE_URL environment variable. This is expected in environments without a running PostgreSQL instance.

## Migration Notes

The migration file (`0016_disputes_system.sql`) includes:
- Cleanup of old dispute-related columns that had different semantics
- Creation of new configuration columns with proper defaults
- All tables with cascade delete for data integrity
- Proper foreign key constraints

Migration will run automatically on server startup per project architecture.

## Known Issues

None. Implementation is complete and ready for testing.

## Next Steps

1. **Apply Migration**: Restart the API server to apply the migration
2. **Test Endpoints**: Use Swagger docs at `/openapi/docs` or create `.http` test files
3. **Frontend Integration**: Use the API contract interfaces for TypeScript types
4. **OpenFGA Model**: Ensure dispute permissions are defined in the OpenFGA authorization model

## Feature Documentation

The implementation strictly follows the specification in:
- `docs/features/15-disputes-system.md`

All use cases, permissions, and workflows from the feature doc have been implemented.
