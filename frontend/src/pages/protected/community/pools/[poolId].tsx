import { Component, createSignal, createMemo, createEffect, Show, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePool, usePoolInventory, usePendingContributions, usePoolDistributions, useConfirmContribution, useRejectContribution, useUpdatePool } from '@/hooks/queries/usePools';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { useCouncilDetailQuery } from '@/hooks/queries/useCouncils';
import { usePoolCheckoutLinks, useCreatePoolCheckoutLink, useRevokePoolCheckoutLink, useRegeneratePoolCheckoutLink } from '@/hooks/queries/useCheckoutLinks';
import { useItems } from '@/hooks/queries/useItems';
import { checkoutLinksService } from '@/services/api/checkoutLinks.service';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { Tabs } from '@/components/common/Tabs';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { ContributeToPoolModal } from '@/components/features/pools/ContributeToPoolModal';
import { ManualDistributionModal } from '@/components/features/pools/ManualDistributionModal';
import { MassDistributionWizard } from '@/components/features/pools/MassDistributionWizard';
import { PoolNeedsTable } from '@/components/features/pools/PoolNeedsTable';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolDetailsDict } from './[poolId].i18n';
import type { PoolCheckoutLink } from '@/types/checkoutLinks.types';
import { formatDistanceToNow } from 'date-fns';

type TabValue = 'inventory' | 'contributions' | 'distributions' | 'needs' | 'self-service' | 'settings';

const PoolDetailsPage: Component = () => {
  const params = useParams<{ id: string; poolId: string }>();
  const navigate = useNavigate();
  const t = makeTranslator(poolDetailsDict, 'poolDetails');
  const { user } = useAuth();

  const [activeTab, setActiveTab] = createSignal<TabValue>('inventory');
  const [showContributeModal, setShowContributeModal] = createSignal(false);
  const [showDistributeModal, setShowDistributeModal] = createSignal(false);
  const [showMassDistributeWizard, setShowMassDistributeWizard] = createSignal(false);

  // Checkout links modal states
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [showSuccessModal, setShowSuccessModal] = createSignal(false);
  const [showRevokeModal, setShowRevokeModal] = createSignal(false);
  const [showRegenerateModal, setShowRegenerateModal] = createSignal(false);
  const [selectedLink, setSelectedLink] = createSignal<PoolCheckoutLink | null>(null);
  const [newlyCreatedLink, setNewlyCreatedLink] = createSignal<PoolCheckoutLink | null>(null);

  // Checkout links form states
  const [selectedItemId, setSelectedItemId] = createSignal('');
  const [maxUnits, setMaxUnits] = createSignal('');
  const [revokeReason, setRevokeReason] = createSignal('');

  // Search state
  const [searchQuery, setSearchQuery] = createSignal('');
  const [itemSearchQuery, setItemSearchQuery] = createSignal('');

  // Settings form state
  const [poolName, setPoolName] = createSignal('');
  const [poolDescription, setPoolDescription] = createSignal('');
  const [maxUnitsPerUser, setMaxUnitsPerUser] = createSignal('');
  const [minimumContribution, setMinimumContribution] = createSignal('');
  const [allowAllItems, setAllowAllItems] = createSignal(true);
  const [allowedItemIds, setAllowedItemIds] = createSignal<string[]>([]);
  const [selectedNewItem, setSelectedNewItem] = createSignal('');
  const [settingsMessage, setSettingsMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);

  const pool = usePool(() => params.id, () => params.poolId);
  const inventory = usePoolInventory(() => params.id, () => params.poolId);
  const pendingContributions = usePendingContributions(() => params.id, () => params.poolId);
  const distributions = usePoolDistributions(() => params.id, () => params.poolId);
  const members = useCommunityMembersQuery(() => params.id);

  // Checkout links queries
  const checkoutLinksQuery = usePoolCheckoutLinks(() => params.id, () => params.poolId);
  const items = useItems(() => params.id);

  // Checkout links mutations
  const createLinkMutation = useCreatePoolCheckoutLink();
  const revokeLinkMutation = useRevokePoolCheckoutLink();
  const regenerateLinkMutation = useRegeneratePoolCheckoutLink();

  // Query council details to get managers list
  const councilDetail = useCouncilDetailQuery(
    () => params.id,
    () => pool.data?.councilId
  );

  // Check if current user is a council member (manager)
  const isCouncilMember = createMemo(() => {
    const currentUser = user();
    const council = councilDetail.data;
    if (!currentUser || !council) return false;

    return council.managers.some(manager => manager.userId === currentUser.id);
  });

  const confirmContributionMutation = useConfirmContribution();
  const rejectContributionMutation = useRejectContribution();
  const updatePoolMutation = useUpdatePool();

  // Initialize settings when pool data loads
  createEffect(() => {
    const poolData = pool.data;
    if (poolData) {
      setPoolName(poolData.name);
      setPoolDescription(poolData.description || '');
      setMaxUnitsPerUser(poolData.maxUnitsPerUser?.toString() || '');
      setMinimumContribution(poolData.minimumContribution?.toString() || '');

      // Set allowed items
      if (poolData.allowedItems && poolData.allowedItems.length > 0) {
        setAllowAllItems(false);
        setAllowedItemIds(poolData.allowedItems.map(item => item.id));
      } else {
        setAllowAllItems(true);
        setAllowedItemIds([]);
      }
    }
  });

  // Available items for checkout links
  const availableItems = createMemo(() => {
    const poolData = pool.data;
    const allItems = items.data || [];

    if (!poolData) return [];

    // If pool has allowed items, filter to those
    if (poolData.allowedItems && poolData.allowedItems.length > 0) {
      return poolData.allowedItems;
    }

    // Otherwise, all community items are available
    return allItems;
  });

  // Filtered available items based on search query
  const filteredAvailableItems = createMemo(() => {
    const query = itemSearchQuery().toLowerCase().trim();
    if (!query) return availableItems();
    return availableItems().filter(item =>
      item.name.toLowerCase().includes(query)
    );
  });

  // Items available to add (not already in allowed list)
  const availableItemsToAdd = createMemo(() => {
    const allItems = items.data || [];
    const currentAllowed = allowedItemIds();
    return allItems.filter(item => !currentAllowed.includes(item.id));
  });

  // Check if settings have changed
  const hasSettingsChanges = createMemo(() => {
    const poolData = pool.data;
    if (!poolData) return false;

    return (
      poolName() !== poolData.name ||
      poolDescription() !== (poolData.description || '') ||
      maxUnitsPerUser() !== (poolData.maxUnitsPerUser?.toString() || '') ||
      minimumContribution() !== (poolData.minimumContribution?.toString() || '') ||
      JSON.stringify(allowedItemIds().sort()) !== JSON.stringify((poolData.allowedItems?.map(i => i.id) || []).sort()) ||
      (allowAllItems() && poolData.allowedItems && poolData.allowedItems.length > 0) ||
      (!allowAllItems() && (!poolData.allowedItems || poolData.allowedItems.length === 0))
    );
  });

  const checkoutLinks = () => checkoutLinksQuery.data || [];

  // Filtered checkout links based on search query
  const filteredCheckoutLinks = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) return checkoutLinks();
    return checkoutLinks().filter(link =>
      link.item.name.toLowerCase().includes(query)
    );
  });

  // Check if item exists in pool's current inventory with available units
  const isItemInPool = (itemId: string) => {
    // Check if the item exists in inventory AND has units available
    return inventory.data?.some(inv => inv.itemId === itemId && inv.unitsAvailable > 0) || false;
  };

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

  // Checkout links handlers
  const handleCopyLink = async (checkoutUrl: string) => {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      console.log(t('linkCopied'));
    } catch (error) {
      console.error('Failed to copy link:', error);
      console.log(t('linkCopyFailed'));
    }
  };

  const handleDownloadQR = (link: PoolCheckoutLink) => {
    const filename = `checkout-qr-${link.item.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    checkoutLinksService.downloadQRCode(link.qrCodeDataUrl, filename);
    console.log(t('qrDownloaded'));
  };

  const handlePrintQR = (link: PoolCheckoutLink) => {
    const title = t('qrPrintTitle').replace('{{item}}', link.item.name);
    checkoutLinksService.printQRCode(link.qrCodeDataUrl, title);
  };

  const generateWhatsAppURL = (link: PoolCheckoutLink, communityName?: string) => {
    const itemName = link.item.name;
    const url = link.checkoutUrl;
    const maxUnits = link.maxUnitsPerCheckout
      ? `\n📦 Max per checkout: ${link.maxUnitsPerCheckout} ${link.item.unit}`
      : '';

    const message = communityName
      ? `🌱 ${communityName}\n\n${itemName}${maxUnits}\n\nScan the QR code or click this link to request:\n${url}`
      : `${itemName}${maxUnits}\n\nScan the QR code or click this link to request:\n${url}`;

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const handleShareWhatsApp = (link: PoolCheckoutLink) => {
    const communityName = pool.data?.name;
    const whatsappURL = generateWhatsAppURL(link, communityName);
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');
  };

  const handleCreateLink = async () => {
    if (!selectedItemId()) return;

    try {
      const newLink = await createLinkMutation.mutateAsync({
        communityId: params.id,
        poolId: params.poolId,
        dto: {
          itemId: selectedItemId(),
          maxUnitsPerCheckout: maxUnits() ? parseFloat(maxUnits()) : null,
        },
      });

      setNewlyCreatedLink(newLink);
      setShowCreateModal(false);
      setShowSuccessModal(true);
      setSelectedItemId('');
      setMaxUnits('');
      setItemSearchQuery('');

      console.log(t('createSuccess'));
    } catch (error) {
      console.error('Failed to create checkout link:', error);
      console.log(t('createError'));
    }
  };

  const handleRevoke = async () => {
    const link = selectedLink();
    if (!link) return;

    try {
      await revokeLinkMutation.mutateAsync({
        communityId: params.id,
        poolId: params.poolId,
        linkId: link.id,
        dto: revokeReason() ? { reason: revokeReason() } : undefined,
      });

      setShowRevokeModal(false);
      setSelectedLink(null);
      setRevokeReason('');
      console.log(t('revokeSuccess'));
    } catch (error) {
      console.error('Failed to revoke checkout link:', error);
      console.log(t('revokeError'));
    }
  };

  const handleRegenerate = async () => {
    const link = selectedLink();
    if (!link) return;

    try {
      const regeneratedLink = await regenerateLinkMutation.mutateAsync({
        communityId: params.id,
        poolId: params.poolId,
        linkId: link.id,
      });

      setNewlyCreatedLink(regeneratedLink);
      setShowRegenerateModal(false);
      setSelectedLink(null);
      setShowSuccessModal(true);

      console.log(t('regenerateSuccess'));
    } catch (error) {
      console.error('Failed to regenerate checkout link:', error);
      console.log(t('regenerateError'));
    }
  };

  const openRevokeModal = (link: PoolCheckoutLink) => {
    setSelectedLink(link);
    setShowRevokeModal(true);
  };

  const openRegenerateModal = (link: PoolCheckoutLink) => {
    setSelectedLink(link);
    setShowRegenerateModal(true);
  };

  const handleAddAllowedItem = () => {
    const itemId = selectedNewItem();
    if (itemId && !allowedItemIds().includes(itemId)) {
      setAllowedItemIds([...allowedItemIds(), itemId]);
      setSelectedNewItem('');
    }
  };

  const handleRemoveAllowedItem = (itemId: string) => {
    setAllowedItemIds(allowedItemIds().filter(id => id !== itemId));
  };

  const handleCancelSettings = () => {
    // Reset to current pool data
    const poolData = pool.data;
    if (poolData) {
      setPoolName(poolData.name);
      setPoolDescription(poolData.description || '');
      setMaxUnitsPerUser(poolData.maxUnitsPerUser?.toString() || '');
      setMinimumContribution(poolData.minimumContribution?.toString() || '');

      if (poolData.allowedItems && poolData.allowedItems.length > 0) {
        setAllowAllItems(false);
        setAllowedItemIds(poolData.allowedItems.map(item => item.id));
      } else {
        setAllowAllItems(true);
        setAllowedItemIds([]);
      }
    }
    setSettingsMessage(null);
  };

  const handleSaveSettings = async () => {
    try {
      await updatePoolMutation.mutateAsync({
        communityId: params.id,
        poolId: params.poolId,
        dto: {
          name: poolName(),
          description: poolDescription() || undefined,
          maxUnitsPerUser: maxUnitsPerUser() ? parseInt(maxUnitsPerUser()) : undefined,
          minimumContribution: minimumContribution() ? parseInt(minimumContribution()) : undefined,
          allowedItemIds: allowAllItems() ? [] : allowedItemIds(),
        },
      });

      setSettingsMessage({ type: 'success', text: 'Pool settings saved successfully' });
      setTimeout(() => setSettingsMessage(null), 3000);
    } catch (error) {
      setSettingsMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    }
  };

  const tabs = () => {
    const baseTabs = [
      { id: 'inventory' as TabValue, label: t('tabInventory') },
      { id: 'contributions' as TabValue, label: t('tabContributions') },
      { id: 'distributions' as TabValue, label: t('tabDistributions') },
    ];

    // Add council-only tabs
    if (isCouncilMember()) {
      baseTabs.push({ id: 'needs' as TabValue, label: t('tabNeeds') });
      baseTabs.push({ id: 'self-service' as TabValue, label: t('tabSelfService') });
      baseTabs.push({ id: 'settings' as TabValue, label: t('tabSettings') });
    }

    return baseTabs;
  };

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
                </div>

                <Show when={pool.data!.description}>
                  <p class="text-stone-700 dark:text-stone-300 mb-4">{pool.data!.description}</p>
                </Show>

                {/* Actions */}
                <div class="flex gap-3 border-t border-stone-200 dark:border-stone-700 pt-4">
                  <Button onClick={() => setShowContributeModal(true)}>
                    <Icon name="plus" size={20} class="mr-2" />
                    {t('contribute')}
                  </Button>
                  <Show when={isCouncilMember()}>
                    <Button variant="secondary" onClick={() => setShowDistributeModal(true)}>
                      <Icon name="send" size={20} class="mr-2" />
                      {t('distribute')}
                    </Button>
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
                            <Show
                              when={isCouncilMember()}
                              fallback={
                                <Badge variant="warning">{t('statusPending')}</Badge>
                              }
                            >
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
                            </Show>
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

            {/* Needs Tab - Council Members Only */}
            <Show when={activeTab() === 'needs' && isCouncilMember()}>
              <Card>
                <div class="p-6">
                  <PoolNeedsTable
                    communityId={params.id}
                    poolId={params.poolId}
                  />
                </div>
              </Card>
            </Show>

            {/* Self-Service Tab - Council Members Only */}
            <Show when={activeTab() === 'self-service' && isCouncilMember()}>
              <div class="space-y-4">
                {/* Header with Create button */}
                <div class="flex justify-end">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Icon name="plus" size={16} />
                    {t('createButton')}
                  </Button>
                </div>

                {/* Checkout Links List */}
                <Show
                  when={!checkoutLinksQuery.isLoading}
                  fallback={
                    <Card>
                      <div class="text-center py-12 text-stone-600 dark:text-stone-400">
                        Loading checkout links...
                      </div>
                    </Card>
                  }
                >
                  <Show
                    when={checkoutLinks().length > 0}
                    fallback={
                      <Card>
                        <div class="text-center py-12">
                          <Icon name="qr-code" size={48} class="mx-auto mb-4 text-stone-400" />
                          <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                            {t('noLinks')}
                          </h3>
                          <p class="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
                            {t('noLinksDescription')}
                          </p>
                          <Button onClick={() => setShowCreateModal(true)}>
                            <Icon name="plus" size={16} />
                            {t('createButton')}
                          </Button>
                        </div>
                      </Card>
                    }
                  >
                    {/* Search Bar */}
                    <div class="mb-4">
                      <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery()}
                        onInput={(e) => setSearchQuery(e.currentTarget.value)}
                        class="w-full px-3 py-1.5 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded focus:outline-none focus:border-ocean-400 dark:focus:border-ocean-600 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                      />
                    </div>

                    {/* Compact Cards */}
                    <div class="grid gap-3">
                      <For each={filteredCheckoutLinks()}>
                        {(link) => (
                          <Card>
                            <div class="flex gap-3 p-3">
                              {/* QR Code - Smaller */}
                              <div class="flex-shrink-0">
                                <img
                                  src={link.qrCodeDataUrl}
                                  alt="QR Code"
                                  class="w-20 h-20 rounded border border-stone-200 dark:border-stone-700"
                                />
                              </div>

                              {/* Info - Compact */}
                              <div class="flex-1 min-w-0">
                                {/* Title and badges */}
                                <div class="flex items-start justify-between gap-2 mb-2">
                                  <div class="flex-1 min-w-0">
                                    <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate mb-1">
                                      {link.item.name}
                                    </h3>
                                    <div class="flex flex-wrap items-center gap-1.5">
                                      <Badge variant={link.isActive ? 'success' : 'default'} size="sm">
                                        {link.isActive ? t('active') : t('revoked')}
                                      </Badge>
                                      <Show when={!isItemInPool(link.itemId)}>
                                        <Badge variant="warning" size="sm">
                                          {t('itemNotInPool')}
                                        </Badge>
                                      </Show>
                                    </div>
                                  </div>
                                </div>

                                {/* Max units info - Compact inline */}
                                <Show when={link.maxUnitsPerCheckout}>
                                  <div class="text-xs text-stone-600 dark:text-stone-400 mb-2">
                                    {t('maxPerCheckout')}: {link.maxUnitsPerCheckout}
                                    <Show when={link.item.unit}> {link.item.unit}</Show>
                                  </div>
                                </Show>
                                <Show when={!link.maxUnitsPerCheckout}>
                                  <div class="text-xs text-stone-600 dark:text-stone-400 mb-2">
                                    {t('maxPerCheckout')}: {t('unlimited')}
                                  </div>
                                </Show>

                                {/* Stats - Inline, compact */}
                                <div class="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-xs text-stone-500 dark:text-stone-400">
                                  <span>{link.totalCheckouts} checkouts</span>
                                  <span>·</span>
                                  <span>{link.totalUnitsDistributed} {link.item.unit || 'units'} distributed</span>
                                  <span>·</span>
                                  <span>
                                    {link.lastCheckoutAt
                                      ? formatDistanceToNow(new Date(link.lastCheckoutAt), { addSuffix: true })
                                      : t('neverUsed')}
                                  </span>
                                </div>

                                {/* Actions - Compact buttons */}
                                <Show when={link.isActive}>
                                  <div class="flex flex-wrap gap-1">
                                    <button
                                      onClick={() => handleCopyLink(link.checkoutUrl)}
                                      class="px-2 py-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded hover:bg-stone-200 dark:hover:bg-stone-600"
                                      title={t('copyLink')}
                                    >
                                      <Icon name="clipboard" size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadQR(link)}
                                      class="px-2 py-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded hover:bg-stone-200 dark:hover:bg-stone-600"
                                      title={t('downloadQR')}
                                    >
                                      <Icon name="download" size={12} />
                                    </button>
                                    <button
                                      onClick={() => handlePrintQR(link)}
                                      class="px-2 py-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded hover:bg-stone-200 dark:hover:bg-stone-600"
                                      title={t('printQR')}
                                    >
                                      <Icon name="printer" size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleShareWhatsApp(link)}
                                      class="px-2 py-1 text-xs rounded hover:opacity-80"
                                      style={{ "background-color": "#25D366", color: "white" }}
                                      title={t('shareWhatsApp')}
                                    >
                                      <Icon name="whatsapp" size={12} />
                                    </button>
                                    <button
                                      onClick={() => openRegenerateModal(link)}
                                      class="px-2 py-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded hover:bg-stone-200 dark:hover:bg-stone-600"
                                      title={t('regenerate')}
                                    >
                                      <Icon name="refresh-cw" size={12} />
                                    </button>
                                    <button
                                      onClick={() => openRevokeModal(link)}
                                      class="px-2 py-1 text-xs bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-200 rounded hover:bg-danger-200 dark:hover:bg-danger-800"
                                      title={t('revoke')}
                                    >
                                      <Icon name="x-circle" size={12} />
                                    </button>
                                  </div>
                                </Show>
                              </div>
                            </div>
                          </Card>
                        )}
                      </For>
                    </div>
                  </Show>
                </Show>
              </div>
            </Show>

            <Show when={activeTab() === 'settings' && isCouncilMember()}>
              <Card>
                <div class="p-6 space-y-6">
                  {/* Header */}
                  <div>
                    <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      {t('settingsTitle')}
                    </h2>
                    <p class="text-sm text-stone-600 dark:text-stone-400">
                      {t('settingsDescription')}
                    </p>
                  </div>

                  {/* Basic Information Section */}
                  <div>
                    <h3 class="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">
                      {t('basicInfoTitle')}
                    </h3>
                    <div class="space-y-4">
                      {/* Name */}
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          {t('poolNameLabel')}
                        </label>
                        <Input
                          type="text"
                          value={poolName()}
                          onInput={(e) => setPoolName(e.currentTarget.value)}
                          placeholder={t('poolNamePlaceholder')}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          {t('descriptionLabel')}
                        </label>
                        <textarea
                          value={poolDescription()}
                          onInput={(e) => setPoolDescription(e.currentTarget.value)}
                          placeholder={t('descriptionPlaceholder')}
                          rows={3}
                          class="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded focus:outline-none focus:border-ocean-400 dark:focus:border-ocean-600 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                        />
                      </div>

                      {/* Max Units Per User */}
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          {t('maxUnitsLabel')}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={maxUnitsPerUser()}
                          onInput={(e) => setMaxUnitsPerUser(e.currentTarget.value)}
                          placeholder={t('maxUnitsPlaceholder')}
                        />
                        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {t('maxUnitsHelp')}
                        </p>
                      </div>

                      {/* Minimum Contribution */}
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                          {t('minContributionLabel')}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={minimumContribution()}
                          onInput={(e) => setMinimumContribution(e.currentTarget.value)}
                          placeholder={t('minContributionPlaceholder')}
                        />
                        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {t('minContributionHelp')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Allowed Items Section */}
                  <div>
                    <h3 class="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">
                      {t('allowedItemsTitle')}
                    </h3>

                    {/* Allow All Toggle */}
                    <div class="mb-4 p-3 bg-stone-50 dark:bg-stone-800 rounded">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowAllItems()}
                          onChange={(e) => setAllowAllItems(e.currentTarget.checked)}
                          class="w-4 h-4 text-ocean-600 border-stone-300 rounded focus:ring-ocean-500"
                        />
                        <span class="text-sm font-medium text-stone-700 dark:text-stone-300">
                          {t('allowAllItemsLabel')}
                        </span>
                      </label>
                      <p class="text-xs text-stone-500 dark:text-stone-400 mt-1 ml-6">
                        {t('allowAllItemsHelp')}
                      </p>
                    </div>

                    {/* Item Management - Only show if not allowing all */}
                    <Show when={!allowAllItems()}>
                      <div class="space-y-3">
                        {/* Add Item Selector */}
                        <div>
                          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                            {t('addItemLabel')}
                          </label>
                          <div class="flex gap-2">
                            <Select
                              value={selectedNewItem()}
                              onChange={(e) => setSelectedNewItem(e.currentTarget.value)}
                              placeholder={t('addItemPlaceholder')}
                              class="flex-1"
                            >
                              <option value="" disabled>
                                {t('addItemPlaceholder')}
                              </option>
                              <For each={availableItemsToAdd()}>
                                {(item) => (
                                  <option value={item.id}>{item.name}</option>
                                )}
                              </For>
                            </Select>
                            <Button
                              onClick={handleAddAllowedItem}
                              disabled={!selectedNewItem()}
                              variant="secondary"
                            >
                              <Icon name="plus" size={16} />
                              {t('addButton')}
                            </Button>
                          </div>
                        </div>

                        {/* Current Allowed Items List */}
                        <div>
                          <p class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            {t('currentItemsLabel')} ({allowedItemIds().length})
                          </p>
                          <Show
                            when={allowedItemIds().length > 0}
                            fallback={
                              <p class="text-sm text-stone-500 dark:text-stone-400 py-3 text-center bg-stone-50 dark:bg-stone-800 rounded">
                                {t('noItemsAllowed')}
                              </p>
                            }
                          >
                            <div class="space-y-2">
                              <For each={allowedItemIds()}>
                                {(itemId) => {
                                  const item = items.data?.find(i => i.id === itemId);
                                  return (
                                    <div class="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800 rounded">
                                      <span class="text-sm text-stone-900 dark:text-stone-100">
                                        {item?.name || 'Unknown Item'}
                                      </span>
                                      <Button
                                        onClick={() => handleRemoveAllowedItem(itemId)}
                                        variant="secondary"
                                        size="sm"
                                      >
                                        <Icon name="close" size={14} />
                                        {t('removeButton')}
                                      </Button>
                                    </div>
                                  );
                                }}
                              </For>
                            </div>
                          </Show>
                        </div>
                      </div>
                    </Show>
                  </div>

                  {/* Save Button */}
                  <div class="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-700">
                    <Button
                      variant="secondary"
                      onClick={handleCancelSettings}
                      disabled={updatePoolMutation.isPending}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={updatePoolMutation.isPending || !hasSettingsChanges()}
                    >
                      {updatePoolMutation.isPending ? t('saving') : t('saveChanges')}
                    </Button>
                  </div>

                  {/* Success/Error Messages */}
                  <Show when={settingsMessage()}>
                    <div class={`p-3 rounded text-sm ${
                      settingsMessage()!.type === 'success'
                        ? 'bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-200'
                        : 'bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-200'
                    }`}>
                      {settingsMessage()!.text}
                    </div>
                  </Show>
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

        {/* Checkout Links Modals */}
        <Modal
          isOpen={showCreateModal()}
          onClose={() => {
            setShowCreateModal(false);
            setItemSearchQuery('');
          }}
          title={t('createModalTitle')}
        >
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('selectItem')}
              </label>

              {/* Search input - only show when there are 5+ items */}
              <Show when={availableItems().length > 5}>
                <input
                  type="text"
                  placeholder={t('searchItems')}
                  value={itemSearchQuery()}
                  onInput={(e) => setItemSearchQuery(e.currentTarget.value)}
                  class="w-full px-3 py-2 mb-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded focus:outline-none focus:border-ocean-400 dark:focus:border-ocean-600 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                />
              </Show>

              <Select
                value={selectedItemId()}
                onChange={(e) => setSelectedItemId(e.currentTarget.value)}
                placeholder={t('selectItemPlaceholder')}
              >
                <option value="" disabled>
                  {t('selectItemPlaceholder')}
                </option>
                <For each={filteredAvailableItems()}>
                  {(item) => (
                    <option value={item.id}>{item.name}</option>
                  )}
                </For>
              </Select>

              {/* No results message */}
              <Show when={filteredAvailableItems().length === 0 && itemSearchQuery()}>
                <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {t('noItemsMatch').replace('{{query}}', itemSearchQuery())}
                </p>
              </Show>
            </div>

            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('maxUnitsPerCheckout')}
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={maxUnits()}
                onInput={(e) => setMaxUnits(e.currentTarget.value)}
                placeholder={t('maxUnitsPerCheckoutPlaceholder')}
              />
              <p class="text-xs text-stone-600 dark:text-stone-400 mt-1">
                {t('maxUnitsPerCheckoutHelp')}
              </p>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleCreateLink}
                disabled={!selectedItemId() || createLinkMutation.isPending}
              >
                {createLinkMutation.isPending ? t('creating') : t('create')}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showRevokeModal()}
          onClose={() => setShowRevokeModal(false)}
          title={t('revokeModalTitle')}
        >
          <div class="space-y-4">
            <p class="text-stone-700 dark:text-stone-300">
              {t('revokeConfirm').replace('{{item}}', selectedLink()?.item.name || '')}
            </p>
            <p class="text-sm text-stone-600 dark:text-stone-400">
              {t('revokeWarning')}
            </p>

            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('revokeReason')}
              </label>
              <Input
                value={revokeReason()}
                onInput={(e) => setRevokeReason(e.currentTarget.value)}
                placeholder={t('revokeReasonPlaceholder')}
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowRevokeModal(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleRevoke}
                disabled={revokeLinkMutation.isPending}
              >
                {revokeLinkMutation.isPending ? 'Revoking...' : t('confirmRevoke')}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showRegenerateModal()}
          onClose={() => setShowRegenerateModal(false)}
          title={t('regenerateModalTitle')}
        >
          <div class="space-y-4">
            <p class="text-stone-700 dark:text-stone-300">
              {t('regenerateConfirm').replace('{{item}}', selectedLink()?.item.name || '')}
            </p>
            <p class="text-sm text-stone-600 dark:text-stone-400">
              {t('regenerateWarning')}
            </p>

            <div class="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowRegenerateModal(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={regenerateLinkMutation.isPending}
              >
                {regenerateLinkMutation.isPending ? 'Regenerating...' : t('confirmRegenerate')}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showSuccessModal()}
          onClose={() => setShowSuccessModal(false)}
          title={t('createSuccess')}
        >
          <Show when={newlyCreatedLink()}>
            {(link) => (
              <div class="space-y-4">
                <div class="text-center">
                  <Icon name="check-circle" size={48} class="mx-auto mb-4 text-success-600" />
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    {t('qrCode')} - {link().item.name}
                  </h3>
                  <p class="text-sm text-stone-600 dark:text-stone-400">
                    Your checkout link is ready to use!
                  </p>
                </div>

                <div class="flex justify-center">
                  <img
                    src={link().qrCodeDataUrl}
                    alt="QR Code"
                    class="w-64 h-64 rounded-lg border-2 border-stone-200 dark:border-stone-700"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    {t('checkoutUrl')}
                  </label>
                  <div class="flex items-center gap-2 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                    <code class="flex-1 text-sm text-stone-900 dark:text-stone-100 overflow-x-auto">
                      {link().checkoutUrl}
                    </code>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyLink(link().checkoutUrl)}
                    >
                      <Icon name="clipboard" size={14} />
                      {t('copyLink')}
                    </Button>
                  </div>
                </div>

                <div class="bg-ocean-50 dark:bg-ocean-900/20 p-4 rounded-lg space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-stone-600 dark:text-stone-400">{t('item')}:</span>
                    <span class="font-medium text-stone-900 dark:text-stone-100">{link().item.name}</span>
                  </div>
                  <Show when={link().maxUnitsPerCheckout}>
                    <div class="flex justify-between text-sm">
                      <span class="text-stone-600 dark:text-stone-400">{t('maxPerCheckout')}:</span>
                      <span class="font-medium text-stone-900 dark:text-stone-100">
                        {link().maxUnitsPerCheckout} {link().item.unit}
                      </span>
                    </div>
                  </Show>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    class="flex-1"
                    onClick={() => handleDownloadQR(link())}
                  >
                    <Icon name="download" size={16} />
                    {t('downloadQR')}
                  </Button>
                  <Button
                    variant="secondary"
                    class="flex-1"
                    onClick={() => handlePrintQR(link())}
                  >
                    <Icon name="printer" size={16} />
                    {t('printQR')}
                  </Button>
                  <Button
                    class="flex-1"
                    onClick={() => handleShareWhatsApp(link())}
                    style={{ "background-color": "#25D366", color: "white" }}
                    title={t('shareWhatsApp')}
                    aria-label={t('shareWhatsApp')}
                  >
                    <Icon name="whatsapp" size={16} />
                  </Button>
                </div>

                <div class="flex justify-end pt-4 border-t border-stone-200 dark:border-stone-700">
                  <Button onClick={() => setShowSuccessModal(false)}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </Show>
        </Modal>
      </div>
    </>
  );
};

export default PoolDetailsPage;
