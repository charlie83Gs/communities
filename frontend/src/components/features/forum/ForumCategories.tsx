import { Component, Show, For, createSignal } from 'solid-js';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useCommunity } from '@/contexts/CommunityContext';
import { useForumCategoriesQuery, useCreateCategoryMutation } from '@/hooks/queries/useForumQueries';
import { makeTranslator } from '@/i18n/makeTranslator';
import { forumDict } from '@/pages/protected/community/forum.i18n';
import type { CreateCategoryDto } from '@/types/forum.types';

interface ForumCategoriesProps {
  communityId: string;
  onCategoryClick: (categoryId: string) => void;
}

export const ForumCategories: Component<ForumCategoriesProps> = (props) => {
  const t = makeTranslator(forumDict, 'forum');
  const { isAdmin } = useCommunity();
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [categoryName, setCategoryName] = createSignal('');
  const [categoryDescription, setCategoryDescription] = createSignal('');

  const categoriesQuery = useForumCategoriesQuery(() => props.communityId);
  const createCategoryMutation = useCreateCategoryMutation();

  const handleCreateCategory = async (e: Event) => {
    e.preventDefault();

    const data: CreateCategoryDto = {
      name: categoryName(),
      description: categoryDescription(),
    };

    try {
      await createCategoryMutation.mutateAsync({ communityId: props.communityId, data });
      setShowCreateModal(false);
      setCategoryName('');
      setCategoryDescription('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return t('categoryNoActivity');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div>
      {/* Header */}
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('categoriesTitle')}</h2>
          <Show when={isAdmin()}>
            <Button onClick={() => setShowCreateModal(true)}>{t('createCategoryButton')}</Button>
          </Show>
        </div>
      </div>

      {/* Categories List */}
      <Show
        when={!categoriesQuery.isLoading}
        fallback={
          <Card class="p-6">
            <div class="text-stone-600 dark:text-stone-300">{t('loading')}</div>
          </Card>
        }
      >
        <Show
          when={categoriesQuery.data?.categories && categoriesQuery.data.categories.length > 0}
          fallback={
            <Card class="p-8 text-center">
              <div class="text-stone-500 dark:text-stone-400">
                <h3 class="text-xl font-semibold mb-2">{t('noCategoriesTitle')}</h3>
                <p>{t('noCategoriesMessage')}</p>
              </div>
            </Card>
          }
        >
          <div class="space-y-3">
            <For each={categoriesQuery.data?.categories}>
              {(category) => (
                <button
                  onClick={() => props.onCategoryClick(category.id)}
                  class="w-full text-left"
                >
                  <Card class="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{category.name}</h3>
                        <Show when={category.description}>
                          <p class="text-stone-600 dark:text-stone-300 mb-3">{category.description}</p>
                        </Show>
                        <div class="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
                          <span>{t('categoryThreadCount').replace('{{count}}', category.threadCount.toString())}</span>
                          <span>{t('categoryLastActivity').replace('{{time}}', formatTimeAgo(category.lastActivity))}</span>
                        </div>
                      </div>
                      <div class="text-3xl ml-4">💬</div>
                    </div>
                  </Card>
                </button>
              )}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={categoriesQuery.isError}>
        <Card class="p-6 bg-danger-50 dark:bg-danger-900 border-danger-200 dark:border-danger-700">
          <p class="text-danger-800 dark:text-danger-200">{t('errorLoadingCategories')}</p>
        </Card>
      </Show>

      {/* Create Category Modal */}
      <Show when={showCreateModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-md w-full mx-4 border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('createCategoryModalTitle')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              >
                {t('modalClose')}
              </button>
            </div>

            <form onSubmit={handleCreateCategory} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t('categoryNameLabel')}
                </label>
                <input
                  type="text"
                  value={categoryName()}
                  onInput={(e) => setCategoryName(e.currentTarget.value)}
                  placeholder={t('categoryNamePlaceholder')}
                  required
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t('categoryDescriptionLabel')}
                </label>
                <textarea
                  value={categoryDescription()}
                  onInput={(e) => setCategoryDescription(e.currentTarget.value)}
                  placeholder={t('categoryDescriptionPlaceholder')}
                  rows={3}
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              <div class="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} type="button">
                  {t('modalCancel')}
                </Button>
                <Button type="submit" loading={createCategoryMutation.isPending}>
                  {t('modalCreate')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
};
