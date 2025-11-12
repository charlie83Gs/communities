import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { itemsService } from '@/services/api/items.service';
import type { CreateItemDto, UpdateItemDto, ItemKind, Item, ItemListItem } from '@/types/items.types';

export const useItems = (communityId: Accessor<string>) => {
  return createQuery(() => ({
    queryKey: ['items', communityId()],
    queryFn: () => itemsService.listItems(communityId()),
    enabled: !!communityId(),
  }));
};

export const useSearchItems = (
  communityId: Accessor<string>,
  query: Accessor<string | undefined>,
  kind: Accessor<ItemKind | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['items', 'search', communityId(), query(), kind()],
    queryFn: () => itemsService.searchItems(communityId(), query(), kind()),
    enabled: !!communityId(),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new results
    staleTime: 30000, // Cache results for 30 seconds to reduce unnecessary refetches
  }));
};

export const useItem = (itemId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['items', itemId()],
    queryFn: () => itemsService.getItem(itemId()!),
    enabled: !!itemId(),
  }));
};

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (dto: CreateItemDto) => itemsService.createItem(dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['items', variables.communityId] });
      void queryClient.invalidateQueries({ queryKey: ['items', 'search'], exact: false });
    },
  }));
};

export const useUpdateItemMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemDto }) =>
      itemsService.updateItem(id, data),
    onSuccess: (updatedItem) => {
      void queryClient.invalidateQueries({ queryKey: ['items', updatedItem.communityId] });
      void queryClient.invalidateQueries({ queryKey: ['items', updatedItem.id] });
      void queryClient.invalidateQueries({ queryKey: ['items', 'search'], exact: false });
    },
  }));
};

export const useDeleteItemMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (id: string) => itemsService.deleteItem(id),
    onSuccess: (_data, itemId) => {
      void queryClient.invalidateQueries({ queryKey: ['items'], exact: false });
      void queryClient.removeQueries({ queryKey: ['items', itemId] });
    },
  }));
};
