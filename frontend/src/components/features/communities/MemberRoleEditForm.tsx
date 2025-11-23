import { Component, createSignal, createMemo, Show, For } from 'solid-js';
import type { CommunityMember } from '@/types/community.types';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { memberRoleEditFormDict } from './MemberRoleEditForm.i18n';
import { communityMembersService } from '@/services/api/communityMembers.service';

interface MemberRoleEditFormProps {
  member: CommunityMember;
  communityId: string;
  onSuccess: () => void;
  onCancel: () => void;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
}

// Feature role categories with their associated roles
const FEATURE_ROLE_CATEGORIES = [
  { id: 'trust', label: 'trust', roles: ['trust_viewer', 'trust_granter'] },
  { id: 'wealth', label: 'wealth', roles: ['wealth_viewer', 'wealth_creator'] },
  { id: 'polls', label: 'polls', roles: ['poll_viewer', 'poll_creator'] },
  { id: 'disputes', label: 'disputes', roles: ['dispute_viewer', 'dispute_handler'] },
  { id: 'pools', label: 'pools', roles: ['pool_viewer', 'pool_creator'] },
  { id: 'councils', label: 'councils', roles: ['council_viewer', 'council_creator'] },
  { id: 'forum', label: 'forum', roles: ['forum_viewer', 'forum_manager', 'thread_creator', 'attachment_uploader', 'content_flagger', 'flag_reviewer'] },
  { id: 'items', label: 'items', roles: ['item_viewer', 'item_manager'] },
  { id: 'analytics', label: 'analytics', roles: ['analytics_viewer'] },
  { id: 'needs', label: 'needs', roles: ['needs_viewer', 'needs_publisher'] },
] as const;

// All feature roles for filtering
const ALL_FEATURE_ROLES: string[] = FEATURE_ROLE_CATEGORIES.flatMap(cat => [...cat.roles]);

export const MemberRoleEditForm: Component<MemberRoleEditFormProps> = (props) => {
  const t = makeTranslator(memberRoleEditFormDict, 'memberRoleEditForm');

  // Initialize base role from member roles
  const initialBaseRole = props.member.roles.includes('admin') ? 'admin' : 'member';

  // Initialize feature roles from member roles (filter out base roles and trust_level_* roles)
  const initialFeatureRoles = props.member.roles.filter(
    role => ALL_FEATURE_ROLES.includes(role) && !role.startsWith('trust_level_')
  );

  const [selectedRole, setSelectedRole] = createSignal(initialBaseRole);
  const [selectedFeatureRoles, setSelectedFeatureRoles] = createSignal<string[]>(initialFeatureRoles);
  const [expandedCategories, setExpandedCategories] = createSignal<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Count total active feature roles
  const totalActiveRoles = createMemo(() => selectedFeatureRoles().length);

  // Count active roles per category
  const getRoleCounts = (categoryRoles: readonly string[]) => {
    return categoryRoles.filter(role => selectedFeatureRoles().includes(role)).length;
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Toggle feature role selection
  const toggleFeatureRole = (role: string) => {
    setSelectedFeatureRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const newRole = selectedRole();
    const currentBaseRole = props.member.roles.includes('admin') ? 'admin' : 'member';

    setIsSubmitting(true);
    try {
      // Update base role if changed
      if (newRole !== currentBaseRole) {
        await props.onUpdateRole(props.member.userId, newRole);
      }

      // Update feature roles
      await communityMembersService.updateMemberFeatureRoles(
        props.communityId,
        props.member.userId,
        selectedFeatureRoles()
      );

      props.onSuccess();
    } catch (err: any) {
      if (err?.message?.includes('feature')) {
        setError(t('featureRoleUpdateFailed'));
      } else {
        setError(err?.message ?? t('updateFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">
            {t('memberName')}: <span class="font-medium">{props.member.displayName || props.member.email || props.member.userId}</span>
          </p>
        </div>

        <Show when={error()}>
          <div class="bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200 px-4 py-2 rounded-md text-sm">
            {error()}
          </div>
        </Show>

        {/* Base Role Section */}
        <div>
          <button
            type="button"
            class="flex items-center gap-2 w-full text-left text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {t('baseRole')}
          </button>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 border border-stone-300 dark:border-stone-600 rounded-md hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition-colors">
              <input
                type="radio"
                name="role"
                value="member"
                checked={selectedRole() === 'member'}
                onChange={(e) => setSelectedRole((e.target as HTMLInputElement).value)}
                class="text-ocean-600 focus:ring-ocean-500"
              />
              <div class="flex-1">
                <div class="font-medium text-stone-900 dark:text-stone-100">{t('memberRole')}</div>
                <div class="text-sm text-stone-600 dark:text-stone-400">{t('memberDescription')}</div>
              </div>
            </label>

            <label class="flex items-center gap-3 p-3 border border-stone-300 dark:border-stone-600 rounded-md hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition-colors">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={selectedRole() === 'admin'}
                onChange={(e) => setSelectedRole((e.target as HTMLInputElement).value)}
                class="text-ocean-600 focus:ring-ocean-500"
              />
              <div class="flex-1">
                <div class="font-medium text-stone-900 dark:text-stone-100">{t('adminRole')}</div>
                <div class="text-sm text-stone-600 dark:text-stone-400">{t('adminDescription')}</div>
              </div>
            </label>
          </div>
        </div>

        {/* Feature Roles Section */}
        <div>
          <button
            type="button"
            class="flex items-center gap-2 w-full text-left text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {t('featureRoles')} ({t('featureRolesActive').replace('{{count}}', String(totalActiveRoles()))})
          </button>

          <div class="border border-stone-300 dark:border-stone-600 rounded-md divide-y divide-stone-200 dark:divide-stone-700">
            <For each={FEATURE_ROLE_CATEGORIES}>
              {(category) => {
                const roleCount = () => getRoleCounts(category.roles);
                const isExpanded = () => expandedCategories().has(category.id);

                return (
                  <div>
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      class="flex items-center justify-between w-full p-3 text-left hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <div class="flex items-center gap-2">
                        <svg
                          class={`w-4 h-4 transition-transform ${isExpanded() ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span class="font-medium text-stone-900 dark:text-stone-100">
                          {t(`categories.${category.label}`)}
                        </span>
                      </div>
                      <span class="text-sm text-stone-500 dark:text-stone-400">
                        ({roleCount()})
                      </span>
                    </button>

                    {/* Category Roles */}
                    <Show when={isExpanded()}>
                      <div class="px-3 pb-3 space-y-2">
                        <For each={category.roles}>
                          {(role) => (
                            <label class="flex items-start gap-3 p-2 rounded hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedFeatureRoles().includes(role)}
                                onChange={() => toggleFeatureRole(role)}
                                class="mt-0.5 text-ocean-600 focus:ring-ocean-500 rounded"
                              />
                              <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                                  {t(`roles.${role}.name`)}
                                </div>
                                <div class="text-xs text-stone-600 dark:text-stone-400">
                                  {t(`roles.${role}.description`)}
                                </div>
                              </div>
                            </label>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>

        <div class="pt-2">
          <p class="text-xs text-stone-500 dark:text-stone-400 mb-3">
            {t('currentRoles')}: <span class="font-medium">{props.member.roles.join(', ')}</span>
          </p>
        </div>

        <div class="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting()}
          >
            {isSubmitting() ? t('saving') : t('saveChanges')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={props.onCancel}
            disabled={isSubmitting()}
          >
            {t('cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
};
