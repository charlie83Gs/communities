/**
 * DisputeForm Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useCreateDisputeMutation } from '@/hooks/queries/useDisputes';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import type { CreateDisputeDto } from '@/types/dispute.types';

interface DisputeFormProps {
  communityId: string;
  onSuccess?: (disputeId: string) => void;
  onCancel?: () => void;
}

export const DisputeForm: Component<DisputeFormProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');
  const navigate = useNavigate();
  const createMutation = useCreateDisputeMutation();

  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [errors, setErrors] = createSignal<{ title?: string; description?: string }>({});

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title().trim()) {
      newErrors.title = t('titleRequired');
    }

    if (!description().trim()) {
      newErrors.description = t('descriptionRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const dto: CreateDisputeDto = {
        title: title().trim(),
        description: description().trim(),
      };

      const result = await createMutation.mutateAsync({
        communityId: props.communityId,
        dto,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setErrors({});

      // Navigate to the dispute detail page or call success callback
      if (props.onSuccess) {
        props.onSuccess(result.id);
      } else {
        navigate(`/communities/${props.communityId}/disputes/${result.id}`);
      }
    } catch (err) {
      console.error('Failed to create dispute:', err);
    }
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    } else {
      navigate(`/communities/${props.communityId}`);
    }
  };

  return (
    <Card>
      <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
        {t('createDisputeTitle')}
      </h2>

      <form onSubmit={handleSubmit} class="space-y-4">
        {/* Title */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('titleLabel')} <span class="text-danger-600">*</span>
          </label>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            placeholder={t('titlePlaceholder')}
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          />
          <Show when={errors().title}>
            <p class="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors().title}</p>
          </Show>
        </div>

        {/* Description */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('descriptionLabel')} <span class="text-danger-600">*</span>
          </label>
          <textarea
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={6}
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          />
          <Show when={errors().description}>
            <p class="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors().description}</p>
          </Show>
        </div>

        {/* Actions */}
        <div class="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={handleCancel} type="button">
            {t('cancel')}
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            {createMutation.isPending ? t('submitting') : t('submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
