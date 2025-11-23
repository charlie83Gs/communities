import { Component, Show, For, createSignal, createMemo } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import {
  useMyContributionProfileQuery,
  useMyContributionsQuery,
  useMyPeerRecognitionQuery,
  usePeerRecognitionLimitsQuery,
  useGrantPeerRecognitionMutation,
} from '@/hooks/queries/useContributions';
import { useAuth } from '@/hooks/useAuth';
import { makeTranslator } from '@/i18n/makeTranslator';
import { contributionsIndexDict } from './index.i18n';
import { Button } from '@/components/common/Button';
import { CommunityMemberSelector } from '@/components/common/CommunityMemberSelector';
import type { VerificationStatus, RecognizedContribution } from '@/types/contributions.types';

const ContributionsIndexPage: Component = () => {
  const params = useParams<{ id: string }>();
  const t = makeTranslator(contributionsIndexDict, 'contributionsIndex');
  const { user } = useAuth();

  // Collapsible state for contributions list
  const [showAllContributions, setShowAllContributions] = createSignal(false);

  // Modal state for grant recognition
  const [showGrantModal, setShowGrantModal] = createSignal(false);

  // Queries
  const profileQuery = useMyContributionProfileQuery(() => params.id);
  const limitsQuery = usePeerRecognitionLimitsQuery(() => params.id);

  // Only query contributions and peer recognition when expanded (lazy loading)
  const contributionsQuery = useMyContributionsQuery(
    () => (showAllContributions() ? params.id : undefined)
  );
  const peerRecognitionQuery = useMyPeerRecognitionQuery(
    () => (showAllContributions() ? params.id : undefined)
  );

  // Mutations
  const grantMutation = useGrantPeerRecognitionMutation();

  // Grant peer recognition form state
  const [grantRecipientId, setGrantRecipientId] = createSignal<string>('');
  const [grantValueUnits, setGrantValueUnits] = createSignal<number>(1);
  const [grantDescription, setGrantDescription] = createSignal('');
  const [grantError, setGrantError] = createSignal<string | null>(null);
  const [grantSuccess, setGrantSuccess] = createSignal(false);

  // Remaining grants this month
  const remainingGrants = createMemo(() => {
    if (!limitsQuery.data) return 0;
    const monthly = limitsQuery.data.monthlyLimit ?? 20;
    const used = limitsQuery.data.usedThisMonth ?? 0;
    return monthly - used;
  });

  // Handle grant peer recognition
  const handleGrantRecognition = async (e: Event) => {
    e.preventDefault();
    setGrantError(null);
    setGrantSuccess(false);

    if (!grantRecipientId()) {
      setGrantError(t('recipientRequired'));
      return;
    }
    if (!grantValueUnits() || grantValueUnits() < 1) {
      setGrantError(t('valueUnitsRequired'));
      return;
    }
    if (!grantDescription().trim()) {
      setGrantError(t('descriptionRequired'));
      return;
    }

    try {
      await grantMutation.mutateAsync({
        communityId: params.id,
        data: {
          toUserId: grantRecipientId(),
          valueUnits: grantValueUnits(),
          description: grantDescription().trim(),
        },
      });
      setGrantSuccess(true);
      setGrantRecipientId('');
      setGrantValueUnits(1);
      setGrantDescription('');
      setShowGrantModal(false);
      setTimeout(() => setGrantSuccess(false), 3000);
    } catch (err: any) {
      setGrantError(err?.message ?? t('grantError'));
    }
  };

  // Status badge helper (simplified - only auto_verified and disputed)
  const getStatusBadge = (status: VerificationStatus) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (status) {
      case 'auto_verified':
      case 'verified': // Treat legacy verified as auto_verified
        return (
          <span
            class={`${baseClasses} bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200`}
          >
            {t('statusAutoVerified')}
          </span>
        );
      case 'disputed':
        return (
          <span
            class={`${baseClasses} bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200`}
          >
            {t('statusDisputed')}
          </span>
        );
      case 'pending': // Should not occur, but handle gracefully
      default:
        return null;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Link */}
        <A
          href={`/communities/${params.id}`}
          class="inline-flex items-center gap-1 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-4"
        >
          <span>&larr;</span> {t('backToCommunity')}
        </A>

        {/* Header */}
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h1>
          <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">{t('subtitle')}</p>
        </div>

        {/* Loading State */}
        <Show when={profileQuery.isLoading}>
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-center text-stone-600 dark:text-stone-400">
            {t('loading')}
          </div>
        </Show>

        {/* Error State */}
        <Show when={profileQuery.isError}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
            {t('error')}
          </div>
        </Show>

        {/* Content */}
        <Show when={!profileQuery.isLoading && !profileQuery.isError}>
          <div class="space-y-6">
            {/* Section 1: My Profile */}
            <div class="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
                {t('myProfile')}
              </h2>

              {/* Stats Grid */}
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div class="p-4 bg-stone-50 dark:bg-stone-900 rounded-lg text-center">
                  <div class="text-2xl font-bold text-ocean-600 dark:text-ocean-400">
                    {profileQuery.data?.totalValue6Months ?? 0}
                  </div>
                  <div class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {t('totalValue6Months')}
                  </div>
                </div>

                <div class="p-4 bg-stone-50 dark:bg-stone-900 rounded-lg text-center">
                  <div class="text-2xl font-bold text-stone-700 dark:text-stone-300">
                    {profileQuery.data?.totalValueLifetime ?? 0}
                  </div>
                  <div class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {t('totalValueLifetime')}
                  </div>
                </div>

                <div class="p-4 bg-stone-50 dark:bg-stone-900 rounded-lg text-center">
                  <div class="text-2xl font-bold text-forest-600 dark:text-forest-400">
                    {profileQuery.data?.recentContributions?.length ?? 0}
                  </div>
                  <div class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {t('contributionCount')}
                  </div>
                </div>

                <div class="p-4 bg-stone-50 dark:bg-stone-900 rounded-lg text-center">
                  <div class="text-2xl font-bold text-warning-600 dark:text-warning-400">
                    {profileQuery.data?.peerRecognitionValueReceived ?? 0}
                  </div>
                  <div class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {t('peerRecognitionReceived')}
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <Show
                when={
                  profileQuery.data?.categoryBreakdown &&
                  Object.keys(profileQuery.data.categoryBreakdown).length > 0
                }
              >
                <div class="border-t border-stone-200 dark:border-stone-700 pt-4">
                  <h3 class="text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-3">
                    {t('categoryBreakdown')}
                  </h3>
                  <div class="space-y-2">
                    <For each={Object.entries(profileQuery.data?.categoryBreakdown ?? {})}>
                      {([categoryName, totalValue]) => (
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-stone-900 dark:text-stone-100">
                            {categoryName}
                          </span>
                          <span class="text-sm font-medium text-ocean-600 dark:text-ocean-400">
                            {totalValue} {t('valueUnits')}
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              {/* Recent Contributions */}
              <Show
                when={
                  profileQuery.data?.recentContributions &&
                  profileQuery.data.recentContributions.length > 0
                }
              >
                <div class="border-t border-stone-200 dark:border-stone-700 pt-4 mt-4">
                  <h3 class="text-sm font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-3">
                    {t('recentContributions')}
                  </h3>
                  <div class="space-y-2">
                    <For each={profileQuery.data?.recentContributions.slice(0, 5)}>
                      {(contribution) => (
                        <div class="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-700 last:border-b-0">
                          <div class="flex-1">
                            <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {contribution.itemName}
                            </div>
                            <div class="text-xs text-stone-500 dark:text-stone-400">
                              {formatDate(contribution.createdAt)}
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-medium text-ocean-600 dark:text-ocean-400">
                              {contribution.totalValue}
                            </span>
                            {getStatusBadge(contribution.verificationStatus)}
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>

            {/* Section 2: Grant Peer Recognition */}
            <div class="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
                {t('grantPeerRecognition')}
              </h2>

              {/* Limits Display */}
              <Show when={limitsQuery.data}>
                <div class="flex gap-4 mb-4 text-sm">
                  <div class="text-stone-600 dark:text-stone-400">
                    <span class="font-medium">{t('monthlyLimit')}:</span>{' '}
                    {limitsQuery.data?.monthlyLimit}
                  </div>
                  <div class="text-stone-600 dark:text-stone-400">
                    <span class="font-medium">{t('used')}:</span> {limitsQuery.data?.usedThisMonth}
                  </div>
                  <div
                    class={
                      remainingGrants() > 0
                        ? 'text-forest-600 dark:text-forest-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }
                  >
                    <span class="font-medium">{t('remaining')}:</span> {remainingGrants()}
                  </div>
                </div>
              </Show>

              {/* Success message */}
              <Show when={grantSuccess()}>
                <div class="text-sm text-forest-600 dark:text-forest-400 mb-4">
                  {t('grantSuccess')}
                </div>
              </Show>

              <Show
                when={remainingGrants() > 0}
                fallback={
                  <div class="text-sm text-stone-600 dark:text-stone-400 italic">
                    {t('noRemainingGrants')}
                  </div>
                }
              >
                <Button onClick={() => setShowGrantModal(true)}>{t('recognizeButton')}</Button>
              </Show>
            </div>

            {/* Grant Recognition Modal */}
            <Show when={showGrantModal()}>
              <div
                class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowGrantModal(false);
                    setGrantError(null);
                  }
                }}
              >
                <div class="bg-white dark:bg-stone-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
                    {t('grantPeerRecognition')}
                  </h3>

                  <form onSubmit={handleGrantRecognition} class="space-y-4">
                    <Show when={grantError()}>
                      <div class="text-sm text-danger-600 dark:text-danger-400">{grantError()}</div>
                    </Show>

                    <CommunityMemberSelector
                      communityId={params.id}
                      mode="single"
                      selectedIds={grantRecipientId() ? [grantRecipientId()] : []}
                      onSelect={(userId) => setGrantRecipientId(userId)}
                      onDeselect={() => setGrantRecipientId('')}
                      excludeIds={user()?.id ? [user()!.id] : []}
                      label={t('selectRecipient')}
                      placeholder={t('selectRecipient')}
                    />

                    <div>
                      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                        {t('valueUnitsLabel')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={remainingGrants()}
                        value={grantValueUnits()}
                        onInput={(e) =>
                          setGrantValueUnits(parseInt((e.target as HTMLInputElement).value) || 1)
                        }
                        class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                        {t('descriptionLabel')}
                      </label>
                      <textarea
                        rows={3}
                        value={grantDescription()}
                        onInput={(e) =>
                          setGrantDescription((e.target as HTMLTextAreaElement).value)
                        }
                        placeholder={t('descriptionPlaceholder')}
                        class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div class="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setShowGrantModal(false);
                          setGrantError(null);
                        }}
                      >
                        {t('cancel')}
                      </Button>
                      <Button type="submit" disabled={grantMutation.isPending}>
                        {grantMutation.isPending ? t('granting') : t('submit')}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </Show>

            {/* Section 3: My Contribution Log (Collapsible) */}
            <div class="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              {/* Collapsible Header */}
              <button
                onClick={() => setShowAllContributions(!showAllContributions())}
                class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {showAllContributions() ? t('hideContributions') : t('viewAllContributions')}
                  </h2>
                  <Show when={contributionsQuery.data}>
                    <span class="text-sm text-stone-500 dark:text-stone-400">
                      ({contributionsQuery.data?.length ?? 0})
                    </span>
                  </Show>
                </div>
                <svg
                  class={`w-5 h-5 text-stone-500 dark:text-stone-400 transition-transform ${
                    showAllContributions() ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Collapsible Content */}
              <Show when={showAllContributions()}>
                <div class="px-6 pb-6 border-t border-stone-200 dark:border-stone-700">
                  {/* Loading State */}
                  <Show when={contributionsQuery.isLoading}>
                    <div class="py-8 text-center text-stone-600 dark:text-stone-400">
                      {t('loadingContributions')}
                    </div>
                  </Show>

                  {/* Empty State */}
                  <Show
                    when={
                      !contributionsQuery.isLoading &&
                      (!contributionsQuery.data || contributionsQuery.data.length === 0)
                    }
                  >
                    <div class="text-center py-8">
                      <div class="text-4xl mb-4">*</div>
                      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                        {t('noContributions')}
                      </h3>
                      <p class="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                        {t('noContributionsDescription')}
                      </p>
                    </div>
                  </Show>

                  {/* Combined Log List (Contributions + Peer Recognition Received) */}
                  <Show
                    when={
                      !contributionsQuery.isLoading &&
                      !peerRecognitionQuery.isLoading &&
                      ((contributionsQuery.data && contributionsQuery.data.length > 0) ||
                        (peerRecognitionQuery.data?.received && peerRecognitionQuery.data.received.length > 0))
                    }
                  >
                    <div class="divide-y divide-stone-200 dark:divide-stone-700 pt-2">
                      {/* Combine and sort by date */}
                      <For
                        each={[
                          ...(contributionsQuery.data || []).map((c) => ({
                            type: 'contribution' as const,
                            date: c.createdAt,
                            data: c,
                          })),
                          ...(peerRecognitionQuery.data?.received || []).map((r) => ({
                            type: 'recognition' as const,
                            date: r.createdAt,
                            data: r,
                          })),
                        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                      >
                        {(item) => (
                          <Show
                            when={item.type === 'contribution'}
                            fallback={
                              <div class="py-2 flex items-center gap-3 text-sm">
                                <span class="text-xs text-stone-400 dark:text-stone-500 whitespace-nowrap">
                                  {formatDate((item.data as any).createdAt)}
                                </span>
                                <span class="text-xs px-1.5 py-0.5 bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300 rounded">
                                  ⭐
                                </span>
                                <span class="font-medium text-stone-900 dark:text-stone-100 truncate">
                                  {t('peerRecognitionFrom')} {(item.data as any).fromUserName}
                                </span>
                                <span class="font-semibold text-warning-600 dark:text-warning-400 whitespace-nowrap">
                                  +{(item.data as any).valueUnits}
                                </span>
                              </div>
                            }
                          >
                            <div class="py-2 flex items-center gap-3 text-sm">
                              <span class="text-xs text-stone-400 dark:text-stone-500 whitespace-nowrap">
                                {formatDate((item.data as RecognizedContribution).createdAt)}
                              </span>
                              <span class="font-medium text-stone-900 dark:text-stone-100 truncate">
                                {(item.data as RecognizedContribution).itemName}
                              </span>
                              <span class="text-stone-600 dark:text-stone-400 whitespace-nowrap">
                                {(item.data as RecognizedContribution).units} × {(item.data as RecognizedContribution).valuePerUnit}
                              </span>
                              <span class="font-semibold text-ocean-600 dark:text-ocean-400 whitespace-nowrap">
                                {(item.data as RecognizedContribution).totalValue}
                              </span>
                              {getStatusBadge((item.data as RecognizedContribution).verificationStatus)}
                            </div>
                          </Show>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
};

export default ContributionsIndexPage;
