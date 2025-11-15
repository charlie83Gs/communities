import { Component, createSignal, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { LogContributionForm } from '@/components/features/contributions/LogContributionForm';
import { ContributionProfile } from '@/components/features/contributions/ContributionProfile';
import { GrantPeerRecognition } from '@/components/features/contributions/GrantPeerRecognition';
import { PendingVerifications } from '@/components/features/contributions/PendingVerifications';
import { ManageValueCategories } from '@/components/features/contributions/ManageValueCategories';
import { useAuth } from '@/hooks/useAuth';
import { useMyCommunityRoleQuery } from '@/hooks/queries/useMyCommunityRoleQuery';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityContributionsDict } from './CommunityContributions.i18n';

type TabType = 'myProfile' | 'logContribution' | 'grantRecognition' | 'verifications' | 'adminCategories';

const CommunityContributions: Component = () => {
  const t = makeTranslator(communityContributionsDict, 'communityContributions');
  const params = useParams<{ communityId: string }>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = createSignal<TabType>('myProfile');

  const roleQuery = useMyCommunityRoleQuery(() => params.communityId);

  const isAdmin = () => {
    const roles = roleQuery.data?.roles || [];
    return roles.includes('admin');
  };

  return (
    <>
      <Title>{t('pageTitle')}</Title>
      <Meta name="description" content={t('pageDescription')} />

      <div class="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t('title')}
          </h1>
          <p class="mt-2 text-stone-600 dark:text-stone-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div class="border-b border-stone-200 dark:border-stone-700 mb-6">
          <nav class="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('myProfile')}
              class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab() === 'myProfile'
                  ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              {t('tabs.myProfile')}
            </button>
            <button
              onClick={() => setActiveTab('logContribution')}
              class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab() === 'logContribution'
                  ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              {t('tabs.logContribution')}
            </button>
            <button
              onClick={() => setActiveTab('grantRecognition')}
              class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab() === 'grantRecognition'
                  ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              {t('tabs.grantRecognition')}
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab() === 'verifications'
                  ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                  : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              {t('tabs.verifications')}
            </button>
            <Show when={isAdmin()}>
              <button
                onClick={() => setActiveTab('adminCategories')}
                class={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab() === 'adminCategories'
                    ? 'border-ocean-500 text-ocean-600 dark:text-ocean-400'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                {t('tabs.adminCategories')}
              </button>
            </Show>
          </nav>
        </div>

        {/* Tab Content */}
        <div class="mt-6">
          <Show when={activeTab() === 'myProfile' && user()}>
            <ContributionProfile communityId={params.communityId} userId={user()!.id} />
          </Show>

          <Show when={activeTab() === 'logContribution'}>
            <LogContributionForm
              communityId={params.communityId}
              onSuccess={() => setActiveTab('myProfile')}
            />
          </Show>

          <Show when={activeTab() === 'grantRecognition'}>
            <GrantPeerRecognition
              communityId={params.communityId}
              onSuccess={() => {
                // Optionally show a success message or stay on the same tab
              }}
            />
          </Show>

          <Show when={activeTab() === 'verifications'}>
            <PendingVerifications communityId={params.communityId} />
          </Show>

          <Show when={activeTab() === 'adminCategories' && isAdmin()}>
            <ManageValueCategories communityId={params.communityId} />
          </Show>
        </div>

        {/* Info Box */}
        <div class="mt-8 p-6 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
          <h3 class="text-lg font-semibold text-sky-900 dark:text-sky-100 mb-2">
            {t('infoBox.title')}
          </h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-sky-800 dark:text-sky-200">
            <li>{t('infoBox.point1')}</li>
            <li>{t('infoBox.point2')}</li>
            <li>{t('infoBox.point3')}</li>
            <li>{t('infoBox.point4')}</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default CommunityContributions;
