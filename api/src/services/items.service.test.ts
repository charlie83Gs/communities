import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { itemsService } from '@/services/items.service';
import { itemsRepository } from '@/repositories/items.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { communityRepository } from '@/repositories/community.repository';
import { openFGAService } from '@/services/openfga.service';

import type { Item } from '@db/schema';

// Test data
const mockItem: Item = {
  id: 'item-123',
  communityId: 'comm-123',
  translations: {
    en: { name: 'Carrots', description: 'Fresh organic carrots' },
    es: { name: 'Zanahorias', description: 'Zanahorias orgánicas frescas' },
    hi: { name: 'गाजर', description: 'ताजा जैविक गाजर' },
  },
  kind: 'object',
  wealthValue: '5.00',
  contributionMetadata: null,
  isDefault: false,
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const mockDefaultItem: Item = {
  ...mockItem,
  id: 'item-default',
  translations: {
    en: { name: 'Other', description: 'Other items' },
  },
  wealthValue: '1.00',
  isDefault: true,
};

const mockCommunity = {
  id: 'comm-123',
  name: 'Test Community',
  description: 'Test',
  createdBy: 'user-123',
  minTrustForItemManagement: { type: 'number', value: 20 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock repositories and services
const mockItemsRepository = {
  create: mock(() => Promise.resolve(mockItem)),
  findById: mock(() => Promise.resolve(mockItem)),
  findByName: mock(() => Promise.resolve(null)),
  listByCommunity: mock(() => Promise.resolve([mockItem])),
  search: mock(() => Promise.resolve([mockItem])),
  update: mock(() => Promise.resolve(mockItem)),
  softDelete: mock(() => Promise.resolve(mockItem)),
  hasActiveWealthReferences: mock(() => Promise.resolve(false)),
  getWealthCount: mock(() => Promise.resolve(0)),
};

const mockCommunityMemberRepository = {
  getUserRole: mock(() => Promise.resolve('member')),
  isAdmin: mock(() => Promise.resolve(false)),
};

const mockCommunityRepository = {
  findById: mock(() => Promise.resolve(mockCommunity)),
};

const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(false)),
};

describe('ItemsService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockItemsRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Replace methods with mocks
    (itemsRepository.create as any) = mockItemsRepository.create;
    (itemsRepository.findById as any) = mockItemsRepository.findById;
    (itemsRepository.findByName as any) = mockItemsRepository.findByName;
    (itemsRepository.listByCommunity as any) = mockItemsRepository.listByCommunity;
    (itemsRepository.search as any) = mockItemsRepository.search;
    (itemsRepository.update as any) = mockItemsRepository.update;
    (itemsRepository.softDelete as any) = mockItemsRepository.softDelete;
    (itemsRepository.hasActiveWealthReferences as any) =
      mockItemsRepository.hasActiveWealthReferences;
    (itemsRepository.getWealthCount as any) = mockItemsRepository.getWealthCount;

    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.isAdmin as any) = mockCommunityMemberRepository.isAdmin;

    (communityRepository.findById as any) = mockCommunityRepository.findById;

    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;
  });

  describe('canManageItems', () => {
    it('should return true when user has can_manage_item permission', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(true);

      const result = await itemsService.canManageItems('user-123', 'comm-123');

      expect(result).toBe(true);
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        'user-123',
        'community',
        'comm-123',
        'can_manage_item'
      );
    });

    it('should return false when user lacks permission', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      const result = await itemsService.canManageItems('user-123', 'comm-123');

      expect(result).toBe(false);
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        'user-123',
        'community',
        'comm-123',
        'can_manage_item'
      );
    });
  });

  describe('listItems', () => {
    it('should list items for community member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockItemsRepository.listByCommunity.mockResolvedValue([mockItem]);

      const result = await itemsService.listItems('comm-123', 'user-123');

      expect(result).toEqual([
        { ...mockItem, name: 'Carrots', description: 'Fresh organic carrots' },
      ]);
      expect(mockItemsRepository.listByCommunity).toHaveBeenCalledWith('comm-123', false);
    });

    it('should list items including deleted when requested', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('admin');
      mockItemsRepository.listByCommunity.mockResolvedValue([
        mockItem,
        { ...mockItem, deletedAt: new Date() },
      ]);

      await itemsService.listItems('comm-123', 'user-123', 'en', true);

      expect(mockItemsRepository.listByCommunity).toHaveBeenCalledWith('comm-123', true);
    });

    it('should throw 403 if user is not a member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(itemsService.listItems('comm-123', 'user-123')).rejects.toThrow(
        'You must be a member of this community to access items'
      );
    });

    it('should throw 403 if user is reader only', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('reader');

      await expect(itemsService.listItems('comm-123', 'user-123')).rejects.toThrow(
        'You must be a member of this community to access items'
      );
    });
  });

  describe('getItemById', () => {
    it('should return item if user is community member', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      const result = await itemsService.getItemById('item-123', 'user-123');

      expect(result).toEqual({
        ...mockItem,
        name: 'Carrots',
        description: 'Fresh organic carrots',
      });
      expect(mockItemsRepository.findById).toHaveBeenCalledWith('item-123');
    });

    it('should throw 404 if item not found', async () => {
      mockItemsRepository.findById.mockResolvedValue(null as any);

      await expect(itemsService.getItemById('item-123', 'user-123')).rejects.toThrow(
        'Item not found'
      );
    });

    it('should throw 403 if user is not community member', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(itemsService.getItemById('item-123', 'user-123')).rejects.toThrow(
        'You must be a member of this community to access items'
      );
    });
  });

  describe('createItem', () => {
    const createDto = {
      communityId: 'comm-123',
      translations: {
        en: { name: 'Tomatoes', description: 'Fresh tomatoes' },
        es: { name: 'Tomates', description: 'Tomates frescos' },
      },
      kind: 'object' as const,
      wealthValue: '5.00',
    };

    it('should create item when user has permission', async () => {
      mockCommunityRepository.findById.mockResolvedValue(mockCommunity);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.findByName.mockResolvedValue(null as any);
      mockItemsRepository.create.mockResolvedValue(mockItem);

      const result = await itemsService.createItem(createDto, 'user-123');

      expect(result).toEqual({ ...mockItem, name: 'Tomatoes', description: 'Fresh tomatoes' });
      expect(mockItemsRepository.create).toHaveBeenCalledWith({
        communityId: 'comm-123',
        translations: {
          en: { name: 'Tomatoes', description: 'Fresh tomatoes' },
          es: { name: 'Tomates', description: 'Tomates frescos' },
        },
        kind: 'object',
        wealthValue: '5.00',
        createdBy: 'user-123',
      });
    });

    it('should throw 404 if community not found', async () => {
      mockCommunityRepository.findById.mockResolvedValue(null as any);

      await expect(itemsService.createItem(createDto, 'user-123')).rejects.toThrow(
        'Community not found'
      );
    });

    it('should throw 403 if user is not a member', async () => {
      mockCommunityRepository.findById.mockResolvedValue(mockCommunity);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(itemsService.createItem(createDto, 'user-123')).rejects.toThrow(
        'You must be a member of this community to access items'
      );
    });

    it('should throw 403 if user lacks permission', async () => {
      mockCommunityRepository.findById.mockResolvedValue(mockCommunity);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(itemsService.createItem(createDto, 'user-123')).rejects.toThrow(
        'You do not have permission to manage items in this community'
      );
    });

    it('should throw 400 if item name already exists (case-insensitive)', async () => {
      mockCommunityRepository.findById.mockResolvedValue(mockCommunity);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.findByName.mockResolvedValue(mockItem as any);

      await expect(itemsService.createItem(createDto, 'user-123')).rejects.toThrow(
        'An item with the name "Tomatoes" already exists in this community'
      );
    });

    it('should throw 400 if name is empty', async () => {
      mockCommunityRepository.findById.mockResolvedValue(mockCommunity);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.findByName.mockResolvedValue(null as any);

      await expect(
        itemsService.createItem({ ...createDto, translations: { en: { name: '   ' } } }, 'user-123')
      ).rejects.toThrow('Item name cannot be empty');
    });

    it('should throw 400 if name exceeds 200 characters', async () => {
      mockCommunityRepository.findById.mockResolvedValue(mockCommunity);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.findByName.mockResolvedValue(null as any);

      await expect(
        itemsService.createItem(
          { ...createDto, translations: { en: { name: 'a'.repeat(201) } } },
          'user-123'
        )
      ).rejects.toThrow('Item name cannot exceed 200 characters');
    });

    it('should trim whitespace from name and description', async () => {
      mockCommunityRepository.findById.mockResolvedValue(mockCommunity);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.findByName.mockResolvedValue(null as any);
      mockItemsRepository.create.mockResolvedValue(mockItem);

      await itemsService.createItem(
        {
          ...createDto,
          translations: {
            en: { name: '  Tomatoes  ', description: '  Fresh tomatoes  ' },
          },
        },
        'user-123'
      );

      expect(mockItemsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          translations: expect.objectContaining({
            en: expect.objectContaining({
              name: 'Tomatoes',
              description: 'Fresh tomatoes',
            }),
          }),
        })
      );
    });
  });

  describe('updateItem', () => {
    const updateDto = {
      translations: {
        en: { name: 'Updated Name', description: 'Updated description' },
      },
      kind: 'service' as const,
      wealthValue: '10.50',
    };

    it('should update item when user has permission', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.findByName.mockResolvedValue(null as any);
      mockItemsRepository.update.mockResolvedValue({
        ...mockItem,
        ...updateDto,
      });

      const result = await itemsService.updateItem('item-123', updateDto, 'user-123');

      expect(result).toMatchObject(updateDto);
      expect(mockItemsRepository.update).toHaveBeenCalledWith('item-123', {
        translations: expect.objectContaining({
          en: expect.objectContaining({
            name: 'Updated Name',
            description: 'Updated description',
          }),
        }),
        kind: 'service',
        wealthValue: '10.50',
      });
    });

    it('should throw 404 if item not found', async () => {
      mockItemsRepository.findById.mockResolvedValue(null as any);

      await expect(itemsService.updateItem('item-123', updateDto, 'user-123')).rejects.toThrow(
        'Item not found'
      );
    });

    it('should throw 400 if item is deleted', async () => {
      mockItemsRepository.findById.mockResolvedValue({
        ...mockItem,
        deletedAt: new Date(),
      });

      await expect(itemsService.updateItem('item-123', updateDto, 'user-123')).rejects.toThrow(
        'Cannot update a deleted item'
      );
    });

    it('should throw 403 if user lacks permission', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(itemsService.updateItem('item-123', updateDto, 'user-123')).rejects.toThrow(
        'You do not have permission to manage items in this community'
      );
    });

    it('should check name uniqueness when name is changed', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.findByName.mockResolvedValue({
        ...mockItem,
        id: 'other-item',
      } as any);

      await expect(
        itemsService.updateItem(
          'item-123',
          { translations: { en: { name: 'Existing Name' } } },
          'user-123'
        )
      ).rejects.toThrow('An item with the name "Existing Name" already exists in this community');
    });

    it('should not check uniqueness if name is unchanged (case-insensitive)', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.update.mockResolvedValue(mockItem);

      await itemsService.updateItem(
        'item-123',
        { translations: { en: { name: 'CARROTS' } } },
        'user-123'
      );

      // Should not call findByName since it's the same name (case-insensitive)
      expect(mockItemsRepository.findByName).not.toHaveBeenCalled();
    });

    it('should allow partial updates', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.update.mockResolvedValue(mockItem);

      await itemsService.updateItem('item-123', { wealthValue: '15.00' }, 'user-123');

      expect(mockItemsRepository.update).toHaveBeenCalledWith('item-123', {
        translations: undefined,
        kind: undefined,
        wealthValue: '15.00',
      });
    });

    it('should throw 500 if update fails', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.update.mockResolvedValue(null as any);

      await expect(itemsService.updateItem('item-123', updateDto, 'user-123')).rejects.toThrow(
        'Failed to update item'
      );
    });
  });

  describe('deleteItem', () => {
    it('should soft delete item when user has permission', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.hasActiveWealthReferences.mockResolvedValue(false);
      mockItemsRepository.softDelete.mockResolvedValue({
        ...mockItem,
        deletedAt: new Date(),
      });

      await itemsService.deleteItem('item-123', 'user-123');

      expect(mockItemsRepository.softDelete).toHaveBeenCalledWith('item-123');
    });

    it('should throw 404 if item not found', async () => {
      mockItemsRepository.findById.mockResolvedValue(null as any);

      await expect(itemsService.deleteItem('item-123', 'user-123')).rejects.toThrow(
        'Item not found'
      );
    });

    it('should throw 400 if item already deleted', async () => {
      mockItemsRepository.findById.mockResolvedValue({
        ...mockItem,
        deletedAt: new Date(),
      });

      await expect(itemsService.deleteItem('item-123', 'user-123')).rejects.toThrow(
        'Item is already deleted'
      );
    });

    it('should throw 403 if user lacks permission', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(itemsService.deleteItem('item-123', 'user-123')).rejects.toThrow(
        'You do not have permission to manage items in this community'
      );
    });

    it('should allow deletion of default items', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockDefaultItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.hasActiveWealthReferences.mockResolvedValue(false);
      mockItemsRepository.softDelete.mockResolvedValue({
        ...mockDefaultItem,
        deletedAt: new Date(),
      });

      await itemsService.deleteItem('item-default', 'user-123');

      expect(mockItemsRepository.softDelete).toHaveBeenCalledWith('item-default');
    });

    it('should throw 400 if item has active wealth references', async () => {
      mockItemsRepository.findById.mockResolvedValue(mockItem);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockItemsRepository.hasActiveWealthReferences.mockResolvedValue(true);

      await expect(itemsService.deleteItem('item-123', 'user-123')).rejects.toThrow(
        'Cannot delete item that has active wealth shares'
      );
    });
  });

  describe('searchItems', () => {
    it('should search items by query', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockItemsRepository.search.mockResolvedValue([mockItem]);

      const result = await itemsService.searchItems(
        'comm-123',
        'user-123',
        'en',
        'carrot',
        undefined
      );

      expect(result).toEqual([
        { ...mockItem, name: 'Carrots', description: 'Fresh organic carrots' },
      ]);
      expect(mockItemsRepository.search).toHaveBeenCalledWith(
        'comm-123',
        'en',
        'carrot',
        undefined
      );
    });

    it('should search items by kind', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockItemsRepository.search.mockResolvedValue([mockItem]);

      await itemsService.searchItems('comm-123', 'user-123', 'en', undefined, 'object');

      expect(mockItemsRepository.search).toHaveBeenCalledWith(
        'comm-123',
        'en',
        undefined,
        'object'
      );
    });

    it('should search items by query and kind combined', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockItemsRepository.search.mockResolvedValue([mockItem]);

      await itemsService.searchItems('comm-123', 'user-123', 'es', 'fresh', 'object');

      expect(mockItemsRepository.search).toHaveBeenCalledWith('comm-123', 'es', 'fresh', 'object');
    });

    it('should throw 403 if user is not a member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(
        itemsService.searchItems('comm-123', 'user-123', 'en', 'test', undefined)
      ).rejects.toThrow('You must be a member of this community to access items');
    });
  });

  describe('ensureDefaultItem', () => {
    it('should create all default items for new community', async () => {
      mockItemsRepository.findByName.mockResolvedValue(null as any); // No existing items
      mockItemsRepository.create.mockResolvedValue(mockDefaultItem);

      const result = await itemsService.ensureDefaultItem('comm-123', 'user-123');

      expect(result).toBeDefined();
      // Should create 400 default items (39 beverages + 72 produce + 124 objects + 94 food + 71 services)
      expect(mockItemsRepository.create).toHaveBeenCalledTimes(400);

      // Verify items have translations structure
      const calls = mockItemsRepository.create.mock.calls as any[];
      expect(calls.length).toBeGreaterThan(0);
      if (calls.length > 0) {
        const firstCall = calls[0][0] as any;
        expect(firstCall).toHaveProperty('translations');
        expect(firstCall.translations).toHaveProperty('en');
        expect(firstCall.translations.en).toHaveProperty('name');
        expect(firstCall).toHaveProperty('kind');
        expect(firstCall).toHaveProperty('isDefault', true);
        expect(firstCall).toHaveProperty('wealthValue');
      }
    });

    it('should skip creating items that already exist', async () => {
      mockItemsRepository.findByName
        .mockResolvedValueOnce(mockDefaultItem as any) // First item exists
        .mockResolvedValue(null as any); // Rest don't exist
      mockItemsRepository.create.mockResolvedValue(mockDefaultItem);

      await itemsService.ensureDefaultItem('comm-123', 'user-123');

      // Should create only 399 items (one already existed)
      expect(mockItemsRepository.create).toHaveBeenCalledTimes(399);
    });

    it('should return first default item', async () => {
      const firstItem = {
        ...mockDefaultItem,
        translations: {
          en: { name: 'Fresh Vegetables (kg)', description: 'Fresh vegetables' },
        },
        wealthValue: '5',
      };
      mockItemsRepository.findByName.mockResolvedValue(null as any);
      mockItemsRepository.create
        .mockResolvedValueOnce(firstItem)
        .mockResolvedValue(mockDefaultItem);

      const result = await itemsService.ensureDefaultItem('comm-123', 'user-123');

      expect(result).toEqual(firstItem);
    });
  });
});
