import { Component, Show, For, createSignal, createMemo } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import {
  useCouncilDetailQuery,
  useCouncilTrustStatusQuery,
  useAwardCouncilTrustMutation,
  useRemoveCouncilTrustMutation,
  useAddCouncilManagerMutation,
  useRemoveCouncilManagerMutation,
} from '@/hooks/queries/useCouncils';
import { useCommunityTrustUsersQuery } from '@/hooks/queries/useCommunityTrustUsersQuery';
import { CommunityMemberSelector } from '@/components/common/CommunityMemberSelector';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { Tabs } from '@/components/common/Tabs';
import { CouncilPoolsList } from '@/components/features/councils/CouncilPoolsList';
import { UsageReportsList } from '@/components/features/councils/UsageReportsList';
import { CreateUsageReportModal } from '@/components/features/councils/CreateUsageReportModal';
import { ConsumptionsList } from '@/components/features/councils/ConsumptionsList';
import { CreateConsumptionModal } from '@/components/features/councils/CreateConsumptionModal';
import { InitiativesList } from '@/components/features/initiatives/InitiativesList';
import { CreateInitiativeModal } from '@/components/features/initiatives/CreateInitiativeModal';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilDetailsDict } from './[councilId].i18n';
import { authStore } from '@/stores/auth.store';

type TabId = 'overview' | 'pools' | 'initiatives' | 'reports' | 'consumptions';

const CouncilDetailsPage: Component = () => {
  const params = useParams<{ id: string; councilId: string }>();
  const navigate = useNavigate();
  const t = makeTranslator(councilDetailsDict, 'councilDetails');

  const [activeTab, setActiveTab] = createSignal<TabId>('overview');
  const [showCreateInitiative, setShowCreateInitiative] = createSignal(false);
  const [showCreateReport, setShowCreateReport] = createSignal(false);
  const [showCreateConsumption, setShowCreateConsumption] = createSignal(false);
  const [showAddManager, setShowAddManager] = createSignal(false);
  const [selectedManagerId, setSelectedManagerId] = createSignal<string[]>([]);
  const [removingManagerId, setRemovingManagerId] = createSignal<string | null>(null);

  const council = useCouncilDetailQuery(
    () => params.id,
    () => params.councilId
  );

  const trustStatus = useCouncilTrustStatusQuery(
    () => params.id,
    () => params.councilId
  );

  const awardTrustMutation = useAwardCouncilTrustMutation();
  const removeTrustMutation = useRemoveCouncilTrustMutation();
  const addManagerMutation = useAddCouncilManagerMutation();
  const removeManagerMutation = useRemoveCouncilManagerMutation();

  const trustUsersQuery = useCommunityTrustUsersQuery(() => params.id);

  const isMutating = createMemo(
    () => awardTrustMutation.isPending || removeTrustMutation.isPending
  );

  const getManagerTrustScore = (userId: string): number => {
    const trustUsers = trustUsersQuery.data || [];
    const trustUser = trustUsers.find((t) => t.userId === userId);
    return trustUser?.points ?? 0;
  };

  // Get existing manager IDs for exclusion in selector
  const existingManagerIds = createMemo(() => {
    return council.data?.managers?.map((m) => m.userId) || [];
  });

  // Check if current user is a manager
  const isManager = createMemo(() => {
    const userId = authStore.user?.id;
    if (!userId || !council.data?.managers) return false;
    return council.data.managers.some((m) => m.userId === userId);
  });

  const tabs = createMemo(() => [
    { id: 'overview', label: t('tabOverview') },
    { id: 'pools', label: t('tabPools') },
    { id: 'initiatives', label: t('tabInitiatives') },
    { id: 'reports', label: t('tabReports') },
    { id: 'consumptions', label: t('tabConsumptions') },
  ]);

  const handleGoBack = () => {
    navigate(`/communities/${params.id}/members`);
  };

  const handleAwardTrust = async () => {
    try {
      await awardTrustMutation.mutateAsync({
        communityId: params.id,
        councilId: params.councilId,
      });
    } catch (error) {
      console.error('Failed to award trust:', error);
    }
  };

  const handleRemoveTrust = async () => {
    try {
      await removeTrustMutation.mutateAsync({
        communityId: params.id,
        councilId: params.councilId,
      });
    } catch (error) {
      console.error('Failed to remove trust:', error);
    }
  };

  const handleAddManager = async () => {
    const userId = selectedManagerId()[0];
    if (!userId) return;

    try {
      await addManagerMutation.mutateAsync({
        communityId: params.id,
        councilId: params.councilId,
        userId,
      });
      setSelectedManagerId([]);
      setShowAddManager(false);
    } catch (error) {
      console.error('Failed to add manager:', error);
    }
  };

  const handleRemoveManager = async (userId: string) => {
    // Prevent removing yourself
    if (userId === authStore.user?.id) {
      return;
    }

    if (!confirm(t('confirmRemoveManager'))) {
      return;
    }

    setRemovingManagerId(userId);
    try {
      await removeManagerMutation.mutateAsync({
        communityId: params.id,
        councilId: params.councilId,
        userId,
      });
    } catch (error) {
      console.error('Failed to remove manager:', error);
    } finally {
      setRemovingManagerId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Title>{council.data?.name ?? 'Council Details'}</Title>
      <Meta name="description" content={council.data?.description ?? ''} />

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Link */}
        <button
          onClick={handleGoBack}
          class="inline-flex items-center gap-2 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-6 cursor-pointer"
        >
          <Icon name="arrow-left" size={16} />
          {t('backToCommunity')}
        </button>

        {/* Loading State */}
        <Show when={council.isLoading}>
          <div class="text-center py-12">
            <p class="text-stone-600 dark:text-stone-400">{t('loading')}</p>
          </div>
        </Show>

        {/* Error State */}
        <Show when={council.isError}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md">
            {t('error')}
          </div>
        </Show>

        {/* Council Details */}
        <Show when={council.data}>
          <div class="space-y-6">
            {/* Header Card */}
            <Card>
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {council.data!.name}
                    </h1>
                    <div class="flex flex-wrap gap-4 text-sm text-stone-600 dark:text-stone-400">
                      <span class="flex items-center gap-1">
                        <Icon name="trust" size={16} />
                        {t('trustScore')}: {council.data!.trustScore}
                      </span>
                      <span class="flex items-center gap-1">
                        <Icon name="members" size={16} />
                        {t('members')}: {council.data!.memberCount}
                      </span>
                      <span class="flex items-center gap-1">
                        <Icon name="activity" size={16} />
                        {t('created')}: {formatDate(council.data!.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div class="flex flex-wrap gap-3 border-t border-stone-200 dark:border-stone-700 pt-4">
                  <Show when={trustStatus.data}>
                    <Show
                      when={trustStatus.data!.userHasTrusted}
                      fallback={
                        <Button
                          onClick={handleAwardTrust}
                          disabled={!trustStatus.data!.canAwardTrust || isMutating()}
                          variant="primary"
                        >
                          <Icon name="trust" size={20} class="mr-2" />
                          {t('awardTrust')}
                        </Button>
                      }
                    >
                      <Button
                        onClick={handleRemoveTrust}
                        disabled={isMutating()}
                        variant="secondary"
                      >
                        <Icon name="trash" size={20} class="mr-2" />
                        {t('removeTrust')}
                      </Button>
                    </Show>
                    <Show when={trustStatus.data!.userHasTrusted}>
                      <Badge variant="success">{t('youHaveTrusted')}</Badge>
                    </Show>
                  </Show>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs
              tabs={tabs()}
              activeTab={activeTab()}
              onTabChange={(id) => setActiveTab(id as TabId)}
            />

            {/* Tab Content */}
            <div class="mt-6">
              {/* Overview Tab */}
              <Show when={activeTab() === 'overview'}>
                <div class="space-y-6">
                  {/* Description */}
                  <Card>
                    <div class="p-6">
                      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                        {t('description')}
                      </h3>
                      <p class="text-stone-700 dark:text-stone-300">
                        {council.data!.description || t('noDescription')}
                      </p>
                    </div>
                  </Card>

                  {/* Managers Section */}
                  <Card>
                    <div class="p-6">
                      <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                          {t('managers')}
                        </h3>
                        <Show when={isManager()}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowAddManager(true)}
                          >
                            <Icon name="plus" size={16} class="mr-1" />
                            {t('addManager')}
                          </Button>
                        </Show>
                      </div>
                      <Show
                        when={council.data!.managers && council.data!.managers.length > 0}
                        fallback={
                          <p class="text-stone-600 dark:text-stone-400 text-center py-4">
                            {t('noManagers')}
                          </p>
                        }
                      >
                        <div class="overflow-x-auto">
                          <table class="w-full border-collapse">
                            <thead>
                              <tr class="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
                                <th class="text-left p-3 font-semibold text-stone-700 dark:text-stone-300">
                                  {t('managerName')}
                                </th>
                                <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">
                                  {t('trustScore')}
                                </th>
                                <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">
                                  {t('addedOn')}
                                </th>
                                <Show when={isManager()}>
                                  <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">
                                    {t('actions')}
                                  </th>
                                </Show>
                              </tr>
                            </thead>
                            <tbody>
                              <For each={council.data!.managers}>
                                {(manager) => (
                                  <tr class="border-b border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700">
                                    <td class="p-3">
                                      <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-ocean-100 dark:bg-ocean-900 flex items-center justify-center">
                                          <Icon
                                            name="members"
                                            size={16}
                                            class="text-ocean-600 dark:text-ocean-400"
                                          />
                                        </div>
                                        <span class="font-medium text-stone-900 dark:text-stone-100">
                                          {manager.userName}
                                        </span>
                                      </div>
                                    </td>
                                    <td class="p-3 text-center">
                                      <span class="text-forest-600 dark:text-forest-400 text-xl font-bold">
                                        {getManagerTrustScore(manager.userId)}
                                      </span>
                                    </td>
                                    <td class="p-3 text-center text-sm text-stone-500 dark:text-stone-400">
                                      {formatDate(manager.addedAt)}
                                    </td>
                                    <Show when={isManager()}>
                                      <td class="p-3 text-center">
                                        <Show when={manager.userId !== authStore.user?.id}>
                                          <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveManager(manager.userId)}
                                            disabled={removingManagerId() === manager.userId}
                                          >
                                            {removingManagerId() === manager.userId
                                              ? t('removing')
                                              : t('removeManager')}
                                          </Button>
                                        </Show>
                                      </td>
                                    </Show>
                                  </tr>
                                )}
                              </For>
                            </tbody>
                          </table>
                        </div>
                      </Show>
                    </div>
                  </Card>
                </div>
              </Show>

              {/* Pools Tab */}
              <Show when={activeTab() === 'pools'}>
                <CouncilPoolsList
                  communityId={params.id}
                  councilId={params.councilId}
                  isManager={isManager()}
                />
              </Show>

              {/* Initiatives Tab */}
              <Show when={activeTab() === 'initiatives'}>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {t('tabInitiatives')}
                    </h3>
                    <Show when={isManager()}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowCreateInitiative(true)}
                      >
                        <Icon name="plus" size={16} class="mr-1" />
                        {t('createInitiative')}
                      </Button>
                    </Show>
                  </div>
                  <InitiativesList
                    communityId={params.id}
                    councilId={params.councilId}
                    canCreateReport={isManager()}
                  />
                </div>
              </Show>

              {/* Usage Reports Tab */}
              <Show when={activeTab() === 'reports'}>
                <UsageReportsList
                  communityId={params.id}
                  councilId={params.councilId}
                  isManager={isManager()}
                  onCreateReport={() => setShowCreateReport(true)}
                />
              </Show>

              {/* Consumptions Tab */}
              <Show when={activeTab() === 'consumptions'}>
                <ConsumptionsList
                  communityId={params.id}
                  councilId={params.councilId}
                  isManager={isManager()}
                  onCreateConsumption={() => setShowCreateConsumption(true)}
                />
              </Show>
            </div>
          </div>
        </Show>
      </div>

      {/* Create Initiative Modal */}
      <CreateInitiativeModal
        communityId={params.id}
        councilId={params.councilId}
        isOpen={showCreateInitiative()}
        onClose={() => setShowCreateInitiative(false)}
      />

      {/* Create Usage Report Modal */}
      <CreateUsageReportModal
        communityId={params.id}
        councilId={params.councilId}
        isOpen={showCreateReport()}
        onClose={() => setShowCreateReport(false)}
      />

      {/* Create Consumption Modal */}
      <CreateConsumptionModal
        communityId={params.id}
        councilId={params.councilId}
        isOpen={showCreateConsumption()}
        onClose={() => setShowCreateConsumption(false)}
      />

      {/* Add Manager Modal */}
      <Show when={showAddManager()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div class="bg-white dark:bg-stone-900 rounded-lg max-w-md w-full shadow-xl">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h2 class="text-xl font-bold text-stone-900 dark:text-stone-100">
                    {t('addManagerTitle')}
                  </h2>
                  <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
                    {t('addManagerDescription')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddManager(false);
                    setSelectedManagerId([]);
                  }}
                  class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
                >
                  x
                </button>
              </div>

              <div class="mb-4">
                <CommunityMemberSelector
                  communityId={params.id}
                  mode="single"
                  selectedIds={selectedManagerId()}
                  onSelect={(userId) => setSelectedManagerId([userId])}
                  onDeselect={() => setSelectedManagerId([])}
                  excludeIds={existingManagerIds()}
                  placeholder={t('selectMember')}
                />
              </div>

              <div class="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddManager(false);
                    setSelectedManagerId([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddManager}
                  disabled={selectedManagerId().length === 0 || addManagerMutation.isPending}
                >
                  {addManagerMutation.isPending ? t('adding') : t('addManager')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default CouncilDetailsPage;
