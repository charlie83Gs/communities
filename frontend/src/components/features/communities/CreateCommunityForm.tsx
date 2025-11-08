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
    minTrustForDisputes: { type: 'number', value: 20 },
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
    minTrustToViewItems: { type: 'number', value: 0 },
    minTrustToViewDisputes: { type: 'number', value: 0 },
    minTrustToViewPolls: { type: 'number', value: 0 },
    minTrustToViewPools: { type: 'number', value: 0 },
    minTrustToViewCouncils: { type: 'number', value: 0 },
    minTrustToViewForum: { type: 'number', value: 0 },
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
                label={t('minTrustToViewDisputesLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustToViewDisputes;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 0).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustToViewDisputes', parseInt(e.currentTarget.value) || 0)}
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
                label={t('minTrustForDisputesLabel')}
                type="number"
                min="0"
                required
                value={(() => {
                  const req = formData().minTrustForDisputes;
                  return (req && typeof req === 'object' && 'value' in req ? req.value : 20).toString();
                })()}
                onInput={(e) => updateTrustRequirement('minTrustForDisputes', parseInt(e.currentTarget.value) || 20)}
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
