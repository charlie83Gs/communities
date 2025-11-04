import { Component, Show, For, createSignal } from 'solid-js';
import {
  useCouncilDetailQuery,
  useCouncilInventoryQuery,
  useCouncilTransactionsQuery,
  useAddCouncilManagerMutation,
  useRemoveCouncilManagerMutation,
} from '@/hooks/queries/useCouncils';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { CouncilTrustButton } from './CouncilTrustButton';
import { InitiativesList } from '@/components/features/initiatives/InitiativesList';
import { CreateInitiativeModal } from '@/components/features/initiatives/CreateInitiativeModal';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilsDict } from './councils.i18n';

interface CouncilDetailsProps {
  communityId: string;
  councilId: string;
  onClose: () => void;
  isAdmin?: boolean;
  isCouncilManager?: boolean;
}

export const CouncilDetails: Component<CouncilDetailsProps> = (props) => {
  const t = makeTranslator(councilsDict, 'councils');
  const [activeTab, setActiveTab] = createSignal<'managers' | 'inventory' | 'transactions' | 'initiatives'>('managers');
  const [transactionsPage, setTransactionsPage] = createSignal(1);
  const [memberSearch, setMemberSearch] = createSignal('');
  const [showAddManager, setShowAddManager] = createSignal(false);
  const [selectedMemberId, setSelectedMemberId] = createSignal<string | null>(null);
  const [showCreateInitiative, setShowCreateInitiative] = createSignal(false);

  const councilQuery = useCouncilDetailQuery(
    () => props.communityId,
    () => props.councilId
  );

  const inventoryQuery = useCouncilInventoryQuery(
    () => props.communityId,
    () => props.councilId
  );

  const transactionsQuery = useCouncilTransactionsQuery(
    () => props.communityId,
    () => props.councilId,
    {
      page: transactionsPage,
      limit: () => 10,
    }
  );

  const membersQuery = useCommunityMembersQuery(
    () => props.communityId,
    () => memberSearch()
  );

  const addManagerMutation = useAddCouncilManagerMutation();
  const removeManagerMutation = useRemoveCouncilManagerMutation();

  const canManageCouncil = () => props.isAdmin || props.isCouncilManager;

  const handleAddManager = async () => {
    const memberId = selectedMemberId();
    if (!memberId) return;

    try {
      await addManagerMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        userId: memberId,
      });
      setShowAddManager(false);
      setSelectedMemberId(null);
      setMemberSearch('');
    } catch (error) {
      console.error('Failed to add manager:', error);
    }
  };

  const handleRemoveManager = async (userId: string) => {
    try {
      await removeManagerMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        userId,
      });
    } catch (error) {
      console.error('Failed to remove manager:', error);
    }
  };

  const getNonManagerMembers = () => {
    const managers = councilQuery.data?.managers || [];
    const managerIds = new Set(managers.map((m) => m.userId));
    return (membersQuery.data || []).filter((member) => !managerIds.has(member.userId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionTypeLabel = (type: 'received' | 'used' | 'transferred') => {
    switch (type) {
      case 'received':
        return t('transactionReceived');
      case 'used':
        return t('transactionUsed');
      case 'transferred':
        return t('transactionTransferred');
      default:
        return type;
    }
  };

  const getTransactionTypeBadgeClass = (type: 'received' | 'used' | 'transferred') => {
    switch (type) {
      case 'received':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'used':
        return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200';
      case 'transferred':
        return 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200';
    }
  };

  return (
    <div class="bg-stone-50 dark:bg-stone-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
      <Show
        when={!councilQuery.isLoading}
        fallback={
          <div class="p-6 text-center text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show when={councilQuery.data}>
          {(council) => (
            <>
              {/* Header */}
              <div class="sticky top-0 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-6 z-10">
                <div class="flex justify-between items-start mb-4">
                  <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {council().name}
                  </h2>
                  <button
                    onClick={props.onClose}
                    class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm font-medium"
                  >
                    ✕
                  </button>
                </div>

                <div class="flex items-start gap-4">
                  <div class="flex-1">
                    <Show
                      when={council().description}
                      fallback={
                        <p class="text-sm text-stone-500 dark:text-stone-400 italic">
                          {t('noDescription')}
                        </p>
                      }
                    >
                      <p class="text-sm text-stone-600 dark:text-stone-400">
                        {council().description}
                      </p>
                    </Show>
                    <div class="mt-3 flex flex-wrap gap-4 text-xs text-stone-500 dark:text-stone-400">
                      <div>
                        {t('createdBy')}: {council().createdBy}
                      </div>
                      <div>
                        {t('createdAt')}: {formatDate(council().createdAt)}
                      </div>
                      <div>
                        {t('trustScore')}: {council().trustScore}
                      </div>
                      <div>
                        {council().memberCount}{' '}
                        {council().memberCount === 1 ? t('manager') : t('managers')}
                      </div>
                    </div>
                  </div>

                  <div class="flex-shrink-0">
                    <CouncilTrustButton
                      communityId={props.communityId}
                      councilId={props.councilId}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div class="p-6 space-y-6">
                {/* Managers Section */}
                <Show when={canManageCouncil()}>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        {t('managersSection')}
                      </h3>
                      <Show when={!showAddManager()}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowAddManager(true)}
                        >
                          {t('addManager')}
                        </Button>
                      </Show>
                    </div>
                    <p class="text-sm text-stone-600 dark:text-stone-400 mb-3">
                      {t('managersDescription')}
                    </p>

                    {/* Add Manager UI */}
                    <Show when={showAddManager()}>
                      <div class="mb-4 p-4 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">
                        <div class="flex flex-col gap-3">
                          <div>
                            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                              {t('searchMembers')}
                            </label>
                            <input
                              type="text"
                              value={memberSearch()}
                              onInput={(e) => setMemberSearch(e.currentTarget.value)}
                              placeholder={t('searchMembersPlaceholder')}
                              class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                            />
                          </div>
                          <Show when={membersQuery.isLoading}>
                            <p class="text-sm text-stone-500 dark:text-stone-400">
                              {t('loading')}
                            </p>
                          </Show>
                          <Show when={!membersQuery.isLoading && getNonManagerMembers().length > 0}>
                            <div class="max-h-48 overflow-y-auto space-y-1">
                              <For each={getNonManagerMembers()}>
                                {(member) => (
                                  <button
                                    onClick={() => setSelectedMemberId(member.userId)}
                                    class={`w-full text-left p-2 rounded-md transition-colors ${
                                      selectedMemberId() === member.userId
                                        ? 'bg-ocean-100 dark:bg-ocean-900/50 border border-ocean-500'
                                        : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                                  >
                                    <div class="font-medium text-stone-900 dark:text-stone-100">
                                      {member.displayName || member.email}
                                    </div>
                                    <div class="text-xs text-stone-500 dark:text-stone-400">
                                      {member.email}
                                    </div>
                                  </button>
                                )}
                              </For>
                            </div>
                          </Show>
                          <Show when={!membersQuery.isLoading && getNonManagerMembers().length === 0}>
                            <p class="text-sm text-stone-500 dark:text-stone-400 italic">
                              {t('noMembersFound')}
                            </p>
                          </Show>
                          <div class="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleAddManager}
                              disabled={!selectedMemberId() || addManagerMutation.isPending}
                            >
                              {addManagerMutation.isPending ? t('adding') : t('add')}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setShowAddManager(false);
                                setSelectedMemberId(null);
                                setMemberSearch('');
                              }}
                            >
                              {t('cancel')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Show>

                    {/* Managers List */}
                    <Show
                      when={council().managers && council().managers.length > 0}
                      fallback={
                        <p class="text-sm text-stone-500 dark:text-stone-400 italic">
                          {t('noManagers')}
                        </p>
                      }
                    >
                      <div class="space-y-2">
                        <For each={council().managers}>
                          {(manager) => (
                            <div class="flex items-center justify-between p-3 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">
                              <div>
                                <div class="font-medium text-stone-900 dark:text-stone-100">
                                  {manager.userName}
                                </div>
                                <div class="text-xs text-stone-500 dark:text-stone-400">
                                  {t('addedOn')}: {formatDate(manager.addedAt)}
                                </div>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRemoveManager(manager.userId)}
                                disabled={removeManagerMutation.isPending}
                              >
                                {t('removeManager')}
                              </Button>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </Show>

                {/* Inventory Section */}
                <div>
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    {t('inventory')}
                  </h3>
                  <Show
                    when={!inventoryQuery.isLoading}
                    fallback={
                      <p class="text-sm text-stone-500 dark:text-stone-400">
                        {t('loading')}
                      </p>
                    }
                  >
                    <Show
                      when={
                        inventoryQuery.data?.inventory &&
                        inventoryQuery.data.inventory.length > 0
                      }
                      fallback={
                        <p class="text-sm text-stone-500 dark:text-stone-400 italic">
                          {t('noInventory')}
                        </p>
                      }
                    >
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <For each={inventoryQuery.data?.inventory}>
                          {(item) => (
                            <div class="p-3 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">
                              <div class="flex items-center justify-between">
                                <div class="font-medium text-stone-900 dark:text-stone-100">
                                  {item.categoryName}
                                </div>
                                <div class="text-sm text-stone-600 dark:text-stone-400">
                                  {t('quantity')}: {item.quantity}
                                  {item.unit ? ` ${item.unit}` : ''}
                                </div>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </Show>
                </div>

                {/* Transactions Section */}
                <div>
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    {t('transactions')}
                  </h3>
                  <Show
                    when={!transactionsQuery.isLoading}
                    fallback={
                      <p class="text-sm text-stone-500 dark:text-stone-400">
                        {t('loading')}
                      </p>
                    }
                  >
                    <Show
                      when={
                        transactionsQuery.data?.transactions &&
                        transactionsQuery.data.transactions.length > 0
                      }
                      fallback={
                        <p class="text-sm text-stone-500 dark:text-stone-400 italic">
                          {t('noTransactions')}
                        </p>
                      }
                    >
                      <div class="space-y-2">
                        <For each={transactionsQuery.data?.transactions}>
                          {(transaction) => (
                            <div class="p-4 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">
                              <div class="flex items-start justify-between mb-2">
                                <div class="flex items-center gap-2">
                                  <span
                                    class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeBadgeClass(
                                      transaction.type
                                    )}`}
                                  >
                                    {getTransactionTypeLabel(transaction.type)}
                                  </span>
                                  <span class="font-medium text-stone-900 dark:text-stone-100">
                                    {transaction.categoryName}
                                  </span>
                                </div>
                                <span class="text-sm text-stone-600 dark:text-stone-400">
                                  {transaction.quantity}
                                </span>
                              </div>
                              <Show when={transaction.description}>
                                <p class="text-sm text-stone-600 dark:text-stone-400 mb-1">
                                  {transaction.description}
                                </p>
                              </Show>
                              <div class="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                                <span>{formatDateTime(transaction.createdAt)}</span>
                                <Show when={transaction.fromUser}>
                                  <span>
                                    {t('from')}: {transaction.fromUser}
                                  </span>
                                </Show>
                                <Show when={transaction.toPool}>
                                  <span>
                                    {t('to')}: {transaction.toPool}
                                  </span>
                                </Show>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>

                      {/* Load More */}
                      <Show
                        when={
                          transactionsQuery.data &&
                          transactionsQuery.data.transactions.length <
                            transactionsQuery.data.total
                        }
                      >
                        <div class="text-center mt-4">
                          <Button
                            variant="secondary"
                            onClick={() => setTransactionsPage((p) => p + 1)}
                          >
                            {t('loadMore')}
                          </Button>
                        </div>
                      </Show>
                    </Show>
                  </Show>
                </div>
              </div>
            </>
          )}
        </Show>
      </Show>
    </div>
  );
};
