import { Component, Show, createEffect, createSignal } from 'solid-js';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilsDict } from './councils.i18n';
import {
  useCouncilTrustStatusQuery,
  useAwardCouncilTrustMutation,
  useRemoveCouncilTrustMutation,
} from '@/hooks/queries/useCouncils';

interface CouncilTrustButtonProps {
  communityId: string;
  councilId: string;
}

export const CouncilTrustButton: Component<CouncilTrustButtonProps> = (props) => {
  const t = makeTranslator(councilsDict, 'councils');
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const trustStatusQuery = useCouncilTrustStatusQuery(
    () => props.communityId,
    () => props.councilId
  );

  const awardTrustMutation = useAwardCouncilTrustMutation();
  const removeTrustMutation = useRemoveCouncilTrustMutation();

  const handleToggleTrust = async () => {
    setErrorMessage(null);
    const userHasTrusted = trustStatusQuery.data?.userHasTrusted;

    try {
      if (userHasTrusted) {
        await removeTrustMutation.mutateAsync({
          communityId: props.communityId,
          councilId: props.councilId,
        });
      } else {
        await awardTrustMutation.mutateAsync({
          communityId: props.communityId,
          councilId: props.councilId,
        });
      }
    } catch (error) {
      console.error('Trust operation failed:', error);
      setErrorMessage(userHasTrusted ? t('removeTrustError') : t('trustError'));
    }
  };

  createEffect(() => {
    // Clear error when trust status changes (mutation succeeded)
    if (trustStatusQuery.data) {
      setErrorMessage(null);
    }
  });

  const isLoading = () =>
    trustStatusQuery.isLoading ||
    awardTrustMutation.isPending ||
    removeTrustMutation.isPending;

  const userHasTrusted = () => trustStatusQuery.data?.userHasTrusted || false;

  const getButtonText = () => {
    if (awardTrustMutation.isPending) return t('trustingCouncil');
    if (removeTrustMutation.isPending) return t('removingTrust');
    return userHasTrusted() ? t('trusted') : t('trust');
  };

  return (
    <div class="flex flex-col gap-2">
      <Button
        onClick={handleToggleTrust}
        disabled={isLoading()}
        variant={userHasTrusted() ? 'secondary' : 'primary'}
        class={
          userHasTrusted()
            ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 hover:bg-success-200 dark:hover:bg-success-800 border-success-300 dark:border-success-700'
            : ''
        }
        title={userHasTrusted() ? t('removeTrust') : t('trustCouncil')}
      >
        {getButtonText()}
      </Button>

      <Show when={errorMessage()}>
        <p class="text-xs text-danger-600 dark:text-danger-400">{errorMessage()}</p>
      </Show>
    </div>
  );
};
