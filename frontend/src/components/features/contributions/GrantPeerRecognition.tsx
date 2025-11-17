import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useGrantPeerRecognitionMutation, usePeerRecognitionLimitsQuery } from '@/hooks/queries/useContributions';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { useAuth } from '@/hooks/useAuth';
import { createDebouncedSignal } from '@/utils/debounce';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { makeTranslator } from '@/i18n/makeTranslator';
import { grantPeerRecognitionDict } from './GrantPeerRecognition.i18n';
import type { GrantPeerRecognitionDto } from '@/types/contributions.types';

interface GrantPeerRecognitionProps {
  communityId: string;
  onSuccess?: () => void;
}

export const GrantPeerRecognition: Component<GrantPeerRecognitionProps> = (props) => {
  const t = makeTranslator(grantPeerRecognitionDict, 'grantPeerRecognition');
  const baseUrl = import.meta.env.VITE_API_URL as string;
  const { user } = useAuth();

  const [displaySearchTerm, debouncedSearchTerm, setSearchTerm] = createDebouncedSignal('', 300);
  const [selectedUserId, setSelectedUserId] = createSignal<string>('');
  const [valueUnits, setValueUnits] = createSignal<number>(1);
  const [description, setDescription] = createSignal<string>('');

  const membersQuery = useCommunityMembersQuery(() => props.communityId);
  const limitsQuery = usePeerRecognitionLimitsQuery(() => props.communityId);
  const grantMutation = useGrantPeerRecognitionMutation();

  const filteredMembers = createMemo(() => {
    const members = membersQuery.data || [];
    const currentUserId = user()?.id;
    const search = debouncedSearchTerm().toLowerCase();

    return members
      .filter((m) => m.userId !== currentUserId) // Don't show current user
      .filter((m) => {
        if (!search) return true;
        const name = m.displayName?.toLowerCase() || '';
        const email = m.email?.toLowerCase() || '';
        return name.includes(search) || email.includes(search);
      });
  });

  const selectedMember = createMemo(() => {
    const members = membersQuery.data || [];
    return members.find((m) => m.userId === selectedUserId());
  });

  const limits = createMemo(() => limitsQuery.data);

  const remainingMonthlyUnits = createMemo(() => {
    const lim = limits();
    if (!lim) return 0;
    return lim.monthlyLimit - lim.usedThisMonth;
  });

  const grantsToSelectedUser = createMemo(() => {
    const lim = limits();
    const userId = selectedUserId();
    if (!lim || !userId) return 0;
    return lim.grantsToUserThisMonth[userId] || 0;
  });

  const canGrantToUser = createMemo(() => {
    const lim = limits();
    const userId = selectedUserId();
    if (!lim || !userId) return true;
    return grantsToSelectedUser() < lim.samePersonLimit;
  });

  const isFormValid = createMemo(() => {
    return (
      selectedUserId() !== '' &&
      valueUnits() > 0 &&
      valueUnits() <= remainingMonthlyUnits() &&
      description().trim() !== '' &&
      canGrantToUser()
    );
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (grantMutation.isPending || !isFormValid()) return;

    const data: GrantPeerRecognitionDto = {
      toUserId: selectedUserId(),
      valueUnits: valueUnits(),
      description: description(),
    };

    grantMutation.mutate(
      { communityId: props.communityId, data },
      {
        onSuccess: () => {
          // Reset form
          setSelectedUserId('');
          setValueUnits(1);
          setDescription('');
          setSearchTerm('');

          if (props.onSuccess) {
            props.onSuccess();
          }
        },
      }
    );
  };

  return (
    <div class="p-6 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
      <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
        {t('title')}
      </h3>

      {/* Limits Display */}
      <Show when={limits()}>
        <div class="mb-4 p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-md">
          <p class="text-sm text-sky-800 dark:text-sky-200">
            {t('remainingThisMonth')}: {remainingMonthlyUnits()} / {limits()!.monthlyLimit} {t('units')}
          </p>
        </div>
      </Show>

      <form onSubmit={handleSubmit} class="space-y-4">
        {/* Member Search/Selection */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('selectMember')}
          </label>
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={displaySearchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
          />
          <Show when={debouncedSearchTerm().length > 0 && filteredMembers().length > 0}>
            <div class="mt-2 border border-stone-200 dark:border-stone-700 rounded-md max-h-48 overflow-y-auto">
              <For each={filteredMembers()}>
                {(member) => (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserId(member.userId);
                      setSearchTerm(member.displayName || member.email || '');
                    }}
                    class="w-full flex items-center space-x-3 p-3 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors text-left"
                  >
                    <Show when={member.profileImage}>
                      <CredentialedImage
                        src={`${baseUrl}/api/v1/images/${member.profileImage}`}
                        alt={member.displayName || member.email || ''}
                        class="w-10 h-10 rounded-full object-cover"
                      />
                    </Show>
                    <div>
                      <p class="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {member.displayName || member.email}
                      </p>
                      <p class="text-xs text-stone-600 dark:text-stone-400">{member.email}</p>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Selected Member Display */}
        <Show when={selectedMember()}>
          <div class="p-3 bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-md">
            <p class="text-sm text-ocean-800 dark:text-ocean-200">
              {t('grantingTo')}: {selectedMember()!.displayName || selectedMember()!.email}
            </p>
            <Show when={!canGrantToUser()}>
              <p class="text-xs text-danger-600 dark:text-danger-400 mt-1">
                {t('samePersonLimitReached')}
              </p>
            </Show>
            <Show when={canGrantToUser() && grantsToSelectedUser() > 0}>
              <p class="text-xs text-stone-600 dark:text-stone-400 mt-1">
                {t('grantsToThisUser')}: {grantsToSelectedUser()} / {limits()?.samePersonLimit || 3}
              </p>
            </Show>
          </div>
        </Show>

        {/* Value Units Input */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('valueUnits')}
          </label>
          <Input
            type="number"
            min="1"
            max={remainingMonthlyUnits()}
            step="1"
            value={valueUnits()}
            onInput={(e) => setValueUnits(parseInt(e.currentTarget.value) || 0)}
            required
          />
          <p class="mt-1 text-xs text-stone-600 dark:text-stone-400">
            {t('maxUnits')}: {remainingMonthlyUnits()}
          </p>
        </div>

        {/* Description */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('descriptionLabel')}
          </label>
          <textarea
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            rows={3}
            class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            placeholder={t('descriptionPlaceholder')}
            required
          />
          <p class="mt-1 text-xs text-stone-600 dark:text-stone-400">
            {t('descriptionHelp')}
          </p>
        </div>

        {/* Error Display */}
        <Show when={grantMutation.isError}>
          <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md p-3">
            <p class="text-sm text-danger-800 dark:text-danger-200">
              {t('errorMessage')}
            </p>
          </div>
        </Show>

        {/* Success Message */}
        <Show when={grantMutation.isSuccess}>
          <div class="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-md p-3">
            <p class="text-sm text-success-800 dark:text-success-200">
              {t('successMessage')}
            </p>
          </div>
        </Show>

        {/* Submit Button */}
        <div class="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid() || grantMutation.isPending}
          >
            {grantMutation.isPending ? t('granting') : t('grantButton')}
          </Button>
        </div>
      </form>
    </div>
  );
};
