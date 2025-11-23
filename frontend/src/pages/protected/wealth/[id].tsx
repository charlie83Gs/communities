import { Component, Show, createMemo, createSignal } from 'solid-js';
import { Title } from '@solidjs/meta';
import { useParams, A } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { useWealthQuery, useWealthRequestMutation, useWealthActionMutations, useUpdateWealthMutation, useWealthRequestsQuery, useManageRequestMutations } from '@/hooks/queries/useWealth';
import { useNotificationsQuery } from '@/hooks/queries/useNotifications';
import type { WealthRequest, WealthRequestStatus } from '@/types/wealth.types';
import { imagesService } from '@/services/api/images.service';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { useAuth } from '@/hooks/useAuth';
import { WealthEditForm } from '@/components/features/wealth/WealthEditForm';
import { WealthRequestsPanel } from '@/components/features/wealth/WealthRequestsPanel';
import { WealthComments } from '@/components/features/wealth/WealthComments';
import { RequestMessageThread } from '@/components/features/wealth/RequestMessageThread';
import { ShareCheckoutLink } from '@/components/features/wealth/ShareCheckoutLink';
import { SkillsBadgeList } from '@/components/features/skills/SkillsBadgeList';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthDetailsDict } from './[id].i18n';

// Timeline component for request status
const RequestStatusTimeline: Component<{
  status: WealthRequestStatus;
  t: ReturnType<typeof makeTranslator>;
}> = (props) => {
  // Define the happy path flow
  const happyPath: WealthRequestStatus[] = ['pending', 'accepted', 'fulfilled'];
  // Terminal states that end the flow early
  const terminalStates: WealthRequestStatus[] = ['rejected', 'cancelled', 'failed'];

  const isTerminal = () => terminalStates.includes(props.status);
  const currentIndex = () => {
    if (isTerminal()) {
      // For terminal states, show where it ended
      if (props.status === 'rejected') return 0; // Rejected at pending
      if (props.status === 'cancelled') return 1; // Cancelled can happen at pending or accepted
      if (props.status === 'failed') return 2; // Failed happens after accepted
    }
    return happyPath.indexOf(props.status);
  };

  const getStepStatus = (index: number, step: WealthRequestStatus) => {
    const current = currentIndex();
    if (isTerminal()) {
      // Show completed steps before the terminal state
      if (props.status === 'rejected' && index === 0) return 'terminal';
      if (props.status === 'cancelled' && index <= 1) return index === 1 ? 'terminal' : 'completed';
      if (props.status === 'failed' && index <= 2) return index === 2 ? 'terminal' : 'completed';
      return index < current ? 'completed' : 'upcoming';
    }
    // For happy path: mark current step and all before as completed
    // The "current" state shows what's been achieved, not what's pending
    if (index <= current) return 'completed';
    return 'upcoming';
  };

  const getStatusDescription = (status: WealthRequestStatus) => {
    switch (status) {
      case 'pending': return props.t('timeline.pendingDesc');
      case 'accepted': return props.t('timeline.acceptedDesc');
      case 'fulfilled': return props.t('timeline.fulfilledDesc');
      case 'rejected': return props.t('timeline.rejectedDesc');
      case 'cancelled': return props.t('timeline.cancelledDesc');
      case 'failed': return props.t('timeline.failedDesc');
      default: return '';
    }
  };

  return (
    <div class="mt-4">
      <p class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">{props.t('timeline.title')}</p>
      <div class="flex items-center justify-between">
        {happyPath.map((step, index) => {
          const stepStatus = getStepStatus(index, step);
          return (
            <>
              {/* Step circle */}
              <div class="flex flex-col items-center flex-1">
                <div
                  class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    stepStatus === 'completed'
                      ? 'bg-green-500 text-white'
                      : stepStatus === 'terminal'
                      ? 'bg-red-500 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  ) : stepStatus === 'terminal' ? (
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  class={`mt-2 text-xs font-medium ${
                    stepStatus === 'completed'
                      ? 'text-stone-900 dark:text-stone-100'
                      : stepStatus === 'terminal'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {props.t(`timeline.${step}`)}
                </span>
              </div>
              {/* Connector line */}
              {index < happyPath.length - 1 && (
                <div
                  class={`h-0.5 flex-1 mx-2 ${
                    getStepStatus(index + 1, happyPath[index + 1]) === 'completed' ||
                    getStepStatus(index, step) === 'completed'
                      ? 'bg-green-500'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                />
              )}
            </>
          );
        })}
      </div>
      {/* Show terminal state info if applicable */}
      <Show when={isTerminal()}>
        <div class="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <p class="text-xs text-red-700 dark:text-red-300">
            <span class="font-medium">{props.t(`timeline.${props.status}`)}:</span> {getStatusDescription(props.status)}
          </p>
        </div>
      </Show>
      {/* Show current step description */}
      <Show when={!isTerminal() && props.status !== 'fulfilled'}>
        <p class="mt-2 text-xs text-stone-500 dark:text-stone-400 text-center">
          {getStatusDescription(props.status)}
        </p>
      </Show>
    </div>
  );
};

const WealthDetailsPage: Component = () => {
  const t = makeTranslator(wealthDetailsDict, 'wealthDetails');
  const params = useParams();
  const wealthId = () => params.id;
  const wealthQuery = useWealthQuery(wealthId);
  const requestsQuery = useWealthRequestsQuery(wealthId);
  const { cancel: cancelRequestMutation, confirm: confirmRequestMutation, fail: failRequestMutation } = useManageRequestMutations();
  const currentRequest = createMemo(() => requestsQuery.data?.[0] ?? null);

  // Memo to check if checkout link should be shown
  const shouldShowCheckoutLink = createMemo(() => {
    const w = wealthQuery.data;
    if (!w) return false;
    return (
      user()?.id === w.createdBy &&
      w.status === 'active' &&
      w.distributionType === 'unit_based' &&
      typeof w.unitsAvailable === 'number' &&
      w.unitsAvailable > 0
    );
  });

  // Query for unread notifications to show activity indicator
  const notifications = useNotificationsQuery(
    () => wealthQuery.data?.communityId,
    () => true // unreadOnly
  );

  // Check if current request has unread messages
  const hasUnreadMessages = createMemo(() => {
    const request = currentRequest();
    if (!request) return false;
    const notifs = notifications.data?.notifications || [];
    return notifs.some(
      n => n.type === 'wealth_request_message' &&
           n.resourceType === 'wealth_request' &&
           n.resourceId === request.id &&
           !n.isRead
    );
  });

  // Request UI state
  const { user } = useAuth();
  const requestMutation = useWealthRequestMutation();
  const [showRequest, setShowRequest] = createSignal(false);
  const [message, setMessage] = createSignal('');
  const [unitsRequested, setUnitsRequested] = createSignal<number | undefined>(undefined);
  const [error, setError] = createSignal<string | null>(null);

  // Owner actions state
  const { cancelWealth, fulfillWealth } = useWealthActionMutations();
  const updateWealthMutation = useUpdateWealthMutation();
  const [showEditModal, setShowEditModal] = createSignal(false);

  return (
    <div class="p-4 max-w-4xl mx-auto space-y-4 min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
      <Title>{t('titleTag')}</Title>

      <Show when={!wealthQuery.isLoading} fallback={<div class="text-stone-600 dark:text-stone-300">{t('loadingShare')}</div>}>
        <Show when={wealthQuery.data} fallback={<div class="text-red-600 dark:text-red-400">{t('notFound')}</div>}>
          {(wealth) => (
            <Card class="p-4 space-y-4">
              <div class="space-y-4">
                {/* Title and description */}
                <div>
                  <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{wealth().title}</h1>
                  <Show when={wealth().description}>
                    <p class="text-stone-700 dark:text-stone-300 mt-1">{wealth().description}</p>
                  </Show>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <Show when={wealth().item}>
                      <Badge variant={wealth().item?.kind === 'object' ? 'ocean' : 'forest'}>
                        {wealth().item?.name} ({wealth().item?.kind})
                      </Badge>
                    </Show>
                    <Badge variant="secondary">{wealth().durationType === 'timebound' ? t('durationTimebound') : t('durationUnlimited')}</Badge>
                    <Badge variant="secondary">{wealth().distributionType === 'unit_based' ? t('distUnit') : t('distRequest')}</Badge>
                    <Badge variant={wealth().status === 'active' ? 'success' : wealth().status === 'fulfilled' ? 'secondary' : 'warning'}>
                      {wealth().status}
                    </Badge>
                  </div>

                  {/* Sharer's Skills - Show when viewing as requester (not owner) */}
                  <Show when={user()?.id !== wealth().createdBy}>
                    <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                      <p class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        {t('sharerSkills')}
                      </p>
                      <SkillsBadgeList
                        userId={wealth().createdBy}
                        communityId={wealth().communityId}
                        maxSkills={3}
                      />
                    </div>
                  </Show>
                </div>

                {/* Action buttons */}
                <div class="flex flex-wrap gap-2">
                  <A href={`/communities/${wealth().communityId}`}>
                    <Button variant="secondary">{t('backToCommunity')}</Button>
                  </A>

                  <Show when={user()?.id === wealth().createdBy}>
                    <Show when={wealth().status === 'active'}>
                      <Button
                        variant="secondary"
                        onClick={() => fulfillWealth.mutateAsync(wealth().id)}
                        disabled={fulfillWealth.isPending}
                      >
                        {fulfillWealth.isPending ? t('marking') : t('markFulfilled')}
                      </Button>
                    </Show>

                    <Show when={wealth().status === 'active'}>
                      <Button
                        variant="danger"
                        onClick={() => cancelWealth.mutateAsync(wealth().id)}
                        disabled={cancelWealth.isPending}
                      >
                        {cancelWealth.isPending ? t('cancelling') : t('delete')}
                      </Button>
                    </Show>

                    <Button
                      variant="secondary"
                      onClick={() => setShowEditModal(true)}
                      disabled={updateWealthMutation.isPending}
                    >
                      Edit
                    </Button>
                  </Show>
                </div>
              </div>

              <Show when={wealth().image}>
                <div class="w-full">
                  <CredentialedImage
                    src={imagesService.url(wealth().image)!}
                    alt={t('imageAlt')}
                    class="w-full max-h-[420px] object-contain rounded border"
                    fallbackText={t('imageFallback')}
                  />
                </div>
              </Show>

              {/* Request button and form (moved from community list) */}
              <div class="pt-2">
                <Show when={user()?.id !== wealth().createdBy && wealth().status === 'active'}>
                  <Show when={!currentRequest() || currentRequest()!.status !== 'pending'}>
                    <Button
                      variant="primary"
                      onClick={() => setShowRequest(true)}
                      disabled={requestMutation.isPending}
                    >
                      {t('request')}
                    </Button>
                  </Show>

                  <Show when={showRequest()}>
                    <form
                      class="mt-3 space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setError(null);
                        let existingRequestId: string | null = null;
                        const currentReq = currentRequest();
                        if (currentReq && currentReq.status === 'pending') {
                          existingRequestId = currentReq.id;
                        }
                        const isUnitBased = wealth().distributionType === 'unit_based';
                        if (isUnitBased && (unitsRequested() == null || Number.isNaN(unitsRequested()!))) {
                          setError(t('unitsRequired', 'Units requested is required for unit-based wealth'));
                          return;
                        }
                        if (existingRequestId) {
                          await cancelRequestMutation.mutateAsync({
                            wealthId: wealth().id,
                            requestId: existingRequestId,
                          });
                        }
                        await requestMutation.mutateAsync({
                          wealthId: wealth().id,
                          dto: {
                            message: message().trim() || undefined,
                            unitsRequested: isUnitBased ? Number(unitsRequested()) : undefined,
                          },
                        });
                        // reset
                        setMessage('');
                        setUnitsRequested(undefined);
                        setShowRequest(false);
                      }}
                    >
                      <Show when={error()}>
                        <div class="text-sm text-red-600 dark:text-red-400">{error()}</div>
                      </Show>
                      <Show when={wealth().distributionType === 'unit_based'}>
                        <Input
                          label={t('unitsRequestedLabel')}
                          type="number"
                          min="1"
                          value={unitsRequested() ?? ''}
                          onInput={(e) => setUnitsRequested(Number((e.target as HTMLInputElement).value))}
                          required
                        />
                      </Show>
                      <div>
                        <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">{t('messageLabel')}</label>
                        <textarea
                          class="w-full border border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 rounded px-3 py-2"
                          rows={3}
                          placeholder={t('messagePlaceholder')}
                          value={message()}
                          onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
                        />
                      </div>
                      <div class="flex gap-2">
                        <Button type="submit" disabled={requestMutation.isPending}>
                          {requestMutation.isPending ? t('submitting') : t('submitRequest')}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowRequest(false)}
                          disabled={requestMutation.isPending}
                        >
                          {t('cancel')}
                        </Button>
                      </div>
                    </form>
                  </Show>

                  <Show when={currentRequest()}>
                    <Card class="mt-4">
                      <div class="p-4 space-y-3">
                        <h3 class="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          {t('myRequest')}
                          {/* Activity indicator for unread messages */}
                          <Show when={hasUnreadMessages()}>
                            <span class="w-2 h-2 bg-ocean-500 rounded-full animate-pulse" title="New messages" />
                          </Show>
                        </h3>
                        <Show when={currentRequest()!.message}>
                          <p class="text-sm text-stone-600 dark:text-stone-300">{currentRequest()!.message}</p>
                        </Show>
                        <Show when={currentRequest()!.unitsRequested != null}>
                          <p class="text-sm text-stone-700 dark:text-stone-300">{t('unitsRequestedPrefix')} {currentRequest()!.unitsRequested}</p>
                        </Show>

                        {/* Status Timeline */}
                        <RequestStatusTimeline status={currentRequest()!.status} t={t} />

                        <Show when={currentRequest()!.status === 'pending'}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setMessage(currentRequest()!.message || '');
                              setUnitsRequested(currentRequest()!.unitsRequested ?? undefined);
                              setShowRequest(true);
                            }}
                          >
                            {t('editRequest')}
                          </Button>
                        </Show>

                        {/* Action buttons for accepted requests */}
                        <Show when={currentRequest()!.status === 'accepted'}>
                          <div class="mt-3 p-3 bg-ocean-50 dark:bg-ocean-900/30 rounded border border-ocean-200 dark:border-ocean-800">
                            <p class="text-sm text-ocean-700 dark:text-ocean-300 mb-3">
                              {t('acceptedHelperText')}
                            </p>
                            <div class="flex flex-wrap gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={async () => {
                                  await confirmRequestMutation.mutateAsync({
                                    wealthId: wealth().id,
                                    requestId: currentRequest()!.id,
                                  });
                                }}
                                disabled={confirmRequestMutation.isPending}
                              >
                                {confirmRequestMutation.isPending ? t('confirming') : t('confirmReceipt')}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={async () => {
                                  await failRequestMutation.mutateAsync({
                                    wealthId: wealth().id,
                                    requestId: currentRequest()!.id,
                                  });
                                }}
                                disabled={failRequestMutation.isPending}
                              >
                                {failRequestMutation.isPending ? t('marking') : t('markAsFailed')}
                              </Button>
                            </div>
                          </div>
                        </Show>

                        {/* Message thread for requester */}
                        <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <RequestMessageThread
                            wealthId={wealth().id}
                            requestId={currentRequest()!.id}
                            wealthOwnerId={wealth().createdBy}
                            requestStatus={currentRequest()!.status}
                          />
                        </div>
                      </div>
                    </Card>
                  </Show>
                </Show>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-3 rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-700">
                  <p class="text-sm text-stone-500 dark:text-stone-400">{t('created')}</p>
                  <p class="font-medium text-stone-900 dark:text-stone-100">{new Date(wealth().createdAt).toLocaleString()}</p>
                </div>
                <div class="p-3 rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-700">
                  <p class="text-sm text-stone-500 dark:text-stone-400">{t('endDate')}</p>
                  <p class="font-medium text-stone-900 dark:text-stone-100">
                    {(() => {
                      const end = wealth().endDate;
                      return end ? new Date(end).toLocaleString() : '—';
                    })()}
                  </p>
                </div>
                <Show when={wealth().distributionType === 'unit_based'}>
                  <div class="p-3 rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-700">
                    <p class="text-sm text-stone-500 dark:text-stone-400">{t('unitsAvailable')}</p>
                    <p class="font-medium text-stone-900 dark:text-stone-100">{wealth().unitsAvailable ?? '—'}</p>
                  </div>
                  <div class="p-3 rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-700">
                    <p class="text-sm text-stone-500 dark:text-stone-400">{t('maxUnitsPerUser')}</p>
                    <p class="font-medium text-stone-900 dark:text-stone-100">{wealth().maxUnitsPerUser ?? '—'}</p>
                  </div>
                </Show>
              </div>

              {/* Owner-only requests panel moved from ShareCard */}
              <Show when={user()?.id === wealth().createdBy}>
                <WealthRequestsPanel wealthId={wealth().id} wealthOwnerId={wealth().createdBy} communityId={wealth().communityId} />
              </Show>

              {/* Checkout Link - Owner only, active shares with units */}
              <Show when={shouldShowCheckoutLink()}>
                <ShareCheckoutLink
                  shareId={wealth().id}
                  shareName={wealth().title}
                  shareUnitsRemaining={wealth().unitsAvailable!}
                  itemUnit={wealth().item?.kind === 'service' ? 'hours' : 'units'}
                />
              </Show>

              {/* Edit modal */}
              <Show when={showEditModal()}>
                <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('editShareTitle')}</h3>
                      <button
                        onClick={() => setShowEditModal(false)}
                        class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm"
                      >
                        {t('close')}
                      </button>
                    </div>
                    <WealthEditForm
                      wealth={wealth()}
                      onUpdated={() => { setShowEditModal(false); wealthQuery.refetch(); }}
                      onCancel={() => setShowEditModal(false)}
                    />
                  </div>
                </div>
              </Show>

              {/* Comments */}
              <div class="pt-6 mt-4 border-t">
                <WealthComments wealthId={wealth().id} />
              </div>
            </Card>
          )}
        </Show>
      </Show>
    </div>
  );
};

export default WealthDetailsPage;
