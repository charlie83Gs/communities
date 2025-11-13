import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { itemsController } from '@/api/controllers/items.controller';
import { itemsService } from '@/services/items.service';
import { AppError } from '@/utils/errors';

import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';
import type { Item } from '@db/schema';

// Test data
const mockItem: Item = {
  id: 'item-123',
  communityId: 'comm-123',
  translations: {
    en: { name: 'Carrots', description: 'Fresh organic carrots' },
  },
  kind: 'object',
  wealthValue: '5.00',
  isDefault: false,
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const mockItemWithCount = {
  ...mockItem,
  _count: { wealthEntries: 5 },
};

// Mock service
const mockItemsService = {
  canManageItems: mock(() => Promise.resolve(true)),
  listItems: mock(() => Promise.resolve([mockItemWithCount])),
  getItemById: mock(() => Promise.resolve(mockItem)),
  createItem: mock(() => Promise.resolve(mockItem)),
  updateItem: mock(() => Promise.resolve(mockItem)),
  deleteItem: mock(() => Promise.resolve()),
  searchItems: mock(() => Promise.resolve([mockItem])),
};

describe('ItemsController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockItemsService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    (itemsService.canManageItems as any) = mockItemsService.canManageItems;
    (itemsService.listItems as any) = mockItemsService.listItems;
    (itemsService.getItemById as any) = mockItemsService.getItemById;
    (itemsService.createItem as any) = mockItemsService.createItem;
    (itemsService.updateItem as any) = mockItemsService.updateItem;
    (itemsService.deleteItem as any) = mockItemsService.deleteItem;
    (itemsService.searchItems as any) = mockItemsService.searchItems;
  });

  describe('list', () => {
    it('should list items successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.listItems.mockResolvedValue([mockItemWithCount]);

      await itemsController.list(req, res, next);

      expect(mockItemsService.listItems).toHaveBeenCalledWith('comm-123', 'user-123', 'en', false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: [mockItemWithCount],
      });
    });

    it('should list items including deleted when requested', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123', includeDeleted: 'true' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.listItems.mockResolvedValue([mockItemWithCount]);

      await itemsController.list(req, res, next);

      expect(mockItemsService.listItems).toHaveBeenCalledWith('comm-123', 'user-123', 'en', true);
    });

    it('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Forbidden', 403);
      mockItemsService.listItems.mockRejectedValue(error);

      await itemsController.list(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should get item by id successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.getItemById.mockResolvedValue(mockItem);

      await itemsController.getById(req, res, next);

      expect(mockItemsService.getItemById).toHaveBeenCalledWith('item-123', 'user-123', 'en');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: mockItem,
      });
    });

    it('should handle not found error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Item not found', 404);
      mockItemsService.getItemById.mockRejectedValue(error);

      await itemsController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should create item successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: {
          communityId: 'comm-123',
          name: 'Tomatoes',
          description: 'Fresh tomatoes',
          kind: 'object',
          wealthValue: '5.00',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.createItem.mockResolvedValue(mockItem);

      await itemsController.create(req, res, next);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        {
          communityId: 'comm-123',
          name: 'Tomatoes',
          description: 'Fresh tomatoes',
          kind: 'object',
          wealthValue: '5.00',
        },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item created successfully',
        data: mockItem,
      });
    });

    it('should handle validation errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: {
          communityId: 'comm-123',
          name: '',
          kind: 'object',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Item name cannot be empty', 400);
      mockItemsService.createItem.mockRejectedValue(error);

      await itemsController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle duplicate name error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: {
          communityId: 'comm-123',
          name: 'Carrots',
          kind: 'object',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('An item with the name "Carrots" already exists in this community', 400);
      mockItemsService.createItem.mockRejectedValue(error);

      await itemsController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle permission errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: {
          communityId: 'comm-123',
          name: 'Tomatoes',
          kind: 'object',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('You do not have permission to manage items in this community', 403);
      mockItemsService.createItem.mockRejectedValue(error);

      await itemsController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should update item successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
        body: {
          name: 'Updated Name',
          description: 'Updated description',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const updatedItem = { ...mockItem, name: 'Updated Name', description: 'Updated description' };
      mockItemsService.updateItem.mockResolvedValue(updatedItem);

      await itemsController.update(req, res, next);

      expect(mockItemsService.updateItem).toHaveBeenCalledWith(
        'item-123',
        {
          name: 'Updated Name',
          description: 'Updated description',
        },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item updated successfully',
        data: updatedItem,
      });
    });

    it('should handle partial updates', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
        body: { description: 'New description only' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.updateItem.mockResolvedValue(mockItem);

      await itemsController.update(req, res, next);

      expect(mockItemsService.updateItem).toHaveBeenCalledWith(
        'item-123',
        { description: 'New description only' },
        'user-123'
      );
    });

    it('should handle not found error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
        body: { name: 'Updated Name' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Item not found', 404);
      mockItemsService.updateItem.mockRejectedValue(error);

      await itemsController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle permission errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
        body: { name: 'Updated Name' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('You do not have permission to manage items in this community', 403);
      mockItemsService.updateItem.mockRejectedValue(error);

      await itemsController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle deleted item error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
        body: { name: 'Updated Name' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Cannot update a deleted item', 400);
      mockItemsService.updateItem.mockRejectedValue(error);

      await itemsController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should delete item successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.deleteItem.mockResolvedValue(undefined);

      await itemsController.delete(req, res, next);

      expect(mockItemsService.deleteItem).toHaveBeenCalledWith('item-123', 'user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item deleted successfully',
        data: null,
      });
    });

    it('should handle not found error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Item not found', 404);
      mockItemsService.deleteItem.mockRejectedValue(error);

      await itemsController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle default item deletion error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-default' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Cannot delete default items', 400);
      mockItemsService.deleteItem.mockRejectedValue(error);

      await itemsController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle active wealth references error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Cannot delete item that has active wealth shares', 400);
      mockItemsService.deleteItem.mockRejectedValue(error);

      await itemsController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle permission errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'item-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('You do not have permission to manage items in this community', 403);
      mockItemsService.deleteItem.mockRejectedValue(error);

      await itemsController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('search', () => {
    it('should search items by query', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {
          communityId: 'comm-123',
          query: 'carrot',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.searchItems.mockResolvedValue([mockItem]);

      await itemsController.search(req, res, next);

      expect(mockItemsService.searchItems).toHaveBeenCalledWith('comm-123', 'user-123', 'en', 'carrot', undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: [mockItem],
      });
    });

    it('should search items by kind', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {
          communityId: 'comm-123',
          kind: 'object',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.searchItems.mockResolvedValue([mockItem]);

      await itemsController.search(req, res, next);

      expect(mockItemsService.searchItems).toHaveBeenCalledWith('comm-123', 'user-123', 'en', undefined, 'object');
    });

    it('should search items by query and kind', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {
          communityId: 'comm-123',
          query: 'fresh',
          kind: 'service',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.searchItems.mockResolvedValue([mockItem]);

      await itemsController.search(req, res, next);

      expect(mockItemsService.searchItems).toHaveBeenCalledWith('comm-123', 'user-123', 'en', 'fresh', 'service');
    });

    it('should search without filters', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.searchItems.mockResolvedValue([mockItem]);

      await itemsController.search(req, res, next);

      expect(mockItemsService.searchItems).toHaveBeenCalledWith('comm-123', 'user-123', 'en', undefined, undefined);
    });

    it('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Forbidden', 403);
      mockItemsService.searchItems.mockRejectedValue(error);

      await itemsController.search(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('canManage', () => {
    it('should return true when user can manage items', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.canManageItems.mockResolvedValue(true);

      await itemsController.canManage(req, res, next);

      expect(mockItemsService.canManageItems).toHaveBeenCalledWith('user-123', 'comm-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: { canManage: true },
      });
    });

    it('should return false when user cannot manage items', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockItemsService.canManageItems.mockResolvedValue(false);

      await itemsController.canManage(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: { canManage: false },
      });
    });

    it('should handle missing communityId', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      await itemsController.canManage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Community ID is required',
      });
    });

    it('should handle invalid communityId type', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 123 as any }, // Invalid type
      });
      const res = createMockResponse();
      const next = createMockNext();

      await itemsController.canManage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Database error', 500);
      mockItemsService.canManageItems.mockRejectedValue(error);

      await itemsController.canManage(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
