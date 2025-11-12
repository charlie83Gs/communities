import { Component, createSignal, createMemo, Show, For } from 'solid-js';
import { useSearchItems } from '@/hooks/queries/useItems';
import type { ItemKind } from '@/types/items.types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ItemCreateForm } from './ItemCreateForm';
import { createDebouncedSignal } from '@/utils/debounce';

interface ItemSelectorProps {
  communityId: string;
  selectedItemId?: string;
  kind?: ItemKind;
  canManageItems: boolean;
  onChange: (itemId: string) => void;
  error?: string;
}

export const ItemSelector: Component<ItemSelectorProps> = (props) => {
  const [displayQuery, debouncedQuery, setSearchQuery] = createDebouncedSignal('', 300);
  const [isCreating, setIsCreating] = createSignal(false);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  let searchInputRef: HTMLInputElement | undefined;

  const items = useSearchItems(
    () => props.communityId,
    () => debouncedQuery(),
    () => props.kind
  );

  const selectedItem = createMemo(() => {
    if (!props.selectedItemId || !items.data) return undefined;
    return items.data.find((item) => item.id === props.selectedItemId);
  });

  const filteredItems = createMemo(() => {
    if (!items.data) return [];
    const query = displayQuery().toLowerCase();
    if (!query) return items.data;
    return items.data.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  });

  const handleSelect = (itemId: string) => {
    props.onChange(itemId);
    setIsDropdownOpen(false);
  };

  const handleCreateSuccess = (item: any) => {
    setIsCreating(false);
    props.onChange(item.id);
    setIsDropdownOpen(false);
  };

  return (
    <div class="mb-4">
      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
        Item Type
      </label>

      <Show when={!isCreating()}>
        <div class="relative">
          <div
            class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-ocean-500 focus-within:border-ocean-500 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen())}
          >
            <Show
              when={selectedItem()}
              fallback={
                <span class="text-stone-500 dark:text-stone-400">Select an item or create new</span>
              }
            >
              <div class="flex items-center gap-2">
                <span>{selectedItem()!.name}</span>
                <Badge variant={selectedItem()!.kind === 'object' ? 'ocean' : 'forest'}>
                  {selectedItem()!.kind}
                </Badge>
              </div>
            </Show>
          </div>

          <Show when={isDropdownOpen()}>
            <div class="absolute z-10 mt-1 w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md shadow-lg max-h-60 overflow-auto">
              <div class="p-2 border-b border-stone-200 dark:border-stone-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 rounded-md text-sm focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  placeholder="Search items..."
                  value={displayQuery()}
                  onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                  onClick={(e) => e.stopPropagation()}
                  autofocus
                />
              </div>

              <Show when={filteredItems().length === 0 && !items.isLoading}>
                <div class="p-4 text-center text-sm text-stone-500 dark:text-stone-400">No items found</div>
              </Show>

              <For each={filteredItems()}>
                {(item) => (
                  <div
                    class="px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer flex items-center justify-between text-stone-900 dark:text-stone-100"
                    onClick={() => handleSelect(item.id)}
                  >
                    <span class="text-sm">{item.name}</span>
                    <Badge variant={item.kind === 'object' ? 'ocean' : 'forest'} class="text-xs">
                      {item.kind}
                    </Badge>
                  </div>
                )}
              </For>

              <Show when={items.isLoading && items.isFetching}>
                <div class="p-2 text-center text-xs text-stone-400 dark:text-stone-500">Searching...</div>
              </Show>

              <Show when={props.canManageItems}>
                <div class="p-2 border-t border-stone-200 dark:border-stone-700">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    class="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreating(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    + Create New Item
                  </Button>
                </div>
              </Show>
            </div>
          </Show>
        </div>

        <Show when={props.error}>
          <p class="mt-1 text-sm text-danger-600">{props.error}</p>
        </Show>
      </Show>

      <Show when={isCreating()}>
        <ItemCreateForm
          communityId={props.communityId}
          initialKind={props.kind}
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreating(false)}
        />
      </Show>
    </div>
  );
};
