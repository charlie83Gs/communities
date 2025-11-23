import { Component, createSignal, Show } from 'solid-js';
import { useCreateCouncilMutation } from '@/hooks/queries/useCouncils';
import { Button } from '@/components/common/Button';
import { CommunityMemberSelector } from '@/components/common/CommunityMemberSelector';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilsDict } from './councils.i18n';
import { authStore } from '@/stores/auth.store';

interface CreateCouncilFormProps {
  communityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateCouncilForm: Component<CreateCouncilFormProps> = (props) => {
  const t = makeTranslator(councilsDict, 'councils');
  const createCouncilMutation = useCreateCouncilMutation();

  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [additionalManagers, setAdditionalManagers] = createSignal<string[]>([]);
  const [error, setError] = createSignal('');

  // Exclude current user from manager selection (they're automatically added as creator)
  const excludeIds = () => {
    const userId = authStore.user?.id;
    return userId ? [userId] : [];
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name().trim()) {
      setError(t('nameRequired'));
      return;
    }

    if (!description().trim()) {
      setError(t('descriptionRequired'));
      return;
    }

    try {
      await createCouncilMutation.mutateAsync({
        communityId: props.communityId,
        dto: {
          name: name().trim(),
          description: description().trim(),
          additionalManagers: additionalManagers().length > 0 ? additionalManagers() : undefined,
        },
      });

      // Reset form
      setName('');
      setDescription('');
      setAdditionalManagers([]);

      props.onSuccess?.();
    } catch (err) {
      console.error('Failed to create council:', err);
      setError(t('errorMessage'));
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
        {t('createCouncilTitle')}
      </h3>

      {/* Council Name */}
      <div>
        <label
          for="council-name"
          class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
        >
          {t('councilName')}
        </label>
        <input
          id="council-name"
          type="text"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder={t('councilNamePlaceholder')}
          required
          class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
        />
      </div>

      {/* Council Description */}
      <div>
        <label
          for="council-description"
          class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
        >
          {t('councilDescription')}
        </label>
        <textarea
          id="council-description"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder={t('councilDescriptionPlaceholder')}
          required
          rows={4}
          class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
        />
      </div>

      {/* Additional Managers */}
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {t('addManager')} ({t('managersDescription')})
        </label>
        <CommunityMemberSelector
          communityId={props.communityId}
          mode="multi"
          selectedIds={additionalManagers()}
          onSelect={(userId) => setAdditionalManagers((prev) => [...prev, userId])}
          onDeselect={(userId) => setAdditionalManagers((prev) => prev.filter((id) => id !== userId))}
          excludeIds={excludeIds()}
          placeholder={t('searchMembersPlaceholder')}
        />
        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
          You will automatically be added as a manager.
        </p>
      </div>

      {/* Error message */}
      <Show when={error()}>
        <div class="text-sm text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20 p-3 rounded-md">
          {error()}
        </div>
      </Show>

      {/* Actions */}
      <div class="flex gap-3 justify-end pt-4">
        <Show when={props.onCancel}>
          <Button type="button" variant="secondary" onClick={props.onCancel}>
            {t('cancel')}
          </Button>
        </Show>
        <Button type="submit" disabled={createCouncilMutation.isPending}>
          {createCouncilMutation.isPending ? t('creating') : t('submit')}
        </Button>
      </div>
    </form>
  );
};
