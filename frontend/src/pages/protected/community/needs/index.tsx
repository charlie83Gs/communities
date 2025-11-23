import { Component, Show } from 'solid-js';
import { useParams, useNavigate, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { NeedsList } from '@/components/features/needs/NeedsList';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { needsIndexDict } from './index.i18n';

const CommunityNeedsPageContent: Component<{ communityId: string }> = (props) => {
  const navigate = useNavigate();
  const t = makeTranslator(needsIndexDict, 'needsIndex');
  const community = useCommunity();

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Link */}
        <A
          href={`/communities/${props.communityId}/resources`}
          class="inline-flex items-center gap-1 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-4"
        >
          <span>←</span> {t('backToResources')}
        </A>

        {/* Header */}
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h1>
            <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">{t('subtitle')}</p>
          </div>
          <div class="flex gap-2">
            <button
              onClick={() => navigate(`/communities/${props.communityId}/needs/aggregate`)}
              class="px-4 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center gap-2"
            >
              <Icon name="health" size={16} />
              {t('viewAggregation')}
            </button>
            <button
              onClick={() => navigate(`/communities/${props.communityId}/needs/create`)}
              class="px-4 py-2 text-sm bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 flex items-center gap-2"
            >
              <Icon name="plus" size={16} />
              {t('publishNeed')}
            </button>
          </div>
        </div>

        {/* Trust Requirement Info */}
        <Show when={community.community()?.minTrustForNeeds?.type === 'number'}>
          <div class="mb-6 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-400">
            {t('minTrustRequired')} <span class="font-medium text-stone-900 dark:text-stone-100">{community.community()?.minTrustForNeeds?.value} {t('trustPoints')}</span>
          </div>
        </Show>

        <NeedsList communityId={props.communityId} />
      </div>
    </>
  );
};

const CommunityNeedsPage: Component = () => {
  const params = useParams();
  const communityId = () => params.id;

  return (
    <CommunityProvider communityId={communityId()}>
      <CommunityNeedsPageContent communityId={communityId()} />
    </CommunityProvider>
  );
};

export default CommunityNeedsPage;
