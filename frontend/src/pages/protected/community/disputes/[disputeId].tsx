/**
 * Dispute Detail Page
 * Location per architecture: /pages/protected (route component)
 */

import { Component, Show, For, createMemo } from 'solid-js';
import { useParams, useNavigate, A } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import { useDisputeDetailQuery } from '@/hooks/queries/useDisputes';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { MediatorProposal } from '@/components/features/disputes/MediatorProposal';
import { AddParticipant } from '@/components/features/disputes/AddParticipant';
import { ResolutionForm } from '@/components/features/disputes/ResolutionForm';
import { ResolutionDisplay } from '@/components/features/disputes/ResolutionDisplay';
import { DisputeMessages } from '@/components/features/disputes/DisputeMessages';
import { DisputePrivacyControl } from '@/components/features/disputes/DisputePrivacyControl';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from '@/components/features/disputes/disputes.i18n';
import { formatDateTime } from '@/utils/dateUtils';

const DisputeDetailPage: Component = () => {
  const t = makeTranslator(disputesDict, 'disputes');
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const communityId = () => params.id;
  const disputeId = () => params.disputeId;

  const disputeQuery = useDisputeDetailQuery(communityId, disputeId);

  const currentUserId = () => user()?.id;

  const getStatusLabel = () => {
    const dispute = disputeQuery.data;
    if (!dispute) return '';

    switch (dispute.status) {
      case 'open':
        return t('statusOpen');
      case 'in_mediation':
        return t('statusInMediation');
      case 'resolved':
        return t('statusResolved');
      case 'closed':
        return t('statusClosed');
      default:
        return dispute.status;
    }
  };

  const getStatusColor = () => {
    const dispute = disputeQuery.data;
    if (!dispute) return '';

    switch (dispute.status) {
      case 'open':
        return 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200';
      case 'in_mediation':
        return 'bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200';
      case 'resolved':
        return 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200';
      case 'closed':
        return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
      default:
        return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
    }
  };

  const canMessage = createMemo(() => {
    const dispute = disputeQuery.data;
    if (!dispute) return false;
    return dispute.isParticipant || dispute.isMediatorAccepted;
  });

  return (
    <>
      <Title>{t('disputeInfo')}</Title>

      <div class="max-w-5xl mx-auto p-6">
        <Show
          when={!disputeQuery.isLoading}
          fallback={
            <div class="text-center py-8 text-stone-500 dark:text-stone-400">
              {t('loading')}
            </div>
          }
        >
          <Show
            when={!disputeQuery.isError}
            fallback={
              <Card>
                <div class="text-center py-12">
                  <h2 class="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                    {t('accessDenied')}
                  </h2>
                  <p class="text-stone-600 dark:text-stone-400 mb-6">
                    {t('accessDeniedMessage')}
                  </p>
                  <A
                    href={`/communities/${communityId()}`}
                    class="text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 no-underline"
                  >
                    ← {t('backToCommunity')}
                  </A>
                </div>
              </Card>
            }
          >
            <Show when={disputeQuery.data}>
              {(dispute) => (
                <div class="space-y-6">
                  {/* Back button */}
                  <A
                    href={`/communities/${communityId()}`}
                    class="text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 no-underline"
                  >
                    ← {t('backToCommunity')}
                  </A>

                  {/* Dispute Header */}
                  <Card>
                    <div class="space-y-4">
                      <div class="flex items-start justify-between">
                        <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100 flex-1">
                          {dispute().title}
                        </h1>
                        <div class="flex items-center gap-2">
                          <span class={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor()}`}>
                            {getStatusLabel()}
                          </span>
                          <DisputePrivacyControl
                            communityId={communityId()!}
                            disputeId={disputeId()!}
                            currentPrivacyType={dispute().privacyType}
                            canUpdatePrivacy={dispute().canUpdatePrivacy}
                          />
                        </div>
                      </div>

                      <div class="flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                        <span>
                          {t('createdAt')}: {formatDateTime(new Date(dispute().createdAt))}
                        </span>
                        <Show when={dispute().resolvedAt}>
                          <span>•</span>
                          <span>
                            {t('resolutionCreatedAt')}: {formatDateTime(new Date(dispute().resolvedAt!))}
                          </span>
                        </Show>
                      </div>

                      <div class="p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
                        <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2">
                          {t('description')}
                        </h3>
                        <p class="text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                          {dispute().description}
                        </p>
                      </div>

                      {/* Participants */}
                      <div>
                        <h3 class="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                          {t('participantsSection')}
                        </h3>
                        <div class="flex flex-wrap gap-2">
                          <For each={dispute().participants}>
                            {(participant) => (
                              <span class="px-3 py-1 bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 rounded-md text-sm">
                                {participant.user?.displayName || participant.user?.username || 'Unknown User'}
                                <Show when={participant.role === 'initiator'}>
                                  {' '}({t('initiator')})
                                </Show>
                              </span>
                            )}
                          </For>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Add Participant Section */}
                  <AddParticipant
                    communityId={communityId()!}
                    disputeId={disputeId()!}
                    currentParticipants={dispute().participants}
                    canAddParticipants={dispute().isParticipant || dispute().isMediatorAccepted}
                  />

                  {/* Mediators Section */}
                  <MediatorProposal
                    communityId={communityId()!}
                    disputeId={disputeId()!}
                    mediators={dispute().mediators}
                    canProposeAsMediator={dispute().canProposeAsMediator}
                    canAcceptMediator={dispute().canAcceptMediator}
                    currentUserId={currentUserId()}
                  />

                  {/* Resolution Section */}
                  <Show
                    when={dispute().resolution}
                    fallback={
                      <Show when={dispute().canCreateResolution}>
                        <ResolutionForm
                          communityId={communityId()!}
                          disputeId={disputeId()!}
                        />
                      </Show>
                    }
                  >
                    <ResolutionDisplay
                      resolution={dispute().resolution!}
                      canView={dispute().canViewResolution}
                    />
                  </Show>

                  {/* Messages Section */}
                  <Card>
                    <DisputeMessages
                      communityId={communityId()!}
                      disputeId={disputeId()!}
                      currentUserId={currentUserId()}
                      canMessage={canMessage()}
                    />
                  </Card>
                </div>
              )}
            </Show>
          </Show>
        </Show>
      </div>
    </>
  );
};

export default DisputeDetailPage;
