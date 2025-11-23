import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { useCreateUsageReportMutation, useAddAttachmentMutation } from '@/hooks/queries/useUsageReports';
import { useItems } from '@/hooks/queries/useItems';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { renderMarkdown } from '@/utils/markdown';
import { makeTranslator } from '@/i18n/makeTranslator';
import { createUsageReportDict } from './CreateUsageReportModal.i18n';
import type { ReportItemDto } from '@/types/council.types';
import type { ItemListItem } from '@/types/items.types';

interface CreateUsageReportModalProps {
  communityId: string;
  councilId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PendingFile {
  file: File;
  id: string;
}

interface SelectedItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

export const CreateUsageReportModal: Component<CreateUsageReportModalProps> = (props) => {
  const t = makeTranslator(createUsageReportDict, 'createUsageReport');

  const [title, setTitle] = createSignal('');
  const [content, setContent] = createSignal('');
  const [showPreview, setShowPreview] = createSignal(false);
  const [error, setError] = createSignal('');
  const [pendingFiles, setPendingFiles] = createSignal<PendingFile[]>([]);
  const [selectedItems, setSelectedItems] = createSignal<SelectedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = createSignal('');
  const [itemQuantity, setItemQuantity] = createSignal(1);

  const createReportMutation = useCreateUsageReportMutation();
  const addAttachmentMutation = useAddAttachmentMutation();

  // Fetch community items
  const itemsQuery = useItems(() => props.communityId);

  // Filter out already selected items
  const availableItems = createMemo(() => {
    if (!itemsQuery.data) return [];
    const selectedIds = new Set(selectedItems().map(item => item.itemId));
    return itemsQuery.data.filter((item: ItemListItem) => !selectedIds.has(item.id));
  });

  const handleAddItem = () => {
    const itemId = selectedItemId();
    const quantity = itemQuantity();

    if (!itemId || quantity < 1) return;

    const item = itemsQuery.data?.find((i: ItemListItem) => i.id === itemId);
    if (!item) return;

    setSelectedItems((prev) => [
      ...prev,
      {
        itemId: item.id,
        itemName: item.name || 'Unnamed Item',
        quantity,
      },
    ]);

    // Reset selection
    setSelectedItemId('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setShowPreview(false);
    setError('');
    setPendingFiles([]);
    setSelectedItems([]);
    setSelectedItemId('');
    setItemQuantity(1);
  };

  const handleClose = () => {
    resetForm();
    props.onClose();
  };

  const handleFileSelect = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    const newFiles: PendingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      newFiles.push({
        file: files[i],
        id: crypto.randomUUID(),
      });
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
    input.value = '';
  };

  const removeFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    const titleValue = title().trim();
    const contentValue = content().trim();

    if (!titleValue) {
      setError(t('titleRequired'));
      return;
    }

    if (!contentValue) {
      setError(t('contentRequired'));
      return;
    }

    try {
      // Prepare items for submission
      const items: ReportItemDto[] = selectedItems().map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      // Create the report first
      const report = await createReportMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        dto: {
          title: titleValue,
          content: contentValue,
          items: items.length > 0 ? items : undefined,
        },
      });

      // Then upload attachments
      const files = pendingFiles();
      for (const pendingFile of files) {
        try {
          await addAttachmentMutation.mutateAsync({
            communityId: props.communityId,
            councilId: props.councilId,
            reportId: report.id,
            file: pendingFile.file,
          });
        } catch (uploadError) {
          console.error('Failed to upload attachment:', uploadError);
        }
      }

      handleClose();
    } catch (err) {
      console.error('Failed to create report:', err);
      setError(t('createError'));
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-stone-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div class="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 p-6 z-10">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {t('title')}
              </h2>
              <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
                {t('description')}
              </p>
            </div>
            <button
              onClick={handleClose}
              class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} class="p-6 space-y-4">
          <Show when={error()}>
            <div class="p-3 bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-200 rounded-md text-sm">
              {error()}
            </div>
          </Show>

          {/* Title */}
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              {t('reportTitle')} <span class="text-danger-600">*</span>
            </label>
            <input
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder={t('titlePlaceholder')}
              class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
          </div>

          {/* Content */}
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                {t('content')} <span class="text-danger-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((p) => !p)}
                class="text-xs text-ocean-600 dark:text-ocean-400 hover:underline"
              >
                {showPreview() ? t('hidePreview') : t('showPreview')}
              </button>
            </div>
            <Show
              when={!showPreview()}
              fallback={
                <div
                  class="min-h-[200px] p-3 border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 rounded-md prose dark:prose-invert max-w-none"
                  innerHTML={renderMarkdown(content())}
                />
              }
            >
              <textarea
                value={content()}
                onInput={(e) => setContent(e.currentTarget.value)}
                placeholder={t('contentPlaceholder')}
                rows={10}
                class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 resize-vertical font-mono text-sm"
              />
            </Show>
          </div>

          {/* Items Used */}
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              {t('itemsUsed')}
            </label>

            {/* Item selection row */}
            <div class="flex gap-2 mb-2">
              <select
                value={selectedItemId()}
                onChange={(e) => setSelectedItemId(e.currentTarget.value)}
                class="flex-1 px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 text-sm"
                disabled={itemsQuery.isLoading}
              >
                <option value="">
                  {itemsQuery.isLoading ? t('loadingItems') : t('selectItem')}
                </option>
                <For each={availableItems()}>
                  {(item) => (
                    <option value={item.id}>{item.name || 'Unnamed Item'}</option>
                  )}
                </For>
              </select>
              <input
                type="number"
                min="1"
                value={itemQuantity()}
                onInput={(e) => setItemQuantity(Math.max(1, parseInt(e.currentTarget.value) || 1))}
                class="w-20 px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 text-sm"
                placeholder={t('quantity')}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                disabled={!selectedItemId()}
              >
                {t('addItem')}
              </Button>
            </div>

            {/* Selected items list */}
            <Show
              when={selectedItems().length > 0}
              fallback={
                <p class="text-sm text-stone-500 dark:text-stone-400 italic">
                  {t('noItemsAdded')}
                </p>
              }
            >
              <div class="space-y-2">
                <For each={selectedItems()}>
                  {(item) => (
                    <div class="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-800 rounded">
                      <Icon name="items" size={16} class="text-stone-400" />
                      <span class="flex-1 text-sm">
                        {item.itemName}
                      </span>
                      <span class="text-sm font-medium text-stone-600 dark:text-stone-400">
                        x{item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.itemId)}
                        class="p-1 text-danger-500 hover:text-danger-700"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          {/* Attachments */}
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              {t('attachments')}
            </label>
            <div class="space-y-2">
              {/* File list */}
              <Show when={pendingFiles().length > 0}>
                <div class="space-y-2">
                  <For each={pendingFiles()}>
                    {(pendingFile) => (
                      <div class="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-800 rounded">
                        <Icon name="document" size={16} class="text-stone-400" />
                        <span class="flex-1 text-sm truncate">
                          {pendingFile.file.name}
                        </span>
                        <span class="text-xs text-stone-500">
                          {formatFileSize(pendingFile.file.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(pendingFile.id)}
                          class="p-1 text-danger-500 hover:text-danger-700"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    )}
                  </For>
                </div>
              </Show>

              {/* File input */}
              <label class="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-md cursor-pointer hover:border-ocean-500 dark:hover:border-ocean-500 transition-colors">
                <Icon name="upload" size={20} class="text-stone-400" />
                <span class="text-sm text-stone-600 dark:text-stone-400">
                  {t('addAttachment')}
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  class="hidden"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div class="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
            <Button type="button" variant="secondary" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createReportMutation.isPending}
              disabled={!title().trim() || !content().trim()}
            >
              {createReportMutation.isPending ? t('creating') : t('submit')}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </Show>
  );
};
