# Skills & Endorsements - Quick Start Guide

## Quick Import Reference

```typescript
// Types
import type { UserSkillWithEndorsements, SkillSuggestion } from '@/types/skills.types';

// Hooks
import {
  useUserSkillsQuery,
  useCreateSkillMutation,
  useDeleteSkillMutation,
  useEndorseSkillMutation,
  useRemoveEndorsementMutation,
  useSkillSuggestionsQuery
} from '@/hooks/queries/useSkills';

// Components
import { SkillsProfile } from '@/components/features/skills/SkillsProfile';
import { SkillsBadgeList } from '@/components/features/skills/SkillsBadgeList';
import { SkillEndorsementModal } from '@/components/features/skills/SkillEndorsementModal';
```

## Common Use Cases

### 1. Display User's Skills on Profile Page

```tsx
import { SkillsProfile } from '@/components/features/skills/SkillsProfile';

<SkillsProfile
  userId={userId}
  communityId={communityId}
  canEndorseSkills={permissions.can_endorse_skills}
/>
```

### 2. Show Top Skills in Member List

```tsx
import { SkillsBadgeList } from '@/components/features/skills/SkillsBadgeList';

<SkillsBadgeList
  userId={member.userId}
  communityId={communityId}
  maxSkills={3}
  onViewAllClick={() => navigate(`/users/${member.userId}`)}
/>
```

### 3. Contextual Endorsement After Transaction

```tsx
import { SkillEndorsementModal } from '@/components/features/skills/SkillEndorsementModal';

const [showModal, setShowModal] = createSignal(false);

// After confirming receipt of item/service:
const handleConfirmReceipt = async () => {
  await confirmReceiptMutation.mutateAsync(requestId);
  setShowModal(true);  // Show endorsement modal
};

<SkillEndorsementModal
  isOpen={showModal()}
  onClose={() => setShowModal(false)}
  userId={providerId}
  userName={providerName}
  communityId={communityId}
  itemId={itemId}  // Optional: enables related skills
  canEndorseSkills={permissions.can_endorse_skills}
/>
```

### 4. Custom Query Usage

```tsx
import { useUserSkillsQuery } from '@/hooks/queries/useSkills';

const MyComponent = () => {
  const skillsQuery = useUserSkillsQuery(
    () => userId,
    () => communityId
  );

  return (
    <Show when={!skillsQuery.isLoading && skillsQuery.data}>
      <For each={skillsQuery.data.skills}>
        {(skill) => (
          <div>
            {skill.name} - {skill.endorsementCount} endorsements
            {skill.isEndorsedByMe && <span>✓</span>}
          </div>
        )}
      </For>
    </Show>
  );
};
```

### 5. Custom Add/Endorse Actions

```tsx
import {
  useCreateSkillMutation,
  useEndorseSkillMutation
} from '@/hooks/queries/useSkills';

const MyComponent = () => {
  const createSkill = useCreateSkillMutation();
  const endorseSkill = useEndorseSkillMutation();

  const handleAddSkill = async (name: string) => {
    try {
      await createSkill.mutateAsync({ name });
      // Success! Queries auto-invalidate
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };

  const handleEndorse = async (skillId: string, communityId: string) => {
    try {
      await endorseSkill.mutateAsync({
        skillId,
        data: { communityId }
      });
      // Success! Queries auto-invalidate
    } catch (error) {
      console.error('Failed to endorse:', error);
    }
  };

  return (
    // Your UI
  );
};
```

## Permission Checks

```typescript
// Check if user can endorse skills
const canEndorse = permissions.can_endorse_skills;

// This evaluates to true if:
// - User is admin, OR
// - User has skill_endorser role, OR
// - User has trust >= minTrustToEndorseSkills (default: 10)
```

## Validation Rules

When creating skills:
- **Max length:** 50 characters
- **Allowed characters:** Letters, numbers, spaces, hyphens, ampersands
- **Regex:** `/^[a-zA-Z0-9\s\-&]+$/`
- **Required:** Yes (cannot be empty or whitespace-only)

Example validation:
```typescript
const SKILL_NAME_REGEX = /^[a-zA-Z0-9\s\-&]+$/;
const MAX_SKILL_LENGTH = 50;

const isValid = (name: string) => {
  const trimmed = name.trim();
  return trimmed.length > 0 &&
         trimmed.length <= MAX_SKILL_LENGTH &&
         SKILL_NAME_REGEX.test(trimmed);
};
```

## Contextual Suggestions

When using `SkillEndorsementModal` with an `itemId`, the backend will:
1. Fetch the item's `relatedSkills` array
2. Mark matching skills as `isRelated: true`
3. Sort related skills first

Example item configuration (backend):
```typescript
// In items table
{
  id: "item-uuid",
  name: "Handmade Table",
  relatedSkills: ["Carpentry", "Woodworking", "Furniture Making"]
}
```

When showing endorsement modal:
```tsx
<SkillEndorsementModal
  userId={crafterId}
  userName={crafterName}
  communityId={communityId}
  itemId="item-uuid"  // Item with relatedSkills
  // ...
/>
```

Result: Skills matching "Carpentry", "Woodworking", or "Furniture Making" appear first with star icon.

## Cache Management

All mutations automatically invalidate relevant queries:

- **createSkill** → Invalidates all `['skills', 'user']` queries
- **deleteSkill** → Invalidates all `['skills', 'user']` queries
- **endorseSkill** → Invalidates all `['skills']` queries
- **removeEndorsement** → Invalidates all `['skills']` queries

No manual refetching needed - UI updates automatically!

## Styling Conventions

### Endorsement Count Badges
```tsx
<span class="px-2 py-0.5 text-xs font-medium rounded-full bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
  {count} endorsements
</span>
```

### Endorsed Indicator
```tsx
<span class="px-2 py-0.5 text-xs font-medium rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
  Endorsed
</span>
```

### Related Skill Badge
```tsx
<span class="px-2 py-0.5 text-xs font-medium rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
  Related
</span>
```

## Troubleshooting

### Skills not appearing after creation
- Check browser console for errors
- Verify API endpoint is responding
- Check query key invalidation in mutation

### Endorsement button not working
- Verify `canEndorseSkills` prop is true
- Check user has permission (trust >= 10 OR skill_endorser role OR admin)
- Check browser console for API errors

### Related skills not showing first
- Verify item has `relatedSkills` array configured
- Check `itemId` is passed to SkillEndorsementModal
- Skill names must match exactly (case-insensitive on backend)

### TypeScript errors
- Ensure all imports use `@/` path alias
- Check type definitions in `types/skills.types.ts`
- Verify TanStack Query version compatibility

## Testing Checklist

- [ ] View skills on profile (loading, error, empty, populated)
- [ ] Add skill (success, validation errors, duplicate)
- [ ] Delete skill (confirmation, success)
- [ ] Endorse skill (success, already endorsed, permission denied)
- [ ] Remove endorsement (success)
- [ ] Self-endorsement works
- [ ] Skills badge list shows top 3
- [ ] Related skills appear first in modal
- [ ] Search filters skills correctly
- [ ] Language switching works
- [ ] Dark mode works
- [ ] Mobile responsive

## Accessibility Features

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Screen reader compatible
- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Color contrast (WCAG AA)

## Performance Considerations

- Skills queries have 30s `staleTime` (prevents excessive refetching)
- Badge list component fails silently (won't block page load)
- Debounced search in endorsement modal (prevents excessive filtering)
- Lazy loading for modals (only rendered when open)
- Optimized re-renders with `createMemo` for sorted/filtered data

## Support

For questions or issues:
1. Check backend API logs for errors
2. Review feature documentation: `/docs/features/19-skills-endorsements.md`
3. Check implementation summary: `/SKILLS_IMPLEMENTATION_SUMMARY.md`
4. Verify OpenFGA permissions are configured correctly
