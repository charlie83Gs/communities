import { Component, Show } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { WealthList } from '@/components/features/wealth/WealthList';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { useCommunity, CommunityProvider } from '@/contexts/CommunityContext';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthIndexDict } from './index.i18n';

const WealthIndexPageContent: Component = () => {
  const params = useParams<{ id: string }>();
  const t = makeTranslator(wealthIndexDict, 'wealthIndex');
  const community = useCommunity();

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Link */}
        <A
          href={`/communities/${params.id}/resources`}
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
          <Show when={community.canCreateWealth()}>
            <A href={`/communities/${params.id}/wealth/create`}>
              <Button>
                <Icon name="plus" size={20} class="mr-2" />
                {t('createWealth')}
              </Button>
            </A>
          </Show>
        </div>

        {/* Trust Requirement Info */}
        <Show when={community.community()?.minTrustForWealth?.type === 'number'}>
          <div class="mb-6 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-400">
            {t('minTrustRequired')} <span class="font-medium text-stone-900 dark:text-stone-100">{community.community()?.minTrustForWealth?.value} {t('trustPoints')}</span>
          </div>
        </Show>

        {/* Wealth List */}
        <WealthList communityId={params.id} />
      </div>
    </>
  );
};

const WealthIndexPage: Component = () => {
  const params = useParams<{ id: string }>();

  return (
    <CommunityProvider communityId={params.id}>
      <WealthIndexPageContent />
    </CommunityProvider>
  );
};

export default WealthIndexPage;
