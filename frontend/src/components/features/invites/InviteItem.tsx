import { Component, createMemo } from 'solid-js';
import type { MyInvite } from '@/types/user.types';
import { Button } from '@/components/common/Button';
import { useRedeemInviteMutation } from '@/hooks/queries/useRedeemInviteMutation';
import { makeTranslator } from '@/i18n/makeTranslator';
import { inviteItemDict } from './InviteItem.i18n';

interface InviteItemProps {
  invite: MyInvite;
}

const InviteItem: Component<InviteItemProps> = (props) => {
  const t = makeTranslator(inviteItemDict, 'inviteItem');
  const { invite } = props;
  const redeemMutation = useRedeemInviteMutation();

  const statusColor = createMemo(() => {
    switch (invite.status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'redeemed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'expired':
        return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
      default:
        return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
    }
  });

  const canAccept = createMemo(() => invite.status === 'pending' && !redeemMutation.isPending);

  const onAccept = async () => {
    if (!canAccept()) return;
    await redeemMutation.mutateAsync(invite.id);
    // Query invalidation is handled inside the mutation hook
  };

  return (
    <div class="flex justify-between items-center p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 shadow-sm">
      <div class="flex-1">
        <h3 class="text-sm font-medium text-stone-900 dark:text-stone-100">
          {t('titlePrefix')} {invite.role}
        </h3>
        <p class="text-sm text-stone-500 dark:text-stone-400">
          {t('communityIdLabel')}: {invite.communityId}
        </p>
        <p class="text-xs text-stone-400 dark:text-stone-500">
          {t('createdLabel')}: {new Date(invite.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor()}`}>
          {invite.status}
        </span>

        {invite.status === 'pending' && (
          <Button
            variant="primary"
            size="sm"
            loading={redeemMutation.isPending}
            disabled={!canAccept()}
            onClick={onAccept}
          >
            {t('accept')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InviteItem;