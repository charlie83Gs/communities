/**
 * ResolutionForm Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, createSignal, Show } from 'solid-js';
import { useCreateResolutionMutation } from '@/hooks/queries/useDisputes';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import type { CreateDisputeResolutionDto, ResolutionType } from '@/types/dispute.types';

interface ResolutionFormProps {
  communityId: string;
  disputeId: string;
  onSuccess?: () => void;
}

export const ResolutionForm: Component<ResolutionFormProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');
  const createResolutionMutation = useCreateResolutionMutation();

  const [resolution, setResolution] = createSignal('');
  const [resolutionType, setResolutionType] = createSignal<ResolutionType>('closed');
  const [error, setError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!resolution().trim()) {
      setError(t('resolutionRequired'));
      return;
    }

    try {
      const dto: CreateDisputeResolutionDto = {
        resolution: resolution().trim(),
        resolutionType: resolutionType(),
      };

      await createResolutionMutation.mutateAsync({
        communityId: props.communityId,
        disputeId: props.disputeId,
        dto,
      });

      // Reset form
      setResolution('');
      setResolutionType('closed');
      setError('');

      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch (err) {
      console.error('Failed to create resolution:', err);
    }
  };

  return (
    <Card>
      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
        {t('createResolution')}
      </h3>

      <form onSubmit={handleSubmit} class="space-y-4">
        {/* Resolution Type */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {t('resolutionTypeLabel')}
          </label>
          <div class="space-y-3">
            <label class="flex items-start gap-3 p-3 border border-stone-300 dark:border-stone-600 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
              <input
                type="radio"
                name="resolutionType"
                value="closed"
                checked={resolutionType() === 'closed'}
                onChange={() => setResolutionType('closed')}
                class="mt-1 text-ocean-600 focus:ring-ocean-500"
              />
              <div class="flex-1">
                <div class="font-medium text-stone-900 dark:text-stone-100">
                  {t('resolutionTypeClosed')}
                </div>
                <div class="text-sm text-stone-600 dark:text-stone-400">
                  {t('resolutionTypeClosedDesc')}
                </div>
              </div>
            </label>
            <label class="flex items-start gap-3 p-3 border border-stone-300 dark:border-stone-600 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
              <input
                type="radio"
                name="resolutionType"
                value="open"
                checked={resolutionType() === 'open'}
                onChange={() => setResolutionType('open')}
                class="mt-1 text-ocean-600 focus:ring-ocean-500"
              />
              <div class="flex-1">
                <div class="font-medium text-stone-900 dark:text-stone-100">
                  {t('resolutionTypeOpen')}
                </div>
                <div class="text-sm text-stone-600 dark:text-stone-400">
                  {t('resolutionTypeOpenDesc')}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Resolution Text */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('resolutionText')} <span class="text-danger-600">*</span>
          </label>
          <textarea
            value={resolution()}
            onInput={(e) => {
              setResolution(e.currentTarget.value);
              setError('');
            }}
            placeholder={t('resolutionPlaceholder')}
            rows={6}
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          />
          <Show when={error()}>
            <p class="mt-1 text-sm text-danger-600 dark:text-danger-400">{error()}</p>
          </Show>
        </div>

        {/* Submit */}
        <div class="flex justify-end">
          <Button type="submit" loading={createResolutionMutation.isPending}>
            {createResolutionMutation.isPending ? t('creatingResolution') : t('createResolution')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
