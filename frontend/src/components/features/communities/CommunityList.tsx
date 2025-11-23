import { Component, For, Show, createMemo, createSignal, createEffect } from 'solid-js';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CommunityCard } from './CommunityCard';
import { useSearchCommunitiesQuery } from '@/hooks/queries/useSearchCommunitiesQuery';
import { createDebouncedSignal } from '@/utils/debounce';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityListDict } from './CommunityList.i18n';

interface CommunityListProps {
  onChanged?: () => void;
}

export const CommunityList: Component<CommunityListProps> = (props) => {
  const t = makeTranslator(communityListDict, 'communityList');

  // Filters and controls
  const [displayQ, debouncedQ, setQ] = createDebouncedSignal<string>('', 300);
  const [advancedSearch, setAdvancedSearch] = createSignal<boolean>(false);
  const [page, setPage] = createSignal<number>(1);
  const [limit, setLimit] = createSignal<number>(12);

  // Reset page to 1 when filters (except page/limit) change
  // Use createEffect instead of standalone on() for proper reactive tracking
  createEffect(() => {
    // Track filter dependencies
    debouncedQ();
    // Reset page to 1 when filter changes
    setPage(1);
  });

  // Build params for search endpoint
  const params = createMemo(() => {
    const p: any = {
      page: page(),
      limit: limit(),
    };

    if (debouncedQ()) p.q = debouncedQ();

    return p;
  });

  const query = useSearchCommunitiesQuery(params);

  // Safe accessors that handle undefined data properly
  const items = createMemo(() => query.data?.items ?? []);
  const pagination = createMemo(() => query.data?.pagination);
  const hasMore = createMemo(() => {
    const pag = pagination();
    return pag ? !!pag.hasMore : false;
  });
  const currentPage = createMemo(() => {
    const pag = pagination();
    return pag?.page ?? page();
  });
  const pageSize = createMemo(() => {
    const pag = pagination();
    return pag?.limit ?? limit();
  });
  const total = createMemo(() => {
    const pag = pagination();
    return pag?.total;
  });

  return (
    <div class="space-y-4">
      <Card class="p-4">
        <form
          class="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            query.refetch();
          }}
        >
          {/* Basic Search */}
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div class="md:col-span-3">
              <label class="block text-sm mb-1">{t('searchLabel')}</label>
              <Input
                placeholder={t('searchPlaceholder')}
                value={displayQ()}
                onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)}
              />
            </div>
            <div class="flex items-end">
              <Button type="submit" variant="primary" disabled={query.isFetching}>
                {query.isFetching ? t('searching') : t('search')}
              </Button>
            </div>
          </div>

          {/* Advanced Search Toggle */}
          <div class="flex items-center">
            <input
              type="checkbox"
              checked={advancedSearch()}
              onChange={(e) => setAdvancedSearch(e.currentTarget.checked)}
              class="mr-2"
            />
            <label class="text-sm">{t('advancedSearch')}</label>
          </div>

          {/* Pagination Controls */}
          <Show when={advancedSearch()}>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <label class="block text-sm mb-1">{t('perPageLabel')}</label>
                <select
                  class="w-full border rounded px-2 py-2"
                  value={String(limit())}
                  onInput={(e) => setLimit(Number((e.currentTarget as HTMLSelectElement).value))}
                >
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                </select>
              </div>
            </div>
          </Show>
        </form>
      </Card>

      <Show when={!query.isLoading} fallback={<Card class="p-4">{t('loading')}</Card>}>
        <Show
          when={items().length > 0}
          fallback={<Card class="p-6 text-center text-stone-500 dark:text-stone-400">{t('noCommunitiesFound')}</Card>}
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={items()}>
              {(community) => (
                <div class="h-full">
                  <CommunityCard community={community} />
                </div>
              )}
            </For>
          </div>

          <div class="flex items-center justify-between mt-4">
            <div class="text-sm text-stone-600 dark:text-stone-400">
              {t('pageInfo').replace('{{page}}', String(currentPage())).replace('{{limit}}', String(pageSize()))}{total() != null ? ` • ${t('totalInfo').replace('{{total}}', String(total()))}` : ''}
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={currentPage() <= 1 || query.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('previous')}
              </Button>
              <Button
                variant="secondary"
                disabled={!hasMore() || query.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};
