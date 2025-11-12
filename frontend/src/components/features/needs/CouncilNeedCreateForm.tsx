import { Component, createMemo, createSignal, Show, For } from 'solid-js';
import { useCreateCouncilNeedMutation } from '@/hooks/queries/useNeeds';
import type { CreateCouncilNeedDto, NeedPriority, NeedRecurrence } from '@/types/needs.types';
import type { ItemKind } from '@/types/items.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ItemSelector } from '@/components/features/items/ItemSelector';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilNeedCreateFormDict } from '@/components/features/needs/CouncilNeedCreateForm.i18n';

interface Council {
  id: string;
  name: string;
  communityId: string;
}

interface CouncilNeedCreateFormProps {
  communityId: string;
  managedCouncils: Council[]; // Councils that the user can manage
  canManageItems?: boolean;
  onCreated?: () => void;
}

export const CouncilNeedCreateForm: Component<CouncilNeedCreateFormProps> = (props) => {
  const t = makeTranslator(councilNeedCreateFormDict, 'councilNeedCreateForm');

  // Item type filter state
  const [itemTypeFilter, setItemTypeFilter] = createSignal<ItemKind | 'all'>('all');

  const [councilId, setCouncilId] = createSignal<string>('');
  const [itemId, setItemId] = createSignal<string>('');
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [priority, setPriority] = createSignal<NeedPriority>('need');
  const [unitsNeeded, setUnitsNeeded] = createSignal<number>(1);
  const [isRecurring, setIsRecurring] = createSignal(false);
  const [recurrence, setRecurrence] = createSignal<NeedRecurrence>('weekly');

  const [error, setError] = createSignal<string | null>(null);

  const createMutation = useCreateCouncilNeedMutation();

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    // Client validation
    if (!councilId()) {
      setError(t('councilRequired'));
      return;
    }
    if (!title().trim()) {
      setError(t('titleRequired'));
      return;
    }
    if (!itemId()) {
      setError(t('itemRequired'));
      return;
    }
    if (unitsNeeded() < 1 || Number.isNaN(unitsNeeded())) {
      setError(t('unitsRequired'));
      return;
    }
    if (isRecurring() && !recurrence()) {
      setError(t('recurrenceRequired'));
      return;
    }

    const dto: CreateCouncilNeedDto = {
      councilId: councilId(),
      communityId: props.communityId,
      itemId: itemId(),
      title: title().trim(),
      description: description().trim() || undefined,
      priority: priority(),
      unitsNeeded: Number(unitsNeeded()),
      isRecurring: isRecurring(),
      recurrence: isRecurring() ? recurrence() : undefined,
    };

    try {
      await createMutation.mutateAsync(dto);
      // Reset form
      setCouncilId('');
      setItemId('');
      setTitle('');
      setDescription('');
      setPriority('need');
      setUnitsNeeded(1);
      setIsRecurring(false);
      setRecurrence('weekly');
      setItemTypeFilter('all');
      props.onCreated?.();
    } catch (err: any) {
      setError(err?.message ?? t('createFailed'));
    }
  };

  const frequencyLabel = createMemo(() => {
    const freq = recurrence();
    if (freq === 'daily') return t('daily').toLowerCase();
    if (freq === 'weekly') return t('weekly').toLowerCase();
    if (freq === 'monthly') return t('monthly').toLowerCase();
    return '';
  });

  return (
    <Card class="mb-6">
      <form class="p-4 space-y-4" onSubmit={onSubmit}>
        <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('title')}</h3>

        <Show when={error()}>
          <div class="text-red-600 text-sm">{error()}</div>
        </Show>

        <Show
          when={props.managedCouncils.length > 0}
          fallback={
            <div class="p-4 bg-stone-100 dark:bg-stone-800 rounded text-stone-600 dark:text-stone-400">
              {t('noCouncils')}
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Council Selector */}
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1 text-stone-900 dark:text-stone-100">
                {t('councilLabel')}
              </label>
              <select
                class="w-full border rounded px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
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

            {/* Item Type Filter */}
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1 text-stone-900 dark:text-stone-100">
                {t('itemTypeFilterLabel')}
              </label>
              <select
                class="w-full border rounded px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                value={itemTypeFilter()}
                onChange={(e) =>
                  setItemTypeFilter((e.target as HTMLSelectElement).value as ItemKind | 'all')
                }
              >
                <option value="all">{t('allItems')}</option>
                <option value="object">{t('objectsOnly')}</option>
                <option value="service">{t('servicesOnly')}</option>
              </select>
            </div>

            {/* Item Selector */}
            <div class="md:col-span-2">
              <ItemSelector
                communityId={props.communityId}
                selectedItemId={itemId()}
                kind={itemTypeFilter() === 'all' ? undefined : (itemTypeFilter() as 'object' | 'service')}
                canManageItems={props.canManageItems ?? false}
                onChange={setItemId}
                error={!itemId() && error() ? t('itemRequired') : undefined}
              />
            </div>

            {/* Title */}
            <div class="md:col-span-2">
              <Input
                label={t('titleLabel')}
                placeholder={t('titlePlaceholder')}
                value={title()}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                required
              />
            </div>

            {/* Description */}
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-1 text-stone-900 dark:text-stone-100">
                {t('descriptionLabel')}
              </label>
              <textarea
                class="w-full border rounded px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                rows={3}
                placeholder={t('descriptionPlaceholder')}
                value={description()}
                onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
              />
            </div>

            {/* Priority */}
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2 text-stone-900 dark:text-stone-100">
                {t('priorityLabel')}
              </label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="council-priority"
                    value="need"
                    checked={priority() === 'need'}
                    onChange={() => setPriority('need')}
                    class="h-4 w-4 text-danger-600 focus:ring-danger-500"
                  />
                  <span class="text-sm text-stone-900 dark:text-stone-100">
                    {t('need')}{' '}
                    <span class="text-xs text-stone-600 dark:text-stone-400">
                      ({t('needHelp')})
                    </span>
                  </span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="council-priority"
                    value="want"
                    checked={priority() === 'want'}
                    onChange={() => setPriority('want')}
                    class="h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                  />
                  <span class="text-sm text-stone-900 dark:text-stone-100">
                    {t('want')}{' '}
                    <span class="text-xs text-stone-600 dark:text-stone-400">
                      ({t('wantHelp')})
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Units Needed */}
            <div>
              <Input
                label={t('unitsNeededLabel')}
                type="number"
                min="1"
                placeholder={t('unitsNeededPlaceholder')}
                value={unitsNeeded()}
                onInput={(e) => setUnitsNeeded(Number((e.target as HTMLInputElement).value))}
                required
              />
            </div>

            {/* Recurring Section */}
            <div class="md:col-span-2 border-t border-stone-200 dark:border-stone-700 pt-4 mt-2">
              <div class="flex items-center gap-2 mb-3">
                <input
                  id="council-recurring-need"
                  type="checkbox"
                  class="h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                  checked={isRecurring()}
                  onChange={(e) => setIsRecurring((e.target as HTMLInputElement).checked)}
                />
                <label
                  for="council-recurring-need"
                  class="text-sm font-medium text-stone-900 dark:text-stone-100"
                >
                  {t('recurringLabel')}
                </label>
              </div>

              <Show when={isRecurring()}>
                <div class="pl-6 space-y-3">
                  <p class="text-xs text-stone-600 dark:text-stone-400 mb-3">
                    {t('recurringHelp')}
                  </p>

                  <div>
                    <label class="block text-sm font-medium mb-1 text-stone-900 dark:text-stone-100">
                      {t('recurrenceLabel')}
                    </label>
                    <select
                      class="w-full md:w-1/2 border rounded px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      value={recurrence()}
                      onChange={(e) =>
                        setRecurrence((e.target as HTMLSelectElement).value as NeedRecurrence)
                      }
                    >
                      <option value="daily">{t('daily')}</option>
                      <option value="weekly">{t('weekly')}</option>
                      <option value="monthly">{t('monthly')}</option>
                    </select>
                  </div>

                  <Show when={unitsNeeded()}>
                    <p class="text-xs text-ocean-600 dark:text-ocean-400 italic">
                      {t('recurrentExample')
                        .replace('{{units}}', String(unitsNeeded()))
                        .replace('{{frequency}}', frequencyLabel())}
                    </p>
                  </Show>
                </div>
              </Show>
            </div>
          </div>

          <div class="pt-2 flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('creating') : t('submit')}
            </Button>
            <Show when={props.onCreated}>
              <Button type="button" variant="secondary" onClick={() => props.onCreated?.()}>
                {t('cancel')}
              </Button>
            </Show>
          </div>
        </Show>
      </form>
    </Card>
  );
};

export default CouncilNeedCreateForm;
