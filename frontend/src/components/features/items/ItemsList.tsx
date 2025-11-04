import { Component, createSignal, createMemo, Show, For } from 'solid-js';
import type { ItemListItem, ItemKind } from '@/types/items.types';
import { ItemCard } from './ItemCard';
import { Input } from '@/components/common/Input';

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
            placeholder="Search items..."
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
            <option value="all">All Types</option>
            <option value="object">Objects</option>
            <option value="service">Services</option>
          </select>

          <select
            class="px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            value={sortBy()}
            onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as SortBy)}
          >
            <option value="name">Sort by Name</option>
            <option value="usage">Sort by Usage</option>
            <option value="created">Sort by Date</option>
          </select>
        </div>
      </div>

      <Show when={props.isLoading}>
        <div class="text-center py-8 text-stone-500">Loading items...</div>
      </Show>

      <Show when={!props.isLoading && filteredAndSortedItems().length === 0}>
        <div class="text-center py-8 text-stone-500">
          <Show when={searchQuery() || filterKind() !== 'all'} fallback={<>No items found</>}>
            No items match your filters
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
