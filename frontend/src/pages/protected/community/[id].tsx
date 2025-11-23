import { Component, Show, Switch, Match } from 'solid-js';
import { Title } from '@solidjs/meta';
import { useParams, useLocation } from '@solidjs/router';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';
import { CommunityLayout, CommunityTab } from '@/components/layout/CommunityLayout';
import { OverviewTab } from '@/components/features/communities/tabs/OverviewTab';
import { MembersTab } from '@/components/features/communities/tabs/MembersTab';
import { DiscussionTab } from '@/components/features/communities/tabs/DiscussionTab';
import { CommunitySettings } from '@/components/features/communities/CommunitySettings';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityDetailsDict } from './[id].i18n';

/**
 * Community page content component.
 * Uses URL-based tab routing with the new compact CommunityLayout.
 */
const CommunityDetailsContent: Component = () => {
  const t = makeTranslator(communityDetailsDict, 'communityDetails');
  const params = useParams();
  const location = useLocation();
  const { community, isLoading, error, isAdmin } = useCommunity();

  // Determine active tab from URL
  const activeTab = (): CommunityTab => {
    const path = location.pathname;
    if (path.includes('/members')) return 'members';
    if (path.includes('/discussion')) return 'discussion';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    const communityId = params.id;

    return (
      <Switch fallback={<OverviewTab communityId={communityId} />}>
        <Match when={activeTab() === 'overview'}>
          <OverviewTab communityId={communityId} />
        </Match>
        <Match when={activeTab() === 'members'}>
          <MembersTab communityId={communityId} />
        </Match>
        <Match when={activeTab() === 'discussion'}>
          <DiscussionTab communityId={communityId} />
        </Match>
        <Match when={activeTab() === 'settings'}>
          <Show
            when={isAdmin()}
            fallback={
              <div class="text-center py-12">
                <div class="text-6xl mb-4">🔒</div>
                <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {t('noAccessTitle') || 'Access Denied'}
                </h3>
                <p class="text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                  {t('noAccessSettings') || 'Only administrators can access community settings.'}
                </p>
              </div>
            }
          >
            <CommunitySettings communityId={communityId} />
          </Show>
        </Match>
      </Switch>
    );
  };

  return (
    <>
      <Title>{community()?.name || t('titleTag')}</Title>
      <Show
        when={!isLoading()}
        fallback={
          <div class="min-h-screen bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
            <div class="text-stone-600 dark:text-stone-300">{t('loading')}</div>
          </div>
        }
      >
        <Show when={community()}>
          <CommunityLayout communityId={params.id} activeTab={activeTab()}>
            {renderTabContent()}
          </CommunityLayout>
        </Show>
        <Show when={error()}>
          <div class="min-h-screen bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
            <div class="text-red-500 dark:text-red-400">
              {t('errorPrefix')} {error()?.message}
            </div>
          </div>
        </Show>
      </Show>
    </>
  );
};

/**
 * Community details page - main entry point.
 * Wraps content in CommunityProvider for context.
 */
const CommunityDetails: Component = () => {
  const t = makeTranslator(communityDetailsDict, 'communityDetails');
  const params = useParams();

  const isValidId = () => {
    const id = params.id;
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  if (!isValidId()) {
    return (
      <div class="min-h-screen bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
        <div class="text-red-500 dark:text-red-400 p-4">{t('invalidId')}</div>
      </div>
    );
  }

  return (
    <CommunityProvider communityId={params.id}>
      <CommunityDetailsContent />
    </CommunityProvider>
  );
};

export default CommunityDetails;
