import { Component, Show, createSignal, createEffect, For } from 'solid-js';
import { A } from '@solidjs/router';
import { useCommunity } from '@/contexts/CommunityContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Tabs } from '@/components/common/Tabs';
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

// TrustThresholdRow component for table rows
interface TrustThresholdRowProps {
  label: string;
  communityId: string;
  value: TrustLevelPickerValue;
  onChange: (value: TrustLevelPickerValue) => void;
  trustLevels?: Array<{ id: string; name: string; threshold: number }>;
}

const TrustThresholdRow: Component<TrustThresholdRowProps> = (props) => {
  const t = makeTranslator(communitySettingsDict, 'communitySettings');

  const [mode, setMode] = createSignal<'number' | 'level'>(
    props.value.levelId ? 'level' : 'number'
  );

  const handleModeChange = (newMode: 'number' | 'level') => {
    setMode(newMode);
    if (newMode === 'level' && props.trustLevels && props.trustLevels.length > 0) {
      // Switch to first available level
      const firstLevel = props.trustLevels[0];
      props.onChange({
        customValue: firstLevel.threshold,
        levelId: firstLevel.id,
      });
    } else if (newMode === 'number') {
      // Switch to number mode, keep current value
      props.onChange({
        customValue: props.value.customValue,
        levelId: undefined,
      });
    }
  };

  const handleLevelChange = (levelId: string) => {
    const level = props.trustLevels?.find((l) => l.id === levelId);
    if (level) {
      props.onChange({
        customValue: level.threshold,
        levelId: level.id,
      });
    }
  };

  const handleNumberChange = (value: number) => {
    props.onChange({
      customValue: value,
      levelId: undefined,
    });
  };

  return (
    <tr class="hover:bg-stone-50 dark:hover:bg-stone-800/50">
      <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">
        {props.label}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <select
          value={mode()}
          onChange={(e) => handleModeChange(e.currentTarget.value as 'number' | 'level')}
          class="px-3 py-1.5 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        >
          <option value="number">{t('typeNumber')}</option>
          <option value="level">{t('typeLevel')}</option>
        </select>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <Show when={mode() === 'number'}>
          <input
            type="number"
            min="0"
            value={props.value.customValue}
            onInput={(e) => handleNumberChange(parseInt(e.currentTarget.value, 10) || 0)}
            class="w-32 px-3 py-1.5 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
          />
        </Show>
        <Show when={mode() === 'level'}>
          <Show when={props.trustLevels && props.trustLevels.length > 0} fallback={<span class="text-stone-500 dark:text-stone-400">No levels</span>}>
            <select
              value={props.value.levelId || ''}
              onChange={(e) => handleLevelChange(e.currentTarget.value)}
              class="w-64 px-3 py-1.5 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            >
              <For each={props.trustLevels?.sort((a, b) => a.threshold - b.threshold)}>
                {(level) => (
                  <option value={level.id}>
                    {level.name} ({level.threshold}+)
                  </option>
                )}
              </For>
            </select>
          </Show>
        </Show>
      </td>
    </tr>
  );
};

export const CommunitySettings: Component<CommunitySettingsProps> = (props) => {
  const t = makeTranslator(communitySettingsDict, 'communitySettings');

  const { community, isAdmin } = useCommunity();
  const [showConfirmDelete, setShowConfirmDelete] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal('general');
  const updateMutation = useUpdateCommunityMutation();
  const deleteMutation = useDeleteCommunityMutation();
  const trustLevels = useTrustLevelsQuery(() => props.communityId);

  // General tab fields
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');

  // Trust threshold fields - action thresholds
  const [minTrustToAwardTrust, setMinTrustToAwardTrust] = createSignal<TrustLevelPickerValue>({
    customValue: 15,
    levelId: undefined,
  });
  const [minTrustForWealth, setMinTrustForWealth] = createSignal<TrustLevelPickerValue>({
    customValue: 10,
    levelId: undefined,
  });
  const [minTrustForDisputeVisibility, setMinTrustForDisputeVisibility] = createSignal<TrustLevelPickerValue>({
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
  const [minTrustForPoolCreation, setMinTrustForPoolCreation] = createSignal<TrustLevelPickerValue>({
    customValue: 20,
    levelId: undefined,
  });
  const [minTrustForCouncilCreation, setMinTrustForCouncilCreation] = createSignal<TrustLevelPickerValue>({
    customValue: 25,
    levelId: undefined,
  });
  const [minTrustForAttachments, setMinTrustForAttachments] = createSignal<TrustLevelPickerValue>({
    customValue: 15,
    levelId: undefined,
  });
  const [minTrustForFlagging, setMinTrustForFlagging] = createSignal<TrustLevelPickerValue>({
    customValue: 15,
    levelId: undefined,
  });
  const [minTrustForFlagReview, setMinTrustForFlagReview] = createSignal<TrustLevelPickerValue>({
    customValue: 30,
    levelId: undefined,
  });

  // Analytics threshold
  const [minTrustForHealthAnalytics, setMinTrustForHealthAnalytics] = createSignal<TrustLevelPickerValue>({
    customValue: 20,
    levelId: undefined,
  });

  // Needs thresholds
  const [minTrustForNeeds, setMinTrustForNeeds] = createSignal<TrustLevelPickerValue>({
    customValue: 5,
    levelId: undefined,
  });

  // Trust threshold fields - viewer thresholds (new)
  const [minTrustToViewTrust, setMinTrustToViewTrust] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });
  const [minTrustToViewWealth, setMinTrustToViewWealth] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });
  const [minTrustToViewItems, setMinTrustToViewItems] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });
  const [minTrustToViewPolls, setMinTrustToViewPolls] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });
  const [minTrustToViewPools, setMinTrustToViewPools] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });
  const [minTrustToViewCouncils, setMinTrustToViewCouncils] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });
  const [minTrustToViewForum, setMinTrustToViewForum] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });
  const [minTrustToViewNeeds, setMinTrustToViewNeeds] = createSignal<TrustLevelPickerValue>({
    customValue: 0,
    levelId: undefined,
  });

  createEffect(() => {
    const comm = community();
    const levels = trustLevels.data;
    if (comm) {
      setName(comm.name);
      setDescription(comm.description || '');

      // Action thresholds
      setMinTrustToAwardTrust(
        trustRequirementToPickerValue(comm.minTrustToAwardTrust, levels, 15)
      );
      setMinTrustForWealth(
        trustRequirementToPickerValue(comm.minTrustForWealth, levels, 10)
      );
      setMinTrustForDisputeVisibility(
        trustRequirementToPickerValue(comm.minTrustForDisputeVisibility, levels, 20)
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
      setMinTrustForPoolCreation(
        trustRequirementToPickerValue(comm.minTrustForPoolCreation, levels, 20)
      );
      setMinTrustForCouncilCreation(
        trustRequirementToPickerValue(comm.minTrustForCouncilCreation, levels, 25)
      );
      setMinTrustForAttachments(
        trustRequirementToPickerValue(comm.minTrustForAttachments, levels, 15)
      );
      setMinTrustForFlagging(
        trustRequirementToPickerValue(comm.minTrustForFlagging, levels, 15)
      );
      setMinTrustForFlagReview(
        trustRequirementToPickerValue(comm.minTrustForFlagReview, levels, 30)
      );
      setMinTrustForHealthAnalytics(
        trustRequirementToPickerValue(comm.minTrustForHealthAnalytics, levels, 20)
      );
      setMinTrustForNeeds(
        trustRequirementToPickerValue(comm.minTrustForNeeds, levels, 5)
      );

      // Viewer thresholds
      setMinTrustToViewTrust(
        trustRequirementToPickerValue(comm.minTrustToViewTrust, levels, 0)
      );
      setMinTrustToViewWealth(
        trustRequirementToPickerValue(comm.minTrustToViewWealth, levels, 0)
      );
      setMinTrustToViewItems(
        trustRequirementToPickerValue(comm.minTrustToViewItems, levels, 0)
      );
      setMinTrustToViewPolls(
        trustRequirementToPickerValue(comm.minTrustToViewPolls, levels, 0)
      );
      setMinTrustToViewPools(
        trustRequirementToPickerValue(comm.minTrustToViewPools, levels, 0)
      );
      setMinTrustToViewCouncils(
        trustRequirementToPickerValue(comm.minTrustToViewCouncils, levels, 0)
      );
      setMinTrustToViewForum(
        trustRequirementToPickerValue(comm.minTrustToViewForum, levels, 0)
      );
      setMinTrustToViewNeeds(
        trustRequirementToPickerValue(comm.minTrustToViewNeeds, levels, 0)
      );
    }
  });

  const handleUpdate = () => {
    const dto: UpdateCommunityDto = {
      name: name(),
      description: description(),
      minTrustToAwardTrust: pickerValueToTrustRequirement(minTrustToAwardTrust()),
      minTrustForWealth: pickerValueToTrustRequirement(minTrustForWealth()),
      minTrustForDisputeVisibility: pickerValueToTrustRequirement(minTrustForDisputeVisibility()),
      minTrustForPolls: pickerValueToTrustRequirement(minTrustForPolls()),
      minTrustForThreadCreation: pickerValueToTrustRequirement(minTrustForThreadCreation()),
      minTrustForForumModeration: pickerValueToTrustRequirement(minTrustForForumModeration()),
      minTrustForPoolCreation: pickerValueToTrustRequirement(minTrustForPoolCreation()),
      minTrustForCouncilCreation: pickerValueToTrustRequirement(minTrustForCouncilCreation()),
      minTrustForAttachments: pickerValueToTrustRequirement(minTrustForAttachments()),
      minTrustForFlagging: pickerValueToTrustRequirement(minTrustForFlagging()),
      minTrustForFlagReview: pickerValueToTrustRequirement(minTrustForFlagReview()),
      minTrustForHealthAnalytics: pickerValueToTrustRequirement(minTrustForHealthAnalytics()),
      minTrustForNeeds: pickerValueToTrustRequirement(minTrustForNeeds()),
      minTrustToViewTrust: pickerValueToTrustRequirement(minTrustToViewTrust()),
      minTrustToViewWealth: pickerValueToTrustRequirement(minTrustToViewWealth()),
      minTrustToViewItems: pickerValueToTrustRequirement(minTrustToViewItems()),
      minTrustToViewPolls: pickerValueToTrustRequirement(minTrustToViewPolls()),
      minTrustToViewPools: pickerValueToTrustRequirement(minTrustToViewPools()),
      minTrustToViewCouncils: pickerValueToTrustRequirement(minTrustToViewCouncils()),
      minTrustToViewForum: pickerValueToTrustRequirement(minTrustToViewForum()),
      minTrustToViewNeeds: pickerValueToTrustRequirement(minTrustToViewNeeds()),
    };

    // Mutation will automatically invalidate queries via onSuccess in the hook
    updateMutation.mutate({ id: props.communityId, dto });
  };

  const handleDelete = () => {
    deleteMutation.mutate(props.communityId);
    setShowConfirmDelete(false);
  };

  const communityData = () => community();

  const tabs = [
    { id: 'general', label: t('generalTab') },
    { id: 'trust-thresholds', label: t('trustThresholdsTab') },
  ];

  return (
    <Show when={isAdmin()}>
      <div class="space-y-6">
        <h2 class="text-2xl font-bold">{t('updateTitle')}</h2>

        <Tabs tabs={tabs} activeTab={activeTab()} onTabChange={setActiveTab} />

        <div class="mt-6">
          <Show when={activeTab() === 'general'}>
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

              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('updating') : t('updateCommunity')}
              </Button>
            </div>
          </Show>

          <Show when={activeTab() === 'trust-thresholds'}>
            <div class="space-y-6">
              <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">{t('manageTrustLevels')}</h4>
                <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">{t('manageTrustLevelsDesc')}</p>
                <A
                  href={`/communities/${props.communityId}/settings/trust-levels`}
                  class="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md text-sm font-medium text-blue-700 dark:text-blue-200 bg-white dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('manageTrustLevels')} →
                </A>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
                  <thead class="bg-stone-50 dark:bg-stone-800">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t('tableColumnPermission')}
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t('tableColumnType')}
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t('tableColumnValue')}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-700">
                    {/* Viewer Access Thresholds Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionViewerThresholds')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permViewTrust')}
                      communityId={props.communityId}
                      value={minTrustToViewTrust()}
                      onChange={setMinTrustToViewTrust}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permViewWealth')}
                      communityId={props.communityId}
                      value={minTrustToViewWealth()}
                      onChange={setMinTrustToViewWealth}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permViewNeeds')}
                      communityId={props.communityId}
                      value={minTrustToViewNeeds()}
                      onChange={setMinTrustToViewNeeds}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permViewItems')}
                      communityId={props.communityId}
                      value={minTrustToViewItems()}
                      onChange={setMinTrustToViewItems}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permViewPolls')}
                      communityId={props.communityId}
                      value={minTrustToViewPolls()}
                      onChange={setMinTrustToViewPolls}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permViewPools')}
                      communityId={props.communityId}
                      value={minTrustToViewPools()}
                      onChange={setMinTrustToViewPools}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permViewCouncils')}
                      communityId={props.communityId}
                      value={minTrustToViewCouncils()}
                      onChange={setMinTrustToViewCouncils}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permViewForum')}
                      communityId={props.communityId}
                      value={minTrustToViewForum()}
                      onChange={setMinTrustToViewForum}
                      trustLevels={trustLevels.data}
                    />

                    {/* Trust & Access Configuration Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionTrustConfig')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permAwardTrust')}
                      communityId={props.communityId}
                      value={minTrustToAwardTrust()}
                      onChange={setMinTrustToAwardTrust}
                      trustLevels={trustLevels.data}
                    />

                    {/* Wealth Configuration Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionWealthConfig')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permAccessWealth')}
                      communityId={props.communityId}
                      value={minTrustForWealth()}
                      onChange={setMinTrustForWealth}
                      trustLevels={trustLevels.data}
                    />

                    {/* Needs Configuration Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionNeedsConfig')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permPublishNeeds')}
                      communityId={props.communityId}
                      value={minTrustForNeeds()}
                      onChange={setMinTrustForNeeds}
                      trustLevels={trustLevels.data}
                    />

                    {/* Item Management Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionItemManagement')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permManageItems')}
                      communityId={props.communityId}
                      value={minTrustToViewItems()}
                      onChange={setMinTrustToViewItems}
                      trustLevels={trustLevels.data}
                    />

                    {/* Dispute Handling Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionDisputeHandling')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permHandleDisputes')}
                      communityId={props.communityId}
                      value={minTrustForDisputeVisibility()}
                      onChange={setMinTrustForDisputeVisibility}
                      trustLevels={trustLevels.data}
                    />

                    {/* Poll Configuration Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionPollConfig')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permCreatePolls')}
                      communityId={props.communityId}
                      value={minTrustForPolls()}
                      onChange={setMinTrustForPolls}
                      trustLevels={trustLevels.data}
                    />

                    {/* Pool Configuration Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionPoolConfig')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permCreatePools')}
                      communityId={props.communityId}
                      value={minTrustForPoolCreation()}
                      onChange={setMinTrustForPoolCreation}
                      trustLevels={trustLevels.data}
                    />

                    {/* Council Configuration Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionCouncilConfig')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permCreateCouncils')}
                      communityId={props.communityId}
                      value={minTrustForCouncilCreation()}
                      onChange={setMinTrustForCouncilCreation}
                      trustLevels={trustLevels.data}
                    />

                    {/* Forum Configuration Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionForumConfig')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permCreateThreads')}
                      communityId={props.communityId}
                      value={minTrustForThreadCreation()}
                      onChange={setMinTrustForThreadCreation}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permUploadAttachments')}
                      communityId={props.communityId}
                      value={minTrustForAttachments()}
                      onChange={setMinTrustForAttachments}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permFlagContent')}
                      communityId={props.communityId}
                      value={minTrustForFlagging()}
                      onChange={setMinTrustForFlagging}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permReviewFlags')}
                      communityId={props.communityId}
                      value={minTrustForFlagReview()}
                      onChange={setMinTrustForFlagReview}
                      trustLevels={trustLevels.data}
                    />
                    <TrustThresholdRow
                      label={t('permModerateForm')}
                      communityId={props.communityId}
                      value={minTrustForForumModeration()}
                      onChange={setMinTrustForForumModeration}
                      trustLevels={trustLevels.data}
                    />

                    {/* Analytics Section */}
                    <tr class="bg-stone-100 dark:bg-stone-800">
                      <td colspan="3" class="px-6 py-3 text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {t('sectionAnalytics')}
                      </td>
                    </tr>
                    <TrustThresholdRow
                      label={t('permViewAnalytics')}
                      communityId={props.communityId}
                      value={minTrustForHealthAnalytics()}
                      onChange={setMinTrustForHealthAnalytics}
                      trustLevels={trustLevels.data}
                    />
                  </tbody>
                </table>
              </div>

              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('updating') : t('updateCommunity')}
              </Button>
            </div>
          </Show>
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
            <div class="bg-white dark:bg-stone-800 p-6 rounded-lg max-w-md w-full mx-4">
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
