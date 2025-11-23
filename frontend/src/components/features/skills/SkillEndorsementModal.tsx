import { Component, Show, For, createSignal, createMemo } from 'solid-js';
import { makeTranslator } from '@/i18n/makeTranslator';
import { skillEndorsementModalDict } from './SkillEndorsementModal.i18n';
import {
  useSkillSuggestionsQuery,
  useEndorseSkillMutation,
  useRemoveEndorsementMutation,
} from '@/hooks/queries/useSkills';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import type { SkillSuggestion } from '@/types/skills.types';

interface SkillEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  communityId: string;
  itemId?: string;
  canEndorseSkills?: boolean;
}

export const SkillEndorsementModal: Component<SkillEndorsementModalProps> = (props) => {
  const t = makeTranslator(skillEndorsementModalDict, 'skillEndorsementModal');

  const [searchTerm, setSearchTerm] = createSignal('');
  const [endorsedThisSession, setEndorsedThisSession] = createSignal(false);

  const suggestionsQuery = useSkillSuggestionsQuery(
    () => props.userId,
    () => props.communityId,
    () => props.itemId
  );
  const endorseSkillMutation = useEndorseSkillMutation();
  const removeEndorsementMutation = useRemoveEndorsementMutation();

  const relatedSkills = createMemo(() => {
    const suggestions = suggestionsQuery.data?.suggestions || [];
    return suggestions.filter((s) => s.isRelated);
  });

  const otherSkills = createMemo(() => {
    const suggestions = suggestionsQuery.data?.suggestions || [];
    return suggestions.filter((s) => !s.isRelated);
  });

  const filteredOtherSkills = createMemo(() => {
    const search = searchTerm().toLowerCase().trim();
    if (!search) return otherSkills();
    return otherSkills().filter((s) => s.skillName.toLowerCase().includes(search));
  });

  const handleToggleEndorsement = async (skill: SkillSuggestion) => {
    if (!props.canEndorseSkills) {
      alert(t('permissionDenied'));
      return;
    }

    try {
      if (skill.isEndorsedByMe) {
        await removeEndorsementMutation.mutateAsync({
          skillId: skill.skillId,
          communityId: props.communityId,
        });
      } else {
        await endorseSkillMutation.mutateAsync({
          skillId: skill.skillId,
          data: { communityId: props.communityId },
        });
        setEndorsedThisSession(true);
      }
    } catch (error) {
      console.error('Failed to toggle endorsement:', error);
      alert(skill.isEndorsedByMe ? t('removeEndorsementError') : t('endorseError'));
    }
  };

  const getEndorsementText = (count: number) => {
    if (count === 1) return `1 ${t('endorsements')}`;
    return `${count} ${t('endorsements_plural')}`;
  };

  const renderSkillItem = (skill: SkillSuggestion, showRelatedBadge = false) => (
    <div class="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
      {/* Skill Info */}
      <div class="flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-medium text-stone-900 dark:text-stone-100">
            {skill.skillName}
          </span>
          {showRelatedBadge && (
            <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
              {t('relatedSkills')}
            </span>
          )}
          <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
            {getEndorsementText(skill.endorsementCount)}
          </span>
        </div>
      </div>

      {/* Endorse Button */}
      <Show when={props.canEndorseSkills}>
        <button
          onClick={() => handleToggleEndorsement(skill)}
          disabled={endorseSkillMutation.isPending || removeEndorsementMutation.isPending}
          class={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
            skill.isEndorsedByMe
              ? 'bg-ocean-100 text-ocean-700 hover:bg-ocean-200 dark:bg-ocean-900 dark:text-ocean-200 dark:hover:bg-ocean-800'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600'
          }`}
        >
          {skill.isEndorsedByMe ? t('endorsed') : t('endorse')}
        </button>
      </Show>
    </div>
  );

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title={t('title')} size="lg">
      <div class="space-y-4">
        {/* Subtitle */}
        <p class="text-stone-600 dark:text-stone-400">
          {t('subtitle').replace('{{userName}}', props.userName)}
        </p>

        {/* Thank you message */}
        <Show when={endorsedThisSession()}>
          <div class="p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 text-success-800 dark:text-success-200">
            {t('thankYou')}
          </div>
        </Show>

        {/* Loading State */}
        <Show when={suggestionsQuery.isLoading}>
          <div class="text-center py-8 text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        </Show>

        {/* Error State */}
        <Show when={suggestionsQuery.isError}>
          <div class="text-center py-8 text-danger-500">{t('error')}</div>
        </Show>

        {/* Skills List */}
        <Show when={!suggestionsQuery.isLoading && !suggestionsQuery.isError}>
          <Show
            when={(suggestionsQuery.data?.suggestions.length || 0) > 0}
            fallback={
              <div class="text-center py-8 text-stone-500 dark:text-stone-400">
                {t('noSkills')}
              </div>
            }
          >
            {/* Related Skills Section */}
            <Show when={relatedSkills().length > 0}>
              <div class="space-y-2">
                <h4 class="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {t('relatedSkills')}
                </h4>
                <div class="space-y-2">
                  <For each={relatedSkills()}>
                    {(skill) => renderSkillItem(skill, true)}
                  </For>
                </div>
              </div>
            </Show>

            {/* Other Skills Section */}
            <Show when={otherSkills().length > 0}>
              <div class="space-y-2">
                <h4 class="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  {t('otherSkills')}
                </h4>

                {/* Search */}
                <Show when={otherSkills().length > 5}>
                  <input
                    type="text"
                    value={searchTerm()}
                    onInput={(e) => setSearchTerm(e.currentTarget.value)}
                    placeholder={t('search')}
                    class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
                  />
                </Show>

                {/* Filtered Skills */}
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <For each={filteredOtherSkills()}>
                    {(skill) => renderSkillItem(skill, false)}
                  </For>
                  <Show when={filteredOtherSkills().length === 0 && searchTerm()}>
                    <div class="text-center py-4 text-stone-500 dark:text-stone-400 text-sm">
                      No skills match "{searchTerm()}"
                    </div>
                  </Show>
                </div>
              </div>
            </Show>
          </Show>
        </Show>

        {/* Actions */}
        <div class="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-700">
          <Button variant="secondary" onClick={props.onClose}>
            {endorsedThisSession() ? t('done') : t('skip')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
