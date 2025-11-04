import { Component, Show, createSignal, createEffect } from 'solid-js';
import { A } from '@solidjs/router';
import { useCommunity } from '@/contexts/CommunityContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { TrustLevelPicker } from '@/components/common/TrustLevelPicker';
import { useUpdateCommunityMutation } from '@/hooks/queries/useUpdateCommunityMutation';
import { useDeleteCommunityMutation } from '@/hooks/queries/useDeleteCommunityMutation';
import { useTrustLevelsQuery } from '@/hooks/queries/useTrustLevelsQuery';
import type { UpdateCommunityDto, TrustLevelPickerValue, TrustRequirement } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communitySettingsDict } from './CommunitySettings.i18n';

interface CommunitySettingsProps {
  communityId: string;
}

// Helper function to convert TrustRequirement to TrustLevelPickerValue
const trustRequirementToPickerValue = (
  requirement: TrustRequirement | null | undefined,
  trustLevels: Array<{ id: string; threshold: number }> | undefined,
  defaultValue: number
): TrustLevelPickerValue => {
  if (!requirement) {
    return { customValue: defaultValue, levelId: undefined };
  }

  if (requirement.type === 'level' && typeof requirement.value === 'string') {
    // Find the trust level by ID to get its threshold
    const level = trustLevels?.find((l) => l.id === requirement.value);
    return {
      customValue: level?.threshold ?? defaultValue,
      levelId: requirement.value,
    };
  }

  // type is 'number'
  return {
    customValue: typeof requirement.value === 'number' ? requirement.value : defaultValue,
    levelId: undefined,
  };
};

// Helper function to convert TrustLevelPickerValue to TrustRequirement
const pickerValueToTrustRequirement = (value: TrustLevelPickerValue): TrustRequirement => {
  if (value.levelId) {
    return { type: 'level', value: value.levelId };
  }
  return { type: 'number', value: value.customValue };
};

export const CommunitySettings: Component<CommunitySettingsProps> = (props) => {
  const t = makeTranslator(communitySettingsDict, 'communitySettings');

  const { community, isAdmin } = useCommunity();
  const [showConfirmDelete, setShowConfirmDelete] = createSignal(false);
  const updateMutation = useUpdateCommunityMutation();
  const deleteMutation = useDeleteCommunityMutation();
  const trustLevels = useTrustLevelsQuery(() => props.communityId);

  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [minTrustToAwardTrust, setMinTrustToAwardTrust] = createSignal<TrustLevelPickerValue>({
    customValue: 15,
    levelId: undefined,
  });
  const [minTrustForWealth, setMinTrustForWealth] = createSignal<TrustLevelPickerValue>({
    customValue: 10,
    levelId: undefined,
  });
  const [minTrustForDisputes, setMinTrustForDisputes] = createSignal<TrustLevelPickerValue>({
    customValue: 20,
    levelId: undefined,
  });
  const [minTrustForPolls, setMinTrustForPolls] = createSignal<TrustLevelPickerValue>({
    customValue: 15,
    levelId: undefined,
  });
  const [minTrustForThreadCreation, setMinTrustForThreadCreation] = createSignal<TrustLevelPickerValue>({
    customValue: 10,
    levelId: undefined,
  });
  const [minTrustForForumModeration, setMinTrustForForumModeration] = createSignal<TrustLevelPickerValue>({
    customValue: 30,
    levelId: undefined,
  });

  createEffect(() => {
    const comm = community();
    const levels = trustLevels.data;
    if (comm) {
      setName(comm.name);
      setDescription(comm.description || '');
      setMinTrustToAwardTrust(
        trustRequirementToPickerValue(comm.minTrustToAwardTrust, levels, 15)
      );
      setMinTrustForWealth(
        trustRequirementToPickerValue(comm.minTrustForWealth, levels, 10)
      );
      setMinTrustForDisputes(
        trustRequirementToPickerValue(comm.minTrustForDisputes, levels, 20)
      );
      setMinTrustForPolls(
        trustRequirementToPickerValue(comm.minTrustForPolls, levels, 15)
      );
      setMinTrustForThreadCreation(
        trustRequirementToPickerValue(comm.minTrustForThreadCreation, levels, 10)
      );
      setMinTrustForForumModeration(
        trustRequirementToPickerValue(comm.minTrustForForumModeration, levels, 30)
      );
    }
  });
  
  const handleUpdate = () => {
    const dto: UpdateCommunityDto = {
      name: name(),
      description: description(),
      minTrustToAwardTrust: pickerValueToTrustRequirement(minTrustToAwardTrust()),
      minTrustForWealth: pickerValueToTrustRequirement(minTrustForWealth()),
      minTrustForDisputes: pickerValueToTrustRequirement(minTrustForDisputes()),
      minTrustForPolls: pickerValueToTrustRequirement(minTrustForPolls()),
      minTrustForThreadCreation: pickerValueToTrustRequirement(minTrustForThreadCreation()),
      minTrustForForumModeration: pickerValueToTrustRequirement(minTrustForForumModeration()),
    };

    // Mutation will automatically invalidate queries via onSuccess in the hook
    updateMutation.mutate({ id: props.communityId, dto });
  };

  const handleDelete = () => {
    deleteMutation.mutate(props.communityId);
    setShowConfirmDelete(false);
  };

  const communityData = () => community();

  return (
    <Show when={isAdmin()}>
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold mb-4">{t('updateTitle')}</h2>
          <div class="space-y-4">
            <Input
              type="text"
              label={t('nameLabel')}
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              required
            />
            <Textarea
              label={t('descriptionLabel')}
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
            />

            <div class="border-t pt-4 mt-4">
              <h3 class="text-lg font-semibold mb-3">{t('trustConfigTitle')}</h3>
              <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('trustConfigDesc')}</p>

              <div class="mb-4 p-4 bg-blue-50 rounded-md">
                <h4 class="font-medium text-blue-900 mb-2">{t('manageTrustLevels')}</h4>
                <p class="text-sm text-blue-700 mb-3">{t('manageTrustLevelsDesc')}</p>
                <A
                  href={`/communities/${props.communityId}/settings/trust-levels`}
                  class="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('manageTrustLevels')} →
                </A>
              </div>

              <div class="space-y-4">
                <TrustLevelPicker
                  communityId={props.communityId}
                  value={minTrustToAwardTrust()}
                  onChange={setMinTrustToAwardTrust}
                  label={t('minTrustToAwardTrust')}
                  description={t('minTrustToAwardTrustDesc')}
                />
                <TrustLevelPicker
                  communityId={props.communityId}
                  value={minTrustForWealth()}
                  onChange={setMinTrustForWealth}
                  label={t('minTrustForWealth')}
                  description={t('minTrustForWealthDesc')}
                />
                <TrustLevelPicker
                  communityId={props.communityId}
                  value={minTrustForDisputes()}
                  onChange={setMinTrustForDisputes}
                  label={t('minTrustForDisputes')}
                  description={t('minTrustForDisputesDesc')}
                />
                <TrustLevelPicker
                  communityId={props.communityId}
                  value={minTrustForPolls()}
                  onChange={setMinTrustForPolls}
                  label={t('minTrustForPolls')}
                  description={t('minTrustForPollsDesc')}
                />
                <TrustLevelPicker
                  communityId={props.communityId}
                  value={minTrustForThreadCreation()}
                  onChange={setMinTrustForThreadCreation}
                  label={t('minTrustForThreadCreation')}
                  description={t('minTrustForThreadCreationDesc')}
                />
                <TrustLevelPicker
                  communityId={props.communityId}
                  value={minTrustForForumModeration()}
                  onChange={setMinTrustForForumModeration}
                  label={t('minTrustForForumModeration')}
                  description={t('minTrustForForumModerationDesc')}
                />
              </div>
            </div>

            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('updating') : t('updateCommunity')}
            </Button>
          </div>
        </div>

        <div class="pt-6 border-t">
          <h2 class="text-xl font-semibold mb-2">{t('dangerZone')}</h2>
          <p class="text-stone-600 dark:text-stone-400 mb-4">{t('dangerZoneDesc')}</p>
          <Button
            variant="danger"
            onClick={() => setShowConfirmDelete(true)}
            disabled={deleteMutation.isPending}
          >
            {t('deleteCommunity')}
          </Button>
        </div>

        <Show when={showConfirmDelete()}>
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 class="text-lg font-semibold mb-4">{t('confirmDeleteTitle')}</h3>
              <p class="mb-6">{t('confirmDeleteMsg').replace('{{name}}', communityData()?.name || '')}</p>
              <div class="flex justify-end space-x-3">
                <Button onClick={() => setShowConfirmDelete(false)}>{t('cancel')}</Button>
                <Button variant="danger" onClick={handleDelete}>
                  {deleteMutation.isPending ? t('deleting') : t('delete')}
                </Button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  );
};