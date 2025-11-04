import { Component, createSignal, Show } from 'solid-js';
import { useItems, useDeleteItemMutation } from '@/hooks/queries/useItems';
import type { ItemListItem } from '@/types/items.types';
import { ItemsList } from './ItemsList';
import { ItemCreateForm } from './ItemCreateForm';
import { ItemEditForm } from './ItemEditForm';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

interface ItemsManagementPanelProps {
  communityId: string;
  canManageItems: boolean;
}

export const ItemsManagementPanel: Component<ItemsManagementPanelProps> = (props) => {
  const [isCreating, setIsCreating] = createSignal(false);
  const [editingItem, setEditingItem] = createSignal<ItemListItem | null>(null);
  const [deletingItemId, setDeletingItemId] = createSignal<string | null>(null);

  const items = useItems(() => props.communityId);
  const deleteMutation = useDeleteItemMutation();

  const handleEdit = (item: ItemListItem) => {
    setEditingItem(item);
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      setDeletingItemId(itemId);
      deleteMutation.mutate(itemId, {
        onSuccess: () => {
          setDeletingItemId(null);
        },
        onError: (error: any) => {
          alert(error?.message ?? 'Failed to delete item');
          setDeletingItemId(null);
        },
      });
    }
  };

  const handleCreateSuccess = () => {
    setIsCreating(false);
  };

  const handleEditSuccess = () => {
    setEditingItem(null);
  };

  return (
    <div class="space-y-6">
      <Show when={!isCreating() && !editingItem()}>
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Manage Items
          </h2>
          <Show when={props.canManageItems}>
            <Button onClick={() => setIsCreating(true)}>
              Create New Item
            </Button>
          </Show>
        </div>
      </Show>

      <Show when={isCreating()}>
        <ItemCreateForm
          communityId={props.communityId}
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreating(false)}
        />
      </Show>

      <Show when={editingItem()}>
        <ItemEditForm
          item={editingItem()!}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingItem(null)}
        />
      </Show>

      <Show when={!isCreating() && !editingItem()}>
        <Show
          when={!items.isLoading && !items.isError}
          fallback={
            <Show when={items.isError} fallback={<div class="text-center py-8">Loading...</div>}>
              <Card class="p-4 bg-danger-100 text-danger-800">
                Failed to load items. Please try again.
              </Card>
            </Show>
          }
        >
          <ItemsList
            items={items.data || []}
            canManageItems={props.canManageItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={items.isLoading}
          />
        </Show>
      </Show>
    </div>
  );
};
