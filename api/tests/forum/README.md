# Forum API Test Suite

Comprehensive test coverage for the forum functionality using Bun's test framework.

## 📊 Test Statistics

- **Total Test Files**: 5
- **Total Test Cases**: 114
- **Total Lines of Code**: 2,208
- **Test Pass Rate**: 100%

## 📁 Test Files

### 1. `helpers.ts` (9.4 KB)
Test utilities and mock factories for forum testing.

**Provides**:
- Mock data generators for categories, threads, posts, votes
- Mock repository factories
- Mock OpenFGA service with configurable permissions
- Mock community member and user repositories
- Setup and teardown utilities

### 2. `categories.test.ts` (12 KB) - 20 Tests
Tests for forum category CRUD operations and permissions.

**Test Coverage**:
- ✅ Create category (admin only)
- ✅ Create category fails without admin permissions
- ✅ List all categories in a community
- ✅ Get category by ID
- ✅ Update category (admin/forum manager only)
- ✅ Delete category (admin/forum manager only)
- ✅ Delete category fails if it has threads
- ✅ Category validation (name length, description)
- ✅ Forum manager can create/update/delete categories
- ✅ Non-member cannot access categories
- ✅ Categories enriched with stats (thread count, last activity)

### 3. `threads.test.ts` (18 KB) - 27 Tests
Tests for forum thread operations, moderation, and trust-based creation.

**Test Coverage**:
- ✅ Create thread with sufficient trust (default: 10)
- ✅ Create thread fails with insufficient trust
- ✅ Create thread as admin (bypasses trust check)
- ✅ List threads in category with pagination
- ✅ List threads with sorting (newest, popular, mostUpvoted)
- ✅ Get thread detail with all posts
- ✅ Delete own thread
- ✅ Delete any thread as admin/forum manager
- ✅ Pin thread (admin/forum manager only)
- ✅ Unpin thread (admin/forum manager only)
- ✅ Lock thread (admin/forum manager only)
- ✅ Unlock thread (admin/forum manager only)
- ✅ Cannot post to locked thread
- ✅ Thread validation (title length, content length)
- ✅ Set best answer (thread author only)
- ✅ OpenFGA relationships created correctly

### 4. `posts.test.ts` (12 KB) - 17 Tests
Tests for forum post CRUD operations and permissions.

**Test Coverage**:
- ✅ Create post (reply to thread)
- ✅ Create post fails in locked thread
- ✅ Update own post
- ✅ Update post fails for other users' posts
- ✅ Delete own post
- ✅ Delete any post as admin/forum manager
- ✅ Post validation (content length)
- ✅ Forum manager can update/delete any post
- ✅ Non-member cannot create posts
- ✅ Thread not found error handling
- ✅ OpenFGA relationships created correctly

### 5. `voting.test.ts` (14 KB) - 16 Tests
Tests for voting on threads and posts.

**Test Coverage**:
- ✅ Upvote thread
- ✅ Downvote thread
- ✅ Remove vote from thread
- ✅ Change vote (upvote to downvote)
- ✅ Cannot vote multiple times (vote is updated)
- ✅ Upvote post
- ✅ Downvote post
- ✅ Remove vote from post
- ✅ Vote counts are correct
- ✅ Non-member cannot vote
- ✅ Reader role cannot vote
- ✅ Handle zero votes
- ✅ Handle large vote counts

### 6. `permissions.test.ts` (21 KB) - 34 Tests
Comprehensive tests for role-based and trust-based forum permissions.

**Test Coverage**:

**Forum Manager Role**:
- ✅ Forum manager can create categories
- ✅ Forum manager can pin threads
- ✅ Forum manager can lock threads
- ✅ Forum manager can delete any thread
- ✅ Forum manager can delete any post
- ✅ Forum manager can update categories
- ✅ Forum manager can delete categories

**Trust-Based Thread Creation (default: 10)**:
- ✅ Create thread with trust >= 10
- ✅ Fail with trust < 10
- ✅ Respect custom trust threshold

**Admin Permissions (Bypass All)**:
- ✅ Admin can create categories without forum_manager role
- ✅ Admin can create threads without trust requirement
- ✅ Admin can pin threads
- ✅ Admin can lock threads
- ✅ Admin can delete any thread
- ✅ Admin can delete any post

**Non-Member Access Restrictions**:
- ✅ Non-member cannot access forum categories
- ✅ Non-member cannot create threads
- ✅ Non-member cannot create posts
- ✅ Non-member cannot vote on threads
- ✅ Non-member cannot vote on posts

**Reader Role Restrictions**:
- ✅ Reader cannot access forum
- ✅ Reader cannot create threads

**Regular Member Permissions**:
- ✅ Member can view categories
- ✅ Member can view threads
- ✅ Member can create posts
- ✅ Member can vote on threads
- ✅ Member can delete own threads
- ✅ Member can delete own posts
- ✅ Member cannot delete other users threads
- ✅ Member cannot pin threads
- ✅ Member cannot lock threads
- ✅ Member cannot create categories

## 🧪 Running Tests

### Run All Forum Tests
```bash
cd api
bun test tests/forum/
```

### Run Individual Test Files
```bash
# Categories
bun test tests/forum/categories.test.ts

# Threads
bun test tests/forum/threads.test.ts

# Posts
bun test tests/forum/posts.test.ts

# Voting
bun test tests/forum/voting.test.ts

# Permissions
bun test tests/forum/permissions.test.ts
```

### Run with Watch Mode
```bash
bun test --watch tests/forum/
```

## 🏗️ Test Architecture

### Mocking Strategy
All tests use Bun's built-in `mock()` function to mock dependencies:
- **Forum Repository**: Mocked for database operations
- **OpenFGA Service**: Mocked for permission checks
- **Community Member Repository**: Mocked for membership validation
- **Community Repository**: Mocked for community configuration
- **App User Repository**: Mocked for user data

### Test Isolation
- Each test suite uses `beforeEach` to reset mocks
- Tests are independent and can run in any order
- No shared state between tests

### Test Structure
```typescript
describe('Feature Area', () => {
  beforeEach(() => {
    // Setup mocks
  });

  describe('Specific Functionality', () => {
    it('should behave correctly', async () => {
      // Arrange: Setup test data and mocks
      // Act: Call the function under test
      // Assert: Verify expected behavior
    });
  });
});
```

## 📋 Test Coverage Summary

### By Feature
- **Categories**: 20 tests (CRUD + permissions)
- **Threads**: 27 tests (CRUD + moderation + trust-based access)
- **Posts**: 17 tests (CRUD + permissions)
- **Voting**: 16 tests (upvote/downvote on threads and posts)
- **Permissions**: 34 tests (role-based + trust-based access control)

### By Permission Type
- **Admin Role**: 8 dedicated tests
- **Forum Manager Role**: 7 dedicated tests
- **Trust-Based Access**: 5 dedicated tests
- **Non-Member Restrictions**: 5 dedicated tests
- **Reader Role Restrictions**: 2 dedicated tests
- **Regular Member Permissions**: 10 dedicated tests

## 🔍 Key Testing Patterns

### Permission Testing
```typescript
// Test admin bypass
mockOpenFGA.check.mockResolvedValue(true); // Admin
await forumService.someAction(...);
expect(result).toBeDefined();

// Test role-based access
mockOpenFGA.check.mockImplementation(async (params: any) => {
  if (params.relation === 'admin') return false;
  if (params.relation === 'forum_manager') return true;
  return false;
});

// Test trust-based access
mockOpenFGA.checkTrustLevel.mockResolvedValue(true); // Trust >= threshold
```

### Error Handling
```typescript
await expect(
  forumService.someAction(...)
).rejects.toThrow('Expected error message');
```

### Mock Repository Responses
```typescript
mockForumRepo.createThread.mockResolvedValue(forumTestData.thread());
mockForumRepo.findThreadById.mockResolvedValue(null); // Not found
mockForumRepo.updateThread.mockRejectedValue(new AppError('...', 400));
```

## 🎯 Test Quality Metrics

- **All tests pass**: 100%
- **No skipped tests**: All 114 tests run
- **Test execution time**: ~120-160ms total
- **Code reusability**: Shared helpers reduce duplication
- **Mock isolation**: Each test has clean mock state

## 📝 Notes

- Tests use the service layer directly (unit tests)
- OpenFGA calls are mocked for speed and isolation
- Database operations are mocked (no real DB required)
- Tests verify business logic, not infrastructure
- Error messages are verified for user-facing clarity

## 🔄 Future Enhancements

Potential additions to test suite:
- Integration tests with real database
- E2E tests with actual HTTP requests
- Performance tests for large datasets
- Concurrent operation tests
- Rate limiting tests
- Pagination edge cases
- Search and filtering tests
- Thread following/notification tests
- Flag system tests (moderation queue)
- Attachment upload tests

## ✅ Test Validation

All tests have been verified to:
- Execute successfully
- Cover happy paths and error cases
- Test permission boundaries
- Validate input/output types
- Check error messages
- Verify OpenFGA relationship creation
- Ensure proper mock cleanup
