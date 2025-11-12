import { Component, For, Show, createMemo, createSignal, on } from 'solid-js';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { WealthCard } from '@/components/features/wealth/WealthCard';
import { useSearchWealthQuery } from '@/hooks/queries/useSearchWealthQuery';
import { createDebouncedSignal } from '@/utils/debounce';
import type { WealthDistributionType, WealthDurationType, WealthStatus } from '@/types/wealth.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthListDict } from '@/components/features/wealth/WealthList.i18n';

interface WealthListProps {
  communityId: string;
}

export const WealthList: Component<WealthListProps> = (props) => {
  const t = makeTranslator(wealthListDict, 'wealthList');

  // Filters and controls
  const [displayQ, debouncedQ, setQ] = createDebouncedSignal<string>('', 300);
  const [advancedSearch, setAdvancedSearch] = createSignal<boolean>(false);
  const [durationType, setDurationType] = createSignal<WealthDurationType | ''>('');
  const [distributionType, setDistributionType] = createSignal<WealthDistributionType | ''>('');
  const [status, setStatus] = createSignal<WealthStatus | ''>('');
  const [endDateAfter, setEndDateAfter] = createSignal<string>('');
  const [endDateBefore, setEndDateBefore] = createSignal<string>('');
  const [page, setPage] = createSignal<number>(1);
  const [limit, setLimit] = createSignal<number>(12);

  // Reset page to 1 when filters (except page/limit) change
  const resetOnFilterChange = () => setPage(1);
  const resetters = createMemo(() => [debouncedQ(), durationType(), distributionType(), status(), endDateAfter(), endDateBefore()]);
  on(resetters, resetOnFilterChange);

  // Build params for search endpoint
  const params = createMemo(() => ({
    q: debouncedQ() ?? '',
    communityId: props.communityId,
    durationType: (durationType() || undefined) as WealthDurationType | undefined,
    distributionType: (distributionType() || undefined) as WealthDistributionType | undefined,
    status: (status() || undefined) as WealthStatus | undefined,
    endDateAfter: endDateAfter() ? new Date(endDateAfter()).toISOString() : undefined,
    endDateBefore: endDateBefore() ? new Date(endDateBefore()).toISOString() : undefined,
    page: page(),
    limit: limit(),
  }));

  const query = useSearchWealthQuery(params);

  const items = createMemo(() => query.data?.items ?? []);
  const pagination = createMemo(() => query.data?.pagination);
  const hasMore = createMemo(() => !!pagination()?.hasMore);
  const currentPage = createMemo(() => pagination()?.page ?? page());
  const pageSize = createMemo(() => pagination()?.limit ?? limit());
  const total = createMemo(() => pagination()?.total);

  return (
    <div class="space-y-4">
      <Card class="p-4">
        <form
          class="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // Query automatically reacts to signal changes, no manual refetch needed
          }}
        >
          {/* Basic Search */}
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div class="md:col-span-3">
              <label class="block text-sm mb-1">{t('filters.searchLabel')}</label>
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={displayQ()}
                onInput={(e) => setQ((e.currentTarget as HTMLInputElement).value)}
              />
            </div>
            <div class="flex items-end">
              <Button type="submit" variant="primary" disabled={query.isFetching}>
                {query.isFetching ? t('filters.submitting') : t('filters.submit')}
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
            <label class="text-sm">{t('filters.advancedSearch')}</label>
          </div>

          <Show when={advancedSearch()}>
            <div class="space-y-4">
              {/* Filter row 1 */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="block text-sm mb-1">{t('filters.duration')}</label>
                  <select class="w-full border rounded px-2 py-2" value={durationType() || ''} onInput={(e) => setDurationType((e.currentTarget as HTMLSelectElement).value as any)}>
                    <option value="">{t('filters.any')}</option>
                    <option value="timebound">{t('filters.timebound')}</option>
                    <option value="unlimited">{t('filters.unlimited')}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm mb-1">{t('filters.distribution')}</label>
                  <select class="w-full border rounded px-2 py-2" value={distributionType() || ''} onInput={(e) => setDistributionType((e.currentTarget as HTMLSelectElement).value as any)}>
                    <option value="">{t('filters.any')}</option>
                    <option value="request_based">{t('filters.request_based')}</option>
                    <option value="unit_based">{t('filters.unit_based')}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm mb-1">{t('filters.status')}</label>
                  <select class="w-full border rounded px-2 py-2" value={status() || ''} onInput={(e) => setStatus((e.currentTarget as HTMLSelectElement).value as any)}>
                    <option value="">{t('filters.any')}</option>
                    <option value="active">Active</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Filter row 2 */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="block text-sm mb-1">{t('filters.endDateAfter')}</label>
                  <Input type="datetime-local" value={endDateAfter()} onInput={(e) => setEndDateAfter((e.currentTarget as HTMLInputElement).value)} />
                </div>
                <div>
                  <label class="block text-sm mb-1">{t('filters.endDateBefore')}</label>
                  <Input type="datetime-local" value={endDateBefore()} onInput={(e) => setEndDateBefore((e.currentTarget as HTMLInputElement).value)} />
                </div>
                <div>
                  <label class="block text-sm mb-1">{t('filters.perPage')}</label>
                  <select class="w-full border rounded px-2 py-2" value={String(limit())} onInput={(e) => setLimit(Number((e.currentTarget as HTMLSelectElement).value))}>
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="18">18</option>
                    <option value="24">24</option>
                  </select>
                </div>
              </div>
            </div>
          </Show>
        </form>
      </Card>

      <Show when={!query.isLoading} fallback={<Card class="p-4">{t('loading')}</Card>}>
        <Show
          when={items().length > 0}
          fallback={<Card class="p-6 text-center text-stone-500 dark:text-stone-400">{t('empty')}</Card>}
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={items()}>
              {(wealth: any) => (
                <div class="h-full">
                  <WealthCard wealth={wealth} />
                </div>
              )}
            </For>
          </div>

          <div class="flex items-center justify-between mt-4">
            <div class="text-sm text-stone-600 dark:text-stone-400">
              {t('pagination.pageX').replace('{{page}}', String(currentPage()))}
              {' '}• {t('pagination.perPageX').replace('{{limit}}', String(pageSize()))}
              {total() != null ? ` • ${t('pagination.totalX').replace('{{total}}', String(total()))}` : ''}
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={currentPage() <= 1 || query.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('pagination.prev')}
              </Button>
              <Button
                variant="secondary"
                disabled={!hasMore() || query.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('pagination.next')}
              </Button>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default WealthList;
