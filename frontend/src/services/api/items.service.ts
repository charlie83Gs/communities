import { apiClient } from './client';
import type { Item, ItemListItem, CreateItemDto, UpdateItemDto, ItemKind } from '@/types/items.types';

class ItemsService {
  private readonly basePath = '/api/v1/items';

  async listItems(communityId: string): Promise<ItemListItem[]> {
    return apiClient.get(`${this.basePath}?communityId=${communityId}`);
  }

  async searchItems(communityId: string, query?: string, kind?: ItemKind): Promise<Item[]> {
    const params = new URLSearchParams({ communityId });
    if (query) params.set('query', query);
    if (kind) params.set('kind', kind);
    return apiClient.get(`${this.basePath}/search?${params}`);
  }

  async getItem(id: string): Promise<Item> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  async createItem(dto: CreateItemDto): Promise<Item> {
    return apiClient.post(this.basePath, dto);
  }

  async updateItem(id: string, dto: UpdateItemDto): Promise<Item> {
    return apiClient.put(`${this.basePath}/${id}`, dto);
  }

  async deleteItem(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  async canManageItems(communityId: string): Promise<{ canManage: boolean }> {
    return apiClient.get(`${this.basePath}/permissions/can-manage?communityId=${communityId}`);
  }
}

export const itemsService = new ItemsService();
