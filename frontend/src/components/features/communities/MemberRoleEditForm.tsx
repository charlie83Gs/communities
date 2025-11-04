import { Component, createSignal, Show } from 'solid-js';
import type { CommunityMember } from '@/types/community.types';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { memberRoleEditFormDict } from './MemberRoleEditForm.i18n';

interface MemberRoleEditFormProps {
  member: CommunityMember;
  communityId: string;
  onSuccess: () => void;
  onCancel: () => void;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
}

export const MemberRoleEditForm: Component<MemberRoleEditFormProps> = (props) => {
  const t = makeTranslator(memberRoleEditFormDict, 'memberRoleEditForm');

  const [selectedRole, setSelectedRole] = createSignal(
    props.member.roles.includes('admin') ? 'admin' : 'member'
  );
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const newRole = selectedRole();
    const currentRoles = props.member.roles;

    // Check if role is already assigned
    if (currentRoles.includes(newRole)) {
      setError(t('roleAlreadyAssigned'));
      return;
    }

    setIsSubmitting(true);
    try {
      await props.onUpdateRole(props.member.userId, newRole);
      props.onSuccess();
    } catch (err: any) {
      setError(err?.message ?? t('updateFailed'));
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

        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {t('selectRole')}
          </label>
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
