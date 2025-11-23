import { Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Collapsible } from '@/components/common/Collapsible';
import { useCreateCommunity } from '@/hooks/queries/useCreateCommunity';
import { makeTranslator } from '@/i18n/makeTranslator';
import { createCommunityFormDict } from './CreateCommunityForm.i18n';
import type { CreateCommunityDto } from '@/types/community.types';

interface CreateCommunityFormProps {
  onSuccess?: () => void;
}

export const CreateCommunityForm: Component<CreateCommunityFormProps> = (props) => {
  const t = makeTranslator(createCommunityFormDict, 'createCommunityForm');

  const navigate = useNavigate();
  const createCommunity = useCreateCommunity();

  const [formData, setFormData] = createSignal<CreateCommunityDto>({
    name: '',
    // Action thresholds
    minTrustToAwardTrust: { type: 'number', value: 15 },
    minTrustForWealth: { type: 'number', value: 10 },
    minTrustForNeeds: { type: 'number', value: 5 },
    minTrustForDisputeVisibility: { type: 'number', value: 20 },
    minTrustForPolls: { type: 'number', value: 15 },
    minTrustForPoolCreation: { type: 'number', value: 20 },
    minTrustForCouncilCreation: { type: 'number', value: 25 },
    minTrustForForumModeration: { type: 'number', value: 30 },
    minTrustForThreadCreation: { type: 'number', value: 10 },
    minTrustForAttachments: { type: 'number', value: 15 },
    minTrustForFlagging: { type: 'number', value: 15 },
    minTrustForFlagReview: { type: 'number', value: 30 },
    // Viewer thresholds (new)
    minTrustToViewTrust: { type: 'number', value: 0 },
    minTrustToViewWealth: { type: 'number', value: 0 },
    minTrustToViewNeeds: { type: 'number', value: 0 },
    minTrustToViewItems: { type: 'number', value: 0 },
    minTrustToViewPolls: { type: 'number', value: 0 },
    minTrustToViewPools: { type: 'number', value: 0 },
    minTrustToViewCouncils: { type: 'number', value: 0 },
    minTrustToViewForum: { type: 'number', value: 0 },
    // Feature flags - default all to enabled
    featureFlags: {
      poolsEnabled: true,
      needsEnabled: true,
      pollsEnabled: true,
      councilsEnabled: true,
      forumEnabled: true,
      healthAnalyticsEnabled: true,
      disputesEnabled: true,
      contributionsEnabled: true,
    },
  });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    createCommunity.mutate(formData(), {
      onSuccess: (newCommunity) => {
        navigate(`/communities/${newCommunity.id}`);
        props.onSuccess?.();
      },
    });
  };

  const updateFormData = (key: keyof CreateCommunityDto, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateTrustRequirement = (key: keyof CreateCommunityDto, value: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: { type: 'number', value } as const
    }));
  };

  const updateFeatureFlag = (flag: keyof NonNullable<CreateCommunityDto['featureFlags']>, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags!,
        [flag]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} class="w-full max-w-lg mx-auto space-y-4">
      <Input
        label={t('nameLabel')}
        type="text"
        required
        value={formData().name}
        onInput={(e) => updateFormData('name', e.currentTarget.value)}
        placeholder={t('namePlaceholder')}
      />

      <Input
        label={t('descriptionLabel')}
        type="textarea"
        value={formData().description || ''}
        onInput={(e) => updateFormData('description', e.currentTarget.value)}
        placeholder={t('descriptionPlaceholder')}
      />

      <Collapsible title={t('configureThresholdsTitle')} defaultOpen={false} class="mt-6">
        <div class="space-y-6">
          <div>
            <h4 class="text-base font-semibold mb-2">{t('viewerThresholdsTitle')}</h4>
            <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('viewerThresholdsDesc')}</p>
            <div class="space-y-3">
              <Input
                label={t('minTrustToViewTrustLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewTrust;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewTrust', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />

              <Input
                label={t('minTrustToViewWealthLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewWealth;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewWealth', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />

              <Input
                label={t('minTrustToViewNeedsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewNeeds;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewNeeds', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />

              <Input
                label={t('minTrustToViewItemsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewItems;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewItems', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />

              <Input
                label={t('minTrustToViewPollsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewPolls;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewPolls', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />

              <Input
                label={t('minTrustToViewPoolsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewPools;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewPools', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />

              <Input
                label={t('minTrustToViewCouncilsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewCouncils;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewCouncils', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />

              <Input
                label={t('minTrustToViewForumLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewForum;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewForum', parseInt(e.currentTarget.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="text-base font-semibold mb-2">{t('trustConfigTitle')}</h4>
            <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('trustConfigDescription')}</p>

            <div class="space-y-3">
              <Input
                label={t('minTrustToAwardTrustLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToAwardTrust;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 15).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToAwardTrust', parseInt(e.currentTarget.value) || 15)}
                placeholder="15"
              />

              <Input
                label={t('minTrustForWealthLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForWealth;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 10).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForWealth', parseInt(e.currentTarget.value) || 10)}
                placeholder="10"
              />

              <Input
                label={t('minTrustForNeedsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForNeeds;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 5).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForNeeds', parseInt(e.currentTarget.value) || 5)}
                placeholder="5"
              />

              <Input
                label={t('minTrustForDisputesLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForDisputeVisibility;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 20).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForDisputeVisibility', parseInt(e.currentTarget.value) || 20)}
                placeholder="20"
              />

              <Input
                label={t('minTrustForPollsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForPolls;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 15).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForPolls', parseInt(e.currentTarget.value) || 15)}
                placeholder="15"
              />
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="text-base font-semibold mb-2">{t('poolCouncilConfigTitle')}</h4>
            <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('poolCouncilConfigDescription')}</p>

            <div class="space-y-3">
              <Input
                label={t('minTrustForPoolCreationLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForPoolCreation;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 20).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForPoolCreation', parseInt(e.currentTarget.value) || 20)}
                placeholder="20"
              />

              <Input
                label={t('minTrustForCouncilCreationLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForCouncilCreation;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 25).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForCouncilCreation', parseInt(e.currentTarget.value) || 25)}
                placeholder="25"
              />
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="text-base font-semibold mb-2">{t('forumConfigTitle')}</h4>
            <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('forumConfigDescription')}</p>

            <div class="space-y-3">
              <Input
                label={t('minTrustForThreadCreationLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForThreadCreation;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 10).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForThreadCreation', parseInt(e.currentTarget.value) || 10)}
                placeholder="10"
              />

              <Input
                label={t('minTrustForAttachmentsLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForAttachments;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 15).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForAttachments', parseInt(e.currentTarget.value) || 15)}
                placeholder="15"
              />

              <Input
                label={t('minTrustForFlaggingLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForFlagging;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 15).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForFlagging', parseInt(e.currentTarget.value) || 15)}
                placeholder="15"
              />

              <Input
                label={t('minTrustForFlagReviewLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForFlagReview;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 30).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForFlagReview', parseInt(e.currentTarget.value) || 30)}
                placeholder="30"
              />

              <Input
                label={t('minTrustForForumModerationLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForForumModeration;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 30).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForForumModeration', parseInt(e.currentTarget.value) || 30)}
                placeholder="30"
              />
            </div>
          </div>
        </div>
      </Collapsible>

      <Collapsible title={t('featureFlagsTitle')} defaultOpen={false} class="mt-6">
        <div class="space-y-4">
          <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('featureFlagsDesc')}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Pools */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.poolsEnabled ?? true}
                onChange={(e) => updateFeatureFlag('poolsEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsPools')}
              </span>
            </label>

            {/* Needs */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.needsEnabled ?? true}
                onChange={(e) => updateFeatureFlag('needsEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsNeeds')}
              </span>
            </label>

            {/* Polls */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.pollsEnabled ?? true}
                onChange={(e) => updateFeatureFlag('pollsEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsPolls')}
              </span>
            </label>

            {/* Councils */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.councilsEnabled ?? true}
                onChange={(e) => updateFeatureFlag('councilsEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsCouncils')}
              </span>
            </label>

            {/* Forum */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.forumEnabled ?? true}
                onChange={(e) => updateFeatureFlag('forumEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsForum')}
              </span>
            </label>

            {/* Health Analytics */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.healthAnalyticsEnabled ?? true}
                onChange={(e) => updateFeatureFlag('healthAnalyticsEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsHealthAnalytics')}
              </span>
            </label>

            {/* Disputes */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.disputesEnabled ?? true}
                onChange={(e) => updateFeatureFlag('disputesEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsDisputes')}
              </span>
            </label>

            {/* Contributions */}
            <label class="flex items-center space-x-3 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors">
              <input
                type="checkbox"
                checked={formData().featureFlags?.contributionsEnabled ?? true}
                onChange={(e) => updateFeatureFlag('contributionsEnabled', e.currentTarget.checked)}
                class="w-5 h-5 text-ocean-600 bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer"
              />
              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                {t('featureFlagsContributions')}
              </span>
            </label>
          </div>
        </div>
      </Collapsible>

      <Button type="submit" loading={createCommunity.isPending} class="w-full">
        {t('createButton')}
      </Button>

      <Show when={createCommunity.error}>
        <p class="text-red-500 text-sm">
          {t('errorPrefix')} {createCommunity.error?.message}
        </p>
      </Show>
    </form>
  );
};
