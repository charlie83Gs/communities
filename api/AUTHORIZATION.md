# OpenFGA ReBAC Authorization System

## Overview

This application uses **OpenFGA** for **Relationship-Based Access Control (ReBAC)**. ALL authorization logic is evaluated by OpenFGA - there is NO authorization logic embedded in application code.

This approach provides:
- **Centralized authorization**: Single source of truth for all permissions
- **Fine-grained control**: Trust-based, role-based, council-based, and pool-based permissions
- **Scalability**: Millions of authorization checks per second
- **Transparency**: All authorization rules defined in OpenFGA model
- **Flexibility**: Easy to add new permission patterns

## Architecture

```
Request → Authentication (SuperTokens) → Authorization (OpenFGA) → Business Logic
```

**Key Principle**: If OpenFGA says "no", the request is denied. NO application code makes authorization decisions.

## Permission Models

The system supports 5 permission models as defined in communities.md:

### 1. Admin Permissions

Direct relationship-based access control.

**How it works:**
- Admins have `community#admin` relation
- Admin relation grants elevated permissions across all community resources

**Example:**
```typescript
// OpenFGA Check
await openFGAService.check({
  user: 'user:alice',
  relation: 'admin',
  object: 'community:xyz'
});
// Returns: true if Alice is admin of community xyz
```

**Use cases:**
- Update community settings
- Assign roles to members
- Delete resources
- Override trust requirements

### 2. Trust Threshold Permissions

Trust scores are modeled as OpenFGA relationships for efficient threshold checking.

**How it works:**
- Each user is assigned to `community#trust_level_X` relation where X = their trust score (0-100)
- When trust score changes, the old relation is removed and new one is added
- Permission checks query: "does user have trust_level_Y where Y >= required threshold?"

**Example:**
```typescript
// User has 15 trust points
// System creates: user:alice trust_level_15 community:xyz

// Check if user can award trust (requires 15 trust)
await openFGAService.checkTrustLevel('alice', 'xyz', 15);
// Returns: true (alice has trust_level_15)

// Check if user can create polls (requires 20 trust)
await openFGAService.checkTrustLevel('alice', 'xyz', 20);
// Returns: false (alice only has trust_level_15)
```

**Use cases:**
- Awarding trust (minTrustToAwardTrust)
- Creating wealth shares (minTrustForWealth)
- Creating polls (minTrustForPolls)
- Handling disputes (minTrustForDisputes)

**Trust Score Sync:**
Trust scores are automatically synced from PostgreSQL to OpenFGA:
```typescript
// When trust score changes
await trustSyncService.syncUserTrustScore(
  communityId,
  userId,
  newTrustScore,
  oldTrustScore
);
```

### 3. User-Based Permissions

Explicit permission grants by admins.

**How it works:**
- Admins assign users to special relations: `poll_creator`, `dispute_handler`, etc.
- Permissions check these relations directly
- Bypasses trust requirements

**Example:**
```typescript
// Admin grants poll creation permission to Bob
await openFGAService.assignUserPermission(
  'bob',
  'xyz',
  'poll_creator'
);

// Check if Bob can create polls
await openFGAService.checkUserPermission('bob', 'xyz', 'poll_creator');
// Returns: true
```

**Use cases:**
- Granting poll creation to specific users
- Assigning dispute handlers
- Custom permission grants

### 4. Council-Based Permissions

Council membership and council trust levels.

**How it works:**
- Users have `council#member` relation
- Councils have their own trust_level relations
- Permissions check council membership or council trust

**Example:**
```typescript
// Alice is member of Food Council
// Tuple: user:alice member council:food_council

// Check if Alice can manage council
await openFGAService.check({
  user: 'user:alice',
  relation: 'can_manage',
  object: 'council:food_council'
});
// Returns: true (council members can manage)

// Council has trust score of 25
// Tuple: council:food_council trust_level_25 community:xyz

// Check if council can handle disputes (requires 20 trust)
await openFGAService.check({
  user: 'council:food_council',
  relation: 'dispute_handler',
  object: 'community:xyz'
});
// Returns: true if council is assigned as dispute_handler
```

**Use cases:**
- Council resource management
- Council initiatives
- Council-based dispute handling
- Trust-gated council operations

### 5. Pool Role Permissions

Pool-specific roles and permissions.

**How it works:**
- Users assigned to `pool#manager` relation
- Permissions check manager relation

**Example:**
```typescript
// Alice is manager of Garden Pool
// Tuple: user:alice manager pool:garden_pool

// Check if Alice can manage pool
await openFGAService.check({
  user: 'user:alice',
  relation: 'can_manage',
  object: 'pool:garden_pool'
});
// Returns: true
```

**Use cases:**
- Pool creation (trust or role-based)
- Pool resource management
- Pool-specific operations

## OpenFGA Model Structure

### Resource Types

- `user`: Users in the system
- `community`: Communities with members, trust, and permissions
- `wealth`: Shared resources/services
- `council`: Specialized community actors
- `pool`: Resource aggregation containers
- `share`: Legacy compatibility
- `share_comment`, `wealth_comment`: Comments on resources
- `invite`: Community invitations
- `system`: Global permissions (superadmin)

### Relations

#### Community Relations

**Core roles:**
- `admin`: Community administrators
- `member`: Regular members
- `reader`: Read-only access

**Trust levels:**
- `trust_level_0` through `trust_level_100`: User trust score relationships

**User permissions:**
- `poll_creator`: Explicit poll creation grant
- `dispute_handler`: Explicit dispute handling grant

**Computed permissions:**
- `can_read`: admin OR member OR reader
- `can_update`: admin only
- `can_delete`: admin only

#### Wealth Relations

**Direct relations:**
- `owner`: Creator of wealth item
- `parent_community`: Link to parent community

**Computed permissions:**
- `can_read`: inherited from parent community
- `can_update`: owner only
- `can_delete`: owner only

#### Council Relations

**Direct relations:**
- `parent_community`: Link to parent community
- `member`: Council members
- `trust_level_X`: Council trust levels

**Computed permissions:**
- `can_read`: inherited from parent community
- `can_manage`: council members

#### Pool Relations

**Direct relations:**
- `parent_community`: Link to parent community
- `parent_council`: Optional link to parent council
- `manager`: Pool managers

**Computed permissions:**
- `can_read`: inherited from parent community
- `can_manage`: pool managers
- `can_contribute`: community members

## Middleware Integration

All middleware should use OpenFGA exclusively for authorization checks.

### Examples

#### Trust-Based Middleware

```typescript
// OLD (embedded logic)
export function requireTrust(options: RequireTrustOptions) {
  return async (req, res, next) => {
    const userTrustScore = await getTrustScore(userId, communityId);
    const threshold = community.minTrustForWealth;
    if (userTrustScore < threshold) {
      throw new AppError('Insufficient trust', 403);
    }
    next();
  };
}

// NEW (OpenFGA only)
export function requireTrust(minTrustLevel: number) {
  return async (req, res, next) => {
    const { userId } = req.session;
    const { communityId } = req.params;

    const hasTrust = await openFGAService.checkTrustLevel(
      userId,
      communityId,
      minTrustLevel
    );

    if (!hasTrust) {
      throw new AppError('Insufficient trust', 403);
    }
    next();
  };
}
```

#### Permission-Based Middleware

```typescript
// OpenFGA permission check
export function requirePermission(
  resourceType: string,
  permission: string
) {
  return async (req, res, next) => {
    const { userId } = req.session;
    const resourceId = req.params.id;

    const hasPermission = await openFGAService.can(
      userId,
      resourceType,
      resourceId,
      permission
    );

    if (!hasPermission) {
      throw new AppError('Forbidden', 403);
    }
    next();
  };
}
```

## Service Layer Integration

Services should **NEVER** implement authorization logic. All authorization is handled by:
1. Middleware (before service is called)
2. OpenFGA service methods (for dynamic checks)

### Anti-Pattern (DON'T DO THIS)

```typescript
// BAD: Authorization logic in service
async createWealth(data, userId) {
  const community = await communityRepository.findById(data.communityId);
  const userTrust = await trustRepository.get(data.communityId, userId);

  // Embedded authorization logic
  if (userTrust.points < community.minTrustForWealth) {
    throw new AppError('Insufficient trust', 403);
  }

  return await wealthRepository.create(data);
}
```

### Correct Pattern (DO THIS)

```typescript
// GOOD: Middleware handles authorization
router.post('/wealth',
  verifySession(),
  requireMember('communityId'),
  requireTrustLevel(10), // Read from community config
  wealthController.create
);

// Service only contains business logic
async createWealth(data, userId) {
  // No authorization checks - middleware handled it
  const wealth = await wealthRepository.create(data);

  // Sync to OpenFGA for future authorization
  await openFGAService.assignRole(userId, 'wealth', wealth.id, 'owner');

  return wealth;
}
```

## Trust Score Synchronization

Trust scores must be synced from PostgreSQL to OpenFGA for trust-based permissions to work.

### When to Sync

Trust scores should be synced whenever they change:
- Trust award created
- Trust award removed
- Admin trust grant updated

### How to Sync

```typescript
import { trustSyncService } from '@/services/trustSync.service';

// After trust score changes
const oldScore = 14;
const newScore = 15;

await trustSyncService.syncUserTrustScore(
  communityId,
  userId,
  newScore,
  oldScore
);
```

### Full Community Sync

For initial setup or full resync:

```typescript
await trustSyncService.syncCommunityTrustScores(communityId);
```

## Configuration Synchronization

Community configuration (trust thresholds, user permissions) must be synced to OpenFGA.

### Trust Thresholds

Read from community configuration when checking permissions:

```typescript
// In middleware
const community = await communityRepository.findById(communityId);
const minTrust = community.minTrustForWealth; // e.g., 10

const hasTrust = await openFGAService.checkTrustLevel(
  userId,
  communityId,
  minTrust
);
```

### User Permission Lists

Sync user permission lists when they change:

```typescript
// When admin adds user to poll creators
await openFGAService.assignUserPermission(
  userId,
  communityId,
  'poll_creator'
);

// When admin removes user from poll creators
await openFGAService.revokeUserPermission(
  userId,
  communityId,
  'poll_creator'
);
```

## Migration Strategy

### Phase 1: Parallel Authorization (Current)

Both old and new authorization systems run in parallel:
- Middleware uses old embedded logic
- OpenFGA is set up but not enforcing
- Trust scores synced to OpenFGA
- Validation that both systems agree

### Phase 2: OpenFGA Primary (Target)

OpenFGA becomes the primary authorization system:
- Middleware refactored to use OpenFGA exclusively
- Embedded authorization logic removed
- Services cleaned up
- Tests updated

### Phase 3: Cleanup

Remove all embedded authorization code:
- Delete old trust middleware
- Remove permission checks from services
- Clean up database queries that check permissions
- Update documentation

## Testing

### Unit Tests

Test OpenFGA service methods:

```typescript
describe('OpenFGA Service', () => {
  it('should check trust level correctly', async () => {
    // Setup: User has trust level 15
    await openFGAService.batchWrite([{
      user: 'user:alice',
      relation: 'trust_level_15',
      object: 'community:xyz'
    }], []);

    // Test: Check if user has >= 10 trust
    const hasTrust = await openFGAService.checkTrustLevel('alice', 'xyz', 10);
    expect(hasTrust).toBe(true);

    // Test: Check if user has >= 20 trust
    const hasHighTrust = await openFGAService.checkTrustLevel('alice', 'xyz', 20);
    expect(hasHighTrust).toBe(false);
  });
});
```

### Integration Tests

Test middleware integration:

```typescript
describe('Wealth API', () => {
  it('should allow member with sufficient trust to create wealth', async () => {
    // Setup: Alice has 15 trust
    await trustSyncService.syncUserTrustScore('xyz', 'alice', 15);

    // Test: Create wealth (requires 10 trust)
    const response = await request(app)
      .post('/api/v1/wealth')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        communityId: 'xyz',
        title: 'Test Wealth'
      });

    expect(response.status).toBe(201);
  });

  it('should deny member with insufficient trust', async () => {
    // Setup: Bob has 5 trust
    await trustSyncService.syncUserTrustScore('xyz', 'bob', 5);

    // Test: Create wealth (requires 10 trust)
    const response = await request(app)
      .post('/api/v1/wealth')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({
        communityId: 'xyz',
        title: 'Test Wealth'
      });

    expect(response.status).toBe(403);
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied Despite Correct Trust Score

**Symptom**: User has sufficient trust in database but still gets 403.

**Solution**: Trust score not synced to OpenFGA.
```bash
# Sync trust scores
await trustSyncService.syncCommunityTrustScores(communityId);
```

#### 2. Admin Can't Perform Action

**Symptom**: Admin gets 403 for actions they should be able to perform.

**Solution**: Admin relation not set in OpenFGA.
```bash
# Verify admin relation
await openFGAService.check({
  user: 'user:alice',
  relation: 'admin',
  object: 'community:xyz'
});
```

#### 3. Slow Permission Checks

**Symptom**: API responses are slow due to OpenFGA checks.

**Solution**:
- Use batch checks where possible
- Cache community configuration
- Consider caching OpenFGA responses (with short TTL)

### Debugging

Enable OpenFGA debug logging:

```typescript
// In openfga.service.ts
console.log('OpenFGA Check:', {
  user,
  relation,
  object,
  allowed: response.allowed
});
```

Check OpenFGA tuples directly:

```typescript
const tuples = await openFGAService.readTuples({
  object: 'community:xyz',
  relation: 'trust_level_15'
});

console.log('Users with trust level 15:', tuples);
```

## Performance Considerations

### Batch Operations

Always use batch operations for multiple tuple writes:

```typescript
// GOOD: Single API call
await openFGAService.batchWrite(
  [
    { user: 'user:alice', relation: 'trust_level_15', object: 'community:xyz' },
    { user: 'user:bob', relation: 'trust_level_20', object: 'community:xyz' }
  ],
  []
);

// BAD: Multiple API calls
await openFGAService.assignRole('alice', 'community', 'xyz', 'trust_level_15');
await openFGAService.assignRole('bob', 'community', 'xyz', 'trust_level_20');
```

### Caching

Cache community configuration to avoid repeated database queries:

```typescript
// Cache community config in memory/Redis
const communityConfig = await getCommunityConfig(communityId); // cached
const minTrust = communityConfig.minTrustForWealth;

const hasTrust = await openFGAService.checkTrustLevel(userId, communityId, minTrust);
```

### Trust Level Granularity

Trust levels use integers 0-100 for users (101 relations) and multiples of 5 for councils (21 relations) to balance granularity and performance.

## Security Best Practices

1. **Never trust client-provided authorization data**: Always use OpenFGA as source of truth
2. **Always verify session before OpenFGA checks**: Authentication first, then authorization
3. **Log all permission denials**: Track who tried to access what
4. **Audit relation changes**: Log all OpenFGA writes for compliance
5. **Principle of least privilege**: Assign minimal required relations

## References

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA Modeling Guide](https://openfga.dev/docs/modeling)
- [communities.md](../communities.md) - Permission model requirements
- [openfga.model.ts](./src/config/openfga.model.ts) - Authorization model definition
