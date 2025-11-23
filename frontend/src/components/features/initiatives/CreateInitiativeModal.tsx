import { Component, createSignal, Show } from 'solid-js';
import { useCreateInitiativeMutation } from '@/hooks/queries/useInitiatives';
import { renderMarkdown } from '@/utils/markdown';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativesDict } from './initiatives.i18n';

interface CreateInitiativeModalProps {
  communityId: string;
  councilId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInitiativeModal: Component<CreateInitiativeModalProps> = (props) => {
  const t = makeTranslator(initiativesDict, 'initiatives');
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [showPreview, setShowPreview] = createSignal(false);
  const [error, setError] = createSignal('');

  const createInitiativeMutation = useCreateInitiativeMutation();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setShowPreview(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    props.onClose();
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    const titleValue = title().trim();
    const descriptionValue = description().trim();

    if (!titleValue) {
      setError(t('titleRequired'));
      return;
    }

    if (!descriptionValue) {
      setError(t('descriptionRequired'));
      return;
    }

    try {
      await createInitiativeMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        dto: {
          title: titleValue,
          description: descriptionValue,
        },
      });
      handleClose();
    } catch (err: unknown) {
      console.error('Failed to create initiative:', err);
      // Extract error message from API response
      const errorMessage = (err as { message?: string })?.message
        || 'Failed to create initiative. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-stone-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div class="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 p-6 z-10">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {t('createInitiativeTitle')}
              </h2>
              <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
                {t('createInitiativeDescription')}
              </p>
            </div>
            <button
              onClick={handleClose}
              class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} class="p-6 space-y-4">
          <Show when={error()}>
            <div class="p-3 bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-200 rounded-md text-sm">
              {error()}
            </div>
          </Show>

          {/* Title */}
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              {t('title')} <span class="text-danger-600">*</span>
            </label>
            <input
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder={t('titlePlaceholder')}
              class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
          </div>

          {/* Description */}
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                {t('description')} <span class="text-danger-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((p) => !p)}
                class="text-xs text-ocean-600 dark:text-ocean-400 hover:underline"
              >
                {showPreview() ? t('hidePreview') : t('showPreview')}
              </button>
            </div>
            <Show
              when={!showPreview()}
              fallback={
                <div
                  class="min-h-[200px] p-3 border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 rounded-md prose dark:prose-invert max-w-none"
                  innerHTML={renderMarkdown(description())}
                />
              }
            >
              <textarea
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={10}
                class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 resize-vertical font-mono text-sm"
              />
            </Show>
          </div>

          {/* Actions */}
          <div class="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
            <Button type="button" variant="secondary" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createInitiativeMutation.isPending}
              disabled={!title().trim() || !description().trim()}
            >
              {createInitiativeMutation.isPending ? t('creating') : t('submit')}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </Show>
  );
};
