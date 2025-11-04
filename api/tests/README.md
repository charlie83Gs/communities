# API Test Suite

Comprehensive unit test suite for the Express.js API using Bun's built-in test runner.

## Test Structure

```
tests/
├── helpers/
│   └── testUtils.ts          # Test utilities and mocks
├── unit/
│   ├── controllers/           # Controller tests
│   │   └── community.controller.test.ts
│   ├── services/              # Service layer tests
│   │   └── community.service.test.ts
│   ├── validators/            # Input validation tests
│   │   ├── community.validator.test.ts
│   │   └── invite.validator.test.ts
│   └── utils/                 # Utility function tests
│       └── errors.test.ts
├── http/                      # HTTP request examples
└── README.md                  # This file
```

## Running Tests

### Run all tests
```bash
bun test
```

### Run specific test file
```bash
bun test tests/unit/controllers/community.controller.test.ts
```

### Run tests in watch mode
```bash
bun test --watch
```

### Run tests with coverage (if configured)
```bash
bun test --coverage
```

## Test Helpers

The `tests/helpers/testUtils.ts` file provides utilities for:

- **Mock Request/Response**: `createMockRequest()`, `createMockResponse()`, `createMockNext()`
- **Mock Authentication**: `createMockAuthenticatedRequest(userId)` - Creates mock Keycloak JWT authentication
- **Mock Repositories**: `createMockRepository()` - Generic repository mocker
- **Mock Services**: `createMockService()` - Generic service mocker
- **Test Data**: Pre-defined test data objects (community, user, wealth, share, invite)
- **Async Helpers**: Utilities for testing async operations

### Example Usage

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
  testData,
} from '../../helpers/testUtils';
import { myController } from '@/api/controllers/my.controller';

describe('MyController', () => {
  it('should handle request successfully', async () => {
    const req = createMockAuthenticatedRequest('user-123', {
      body: { name: 'Test' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await myController.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Created successfully',
      data: expect.any(Object),
    });
  });
});
```

## Test Coverage

### Controllers (22/22 tests passing)
- ✅ Community Controller
  - Create, Read, Update, Delete operations
  - List and search functionality
  - Member management (get, add, remove, update roles)
  - Error handling for all endpoints

### Services (116+ tests)
- ✅ Community Service
  - CRUD operations with authorization
  - Role-based access control
  - Member management
  - Search and filtering

### Validators (50+ tests)
- ✅ Community Validator
  - Request body validation
  - Path parameter validation
  - Query parameter validation
  - Trust configuration validation
  - Analytics configuration validation
- ✅ Invite Validator
  - User invite validation
  - Link invite validation
  - Role validation

### Utilities (15+ tests)
- ✅ Error Handler
  - AppError handling
  - ZodError handling
  - JWT authentication error handling
  - Generic error handling

## Testing Patterns

### 1. Mocking Dependencies

Always mock external dependencies (repositories, services, databases):

```typescript
const mockRepository = {
  findById: mock(() => Promise.resolve(testData.community)),
  create: mock(() => Promise.resolve(testData.community)),
};

beforeEach(() => {
  mockRepository.findById.mockReset();
  (communityRepository.findById as any) = mockRepository.findById;
});
```

### 2. Testing Async Operations

Use async/await and expect().rejects for error cases:

```typescript
it('should throw error when not found', async () => {
  mockRepository.findById.mockResolvedValue(null);

  await expect(
    service.getCommunity('invalid-id')
  ).rejects.toThrow('Community not found');
});
```

### 3. Testing Authorization

Mock Keycloak authentication and OpenFGA checks:

```typescript
it('should allow admin to delete', async () => {
  const req = createMockAuthenticatedRequest('admin-user-id', {
    user: {
      id: 'admin-user-id',
      email: 'admin@example.com',
      username: 'admin',
      roles: ['admin'],
      realmRoles: ['admin'],
      clientRoles: [],
    },
  });
  mockOpenFGA.can.mockResolvedValue(true);

  await controller.delete(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
});
```

### 4. Testing Validation

Test both valid and invalid inputs:

```typescript
it('should pass with valid data', () => {
  const req = createMockRequest({
    body: { name: 'Valid Name' },
  });

  validateCreate(req, res, next);

  expect(next).toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
});

it('should fail with invalid data', () => {
  const req = createMockRequest({
    body: { name: '' }, // Invalid: empty name
  });

  validateCreate(req, res, next);

  expect(res.status).toHaveBeenCalledWith(400);
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on others
2. **Reset Mocks**: Always reset mocks in `beforeEach()` to avoid state leakage
3. **Clear Names**: Test names should clearly describe what is being tested
4. **Arrange-Act-Assert**: Follow the AAA pattern for test structure
5. **Test Edge Cases**: Include tests for error conditions, edge cases, and happy paths
6. **Mock External Services**: Never make real database or API calls in unit tests
7. **Use Type Safety**: Leverage TypeScript for type-safe test code

## Common Test Scenarios

### Testing Controllers
- ✅ Successful operations (201/200 responses)
- ✅ Error handling (400/401/403/404/500 responses)
- ✅ Parameter validation
- ✅ Authentication/Authorization checks
- ✅ Pagination and filtering
- ✅ Edge cases (empty results, null values)

### Testing Services
- ✅ Business logic correctness
- ✅ Authorization checks (admin, member, owner)
- ✅ Data validation
- ✅ Transaction handling
- ✅ Error propagation
- ✅ Integration with repositories and external services

### Testing Validators
- ✅ Required field validation
- ✅ Type validation (string, number, UUID, etc.)
- ✅ Range validation (min/max lengths, values)
- ✅ Format validation (email, UUID, dates)
- ✅ Optional field handling
- ✅ Nested object validation

## TODO: Additional Test Coverage Needed

### Controllers
- [ ] Invite Controller
- [ ] Trust Controller
- [ ] Wealth Controller
- [ ] Share Controller
- [ ] Users Controller
- [ ] Images Controller

### Services
- [ ] Invite Service
- [ ] Trust Service
- [ ] Wealth Service
- [ ] Share Service
- [ ] OpenFGA Service
- [ ] Image Service

### Repositories
- [ ] Community Repository
- [ ] Invite Repository
- [ ] Trust Repository
- [ ] Wealth Repository
- [ ] Share Repository
- [ ] User Repository

### Validators
- [ ] Trust Validator
- [ ] Wealth Validator
- [ ] Share Validator
- [ ] Users Validator
- [ ] Images Validator

## Contributing

When adding new tests:
1. Follow the existing structure and patterns
2. Use the test utilities from `tests/helpers/testUtils.ts`
3. Ensure all tests pass before committing
4. Add tests for both success and failure cases
5. Update this README with new test coverage

## Current Status

**Tests**: 344 passing, 17 failing (in progress)
**Coverage**: Controllers (partial), Services (partial), Validators (partial), Utils (good)

Run `bun test` to see the latest results.
