import { Component, createSignal, Show } from 'solid-js';
import { Title } from '@solidjs/meta';
import { useParams, Navigate } from '@solidjs/router';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';
import { Card } from '@/components/common/Card';
import { WealthStatistics } from '@/components/features/health/WealthStatistics';
import { TrustStatistics } from '@/components/features/health/TrustStatistics';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityHealthDict } from './health.i18n';

type HealthTab = 'wealth' | 'trust';

const CommunityHealthContent: Component = () => {
  const t = makeTranslator(communityHealthDict, 'communityHealth');
  const { community, isLoading, error } = useCommunity();
  const [activeTab, setActiveTab] = createSignal<HealthTab>('trust');

  return (
    <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
      <Title>{t('titleTag')}</Title>

      <Show
        when={!isLoading()}
        fallback={
          <div class="text-stone-600 dark:text-stone-300 p-4">{t('loading')}</div>
        }
      >
        <Show when={community()}>
          {(communityData) => (
            <div class="container mx-auto p-4">
              {/* Header */}
              <Card class="max-w-6xl mx-auto mb-6 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-ocean-600/10 to-forest-600/10 dark:from-ocean-500/20 dark:to-forest-500/20" />
                <div class="relative p-6">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
                      <span class="text-2xl">📊</span>
                    </div>
                    <div>
                      <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">
                        {t('pageTitle')}
                      </h1>
                      <p class="text-stone-600 dark:text-stone-400">
                        {communityData().name}
                      </p>
                    </div>
                  </div>
                  <p class="text-stone-700 dark:text-stone-300 mt-2">
                    {t('pageDescription')}
                  </p>
                </div>
              </Card>

              {/* Analytics Content */}
              <div class="max-w-6xl mx-auto">
                {/* Tab Navigation */}
                <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 mb-6">
                  <div class="flex border-b border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => setActiveTab('trust')}
                      class={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab() === 'trust'
                          ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600 dark:border-ocean-400 bg-ocean-50/50 dark:bg-ocean-900/20'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                      }`}
                    >
                      <div class="flex items-center justify-center gap-2">
                        <span class="text-lg">🤝</span>
                        <span>{t('trustTab')}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('wealth')}
                      class={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab() === 'wealth'
                          ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600 dark:border-ocean-400 bg-ocean-50/50 dark:bg-ocean-900/20'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                      }`}
                    >
                      <div class="flex items-center justify-center gap-2">
                        <span class="text-lg">💰</span>
                        <span>{t('wealthTab')}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <Show when={activeTab() === 'wealth'}>
                  <WealthStatistics communityId={communityData().id} />
                </Show>
                <Show when={activeTab() === 'trust'}>
                  <TrustStatistics communityId={communityData().id} />
                </Show>
              </div>
            </div>
          )}
        </Show>

        <Show when={error()}>
          <div class="text-red-500 dark:text-red-400 p-4">
            {t('errorPrefix')} {error()?.message}
          </div>
        </Show>
      </Show>
    </div>
  );
};

const CommunityHealth: Component = () => {
  const t = makeTranslator(communityHealthDict, 'communityHealth');
  const params = useParams();

  const isValidId = () => {
    const id = params.id;
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  if (!isValidId()) {
    return <div class="text-red-500 dark:text-red-400 p-4">{t('invalidId')}</div>;
  }

  return (
    <CommunityProvider communityId={params.id}>
      <CommunityHealthContent />
    </CommunityProvider>
  );
};

export default CommunityHealth;
