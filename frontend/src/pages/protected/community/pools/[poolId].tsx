import { Component, createSignal, Show, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePool, usePoolInventory, usePendingContributions, usePoolDistributions, useConfirmContribution, useRejectContribution } from '@/hooks/queries/usePools';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { Tabs } from '@/components/common/Tabs';
import { ContributeToPoolModal } from '@/components/features/pools/ContributeToPoolModal';
import { ManualDistributionModal } from '@/components/features/pools/ManualDistributionModal';
import { MassDistributionWizard } from '@/components/features/pools/MassDistributionWizard';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolDetailsDict } from './[poolId].i18n';

type TabValue = 'inventory' | 'contributions' | 'distributions' | 'settings';

const PoolDetailsPage: Component = () => {
  const params = useParams<{ id: string; poolId: string }>();
  const navigate = useNavigate();
  const t = makeTranslator(poolDetailsDict, 'poolDetails');

  const [activeTab, setActiveTab] = createSignal<TabValue>('inventory');
  const [showContributeModal, setShowContributeModal] = createSignal(false);
  const [showDistributeModal, setShowDistributeModal] = createSignal(false);
  const [showMassDistributeWizard, setShowMassDistributeWizard] = createSignal(false);

  const pool = usePool(() => params.id, () => params.poolId);
  const inventory = usePoolInventory(() => params.id, () => params.poolId);
  const pendingContributions = usePendingContributions(() => params.id, () => params.poolId);
  const distributions = usePoolDistributions(() => params.id, () => params.poolId);
  const members = useCommunityMembersQuery(() => params.id);

  const confirmContributionMutation = useConfirmContribution();
  const rejectContributionMutation = useRejectContribution();

  const handleGoBack = () => {
    navigate(`/communities/${params.id}`);
  };

  const handleConfirmContribution = async (wealthId: string) => {
    try {
      await confirmContributionMutation.mutateAsync({
        communityId: params.id,
        poolId: params.poolId,
        wealthId,
      });
    } catch (error) {
      console.error('Failed to confirm contribution:', error);
    }
  };

  const handleRejectContribution = async (wealthId: string) => {
    try {
      await rejectContributionMutation.mutateAsync({
        communityId: params.id,
        poolId: params.poolId,
        wealthId,
      });
    } catch (error) {
      console.error('Failed to reject contribution:', error);
    }
  };

  const tabs = () => [
    { id: 'inventory' as TabValue, label: t('tabInventory') },
    { id: 'contributions' as TabValue, label: t('tabContributions') },
    { id: 'distributions' as TabValue, label: t('tabDistributions') },
    { id: 'settings' as TabValue, label: t('tabSettings') },
  ];

  return (
    <>
      <Title>{pool.data?.name ?? 'Pool Details'}</Title>
      <Meta name="description" content={pool.data?.description ?? ''} />

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Link */}
        <button
          onClick={handleGoBack}
          class="inline-flex items-center gap-2 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-6 cursor-pointer"
        >
          <Icon name="arrow-left" size={16} />
          {t('backToPools')}
        </button>

        {/* Loading State */}
        <Show when={pool.isLoading}>
          <div class="text-center py-12">
            <p class="text-stone-600 dark:text-stone-400">{t('loading')}</p>
          </div>
        </Show>

        {/* Error State */}
        <Show when={pool.isError}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md">
            {t('error')}
          </div>
        </Show>

        {/* Pool Details */}
        <Show when={pool.data}>
          <div class="space-y-6">
            {/* Header Card */}
            <Card>
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {pool.data!.name}
                    </h1>
                    <p class="text-stone-600 dark:text-stone-400">
                      {t('managedBy')}: {pool.data!.councilName}
                    </p>
                  </div>
                  <Badge
                    variant={pool.data!.distributionType === 'needs_based' ? 'success' : 'default'}
                  >
                    {pool.data!.distributionType === 'needs_based' ? t('needsBased') : t('manual')}
                  </Badge>
                </div>

                <Show when={pool.data!.description}>
                  <p class="text-stone-700 dark:text-stone-300 mb-4">{pool.data!.description}</p>
                </Show>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Show when={pool.data!.primaryItem}>
                    <div class="flex items-center gap-2">
                      <Icon name="tag" size={20} class="text-ocean-600 dark:text-ocean-400" />
                      <span class="text-sm text-stone-600 dark:text-stone-400">{t('primaryItem')}:</span>
                      <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {pool.data!.primaryItem!.name}
                      </span>
                    </div>
                  </Show>
                </div>

                {/* Actions */}
                <div class="flex gap-3 border-t border-stone-200 dark:border-stone-700 pt-4">
                  <Button onClick={() => setShowContributeModal(true)}>
                    <Icon name="plus" size={20} class="mr-2" />
                    {t('contribute')}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowDistributeModal(true)}>
                    <Icon name="send" size={20} class="mr-2" />
                    {t('distribute')}
                  </Button>
                  <Show when={pool.data!.distributionType === 'needs_based'}>
                    <Button variant="secondary" onClick={() => setShowMassDistributeWizard(true)}>
                      <Icon name="users" size={20} class="mr-2" />
                      {t('massDistribute')}
                    </Button>
                  </Show>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs
              tabs={tabs()}
              activeTab={activeTab()}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <Show when={activeTab() === 'inventory'}>
              <Card>
                <div class="p-6">
                  <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                    {t('tabInventory')}
                  </h2>
                  <Show
                    when={inventory.data && inventory.data.length > 0}
                    fallback={
                      <p class="text-stone-600 dark:text-stone-400 text-center py-8">
                        {t('emptyInventory')}
                      </p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={inventory.data}>
                        {(item) => (
                          <div class="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-md">
                            <span class="font-medium text-stone-900 dark:text-stone-100">
                              {item.itemName}
                            </span>
                            <Badge variant="default">{item.unitsAvailable} units</Badge>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </Card>
            </Show>

            <Show when={activeTab() === 'contributions'}>
              <Card>
                <div class="p-6">
                  <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                    {t('tabContributions')}
                  </h2>
                  <Show
                    when={pendingContributions.data && pendingContributions.data.length > 0}
                    fallback={
                      <p class="text-stone-600 dark:text-stone-400 text-center py-8">
                        {t('noPendingContributions')}
                      </p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={pendingContributions.data}>
                        {(contrib) => (
                          <div class="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-md">
                            <div>
                              <p class="font-medium text-stone-900 dark:text-stone-100">
                                {contrib.contributorName}
                              </p>
                              <p class="text-sm text-stone-600 dark:text-stone-400">
                                {contrib.itemName} × {contrib.unitsOffered}
                              </p>
                              <Show when={contrib.message}>
                                <p class="text-xs text-stone-500 dark:text-stone-400 mt-1 italic">
                                  {contrib.message}
                                </p>
                              </Show>
                            </div>
                            <div class="flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleConfirmContribution(contrib.wealthId)}
                                disabled={confirmContributionMutation.isPending}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleRejectContribution(contrib.wealthId)}
                                disabled={rejectContributionMutation.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </Card>
            </Show>

            <Show when={activeTab() === 'distributions'}>
              <Card>
                <div class="p-6">
                  <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                    {t('tabDistributions')}
                  </h2>
                  <Show
                    when={distributions.data && distributions.data.length > 0}
                    fallback={
                      <p class="text-stone-600 dark:text-stone-400 text-center py-8">
                        {t('noDistributions')}
                      </p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={distributions.data}>
                        {(dist) => (
                          <div class="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-md">
                            <div>
                              <p class="font-medium text-stone-900 dark:text-stone-100">
                                {dist.recipientName}
                              </p>
                              <p class="text-sm text-stone-600 dark:text-stone-400">
                                {dist.itemName} × {dist.unitsDistributed}
                              </p>
                            </div>
                            <span class="text-xs text-stone-500 dark:text-stone-400">
                              {new Date(dist.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </Card>
            </Show>

            <Show when={activeTab() === 'settings'}>
              <Card>
                <div class="p-6">
                  <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
                    {t('tabSettings')}
                  </h2>
                  <p class="text-stone-600 dark:text-stone-400">
                    Pool settings UI coming soon...
                  </p>
                </div>
              </Card>
            </Show>
          </div>
        </Show>

        {/* Modals */}
        <Show when={pool.data}>
          <ContributeToPoolModal
            pool={pool.data!}
            communityId={params.id}
            isOpen={showContributeModal()}
            onClose={() => setShowContributeModal(false)}
            onSuccess={() => {
              // Optionally refresh data or show success message
              setActiveTab('contributions');
            }}
          />

          <ManualDistributionModal
            pool={pool.data!}
            communityId={params.id}
            inventory={inventory.data || []}
            members={members.data?.map((m) => ({
              id: m.userId,
              username: m.displayName || m.email || m.userId,
              displayName: m.displayName || undefined,
            })) || []}
            isOpen={showDistributeModal()}
            onClose={() => setShowDistributeModal(false)}
            onSuccess={() => {
              // Optionally refresh data or show success message
              setActiveTab('distributions');
            }}
          />

          <MassDistributionWizard
            pool={pool.data!}
            communityId={params.id}
            inventory={inventory.data || []}
            isOpen={showMassDistributeWizard()}
            onClose={() => setShowMassDistributeWizard(false)}
            onSuccess={() => {
              // Optionally refresh data or show success message
              setActiveTab('distributions');
            }}
          />
        </Show>
      </div>
    </>
  );
};

export default PoolDetailsPage;
