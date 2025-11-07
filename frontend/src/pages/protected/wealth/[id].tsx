import { Component, Show, createMemo, createSignal } from 'solid-js';
import { Title } from '@solidjs/meta';
import { useParams, A } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { useWealthQuery, useWealthRequestMutation, useWealthActionMutations, useUpdateWealthMutation, useWealthRequestsQuery, useManageRequestMutations } from '@/hooks/queries/useWealth';
import type { WealthRequest } from '@/types/wealth.types';
import { imagesService } from '@/services/api/images.service';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { useAuth } from '@/hooks/useAuth';
import { WealthEditForm } from '@/components/features/wealth/WealthEditForm';
import { WealthRequestsPanel } from '@/components/features/wealth/WealthRequestsPanel';
import { WealthComments } from '@/components/features/wealth/WealthComments';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthDetailsDict } from './[id].i18n';

const WealthDetailsPage: Component = () => {
  const t = makeTranslator(wealthDetailsDict, 'wealthDetails');
  const params = useParams();
  const wealthId = () => params.id;
  const wealthQuery = useWealthQuery(wealthId);
  const requestsQuery = useWealthRequestsQuery(wealthId);
  const { cancel: cancelRequestMutation } = useManageRequestMutations();
  const currentRequest = createMemo(() => requestsQuery.data?.[0] ?? null);

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
              <div class="flex items-start justify-between gap-4">
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
                </div>
                <div class="flex items-center gap-2">
                  <A href={`/communities/${wealth().communityId}`}>
                    <Button variant="secondary">{t('backToCommunity')}</Button>
                  </A>

                  <Show when={user()?.id === wealth().createdBy}>
                    <div class="flex items-center gap-2">
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
                    </div>
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
                        <h3 class="font-semibold text-stone-900 dark:text-stone-100">{t('myRequest')}</h3>
                        <Show when={currentRequest()!.message}>
                          <p class="text-sm text-stone-600 dark:text-stone-300">{currentRequest()!.message}</p>
                        </Show>
                        <Show when={currentRequest()!.unitsRequested != null}>
                          <p class="text-sm text-stone-700 dark:text-stone-300">{t('unitsRequestedPrefix')} {currentRequest()!.unitsRequested}</p>
                        </Show>
                        <p class="text-xs text-stone-400 dark:text-stone-500">{t('statusPrefix')} {currentRequest()!.status}</p>
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
                <WealthRequestsPanel wealthId={wealth().id} />
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
