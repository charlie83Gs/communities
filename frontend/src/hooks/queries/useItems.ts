import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { itemsService } from '@/services/api/items.service';
import type { CreateItemDto, UpdateItemDto, ItemKind, Item, ItemListItem } from '@/types/items.types';
import type { Locale } from '@/stores/i18n.store';
import { i18nLocale } from '@/stores/i18n.store';

export const useItems = (communityId: Accessor<string>, language?: Accessor<Locale>) => {
  return createQuery(() => ({
    queryKey: ['items', communityId(), language?.() || i18nLocale.locale()],
    queryFn: () => itemsService.listItems(communityId(), language?.() || i18nLocale.locale()),
    enabled: !!communityId(),
  }));
};

export const useSearchItems = (
  communityId: Accessor<string>,
  query: Accessor<string | undefined>,
  kind: Accessor<ItemKind | undefined>,
  language?: Accessor<Locale>
) => {
  return createQuery(() => ({
    queryKey: ['items', 'search', communityId(), query(), kind(), language?.() || i18nLocale.locale()],
    queryFn: () => itemsService.searchItems(communityId(), query(), kind(), language?.() || i18nLocale.locale()),
    enabled: !!communityId(),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new results
    staleTime: 30000, // Cache results for 30 seconds to reduce unnecessary refetches
  }));
};

export const useItem = (itemId: Accessor<string | undefined>, language?: Accessor<Locale>) => {
  return createQuery(() => ({
    queryKey: ['items', itemId(), language?.() || i18nLocale.locale()],
    queryFn: () => itemsService.getItem(itemId()!, language?.() || i18nLocale.locale()),
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
