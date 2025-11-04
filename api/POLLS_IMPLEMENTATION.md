# Polls API Implementation

## Overview

Complete polls API functionality has been implemented for the Express.js backend. This implementation follows the test-first development approach and adheres to the project's architectural patterns using Drizzle ORM, OpenFGA authorization, and SuperTokens authentication.

## Files Created

### 1. Database Schema
**Location**: `/api/src/db/schema/polls.schema.ts`

Defines three tables:
- **polls**: Main poll table with community association, creator info, and status
- **poll_options**: Poll option choices with display order
- **poll_votes**: User votes tracking (one vote per user per poll)

**Features**:
- Support for user, council, and pool-created polls
- Poll status tracking (active/closed)
- Automatic end date calculation
- Cascade deletion for options and votes

### 2. Database Migration
**Location**: `/api/src/db/migrations/0003_worthless_exiles.sql`

Auto-generated migration file created via:
```bash
cd api && bun run db:generate
```

The migration will run automatically on server startup.

### 3. Type Definitions
**Location**: `/api/src/types/poll.types.ts`

TypeScript interfaces for:
- `Poll`: Main poll entity
- `PollOption`: Poll option entity
- `PollVote`: Vote record
- `PollResult`: Calculated vote results with percentages
- `CreatePollDto`: Poll creation input
- `PollWithDetails`: Extended poll response with options, user vote, and results
- `ListPollsQuery`: Query filters for listing polls

### 4. Service Layer
**Location**: `/api/src/services/poll.service.ts`

Business logic implementation:

**Authorization Checks**:
- `canCreatePoll()`: Verifies user has poll_creator role OR meets trust threshold
- Checks admin status (admins bypass all requirements)
- Validates council/pool membership for entity-created polls

**Methods**:
- `createPoll()`: Creates poll with options in transaction
- `listPolls()`: Lists polls with optional status/creatorType filters
- `getPollById()`: Returns poll with options, user vote, and results
- `vote()`: Records user vote (validates poll status, expiration, duplicate votes)
- `closePoll()`: Closes poll (creator or admin only)
- `calculateResults()`: Computes vote counts and percentages

**Validations**:
- 2-10 options required
- Duration between 1-720 hours (1 hour to 30 days)
- One vote per user per poll
- Cannot vote on closed or expired polls

### 5. Validators
**Location**: `/api/src/api/validators/poll.validator.ts`

Zod-based request validation:
- `validateCreatePoll`: Poll creation validation
- `validateListPollsQuery`: Query parameter validation
- `validateGetPollById`: Path parameter validation
- `validateVote`: Vote request validation
- `validateClosePoll`: Close poll validation

### 6. Controller
**Location**: `/api/src/api/controllers/poll.controller.ts`

HTTP request handlers with comprehensive Swagger documentation:
- `list()`: GET polls list
- `getById()`: GET poll details
- `create()`: POST new poll
- `vote()`: POST vote
- `close()`: POST close poll
- `createComment()`: POST comment on poll
- `listComments()`: GET poll comments

**Swagger Schemas**:
- Complete OpenAPI 3.0 documentation
- Request/response examples
- Error response definitions

### 7. Routes
**Location**: `/api/src/api/routes/poll.routes.ts`

Express routes under `/api/v1/communities/:communityId/polls`:
- `GET /:communityId/polls` - List polls
- `GET /:communityId/polls/:pollId` - Get poll details
- `POST /:communityId/polls` - Create poll
- `POST /:communityId/polls/:pollId/vote` - Vote on poll
- `POST /:communityId/polls/:pollId/close` - Close poll
- `POST /:communityId/polls/:pollId/comments` - Create comment
- `GET /:communityId/polls/:pollId/comments` - List comments

All routes require authentication via SuperTokens session.

### 8. App Registration
**Location**: `/api/src/app.ts`

Poll routes registered:
```typescript
import pollRoutes from '@api/routes/poll.routes';
app.use('/api/v1/communities', pollRoutes);
```

### 9. Test File
**Location**: `/api/tests/http/polls.http`

Comprehensive HTTP test file with 25+ test cases covering:
- Poll creation (user, council, pool)
- Validation errors
- Listing with filters
- Voting
- Closing polls
- Comments
- Authorization failures
- Complete lifecycle scenarios

## API Contract

### Endpoints

#### 1. GET /api/v1/communities/:communityId/polls
**Query Params**: `?status=active|closed&creatorType=user|council|pool`
**Response**: `{ polls: Poll[] }`

#### 2. GET /api/v1/communities/:communityId/polls/:pollId
**Response**:
```json
{
  "poll": Poll,
  "options": PollOption[],
  "userVote": { "optionId": "string" } | null,
  "results": [{ "optionId": "string", "votes": number, "percentage": number }]
}
```

#### 3. POST /api/v1/communities/:communityId/polls
**Body**:
```json
{
  "title": "string",
  "description": "string (optional)",
  "options": ["string", "string", ...],
  "duration": number,
  "creatorType": "user" | "council" | "pool",
  "creatorId": "string (optional)"
}
```
**Response**: `{ poll: Poll }`

#### 4. POST /api/v1/communities/:communityId/polls/:pollId/vote
**Body**: `{ "optionId": "string" }`
**Response**: `{ "success": true }`

#### 5. POST /api/v1/communities/:communityId/polls/:pollId/close
**Response**: `{ poll: Poll }`

#### 6. POST /api/v1/communities/:communityId/polls/:pollId/comments
**Body**: `{ "content": "string", "parentId": "string (optional)" }`
**Response**: `{ comment: Comment }`

#### 7. GET /api/v1/communities/:communityId/polls/:pollId/comments
**Query Params**: `?limit=number&offset=number`
**Response**: `{ comments: Comment[] }`

## Authorization Model

### Poll Creation
Users can create polls if they have:
1. **Admin role**: `community#admin` relation (bypasses all requirements)
2. **Explicit permission**: `community#poll_creator` relation
3. **Trust threshold**: `community#trust_level_X` where X >= `minTrustForPolls` (default: 15)

### Council/Pool Polls
Additional checks for entity-created polls:
- **Council polls**: User must have `council#member` relation
- **Pool polls**: User must have `pool#manager` relation

### Voting
- User must have `community#member` relation
- Poll must be active and not expired
- One vote per user per poll

### Closing Polls
- User must be poll creator (`poll.createdBy === userId`)
- OR user must have `community#admin` relation

## Testing

### Run Tests
```bash
# Start the API server
cd api && bun dev

# Use the HTTP test file
# Open tests/http/polls.http in VS Code with REST Client extension
# Or use curl/Postman with the examples provided
```

### Test Scenarios Included
1. **Complete Poll Lifecycle**: Create → List → Get → Vote → Close
2. **Multiple Users Voting**: Concurrent voting and result calculation
3. **Council Poll Creation**: Entity-based poll creation
4. **Poll Expiration**: Time-based validation
5. **Permission Testing**: Role and trust-based authorization

## Database Schema

### polls
```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  creator_type poll_creator_type NOT NULL,
  creator_id UUID,
  created_by TEXT NOT NULL REFERENCES app_users(id),
  status poll_status NOT NULL DEFAULT 'active',
  ends_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### poll_options
```sql
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(200) NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### poll_votes
```sql
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Community Settings
Polls respect the community's `minTrustForPolls` configuration:
```typescript
// Default value
minTrustForPolls: { type: 'number', value: 15 }
```

Admins can adjust this threshold per community to control who can create polls based on trust score.

## Error Handling

The service returns appropriate HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Validation error, business rule violation
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **500**: Internal server error

All errors use the standardized `AppError` class for consistent error responses.

## Comments Integration

Poll comments reuse the existing wealth comments infrastructure:
- Comments are stored in the `wealth_comments` table
- The `wealthId` field is used to store the `pollId`
- Full threading support (parent-child replies)
- Pagination support

This approach avoids code duplication while maintaining functionality.

## Next Steps for Frontend Integration

1. **Install types**: Frontend should use matching TypeScript interfaces
2. **API calls**: Use the documented endpoints with proper authorization headers
3. **Real-time updates**: Consider WebSocket integration for live vote results
4. **UI components**: Build poll creation form, voting interface, results visualization
5. **Notifications**: Notify users when polls close or when they're mentioned in comments

## Example Usage

### Create a Poll
```typescript
const response = await fetch('http://localhost:3000/api/v1/communities/{communityId}/polls', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "What should we plant?",
    description: "Vote for spring vegetables",
    options: ["Tomatoes", "Carrots", "Lettuce"],
    duration: 168, // 7 days
    creatorType: "user"
  })
});

const { poll } = await response.json();
console.log('Poll created:', poll.id);
```

### Vote on a Poll
```typescript
await fetch(`http://localhost:3000/api/v1/communities/{communityId}/polls/{pollId}/vote`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    optionId: "option-uuid-here"
  })
});
```

### Get Poll Results
```typescript
const response = await fetch(`http://localhost:3000/api/v1/communities/{communityId}/polls/{pollId}`, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const { poll, options, userVote, results } = await response.json();

results.forEach(result => {
  const option = options.find(o => o.id === result.optionId);
  console.log(`${option.optionText}: ${result.votes} votes (${result.percentage}%)`);
});
```

## Summary

The polls API is fully implemented with:
- ✅ Complete database schema with migrations
- ✅ Type-safe TypeScript interfaces
- ✅ OpenFGA authorization with role and trust-based access
- ✅ Comprehensive business logic validation
- ✅ Zod request validation
- ✅ Swagger/OpenAPI documentation
- ✅ Express routes with authentication
- ✅ Extensive HTTP test cases
- ✅ Support for user, council, and pool creators
- ✅ Vote tracking with percentage calculations
- ✅ Comments integration
- ✅ Poll lifecycle management (active/closed)

The implementation follows all project conventions and is ready for frontend integration.
