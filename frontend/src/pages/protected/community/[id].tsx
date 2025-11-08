import { Component, Show, createSignal, Switch, Match, createMemo, createEffect } from 'solid-js';
import { Button } from '@/components/common/Button';
import { Title } from '@solidjs/meta';
import { useParams } from '@solidjs/router';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';
import { Card } from '@/components/common/Card';
import { SectionDisclaimer } from '@/components/common/SectionDisclaimer';
import { InviteUserForm } from '@/components/features/communities/InviteUserForm';
import { InviteLinkForm } from '@/components/features/communities/InviteLinkForm';
import { MembersList } from '@/components/features/communities/MembersList';
import { CommunitySettings } from '@/components/features/communities/CommunitySettings';
import { TrustGrantsManager } from '@/components/features/communities/TrustGrantsManager';
import InviteList from '@/components/features/communities/InviteList';
import InviteLinksList from '@/components/features/communities/InviteLinksList';
import { WealthList } from '@/components/features/wealth/WealthList';
import { WealthCreateForm } from '@/components/features/wealth/WealthCreateForm';
import { PollsList } from '@/components/features/polls/PollsList';
import { CreatePollForm } from '@/components/features/polls/CreatePollForm';
import { CouncilsList } from '@/components/features/councils/CouncilsList';
import { CreateCouncilForm } from '@/components/features/councils/CreateCouncilForm';
import { CouncilDetails } from '@/components/features/councils/CouncilDetails';
import { CommunitySidebar, SidebarTab } from '@/components/features/communities/CommunitySidebar';
import { ForumContent } from '@/components/features/forum/ForumContent';
import { ItemsManagementPanel } from '@/components/features/items/ItemsManagementPanel';
import { TrustTimeline } from '@/components/features/communities/TrustTimeline';
import { HealthAnalyticsPanel } from '@/components/features/health/HealthAnalyticsPanel';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityDetailsDict } from './[id].i18n';
import { useTrustLevelsQuery } from '@/hooks/queries/useTrustLevelsQuery';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import { resolveTrustRequirement } from '@/utils/trustLevels';
const CommunityDetailsContent: Component = () => {
  const t = makeTranslator(communityDetailsDict, 'communityDetails');
  const {
    community,
    isLoading,
    error,
    isAdmin,
    canInviteMembers,
    canRemoveMembers,
    canUpdateMemberRoles,
    canManageItems,
    role,
    // Permission flags from trustMe
    canViewTrust,
    canViewWealth,
    canCreateWealth,
    canViewItems,
    canViewPolls,
    canCreatePolls,
    canViewPools,
    canCreatePools,
    canViewCouncils,
    canCreateCouncils,
    canViewForum,
    canManageForum,
    canCreateThreads,
    canViewAnalytics,
  } = useCommunity();

  // Fetch user's trust score
  const trustSummaryQuery = useMyTrustSummaryQuery(() => community()?.id);

  const [activeTab, setActiveTab] = createSignal<SidebarTab>('wealth');
  const [showShareForm, setShowShareForm] = createSignal(false);
  const [showPollForm, setShowPollForm] = createSignal(false);
  const [showCouncilForm, setShowCouncilForm] = createSignal(false);
  const [selectedCouncilId, setSelectedCouncilId] = createSignal<string | null>(null);

  // Fetch trust levels for the community
  const trustLevelsQuery = useTrustLevelsQuery(() => community()?.id);

  const disclaimerWealth = createMemo(() => {
    const comm = community();
    const levels = trustLevelsQuery.data || [];

    if (!comm?.minTrustForWealth) {
      return t('disclaimerWealth').replace('{{minTrust}}', '0');
    }

    const minTrust = resolveTrustRequirement(comm.minTrustForWealth, levels) ?? 0;
    return t('disclaimerWealth').replace('{{minTrust}}', minTrust.toString());
  });

  const disclaimerMembers = createMemo(() => {
    const comm = community();
    const levels = trustLevelsQuery.data || [];

    if (!comm?.minTrustToAwardTrust) {
      return t('disclaimerMembers').replace('{{minTrust}}', '15');
    }

    const minTrust = resolveTrustRequirement(comm.minTrustToAwardTrust, levels) ?? 15;
    return t('disclaimerMembers').replace('{{minTrust}}', minTrust.toString());
  });

  const disclaimerPolls = createMemo(() => {
    const comm = community();
    const levels = trustLevelsQuery.data || [];

    if (!comm?.minTrustForPolls) {
      return t('disclaimerPolls').replace('{{minTrust}}', '15');
    }

    const minTrust = resolveTrustRequirement(comm.minTrustForPolls, levels) ?? 15;
    return t('disclaimerPolls').replace('{{minTrust}}', minTrust.toString());
  });

  const disclaimerCouncils = createMemo(() => {
    const comm = community();
    const levels = trustLevelsQuery.data || [];

    if (!comm?.minTrustForCouncilCreation) {
      return t('disclaimerCouncils').replace('{{minTrust}}', '25');
    }

    const minTrust = resolveTrustRequirement(comm.minTrustForCouncilCreation, levels) ?? 25;
    return t('disclaimerCouncils').replace('{{minTrust}}', minTrust.toString());
  });

  const sidebarItems = createMemo(() => [
    {
      id: 'wealth' as SidebarTab,
      label: t('tabWealth'),
      icon: 'wealth' as const,
      visible: canViewWealth(),
    },
    {
      id: 'members' as SidebarTab,
      label: t('tabMembers'),
      icon: 'members' as const,
      visible: canViewTrust(), // Members tab shows trust/awards functionality
    },
    {
      id: 'forum' as SidebarTab,
      label: t('tabForum'),
      icon: 'forum' as const,
      visible: canViewForum(),
    },
    {
      id: 'polls' as SidebarTab,
      label: t('tabPolls'),
      icon: 'polls' as const,
      visible: canViewPolls(),
    },
    {
      id: 'councils' as SidebarTab,
      label: t('tabCouncils'),
      icon: 'members' as const,
      visible: canViewCouncils(),
    },
    {
      id: 'trust-timeline' as SidebarTab,
      label: t('tabTrustTimeline'),
      icon: 'trust' as const,
      visible: canViewTrust(),
    },
    {
      id: 'health' as SidebarTab,
      label: t('tabHealth'),
      icon: 'health' as const,
      visible: canViewAnalytics(),
    },
    {
      id: 'items' as SidebarTab,
      label: t('tabItems'),
      icon: 'items' as const,
      visible: canViewItems(),
    },
    {
      id: 'invites' as SidebarTab,
      label: t('tabInvites'),
      icon: 'invites' as const,
      visible: canInviteMembers() || isAdmin(),
    },
    {
      id: 'trust-grants' as SidebarTab,
      label: t('tabTrustGrants'),
      icon: 'trust' as const,
      visible: isAdmin(),
    },
    {
      id: 'settings' as SidebarTab,
      label: t('tabSettings'),
      icon: 'settings' as const,
      visible: isAdmin(),
    },
  ]);

  // Compute first available tab (must be after sidebarItems definition)
  const firstAvailableTab = createMemo(() => {
    const items = sidebarItems();
    const visibleItem = items.find(item => item.visible);
    return visibleItem?.id || null;
  });

  // Auto-redirect if current tab is not visible
  createEffect(() => {
    const currentTab = activeTab();
    const items = sidebarItems();
    const currentTabItem = items.find(item => item.id === currentTab);

    // If current tab is not visible, switch to first available
    if (currentTabItem && !currentTabItem.visible) {
      const firstTab = firstAvailableTab();
      if (firstTab) {
        setActiveTab(firstTab);
      }
    }
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
      <Title>{t('titleTag')}</Title>
      <Show when={!isLoading()} fallback={<div class="text-stone-600 dark:text-stone-300 p-4">{t('loading')}</div>}>
        <Show when={community()}>
          {(communityData) => (
            <>
              {/* Community Header */}
              <div class="container mx-auto p-4">
                <Card class="max-w-5xl mx-auto relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-r from-ocean-600/10 to-forest-600/10 dark:from-ocean-500/20 dark:to-forest-500/20"></div>
                  <div class="relative p-6">
                    <div class="flex items-start gap-3 mb-4 relative">
                      <div class="w-14 h-14 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
                        <span class="text-3xl">🏘️</span>
                      </div>
                      <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100 flex-1">{communityData().name}</h1>

                      {/* Trust Score Badge */}
                      <Show when={role() && trustSummaryQuery.data}>
                        <div
                          class="flex flex-col items-center gap-1.5 ml-auto cursor-help self-center"
                          title={t('yourTrustScore')}
                        >
                          <div class="relative group">
                            {/* Outer glow ring */}
                            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-forest-400 to-ocean-500 opacity-20 blur-md group-hover:opacity-30 transition-opacity"></div>

                            {/* Main circle */}
                            <div class="relative w-20 h-20 rounded-full bg-gradient-to-br from-forest-500 via-ocean-500 to-sage-600 p-0.5 shadow-lg group-hover:shadow-xl transition-all">
                              <div class="w-full h-full rounded-full bg-white dark:bg-stone-900 flex flex-col items-center justify-center">
                                <span class="text-4xl font-bold bg-gradient-to-br from-forest-600 to-ocean-600 dark:from-forest-400 dark:to-ocean-400 bg-clip-text text-transparent">
                                  {trustSummaryQuery.data!.points}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span class="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                            {t('trustPoints')}
                          </span>
                        </div>
                      </Show>
                    </div>
                    <p class="text-stone-600 dark:text-stone-300 mb-4">{communityData().description || t('noDescription')}</p>
                    <Show when={communityData().locationRestricted}>
                      <div class="mb-4 flex items-start gap-2">
                        <div class="w-8 h-8 bg-sage-100 dark:bg-sage-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-sm">📍</span>
                        </div>
                        <div>
                          <h3 class="font-semibold mb-1 text-stone-900 dark:text-stone-100">{t('locationTitle')}</h3>
                          <p class="text-stone-700 dark:text-stone-300">{communityData().city}, {communityData().stateProvince}, {communityData().country}</p>
                        </div>
                      </div>
                    </Show>
                    <div class="text-sm text-stone-500 dark:text-stone-400">
                      <p>{t('createdBy')}: {communityData().createdBy}</p>
                      <p>{t('createdAt')}: {communityData().createdAt?.toLocaleDateString() || '-'}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar Layout */}
              <div class="container mx-auto px-4 pb-4">
                <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 min-h-[600px]">
                  {/* Sidebar */}
                  <CommunitySidebar
                    activeTab={activeTab()}
                    onTabChange={setActiveTab}
                    items={sidebarItems()}
                  />

                  {/* Main Content Area */}
                  <div class="flex-1 min-w-0 bg-white dark:bg-stone-800 rounded-lg p-6 shadow-sm border border-stone-200 dark:border-stone-700">
                    <Show
                      when={firstAvailableTab()}
                      fallback={
                        <div class="text-center py-12">
                          <div class="text-6xl mb-4">🔒</div>
                          <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                            {t('noAccessTitle') || 'No Access'}
                          </h3>
                          <p class="text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                            {t('noAccessMessage') || 'You do not have permission to access any sections of this community yet. Build trust with other members to unlock features.'}
                          </p>
                        </div>
                      }
                    >
                      <Switch fallback={undefined}>
                      <Match when={activeTab() === 'wealth'}>
                        <Show when={canViewWealth()} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('mustBeMember')}</div>}>
                          <div class="space-y-6">
                            <SectionDisclaimer>
                              {disclaimerWealth()}
                            </SectionDisclaimer>
                            <Show when={canCreateWealth()}>
                              <Button onClick={() => setShowShareForm(true)}>
                                {t('createShare')}
                              </Button>
                            </Show>
                            <WealthList communityId={communityData().id} />
                          </div>
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'members'}>
                        <Show when={role()} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('noPermissionMembers')}</div>}>
                          <SectionDisclaimer>
                            {disclaimerMembers()}
                          </SectionDisclaimer>
                          <MembersList
                            communityId={communityData().id}
                            showActions={isAdmin()}
                            canRemoveMembers={canRemoveMembers()}
                            canUpdateRoles={canUpdateMemberRoles()}
                          />
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'polls'}>
                        <Show when={canViewPolls()} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('mustBeMember')}</div>}>
                          <div class="space-y-6">
                            <SectionDisclaimer>
                              {disclaimerPolls()}
                            </SectionDisclaimer>
                            <PollsList
                              communityId={communityData().id}
                              onCreateClick={() => setShowPollForm(true)}
                              canCreatePoll={canCreatePolls()}
                            />
                          </div>
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'councils'}>
                        <Show when={canViewCouncils()} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('mustBeMember')}</div>}>
                          <div class="space-y-6">
                            <SectionDisclaimer>
                              {disclaimerCouncils()}
                            </SectionDisclaimer>
                            <CouncilsList
                              communityId={communityData().id}
                              onCreateClick={() => setShowCouncilForm(true)}
                              onViewDetails={(councilId) => setSelectedCouncilId(councilId)}
                              canCreateCouncil={canCreateCouncils()}
                            />
                          </div>
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'forum'}>
                        <Show when={canViewForum()} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('mustBeMember')}</div>}>
                          <ForumContent communityId={communityData().id} />
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'trust-timeline'}>
                        <Show when={canViewTrust()} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('mustBeMember')}</div>}>
                          <TrustTimeline communityId={communityData().id} />
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'health'}>
                        <Show when={canViewAnalytics()} fallback={<div class="p-4 text-stone-500 dark:text-stone-400">{t('mustBeMember')}</div>}>
                          <HealthAnalyticsPanel communityId={communityData().id} />
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'items'}>
                        <Show
                          when={canViewItems()}
                          fallback={
                            <div class="p-4 text-stone-500 dark:text-stone-400">
                              {t('noPermissionItems')}
                            </div>
                          }
                        >
                          <ItemsManagementPanel
                            communityId={communityData().id}
                            canManageItems={canManageItems()}
                          />
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'invites'}>
                        <SectionDisclaimer>
                          {t('disclaimerInvites')}
                        </SectionDisclaimer>
                        <Show when={canInviteMembers()}>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <InviteUserForm communityId={communityData().id} />
                            <InviteLinkForm communityId={communityData().id} />
                          </div>
                        </Show>
                        <Show when={isAdmin()}>
                          <InviteList communityId={communityData().id} />
                          <InviteLinksList communityId={communityData().id} />
                        </Show>
                      </Match>
                      <Match when={activeTab() === 'trust-grants'}>
                        <SectionDisclaimer>
                          {t('disclaimerTrustGrants')}
                        </SectionDisclaimer>
                        <TrustGrantsManager communityId={communityData().id} />
                      </Match>
                      <Match when={activeTab() === 'settings'}>
                        <SectionDisclaimer>
                          {t('disclaimerSettings')}
                        </SectionDisclaimer>
                        <CommunitySettings communityId={communityData().id} />
                      </Match>
                    </Switch>
                    </Show>
                  </div>
                </div>
              </div>

              <Show when={showShareForm()}>
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('modalTitleCreateShare')}</h3>
                      <button
                        onClick={() => setShowShareForm(false)}
                        class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm"
                      >
                        {t('modalClose')}
                      </button>
                    </div>
                    <WealthCreateForm
                      communityId={communityData().id}
                      onCreated={() => setShowShareForm(false)}
                    />
                  </div>
                </div>
              </Show>

              <Show when={showPollForm()}>
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
                    <CreatePollForm
                      communityId={communityData().id}
                      onSuccess={() => setShowPollForm(false)}
                      onCancel={() => setShowPollForm(false)}
                    />
                  </div>
                </div>
              </Show>

              <Show when={showCouncilForm()}>
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
                    <CreateCouncilForm
                      communityId={communityData().id}
                      onSuccess={() => setShowCouncilForm(false)}
                      onCancel={() => setShowCouncilForm(false)}
                    />
                  </div>
                </div>
              </Show>

              <Show when={selectedCouncilId()}>
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <CouncilDetails
                    communityId={communityData().id}
                    councilId={selectedCouncilId()!}
                    onClose={() => setSelectedCouncilId(null)}
                    isAdmin={isAdmin()}
                  />
                </div>
              </Show>
            </>
          )}
        </Show>
        <Show when={error()}>
          <div class="text-red-500 dark:text-red-400">{t('errorPrefix')} {error()?.message}</div>
        </Show>
      </Show>
    </div>
  );
};

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
    return <div class="text-red-500 dark:text-red-400 p-4">{t('invalidId')}</div>;
  }

  return (
    <CommunityProvider communityId={params.id}>
      <CommunityDetailsContent />
    </CommunityProvider>
  );
};

export default CommunityDetails;
