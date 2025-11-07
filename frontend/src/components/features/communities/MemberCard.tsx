import { Component, JSX, Show, For, createMemo } from 'solid-js';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { makeTranslator } from '@/i18n/makeTranslator';
import { memberCardDict } from './MemberCard.i18n';
import type { CommunityMember } from '@/types/community.types';
import type { TrustView } from '@/types/trust.types';

interface MemberCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  member: CommunityMember & { trustView?: TrustView };
  isAdmin: boolean;
  canAwardTrust?: boolean;
  hasAwardedTrust?: boolean;
  currentUserId?: string;
  onRemove?: (userId: string) => void;
  onEditRole?: (userId: string) => void;
  onToggleTrust?: (userId: string, currentlyAwarded: boolean) => void;
}

export const MemberCard: Component<MemberCardProps> = (props) => {
  const t = makeTranslator(memberCardDict, 'memberCard');

  const baseUrl = import.meta.env.VITE_API_URL as string;

  const isCurrentUser = () => props.currentUserId === props.member.userId;

  const trustView = () => props.member.trustView;
  const peerAwards = () => trustView()?.peerAwards ?? 0;
  const adminGrant = () => trustView()?.adminGrant ?? 0;
  const totalPoints = () => trustView()?.points ?? 0;

  const trustBreakdown = createMemo(() => {
    return `${peerAwards()} ${t('peerAwards')} + ${adminGrant()} ${t('adminGrant')} = ${totalPoints()} ${t('total')}`;
  });

  const handleTrustClick = () => {
    if (props.onToggleTrust) {
      props.onToggleTrust(props.member.userId, props.hasAwardedTrust ?? false);
    }
  };

  return (
    <div class="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 shadow-sm">
      <div class="flex items-center gap-4">
        <Show when={props.member.profileImage}>
          <CredentialedImage
            src={`${baseUrl}/api/v1/images/${props.member.profileImage}`}
            alt="Profile"
            class="w-10 h-10 rounded-full object-cover"
            fallbackText="?"
          />
        </Show>
        <Show when={!props.member.profileImage}>
          <div class="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center text-stone-700 dark:text-stone-300">
            {props.member.displayName?.charAt(0).toUpperCase() || '?'}
          </div>
        </Show>
        <div>
          <div class="flex items-center gap-2">
            <a href={`/users/${props.member.userId}`} class="font-medium hover:underline text-stone-900 dark:text-stone-100">
              {props.member.displayName || props.member.email || props.member.userId}
            </a>
            <Show when={props.canAwardTrust && !isCurrentUser()}>
              <button
                onClick={handleTrustClick}
                class={`p-1 rounded transition-colors ${
                  props.hasAwardedTrust
                    ? 'text-forest-600 hover:text-forest-700 dark:text-forest-500 dark:hover:text-forest-400'
                    : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-400'
                }`}
                title={props.hasAwardedTrust ? t('removeTrust') : t('awardTrust')}
                aria-label={props.hasAwardedTrust ? t('removeTrust') : t('awardTrust')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={props.hasAwardedTrust ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </button>
            </Show>
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400">{props.member.email || 'No email'}</p>
        </div>
      </div>
      <div class="flex items-center gap-4 pl-4 border-l border-stone-200 dark:border-stone-700">
        <div class="flex flex-col items-center gap-1 min-w-[80px]">
          <span class="text-xs text-stone-500 dark:text-stone-400 font-medium">{t('role')}</span>
          <div class="flex gap-1 flex-wrap justify-center text-sm font-medium text-stone-700 dark:text-stone-300">
            <For each={props.member.roles}>
              {(role) => <span>{role}</span>}
            </For>
          </div>
        </div>
        <div class="w-px h-6 bg-stone-200 dark:bg-stone-700"></div>
        <div class="flex flex-col items-center gap-1 min-w-[60px]">
          <span class="text-xs text-stone-500 dark:text-stone-400 font-medium">{t('trust')}</span>
          <div title={trustBreakdown()} class="text-forest-600 dark:text-forest-400 text-xl font-bold cursor-help">
            {totalPoints()}
          </div>
        </div>
        <Show when={props.isAdmin && !isCurrentUser()}>
          <div class="flex gap-2 ml-auto">
            <button
              onClick={() => props.onEditRole?.(props.member.userId)}
              class="p-2 rounded-md text-stone-600 hover:text-ocean-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-ocean-400 dark:hover:bg-stone-700 transition-colors"
              aria-label={t('editRole')}
              title={t('editRoleTooltip')}
            >
              <Icon name="edit" size={18} />
            </button>
            <button
              onClick={() => props.onRemove?.(props.member.userId)}
              class="p-2 rounded-md text-stone-600 hover:text-danger-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-danger-400 dark:hover:bg-stone-700 transition-colors"
              aria-label={t('remove')}
              title={t('removeTooltip')}
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};
