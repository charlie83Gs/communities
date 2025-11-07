---
name: api-validators
description: This skill teaches the agent how to implement request validation in the API project. MANDATORY - You MUST read this skill before modifying any validator files.
---

# API Validators Skill

## Purpose
This skill covers the validation layer of the API project - using schemas to validate and transform HTTP request data before it reaches the controller.

## When to Use This Skill
- Adding validation for new endpoints
- Defining request schemas with Zod
- Validating query parameters, path params, and request bodies
- Creating reusable validation schemas
- Transforming and parsing request data

## Key Patterns from Codebase

### 1. Basic Validator Structure
```typescript
// api/src/api/validators/community.validator.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Define Zod schemas for each endpoint
export const createCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    // Trust System Configuration
    minTrustToAwardTrust: trustRequirementSchema.optional(),
    // Wealth Access Configuration
    minTrustForWealth: trustRequirementSchema.optional(),
  }),
}).passthrough(); // Allow extra fields

export const getCommunitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const updateCommunitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
  }),
}).passthrough();
```

### 2. Reusable Schemas
```typescript
/**
 * TrustRequirement schema matching the TrustRequirement type from trustLevel.types.ts
 *
 * Accepts two formats:
 * - { type: 'number', value: <non-negative integer> }
 * - { type: 'level', value: <UUID string> }
 *
 * This replaces the old plain number format to support both direct numeric thresholds
 * and references to trust levels defined in the community.
 */
const trustRequirementSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('number'),
    value: z.number().int().min(0),
  }),
  z.object({
    type: z.literal('level'),
    value: z.string().uuid(),
  }),
]);

const trustTitleSchema = z.object({
  name: z.string().min(1).max(50),
  minScore: z.number().int().min(0),
});

const metricVisibilitySchema = z.object({
  showActiveMembers: z.boolean().optional(),
  showWealthGeneration: z.boolean().optional(),
  showTrustNetwork: z.boolean().optional(),
  showCouncilActivity: z.boolean().optional(),
  showNeedsFulfillment: z.boolean().optional(),
  showDisputeRate: z.boolean().optional(),
});
```

### 3. Query Parameter Validation with Transformation
```typescript
export const listCommunitiesSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

export const communitySearchQuerySchema = z.object({
  query: z.object({
    q: z.string().max(200).optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();
```

### 4. Validator Middleware Functions
```typescript
function handleZod(
  parse: () => unknown,
  res: Response,
  next: NextFunction
) {
  try {
    parse();
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        errors: err.issues,
      });
    }
    next(err);
  }
}

export const validateCreateCommunity = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createCommunitySchema.parse(req), res, next);

export const validateUpdateCommunity = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateCommunitySchema.parse(req), res, next);

export const validateGetCommunity = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getCommunitySchema.parse(req), res, next);

export const validateListCommunities = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listCommunitiesSchema.parse(req), res, next);
```

### 5. Complex Nested Validation
```typescript
export const createWealthSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    quantity: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    targetType: z.enum(['community', 'council', 'pool']),
    targetId: z.string().uuid().optional(),
    minTrustRequired: z.number().int().min(0).optional(),
    expiresAt: z.string().datetime().optional().transform(
      (val) => val ? new Date(val) : undefined
    ),
    images: z.array(z.string().url()).max(10).optional(),
  }).refine(
    (data) => {
      // If targetType is council or pool, targetId is required
      if (data.targetType !== 'community') {
        return !!data.targetId;
      }
      return true;
    },
    {
      message: "targetId is required for council and pool shares",
      path: ["targetId"],
    }
  ),
}).passthrough();
```

### 6. Array Validation
```typescript
export const batchUpdateSchema = z.object({
  body: z.object({
    updates: z.array(z.object({
      id: z.string().uuid(),
      status: z.enum(['active', 'fulfilled', 'expired', 'cancelled']),
    })).min(1).max(50), // Limit batch size
  }),
}).passthrough();
```

### 7. Member Management Validators
```typescript
export const getMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
}).passthrough();

export const updateMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  body: z.object({
    role: z.string().min(1).max(64),
  }),
}).passthrough();
```

## Common Zod Patterns

### String Validation
```typescript
z.string()                          // Any string
z.string().min(1)                   // Non-empty string
z.string().max(100)                 // Max length
z.string().email()                  // Email format
z.string().url()                    // URL format
z.string().uuid()                   // UUID format
z.string().datetime()               // ISO datetime
z.string().regex(/^[a-z0-9-]+$/)   // Custom pattern
```

### Number Validation
```typescript
z.number()                          // Any number
z.number().int()                    // Integer only
z.number().min(0)                   // Minimum value
z.number().max(100)                 // Maximum value
z.number().positive()               // > 0
z.number().nonnegative()            // >= 0
```

### Enum Validation
```typescript
z.enum(['option1', 'option2', 'option3'])
z.nativeEnum(MyTypeScriptEnum)
```

### Array Validation
```typescript
z.array(z.string())                 // Array of strings
z.array(z.string()).min(1)          // Non-empty array
z.array(z.string()).max(10)         // Max length
z.array(z.object({ ... }))          // Array of objects
```

### Object Validation
```typescript
z.object({
  field1: z.string(),
  field2: z.number().optional(),    // Optional field
  field3: z.string().nullable(),    // Can be null
})
```

### Discriminated Unions
```typescript
z.discriminatedUnion('type', [
  z.object({ type: z.literal('A'), valueA: z.string() }),
  z.object({ type: z.literal('B'), valueB: z.number() }),
])
```

### Transformations
```typescript
z.string().transform(Number)                    // String to number
z.string().transform((val) => val.toLowerCase()) // Custom transform
z.string().datetime().transform((val) => new Date(val)) // String to Date
```

### Refinements (Custom Validation)
```typescript
z.object({ ... }).refine(
  (data) => data.field1 !== data.field2,
  {
    message: "Fields must be different",
    path: ["field2"],
  }
)
```

## Error Response Format

When validation fails, Zod errors are automatically formatted:

```json
{
  "status": "error",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["body", "name"],
      "message": "Expected string, received number"
    },
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "path": ["body", "description"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

## Best Practices

1. **Organize by Feature**: One validator file per controller
2. **Reuse Schemas**: Create shared schemas for common patterns
3. **Use .passthrough()**: Allow extra fields to pass through (for future compatibility)
4. **Transform Query Params**: Convert string query params to appropriate types
5. **Validate All Inputs**: params, query, and body
6. **Clear Error Messages**: Use custom messages for business rules
7. **Limit Array Sizes**: Prevent DoS with max array lengths
8. **UUID Validation**: Always validate UUIDs for ID parameters
9. **Optional vs Nullable**: Use .optional() for missing fields, .nullable() for null values
10. **Refinements for Business Rules**: Use .refine() for complex validation logic

## Testing Validators

Validators are tested through integration tests. The validation middleware automatically returns 400 errors with detailed messages.

## Related Skills
- `api-routes` - Using validators in route definitions
- `api-controller` - Receiving validated data
- `api-testing` - Testing validation errors

## Feature Documentation
Before implementing validators, **MUST READ** the relevant feature documentation in `docs/features/` to understand:
- Required and optional fields
- Validation rules and constraints
- Business logic requirements
- Data type specifications
