import { Component, Show, For, createSignal } from 'solid-js';
import { makeTranslator } from '@/i18n/makeTranslator';
import { skillsProfileDict } from './SkillsProfile.i18n';
import {
  useUserSkillsQuery,
  useDeleteSkillMutation,
  useEndorseSkillMutation,
  useRemoveEndorsementMutation,
} from '@/hooks/queries/useSkills';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { AddSkillForm } from './AddSkillForm';
import { useAuth } from '@/hooks/useAuth';
import type { UserSkillWithEndorsements } from '@/types/skills.types';

interface SkillsProfileProps {
  userId: string;
  communityId: string;
  canEndorseSkills?: boolean;
}

export const SkillsProfile: Component<SkillsProfileProps> = (props) => {
  const t = makeTranslator(skillsProfileDict, 'skillsProfile');
  const { user } = useAuth();
  const currentUserId = () => user()?.id;

  const [showAddForm, setShowAddForm] = createSignal(false);
  const [deletingSkillId, setDeletingSkillId] = createSignal<string | null>(null);

  const skillsQuery = useUserSkillsQuery(
    () => props.userId,
    () => props.communityId
  );
  const deleteSkillMutation = useDeleteSkillMutation();
  const endorseSkillMutation = useEndorseSkillMutation();
  const removeEndorsementMutation = useRemoveEndorsementMutation();

  const isOwnProfile = () => currentUserId() === props.userId;

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    setDeletingSkillId(skillId);
    try {
      await deleteSkillMutation.mutateAsync(skillId);
    } catch (error) {
      console.error('Failed to delete skill:', error);
      alert(t('deleteError'));
    } finally {
      setDeletingSkillId(null);
    }
  };

  const handleToggleEndorsement = async (skill: UserSkillWithEndorsements) => {
    if (!props.canEndorseSkills) {
      alert(t('permissionDenied'));
      return;
    }

    try {
      if (skill.isEndorsedByMe) {
        await removeEndorsementMutation.mutateAsync({
          skillId: skill.id,
          communityId: props.communityId,
        });
      } else {
        await endorseSkillMutation.mutateAsync({
          skillId: skill.id,
          data: { communityId: props.communityId },
        });
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

  const sortedSkills = () => {
    const skills = skillsQuery.data?.skills || [];
    return [...skills].sort((a, b) => b.endorsementCount - a.endorsementCount);
  };

  return (
    <div class="bg-white dark:bg-stone-800 rounded-lg shadow border border-stone-200 dark:border-stone-700 p-6">
      {/* Header */}
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-stone-900 dark:text-stone-100">
          {t('title')}
        </h3>
        <Show when={isOwnProfile()}>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm())}
            variant="secondary"
          >
            <Icon name="plus" size={16} class="mr-1" />
            {t('addSkill')}
          </Button>
        </Show>
      </div>

      {/* Add Skill Form */}
      <Show when={showAddForm()}>
        <div class="mb-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
          <AddSkillForm
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      </Show>

      {/* Loading State */}
      <Show when={skillsQuery.isLoading}>
        <div class="text-center py-8 text-stone-500 dark:text-stone-400">
          {t('loading')}
        </div>
      </Show>

      {/* Error State */}
      <Show when={skillsQuery.isError}>
        <div class="text-center py-8 text-danger-500">
          {t('error')}
        </div>
      </Show>

      {/* Skills List */}
      <Show when={!skillsQuery.isLoading && !skillsQuery.isError}>
        <Show
          when={sortedSkills().length > 0}
          fallback={
            <div class="text-center py-8 text-stone-500 dark:text-stone-400">
              {t('noSkills')}
            </div>
          }
        >
          <div class="space-y-3">
            <For each={sortedSkills()}>
              {(skill) => (
                <div class="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  {/* Skill Info */}
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-stone-900 dark:text-stone-100">
                        {skill.name}
                      </span>
                      <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
                        {getEndorsementText(skill.endorsementCount)}
                      </span>
                      <Show when={skill.isEndorsedByMe}>
                        <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
                          {t('endorsed')}
                        </span>
                      </Show>
                    </div>
                  </div>

                  {/* Actions */}
                  <div class="flex items-center gap-2">
                    {/* Endorse/Remove Endorsement Button */}
                    <Show when={props.canEndorseSkills}>
                      <button
                        onClick={() => handleToggleEndorsement(skill)}
                        disabled={endorseSkillMutation.isPending || removeEndorsementMutation.isPending}
                        class={`p-2 rounded-md transition-colors ${
                          skill.isEndorsedByMe
                            ? 'text-ocean-600 hover:text-ocean-700 hover:bg-stone-100 dark:text-ocean-400 dark:hover:text-ocean-300 dark:hover:bg-stone-600'
                            : 'text-stone-400 hover:text-forest-600 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-forest-400 dark:hover:bg-stone-600'
                        } disabled:opacity-50`}
                        title={skill.isEndorsedByMe ? t('removeEndorsement') : t('endorse')}
                        aria-label={skill.isEndorsedByMe ? t('removeEndorsement') : t('endorse')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill={skill.isEndorsedByMe ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                      </button>
                    </Show>

                    {/* Delete Button (only for own profile) */}
                    <Show when={isOwnProfile()}>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        disabled={deletingSkillId() === skill.id}
                        class="p-2 rounded-md text-stone-400 hover:text-danger-600 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-danger-400 dark:hover:bg-stone-600 transition-colors disabled:opacity-50"
                        title={t('deleteSkill')}
                        aria-label={t('deleteSkill')}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};
