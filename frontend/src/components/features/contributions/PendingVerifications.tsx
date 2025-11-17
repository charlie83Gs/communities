import { Component, createSignal, Show, For } from 'solid-js';
import { Button } from '@/components/common/Button';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import {
  usePendingVerificationsQuery,
  useVerifyContributionMutation,
  useDisputeContributionMutation,
} from '@/hooks/queries/useContributions';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pendingVerificationsDict } from './PendingVerifications.i18n';
import type { VerifyContributionDto, DisputeContributionDto } from '@/types/contributions.types';

interface PendingVerificationsProps {
  communityId: string;
}

export const PendingVerifications: Component<PendingVerificationsProps> = (props) => {
  const t = makeTranslator(pendingVerificationsDict, 'pendingVerifications');
  const baseUrl = import.meta.env.VITE_API_URL as string;

  const [selectedContributionId, setSelectedContributionId] = createSignal<string | null>(null);
  const [testimonial, setTestimonial] = createSignal('');
  const [disputeReason, setDisputeReason] = createSignal('');
  const [showDisputeForm, setShowDisputeForm] = createSignal(false);

  const verificationsQuery = usePendingVerificationsQuery(() => props.communityId);
  const verifyMutation = useVerifyContributionMutation();
  const disputeMutation = useDisputeContributionMutation();

  const handleVerify = (contributionId: string) => {
    const data: VerifyContributionDto = {
      testimonial: testimonial() || undefined,
    };

    verifyMutation.mutate(
      {
        communityId: props.communityId,
        contributionId,
        data,
      },
      {
        onSuccess: () => {
          setSelectedContributionId(null);
          setTestimonial('');
        },
      }
    );
  };

  const handleDispute = (contributionId: string) => {
    if (!disputeReason().trim()) return;

    const data: DisputeContributionDto = {
      reason: disputeReason(),
    };

    disputeMutation.mutate(
      {
        communityId: props.communityId,
        contributionId,
        data,
      },
      {
        onSuccess: () => {
          setSelectedContributionId(null);
          setDisputeReason('');
          setShowDisputeForm(false);
        },
      }
    );
  };

  const startVerification = (contributionId: string) => {
    setSelectedContributionId(contributionId);
    setTestimonial('');
  };

  const cancelVerification = () => {
    setSelectedContributionId(null);
    setTestimonial('');
    setDisputeReason('');
    setShowDisputeForm(false);
  };

  return (
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t('title')}
      </h2>

      <Show
        when={!verificationsQuery.isLoading}
        fallback={
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
          </div>
        }
      >
        <For
          each={verificationsQuery.data || []}
          fallback={
            <div class="p-8 text-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              <p class="text-stone-500 dark:text-stone-500">{t('noPending')}</p>
            </div>
          }
        >
          {(pending) => (
            <div class="p-6 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 space-y-4">
              {/* Contributor Info */}
              <div class="flex items-center space-x-3">
                <Show when={pending.contributorImage}>
                  <CredentialedImage
                    src={`${baseUrl}/api/v1/images/${pending.contributorImage}`}
                    alt={pending.contributorName}
                    class="w-12 h-12 rounded-full object-cover"
                  />
                </Show>
                <div>
                  <p class="font-semibold text-stone-900 dark:text-stone-100">
                    {pending.contributorName}
                  </p>
                  <p class="text-sm text-stone-600 dark:text-stone-400">
                    {t('requestsVerification')}
                  </p>
                </div>
              </div>

              {/* Contribution Details */}
              <div class="bg-stone-50 dark:bg-stone-900 rounded-md p-4 space-y-2">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-stone-900 dark:text-stone-100">
                        {pending.contribution.itemName}
                      </p>
                      <span class={`text-xs px-2 py-0.5 rounded ${
                        pending.contribution.itemKind === 'object'
                          ? 'bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200'
                          : 'bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200'
                      }`}>
                        {pending.contribution.itemKind}
                      </span>
                    </div>
                    <p class="text-sm text-stone-600 dark:text-stone-400">
                      {pending.contribution.units} × {pending.contribution.valuePerUnit} ={' '}
                      {pending.contribution.totalValue} {t('valueUnits')}
                    </p>
                  </div>
                  <p class="text-xs text-stone-500 dark:text-stone-500">
                    {new Date(pending.contribution.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p class="text-sm text-stone-700 dark:text-stone-300">
                  {pending.contribution.description}
                </p>
              </div>

              {/* Verification Form */}
              <Show
                when={selectedContributionId() === pending.contribution.id}
                fallback={
                  <div class="flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedContributionId(pending.contribution.id);
                        setShowDisputeForm(true);
                      }}
                      disabled={disputeMutation.isPending}
                    >
                      {t('disputeButton')}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => startVerification(pending.contribution.id)}
                    >
                      {t('verifyButton')}
                    </Button>
                  </div>
                }
              >
                <div class="space-y-3 border-t border-stone-200 dark:border-stone-700 pt-4">
                  <Show
                    when={showDisputeForm()}
                    fallback={
                      <>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                          {t('testimonialLabel')}
                        </label>
                        <textarea
                          value={testimonial()}
                          onInput={(e) => setTestimonial(e.currentTarget.value)}
                          rows={3}
                          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                          placeholder={t('testimonialPlaceholder')}
                        />
                        <p class="text-xs text-stone-600 dark:text-stone-400">
                          {t('testimonialHelp')}
                        </p>
                        <div class="flex justify-end space-x-3">
                          <Button variant="secondary" onClick={cancelVerification}>
                            {t('cancelButton')}
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleVerify(pending.contribution.id)}
                            disabled={verifyMutation.isPending}
                          >
                            {verifyMutation.isPending ? t('verifying') : t('confirmVerifyButton')}
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <label class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                      {t('disputeReasonLabel')}
                    </label>
                    <textarea
                      value={disputeReason()}
                      onInput={(e) => setDisputeReason(e.currentTarget.value)}
                      rows={3}
                      class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                      placeholder={t('disputeReasonPlaceholder')}
                      required
                    />
                    <p class="text-xs text-stone-600 dark:text-stone-400">
                      {t('disputeReasonHelp')}
                    </p>
                    <div class="flex justify-end space-x-3">
                      <Button variant="secondary" onClick={cancelVerification}>
                        {t('cancelButton')}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDispute(pending.contribution.id)}
                        disabled={disputeMutation.isPending || !disputeReason().trim()}
                      >
                        {disputeMutation.isPending ? t('disputing') : t('confirmDisputeButton')}
                      </Button>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* Error Display */}
              <Show when={verifyMutation.isError || disputeMutation.isError}>
                <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md p-3">
                  <p class="text-sm text-danger-800 dark:text-danger-200">
                    {t('errorMessage')}
                  </p>
                </div>
              </Show>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};
