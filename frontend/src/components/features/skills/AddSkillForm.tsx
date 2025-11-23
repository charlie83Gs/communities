import { Component, createSignal, Show } from 'solid-js';
import { makeTranslator } from '@/i18n/makeTranslator';
import { addSkillFormDict } from './AddSkillForm.i18n';
import { useCreateSkillMutation } from '@/hooks/queries/useSkills';
import { Button } from '@/components/common/Button';

interface AddSkillFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_SKILL_LENGTH = 50;
const SKILL_NAME_REGEX = /^[a-zA-Z0-9\s\-&]+$/;

export const AddSkillForm: Component<AddSkillFormProps> = (props) => {
  const t = makeTranslator(addSkillFormDict, 'addSkillForm');

  const [skillName, setSkillName] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const createSkillMutation = useCreateSkillMutation();

  const remainingChars = () => MAX_SKILL_LENGTH - skillName().length;

  const validateSkillName = (name: string): string | null => {
    if (!name.trim()) {
      return t('required');
    }
    if (name.length > MAX_SKILL_LENGTH) {
      return t('tooLong');
    }
    if (!SKILL_NAME_REGEX.test(name)) {
      return t('validationError');
    }
    return null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const trimmedName = skillName().trim();
    const validationError = validateSkillName(trimmedName);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await createSkillMutation.mutateAsync({ name: trimmedName });
      setSkillName('');
      props.onSuccess?.();
    } catch (err: any) {
      console.error('Failed to create skill:', err);
      // Check for duplicate error
      if (err?.message?.toLowerCase().includes('duplicate')) {
        setError(t('duplicateError'));
      } else {
        setError(t('serverError'));
      }
    }
  };

  const handleCancel = () => {
    setSkillName('');
    setError(null);
    props.onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <label
          for="skillName"
          class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
        >
          {t('skillName')}
        </label>
        <input
          id="skillName"
          type="text"
          value={skillName()}
          onInput={(e) => {
            setSkillName(e.currentTarget.value);
            setError(null);
          }}
          placeholder={t('placeholder')}
          maxLength={MAX_SKILL_LENGTH}
          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
        />
        <div class="flex justify-between items-center mt-1">
          <span class="text-xs text-stone-500 dark:text-stone-400">
            {t('maxChars')}
          </span>
          <span
            class={`text-xs ${
              remainingChars() < 10
                ? 'text-warning-600 dark:text-warning-400'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {remainingChars()} {t('charsRemaining')}
          </span>
        </div>
      </div>

      {/* Error Message */}
      <Show when={error()}>
        <div class="text-sm text-danger-600 dark:text-danger-400">
          {error()}
        </div>
      </Show>

      {/* Actions */}
      <div class="flex gap-2 justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCancel}
          disabled={createSkillMutation.isPending}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={createSkillMutation.isPending}
          disabled={!skillName().trim()}
        >
          {createSkillMutation.isPending ? t('adding') : t('add')}
        </Button>
      </div>
    </form>
  );
};
