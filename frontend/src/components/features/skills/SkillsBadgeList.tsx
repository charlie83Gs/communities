import { Component, Show, For, createMemo } from 'solid-js';
import { makeTranslator } from '@/i18n/makeTranslator';
import { skillsBadgeListDict } from './SkillsBadgeList.i18n';
import { useUserSkillsQuery } from '@/hooks/queries/useSkills';
import type { UserSkillWithEndorsements } from '@/types/skills.types';

interface SkillsBadgeListProps {
  userId: string;
  communityId: string;
  maxSkills?: number;
  onViewAllClick?: () => void;
}

export const SkillsBadgeList: Component<SkillsBadgeListProps> = (props) => {
  const t = makeTranslator(skillsBadgeListDict, 'skillsBadgeList');

  const maxSkills = () => props.maxSkills ?? 3;

  const skillsQuery = useUserSkillsQuery(
    () => props.userId,
    () => props.communityId
  );

  const topSkills = createMemo(() => {
    const skills = skillsQuery.data?.skills || [];
    // Sort by endorsement count (highest first)
    const sorted = [...skills].sort((a, b) => b.endorsementCount - a.endorsementCount);
    // Take top N
    return sorted.slice(0, maxSkills());
  });

  const hasMoreSkills = createMemo(() => {
    const totalSkills = skillsQuery.data?.skills.length || 0;
    return totalSkills > maxSkills();
  });

  const getEndorsementText = (count: number) => {
    if (count === 1) return `1`;
    return `${count}`;
  };

  return (
    <div class="flex items-center gap-2 flex-wrap">
      {/* Loading State */}
      <Show when={skillsQuery.isLoading}>
        <span class="text-xs text-stone-500 dark:text-stone-400">Loading...</span>
      </Show>

      {/* Error State (silently fail) */}
      <Show when={skillsQuery.isError}>
        <span class="text-xs text-stone-500 dark:text-stone-400">{t('noSkills')}</span>
      </Show>

      {/* Skills Badges */}
      <Show when={!skillsQuery.isLoading && !skillsQuery.isError}>
        <Show
          when={topSkills().length > 0}
          fallback={
            <span class="text-xs text-stone-500 dark:text-stone-400">{t('noSkills')}</span>
          }
        >
          <For each={topSkills()}>
            {(skill) => (
              <span
                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 border border-forest-200 dark:border-forest-800"
                title={`${skill.name} - ${skill.endorsementCount} ${
                  skill.endorsementCount === 1 ? t('endorsements') : t('endorsements_plural')
                }`}
              >
                <span>{skill.name}</span>
                <span class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-forest-200 dark:bg-forest-800 text-forest-900 dark:text-forest-100">
                  {getEndorsementText(skill.endorsementCount)}
                </span>
              </span>
            )}
          </For>

          {/* "View All" Button */}
          <Show when={hasMoreSkills() && props.onViewAllClick}>
            <button
              onClick={props.onViewAllClick}
              class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors border border-stone-200 dark:border-stone-600"
              title={t('viewAll')}
            >
              +{(skillsQuery.data?.skills.length || 0) - maxSkills()}
            </button>
          </Show>
        </Show>
      </Show>
    </div>
  );
};
