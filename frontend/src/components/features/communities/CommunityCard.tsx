import { Component, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import type { Community } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityCardDict } from './CommunityCard.i18n';

interface CommunityCardProps {
  community: Community;
}

export const CommunityCard: Component<CommunityCardProps> = (props) => {
  const t = makeTranslator(communityCardDict, 'communityCard');
  const { community } = props;

  return (
    <Card class="h-full p-4 hover:shadow-lg transition-shadow">
      <A href={`/communities/${community.id}`} class="flex items-stretch gap-4 h-full">
        <div class="flex-1 flex flex-col">
          <h3 class="text-xl font-bold mb-3">{community.name}</h3>
          <p class="text-stone-600 dark:text-stone-400 mb-3 flex-1">{community.description || t('noDescription')}</p>
          <Show when={community.createdAt}>
            <p class="text-sm text-stone-400 dark:text-stone-500">{t('createdOn').replace('{{date}}', new Date(community.createdAt!).toLocaleDateString())}</p>
          </Show>
        </div>
        <div class="flex items-center gap-4 pl-4 border-l border-stone-200 dark:border-stone-700">
          <div class="flex flex-col items-center gap-1 min-w-[60px]">
            <span class="text-xs text-stone-500 dark:text-stone-400 font-medium">{t('trustScore')}</span>
            <div class="text-forest-600 dark:text-forest-400 text-xl font-bold">
              {community.userTrustScore ?? 0}
            </div>
          </div>
        </div>
      </A>
    </Card>
  );
};
