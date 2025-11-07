import { Component, createMemo, createSignal, Show } from 'solid-js';
import { wealthService } from '@/services/api/wealth.service';
import { useUpdateWealthMutation } from '@/hooks/queries/useWealth';
import type { UpdateWealthDto, WealthDistributionType, WealthDurationType } from '@/types/wealth.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { imagesService } from '@/services/api/images.service';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { ItemSelector } from '@/components/features/items/ItemSelector';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthEditFormDict } from '@/components/features/wealth/WealthEditForm.i18n';

interface WealthEditFormProps {
  wealth: any; // Wealth object
  canManageItems?: boolean;
  onUpdated?: () => void;
  onCancel?: () => void;
}

export const WealthEditForm: Component<WealthEditFormProps> = (props) => {
  const t = makeTranslator(wealthEditFormDict, 'wealthEditForm');

  const [title, setTitle] = createSignal(props.wealth.title || '');
  const [description, setDescription] = createSignal(props.wealth.description || '');
  const [itemId, setItemId] = createSignal<string>(props.wealth.itemId || '');
  // Note: type, durationType, and distributionType are immutable and read-only
  const [endDate, setEndDate] = createSignal<string | undefined>(props.wealth.endDate ? new Date(props.wealth.endDate).toISOString().slice(0, 16) : undefined);
  const [unitsAvailable, setUnitsAvailable] = createSignal<number | undefined>(props.wealth.unitsAvailable);
  const [maxUnitsPerUser, setMaxUnitsPerUser] = createSignal<number | undefined>(props.wealth.maxUnitsPerUser);
  const [automationEnabled, setAutomationEnabled] = createSignal(props.wealth.automationEnabled || false);

  // Image upload state
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = createSignal<string | undefined>(props.wealth.image);
  const [isUploading, setIsUploading] = createSignal(false);

  const [error, setError] = createSignal<string | null>(null);

  const isTimebound = createMemo(() => props.wealth.durationType === 'timebound');
  const isUnitBased = createMemo(() => props.wealth.distributionType === 'unit_based');

  const updateMutation = useUpdateWealthMutation();

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
    if (isUnitBased() && (unitsAvailable() == null || Number.isNaN(unitsAvailable()!))) {
      setError(t('unitsRequired'));
      return;
    }

    // If a file was selected but not yet uploaded, upload it now before updating the share
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

    const dto: UpdateWealthDto = {
      title: title().trim(),
      description: description().trim() || undefined,
      image: imageFilename || undefined,
      endDate: isTimebound() ? new Date(endDate()!).toISOString() : undefined,
      unitsAvailable: isUnitBased() ? Number(unitsAvailable()) : undefined,
      maxUnitsPerUser: isUnitBased() ? (maxUnitsPerUser() ? Number(maxUnitsPerUser()) : undefined) : undefined,
      automationEnabled: automationEnabled() || undefined,
      itemId: itemId(),
    };

    try {
      await updateMutation.mutateAsync({ id: props.wealth.id, dto });
      props.onUpdated?.();
    } catch (err: any) {
      setError(err?.message ?? t('updateFailed'));
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
          <div class="md:col-span-2">
            <ItemSelector
              communityId={props.wealth.communityId}
              selectedItemId={itemId()}
              kind={props.wealth.item?.kind}
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
                  {t('image').replace('{{filename}}', uploadedFilename()!)}
                </div>
              </Show>
              <Show when={uploadedFilename()}>
                <CredentialedImage
                  src={imagesService.url(uploadedFilename())!}
                  alt="Image preview"
                  class="max-h-40 rounded border"
                  fallbackText={t('unableToPreview')}
                />
              </Show>
            </div>
          </div>

          {/* Duration Type - Read-only (immutable) */}
          <div>
            <label class="block text-sm font-medium mb-1">{t('durationLabel')}</label>
            <div class="w-full border rounded px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              {props.wealth.durationType === 'unlimited' ? t('unlimited') : t('timebound')}
              <span class="text-xs ml-2">({t('immutable', 'Cannot be changed')})</span>
            </div>
          </div>

          <Show when={isTimebound()}>
            <div>
              <label class="block text-sm font-medium mb-1">{t('endDateLabel')}</label>
              <input
                type="datetime-local"
                class="w-full border rounded px-3 py-2"
                value={endDate() ?? ''}
                onInput={(e) => setEndDate((e.target as HTMLInputElement).value)}
              />
            </div>
          </Show>

          {/* Distribution Type - Read-only (immutable) */}
          <div>
            <label class="block text-sm font-medium mb-1">{t('distributionLabel')}</label>
            <div class="w-full border rounded px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              {props.wealth.distributionType === 'request_based' ? t('requestBased') : t('unitBased')}
              <span class="text-xs ml-2">({t('immutable', 'Cannot be changed')})</span>
            </div>
          </div>

          <Show when={isUnitBased()}>
            <div>
              <Input
                label={t('unitsAvailableLabel')}
                type="number"
                min="1"
                value={unitsAvailable() ?? ''}
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

        <div class="flex gap-2 pt-2">
          <Button type="submit" variant="primary" disabled={updateMutation.isPending || isUploading()}>
            {updateMutation.isPending || isUploading() ? t('updating') : t('updateShare')}
          </Button>
          <Show when={props.onCancel}>
            <Button type="button" variant="secondary" onClick={props.onCancel}>
              {t('cancel')}
            </Button>
          </Show>
        </div>
      </form>
    </Card>
  );
};

export default WealthEditForm;
