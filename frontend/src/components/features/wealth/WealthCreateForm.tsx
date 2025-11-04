import { Component, createMemo, createSignal, Show } from 'solid-js';
import { wealthService } from '@/services/api/wealth.service';
import { useCreateWealthMutation } from '@/hooks/queries/useWealth';
import type { CreateWealthDto, WealthDistributionType, WealthDurationType } from '@/types/wealth.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { imagesService } from '@/services/api/images.service';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { ItemSelector } from '@/components/features/items/ItemSelector';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthCreateFormDict } from '@/components/features/wealth/WealthCreateForm.i18n';

interface WealthCreateFormProps {
  communityId: string;
  canManageItems?: boolean;
  onCreated?: () => void;
}

export const WealthCreateForm: Component<WealthCreateFormProps> = (props) => {
  const t = makeTranslator(wealthCreateFormDict, 'wealthCreateForm');

  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [durationType, setDurationType] = createSignal<WealthDurationType>('unlimited');
  const [endDate, setEndDate] = createSignal<string | undefined>(undefined);
  const [distributionType, setDistributionType] = createSignal<WealthDistributionType>('request_based');
  const [unitsAvailable, setUnitsAvailable] = createSignal<number | undefined>(undefined);
  const [maxUnitsPerUser, setMaxUnitsPerUser] = createSignal<number | undefined>(undefined);
  const [automationEnabled, setAutomationEnabled] = createSignal(false);
  const [itemId, setItemId] = createSignal<string>('');

  // Image upload state
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = createSignal<string | undefined>(undefined);
  const [isUploading, setIsUploading] = createSignal(false);

  const [error, setError] = createSignal<string | null>(null);

  const isTimebound = createMemo(() => durationType() === 'timebound');
  const isUnitBased = createMemo(() => distributionType() === 'unit_based');

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
    if (isUnitBased() && (unitsAvailable() == null || Number.isNaN(unitsAvailable()!))) {
      setError(t('unitsRequired'));
      return;
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
      distributionType: distributionType(),
      unitsAvailable: isUnitBased() ? Number(unitsAvailable()) : undefined,
      maxUnitsPerUser: isUnitBased() ? (maxUnitsPerUser() ? Number(maxUnitsPerUser()) : undefined) : undefined,
      automationEnabled: automationEnabled() || undefined,
      itemId: itemId(),
    };

    try {
      await createMutation.mutateAsync(dto);
      // reset form
      setTitle('');
      setDescription('');
      setDurationType('unlimited');
      setEndDate(undefined);
      setDistributionType('request_based');
      setUnitsAvailable(undefined);
      setMaxUnitsPerUser(undefined);
      setAutomationEnabled(false);
      setItemId('');
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
          <div class="md:col-span-2">
            <ItemSelector
              communityId={props.communityId}
              selectedItemId={itemId()}
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
                class="w-full border rounded px-3 py-2"
                value={endDate() ?? ''}
                onInput={(e) => setEndDate((e.target as HTMLInputElement).value)}
              />
            </div>
          </Show>

          <div>
            <label class="block text-sm font-medium mb-1">{t('distributionLabel')}</label>
            <select
              class="w-full border rounded px-3 py-2"
              value={distributionType()}
              onChange={(e) => setDistributionType((e.target as HTMLSelectElement).value as WealthDistributionType)}
            >
              <option value="request_based">{t('requestBased')}</option>
              <option value="unit_based">{t('unitBased')}</option>
            </select>
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