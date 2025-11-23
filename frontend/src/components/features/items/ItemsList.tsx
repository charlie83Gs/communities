import { Component, createSignal, createMemo, Show, For } from 'solid-js';
import type { ItemListItem, ItemKind } from '@/types/items.types';
import { ItemCard } from './ItemCard';
import { Input } from '@/components/common/Input';
import { makeTranslator } from '@/i18n/makeTranslator';
import { itemsDict } from './items.i18n';

interface ItemsListProps {
  items: ItemListItem[];
  canManageItems: boolean;
  onEdit: (item: ItemListItem) => void;
  onDelete: (itemId: string) => void;
  isLoading?: boolean;
}

type SortBy = 'name' | 'usage' | 'created';
type FilterKind = 'all' | 'object' | 'service';

export const ItemsList: Component<ItemsListProps> = (props) => {
  const t = makeTranslator(itemsDict, 'items.list');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [filterKind, setFilterKind] = createSignal<FilterKind>('all');
  const [sortBy, setSortBy] = createSignal<SortBy>('name');

  const filteredAndSortedItems = createMemo(() => {
    let result = [...props.items];

    // Filter by search query
    const query = searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Filter by kind
    const kind = filterKind();
    if (kind !== 'all') {
      result = result.filter((item) => item.kind === kind);
    }

    // Sort
    const sort = sortBy();
    result.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return (b._count?.wealthEntries ?? 0) - (a._count?.wealthEntries ?? 0);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  });

  return (
    <div class="space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <Input
            placeholder={t('search')}
            value={searchQuery()}
            onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="flex gap-2">
          <select
            class="px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            value={filterKind()}
            onChange={(e) => setFilterKind((e.target as HTMLSelectElement).value as FilterKind)}
          >
            <option value="all">{t('filters.allTypes')}</option>
            <option value="object">{t('filters.objects')}</option>
            <option value="service">{t('filters.services')}</option>
          </select>

          <select
            class="px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            value={sortBy()}
            onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as SortBy)}
          >
            <option value="name">{t('sort.byName')}</option>
            <option value="usage">{t('sort.byUsage')}</option>
            <option value="created">{t('sort.byDate')}</option>
          </select>
        </div>
      </div>

      <Show when={props.isLoading}>
        <div class="text-center py-8 text-stone-500">{t('loading')}</div>
      </Show>

      <Show when={!props.isLoading && filteredAndSortedItems().length === 0}>
        <div class="text-center py-8 text-stone-500">
          <Show when={searchQuery() || filterKind() !== 'all'} fallback={<>{t('noItems')}</>}>
            {t('noMatch')}
          </Show>
        </div>
      </Show>

      <div class="grid grid-cols-1 gap-4">
        <For each={filteredAndSortedItems()}>
          {(item) => (
            <ItemCard
              item={item}
              canManageItems={props.canManageItems}
              onEdit={props.onEdit}
              onDelete={props.onDelete}
            />
          )}
        </For>
      </div>
    </div>
  );
};
