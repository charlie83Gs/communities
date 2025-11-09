import { Component, createSignal, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { ItemSelector } from '@/components/features/items/ItemSelector';
import { useCreatePool } from '@/hooks/queries/usePools';
import type { CreatePoolRequest, DistributionType } from '@/types/pools.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolCreateFormDict } from './PoolCreateForm.i18n';

interface PoolCreateFormProps {
  communityId: string;
  managedCouncils: Array<{ id: string; name: string }>;
  onCreated?: (poolId: string) => void;
}

export const PoolCreateForm: Component<PoolCreateFormProps> = (props) => {
  const t = makeTranslator(poolCreateFormDict, 'poolCreateForm');
  const navigate = useNavigate();

  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [councilId, setCouncilId] = createSignal('');
  const [primaryItemId, setPrimaryItemId] = createSignal<string | undefined>(undefined);
  const [distributionType, setDistributionType] = createSignal<DistributionType>('manual');
  const [maxUnitsPerUser, setMaxUnitsPerUser] = createSignal<number | undefined>(undefined);
  const [minimumContribution, setMinimumContribution] = createSignal<number | undefined>(undefined);
  const [error, setError] = createSignal<string | null>(null);

  const createMutation = useCreatePool();

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!name().trim()) {
      setError(t('nameRequired'));
      return;
    }

    if (!councilId()) {
      setError(t('councilRequired'));
      return;
    }

    const dto: CreatePoolRequest = {
      name: name().trim(),
      description: description().trim() || '',
      primaryItemId: primaryItemId() || undefined,
      distributionType: distributionType(),
      maxUnitsPerUser: maxUnitsPerUser() || undefined,
      minimumContribution: minimumContribution() || undefined,
    };

    try {
      const pool = await createMutation.mutateAsync({
        communityId: props.communityId,
        councilId: councilId(),
        dto,
      });
      props.onCreated?.(pool.id);
      navigate(`/communities/${props.communityId}/pools/${pool.id}`);
    } catch (err: any) {
      setError(err?.message ?? t('createFailed'));
    }
  };

  return (
    <Card>
      <form class="p-6 space-y-6" onSubmit={onSubmit}>
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h2>

        <Show when={error()}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md text-sm">
            {error()}
          </div>
        </Show>

        {/* Pool Name */}
        <Input
          label={t('nameLabel')}
          placeholder={t('namePlaceholder')}
          value={name()}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          required
        />

        {/* Description */}
        <div>
          <Textarea
            label={t('descriptionLabel')}
            placeholder={t('descriptionPlaceholder')}
            value={description()}
            onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
            rows={4}
          />
        </div>

        {/* Council Selector */}
        <div>
          <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
            {t('councilLabel')} <span class="text-danger-600">*</span>
          </label>
          <select
            class="w-full border rounded-md px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            value={councilId()}
            onChange={(e) => setCouncilId((e.target as HTMLSelectElement).value)}
            required
          >
            <option value="">{t('councilPlaceholder')}</option>
            <For each={props.managedCouncils}>
              {(council) => <option value={council.id}>{council.name}</option>}
            </For>
          </select>
        </div>

        {/* Primary Item */}
        <div>
          <label class="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
            {t('primaryItemLabel')}
          </label>
          <ItemSelector
            communityId={props.communityId}
            selectedItemId={primaryItemId()}
            onChange={(itemId) => setPrimaryItemId(itemId || undefined)}
            canManageItems={false}
          />
        </div>

        {/* Distribution Type */}
        <div>
          <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
            {t('distributionTypeLabel')}
          </label>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input
                type="radio"
                name="distributionType"
                value="manual"
                checked={distributionType() === 'manual'}
                onChange={() => setDistributionType('manual')}
                class="text-ocean-600 focus:ring-ocean-500"
              />
              <span class="text-sm text-stone-900 dark:text-stone-100">{t('manual')}</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="radio"
                name="distributionType"
                value="needs_based"
                checked={distributionType() === 'needs_based'}
                onChange={() => setDistributionType('needs_based')}
                class="text-ocean-600 focus:ring-ocean-500"
              />
              <span class="text-sm text-stone-900 dark:text-stone-100">{t('needsBased')}</span>
            </label>
          </div>
        </div>

        {/* Max Units Per User */}
        <Input
          label={t('maxUnitsPerUserLabel')}
          type="number"
          min="1"
          value={maxUnitsPerUser() ?? ''}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            setMaxUnitsPerUser(val ? Number(val) : undefined);
          }}
        />

        {/* Minimum Contribution */}
        <Input
          label={t('minimumContributionLabel')}
          type="number"
          min="1"
          value={minimumContribution() ?? ''}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            setMinimumContribution(val ? Number(val) : undefined);
          }}
        />

        {/* Actions */}
        <div class="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t('creating') : t('createPool')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/communities/${props.communityId}/pools`)}
          >
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
