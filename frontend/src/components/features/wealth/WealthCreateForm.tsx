import { Component, createMemo, createSignal, Show } from 'solid-js';
import { wealthService } from '@/services/api/wealth.service';
import { useCreateWealthMutation } from '@/hooks/queries/useWealth';
import type { CreateWealthDto, WealthDurationType, RecurrentFrequency } from '@/types/wealth.types';
import type { ItemKind } from '@/types/items.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { imagesService } from '@/services/api/images.service';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { ItemSelector } from '@/components/features/items/ItemSelector';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthCreateFormDict } from '@/components/features/wealth/WealthCreateForm.i18n';
import { useSearchItems } from '@/hooks/queries/useItems';

interface WealthCreateFormProps {
  communityId: string;
  canManageItems?: boolean;
  onCreated?: () => void;
}

export const WealthCreateForm: Component<WealthCreateFormProps> = (props) => {
  const t = makeTranslator(wealthCreateFormDict, 'wealthCreateForm');

  // Item type filter state
  const [itemTypeFilter, setItemTypeFilter] = createSignal<ItemKind | 'all'>('all');

  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [durationType, setDurationType] = createSignal<WealthDurationType>('unlimited');
  const [endDate, setEndDate] = createSignal<string | undefined>(undefined);
  const [unitsAvailable, setUnitsAvailable] = createSignal<number>(1); // Default to 1
  const [maxUnitsPerUser, setMaxUnitsPerUser] = createSignal<number | undefined>(undefined);
  const [automationEnabled, setAutomationEnabled] = createSignal(false);
  const [itemId, setItemId] = createSignal<string>('');

  // Recurrent service state
  const [isRecurrent, setIsRecurrent] = createSignal(false);
  const [recurrentFrequency, setRecurrentFrequency] = createSignal<RecurrentFrequency>('weekly');
  const [recurrentReplenishValue, setRecurrentReplenishValue] = createSignal<number | undefined>(undefined);

  // Image upload state
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = createSignal<string | undefined>(undefined);
  const [isUploading, setIsUploading] = createSignal(false);

  const [error, setError] = createSignal<string | null>(null);

  // Query all items to get the selected item's kind
  const items = useSearchItems(
    () => props.communityId,
    () => '',
    () => itemTypeFilter() === 'all' ? undefined : itemTypeFilter()
  );

  // Get the selected item's kind
  const selectedItemKind = createMemo<ItemKind | undefined>(() => {
    const id = itemId();
    if (!id || !items.data) return undefined;
    const item = items.data.find(i => i.id === id);
    return item?.kind;
  });

  const isTimebound = createMemo(() => durationType() === 'timebound');
  const isService = createMemo(() => selectedItemKind() === 'service');

  const createMutation = useCreateWealthMutation();

  const onPickFile = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0] || null;
    setSelectedFile(file);
    // reset previously uploaded filename if picking a new file
    if (file) setUploadedFilename(undefined);
  };

  const onUploadImage = async () => {
    const file = selectedFile();
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await imagesService.upload(file);
      setUploadedFilename(uploaded.filename);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onRemoveImage = () => {
    setSelectedFile(null);
    setUploadedFilename(undefined);
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    // Simple client validation
    if (!title().trim()) {
      setError(t('titleRequired'));
      return;
    }
    if (!itemId()) {
      setError('Item is required');
      return;
    }
    if (isTimebound() && !endDate()) {
      setError(t('endDateRequired'));
      return;
    }
    if (unitsAvailable() == null || Number.isNaN(unitsAvailable()) || unitsAvailable() < 1) {
      setError(t('unitsRequired'));
      return;
    }

    // Validate recurrent service fields
    if (isRecurrent()) {
      if (!isService()) {
        setError('Recurrent is only available for services');
        return;
      }
      if (recurrentReplenishValue() == null || Number.isNaN(recurrentReplenishValue()!)) {
        setError(t('replenishValueRequired'));
        return;
      }
      if (recurrentReplenishValue()! <= 0) {
        setError(t('replenishValuePositive'));
        return;
      }
    }

    // If a file was selected but not yet uploaded, upload it now before creating the share
    let imageFilename = uploadedFilename();
    if (!imageFilename && selectedFile()) {
      try {
        setIsUploading(true);
        const uploaded = await imagesService.upload(selectedFile()!);
        imageFilename = uploaded.filename;
        setUploadedFilename(imageFilename);
      } catch (e: any) {
        setError(e?.message ?? t('imageUploadFailed'));
        setIsUploading(false);
        return; // stop submit if image upload failed
      } finally {
        setIsUploading(false);
      }
    }

    const dto: CreateWealthDto = {
      communityId: props.communityId,
      title: title().trim(),
      description: description().trim() || undefined,
      image: imageFilename || undefined,
      durationType: durationType(),
      endDate: isTimebound() ? new Date(endDate()!).toISOString() : undefined,
      // Don't send distributionType - backend handles it
      unitsAvailable: Number(unitsAvailable()),
      maxUnitsPerUser: maxUnitsPerUser() ? Number(maxUnitsPerUser()) : undefined,
      automationEnabled: automationEnabled() || undefined,
      itemId: itemId(),
      // Recurrent fields (only if enabled)
      isRecurrent: isRecurrent() || undefined,
      recurrentFrequency: isRecurrent() ? recurrentFrequency() : undefined,
      recurrentReplenishValue: isRecurrent() ? Number(recurrentReplenishValue()) : undefined,
    };

    try {
      await createMutation.mutateAsync(dto);
      // reset form
      setTitle('');
      setDescription('');
      setDurationType('unlimited');
      setEndDate(undefined);
      setUnitsAvailable(1);
      setMaxUnitsPerUser(undefined);
      setAutomationEnabled(false);
      setItemId('');
      setIsRecurrent(false);
      setRecurrentFrequency('weekly');
      setRecurrentReplenishValue(undefined);
      setItemTypeFilter('all');
      // reset image state
      setSelectedFile(null);
      setUploadedFilename(undefined);
      props.onCreated?.();
    } catch (err: any) {
      setError(err?.message ?? t('createFailed'));
    }
  };

  return (
    <Card class="mb-6">
      <form class="p-4 space-y-4" onSubmit={onSubmit}>
        <h3 class="text-lg font-semibold">{t('title')}</h3>

        <Show when={error()}>
          <div class="text-red-600 text-sm">{error()}</div>
        </Show>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item Type Filter */}
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">{t('itemTypeFilterLabel')}</label>
            <select
              class="w-full border rounded px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              value={itemTypeFilter()}
              onChange={(e) => setItemTypeFilter((e.target as HTMLSelectElement).value as ItemKind | 'all')}
            >
              <option value="all">{t('allItems')}</option>
              <option value="object">{t('objectsOnly')}</option>
              <option value="service">{t('servicesOnly')}</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <ItemSelector
              communityId={props.communityId}
              selectedItemId={itemId()}
              kind={itemTypeFilter() === 'all' ? undefined : itemTypeFilter()}
              canManageItems={props.canManageItems ?? false}
              onChange={setItemId}
              error={!itemId() && error() ? 'Item is required' : undefined}
            />
          </div>

          <div class="md:col-span-2">
            <Input
              label={t('titleLabel')}
              placeholder={t('titlePlaceholder')}
              value={title()}
              onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">{t('descriptionLabel')}</label>
            <textarea
              class="w-full border rounded px-3 py-2"
              rows={3}
              placeholder={t('descriptionPlaceholder')}
              value={description()}
              onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">{t('imageLabel')}</label>
            <div class="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={onPickFile}
              />
              <div class="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onUploadImage}
                  disabled={!selectedFile() || isUploading()}
                >
                  {isUploading() ? t('uploading') : t('uploadImage')}
                </Button>
                <Show when={selectedFile() || uploadedFilename()}>
                  <Button type="button" variant="danger" onClick={onRemoveImage}>
                    {t('remove')}
                  </Button>
                </Show>
              </div>
              <Show when={uploadedFilename()}>
                <div class="text-xs text-green-600">
                  {t('uploadedAs').replace('{{filename}}', uploadedFilename()!)}
                </div>
              </Show>
              <Show when={uploadedFilename()}>
                <CredentialedImage
                  src={imagesService.url(uploadedFilename())!}
                  alt="Uploaded preview"
                  class="max-h-40 rounded border"
                  fallbackText={t('unableToPreview')}
                />
              </Show>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{t('durationLabel')}</label>
            <select
              class="w-full border rounded px-3 py-2"
              value={durationType()}
              onChange={(e) => setDurationType((e.target as HTMLSelectElement).value as WealthDurationType)}
            >
              <option value="unlimited">{t('unlimited')}</option>
              <option value="timebound">{t('timebound')}</option>
            </select>
          </div>

          <Show when={isTimebound()}>
            <div>
              <label class="block text-sm font-medium mb-1">{t('endDateLabel')}</label>
              <input
                type="datetime-local"
                class="w-full border rounded px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                value={endDate() ?? ''}
                onInput={(e) => setEndDate((e.target as HTMLInputElement).value)}
              />
            </div>
          </Show>

          {/* Units fields - always shown, default to 1 */}
          <div>
            <Input
              label={t('unitsAvailableLabel')}
              type="number"
              min="1"
              value={unitsAvailable()}
              onInput={(e) => setUnitsAvailable(Number((e.target as HTMLInputElement).value))}
              required
            />
          </div>

          <div>
            <Input
              label={t('maxUnitsPerUserLabel')}
              type="number"
              min="1"
              value={maxUnitsPerUser() ?? ''}
              onInput={(e) => setMaxUnitsPerUser(Number((e.target as HTMLInputElement).value))}
            />
          </div>

          {/* Recurrent Service Options - only for services */}
          <Show when={isService()}>
            <div class="md:col-span-2 border-t border-stone-200 dark:border-stone-700 pt-4 mt-2">
              <div class="flex items-center gap-2 mb-3">
                <input
                  id="recurrent-service"
                  type="checkbox"
                  class="h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                  checked={isRecurrent()}
                  onChange={(e) => setIsRecurrent((e.target as HTMLInputElement).checked)}
                />
                <label for="recurrent-service" class="text-sm font-medium">
                  {t('recurrentServiceLabel')}
                </label>
              </div>

              <Show when={isRecurrent()}>
                <div class="pl-6 space-y-3">
                  <p class="text-xs text-stone-600 dark:text-stone-400 mb-3">
                    {t('recurrentServiceHelp')}
                  </p>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-1">{t('frequencyLabel')}</label>
                      <select
                        class="w-full border rounded px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        value={recurrentFrequency()}
                        onChange={(e) => setRecurrentFrequency((e.target as HTMLSelectElement).value as RecurrentFrequency)}
                      >
                        <option value="weekly">{t('weekly')}</option>
                        <option value="monthly">{t('monthly')}</option>
                      </select>
                    </div>

                    <div>
                      <Input
                        label={t('replenishValueLabel')}
                        type="number"
                        min="1"
                        value={recurrentReplenishValue() ?? ''}
                        onInput={(e) => setRecurrentReplenishValue(Number((e.target as HTMLInputElement).value))}
                        required
                      />
                    </div>
                  </div>

                  <Show when={recurrentReplenishValue()}>
                    <p class="text-xs text-ocean-600 dark:text-ocean-400 italic">
                      {t('recurrentExample')
                        .replace('{{units}}', String(recurrentReplenishValue()))
                        .replace('{{frequency}}', recurrentFrequency() === 'weekly' ? t('weekly').toLowerCase() : t('monthly').toLowerCase())}
                    </p>
                  </Show>
                </div>
              </Show>
            </div>
          </Show>

          <div class="md:col-span-2 flex items-center gap-2">
            <input
              id="automation"
              type="checkbox"
              class="h-4 w-4"
              checked={automationEnabled()}
              onChange={(e) => setAutomationEnabled((e.target as HTMLInputElement).checked)}
            />
            <label for="automation" class="text-sm">{t('enableAutomation')}</label>
          </div>
        </div>

        <div class="pt-2">
          <Button type="submit" disabled={createMutation.isPending || isUploading()}>
            {createMutation.isPending || isUploading() ? t('creating') : t('shareWealth')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WealthCreateForm;
