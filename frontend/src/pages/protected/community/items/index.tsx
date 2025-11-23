import { Component, Show } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { useCanManageItemsQuery } from '@/hooks/queries/useCanManageItemsQuery';
import { ItemsManagementPanel } from '@/components/features/items/ItemsManagementPanel';
import { makeTranslator } from '@/i18n/makeTranslator';
import { itemsIndexDict } from './index.i18n';
import { Icon } from '@/components/common/Icon';

const ItemsIndexPage: Component = () => {
  const params = useParams<{ id: string }>();
  const t = makeTranslator(itemsIndexDict, 'itemsIndex');

  // Check if user can manage items
  const canManageQuery = useCanManageItemsQuery(() => params.id);

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Link */}
        <A
          href={`/communities/${params.id}/resources`}
          class="inline-flex items-center gap-1 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-4"
        >
          <span>←</span> {t('backToResources')}
        </A>

        {/* Header */}
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h1>
          <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">{t('subtitle')}</p>
        </div>

        {/* Loading State */}
        <Show when={canManageQuery.isLoading}>
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-center text-stone-600 dark:text-stone-400">
            {t('checkingPermissions')}
          </div>
        </Show>

        {/* Error State */}
        <Show when={canManageQuery.isError}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
            {t('error')}
          </div>
        </Show>

        {/* Permission Check */}
        <Show when={!canManageQuery.isLoading && !canManageQuery.isError}>
          <Show
            when={canManageQuery.data?.canManage}
            fallback={
              <div class="text-center py-12 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                <Icon name="lock" size={48} class="mx-auto mb-4 text-stone-400" />
                <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {t('permissionDenied')}
                </h3>
                <p class="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                  {t('permissionDeniedDescription')}
                </p>
              </div>
            }
          >
            <ItemsManagementPanel
              communityId={params.id}
              canManageItems={canManageQuery.data?.canManage ?? false}
            />
          </Show>
        </Show>
      </div>
    </>
  );
};

export default ItemsIndexPage;
