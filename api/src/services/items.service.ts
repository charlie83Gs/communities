import {
  itemsRepository,
  CreateItemDto as RepoCreateItemDto,
  UpdateItemDto as RepoUpdateItemDto,
} from '@repositories/items.repository';
import { communityMemberRepository } from '@repositories/communityMember.repository';
import { communityRepository } from '@repositories/community.repository';
import { AppError } from '@utils/errors';
import { openFGAService } from './openfga.service';
import type { Item } from '@db/schema';

export type CreateItemDto = {
  communityId: string;
  name: string;
  description?: string | null;
  kind: 'object' | 'service';
  wealthValue: string;
};

export type UpdateItemDto = {
  name?: string;
  description?: string | null;
  kind?: 'object' | 'service';
  wealthValue?: string;
};

export interface ItemListItem extends Item {
  _count?: {
    wealthEntries: number;
  };
}

export class ItemsService {
  /**
   * Ensure user is a member or admin of the community
   */
  private async ensureCommunityMember(communityId: string, userId: string): Promise<void> {
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role || (role !== 'admin' && role !== 'member')) {
      throw new AppError('You must be a member of this community to access items', 403);
    }
  }

  /**
   * Check if user can manage items in a community
   * Uses OpenFGA permission: can_manage_item
   * Permission automatically handles: admin OR item_manager OR trust_item_manager
   */
  async canManageItems(userId: string, communityId: string): Promise<boolean> {
    return await openFGAService.checkAccess(userId, 'community', communityId, 'can_manage_item');
  }

  /**
   * List all items for a community
   */
  async listItems(
    communityId: string,
    userId: string,
    includeDeleted = false
  ): Promise<ItemListItem[]> {
    // Verify user is a member of the community
    await this.ensureCommunityMember(communityId, userId);

    return await itemsRepository.listByCommunity(communityId, includeDeleted);
  }

  /**
   * Get item by ID
   */
  async getItemById(itemId: string, userId: string): Promise<Item> {
    const item = await itemsRepository.findById(itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Verify user is a member of the community
    await this.ensureCommunityMember(item.communityId, userId);

    return item;
  }

  /**
   * Create a new item
   */
  async createItem(dto: CreateItemDto, userId: string): Promise<Item> {
    // Verify community exists
    const community = await communityRepository.findById(dto.communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Verify user is a member
    await this.ensureCommunityMember(dto.communityId, userId);

    // Check permission
    const canCreate = await this.canManageItems(userId, dto.communityId);
    if (!canCreate) {
      throw new AppError(
        'You do not have permission to manage items in this community. You need the item_manager role or sufficient trust level.',
        403
      );
    }

    // Check name uniqueness (case-insensitive)
    const existing = await itemsRepository.findByName(dto.communityId, dto.name);
    if (existing) {
      throw new AppError(
        `An item with the name "${dto.name}" already exists in this community`,
        400
      );
    }

    // Validate name length
    if (dto.name.trim().length === 0) {
      throw new AppError('Item name cannot be empty', 400);
    }

    if (dto.name.length > 200) {
      throw new AppError('Item name cannot exceed 200 characters', 400);
    }

    // Create item
    const item = await itemsRepository.create({
      communityId: dto.communityId,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      kind: dto.kind,
      wealthValue: dto.wealthValue,
      createdBy: userId,
    });

    return item;
  }

  /**
   * Update an item
   */
  async updateItem(itemId: string, dto: UpdateItemDto, userId: string): Promise<Item> {
    const item = await itemsRepository.findById(itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Check if item is soft-deleted
    if (item.deletedAt) {
      throw new AppError('Cannot update a deleted item', 400);
    }

    // Verify user is a member
    await this.ensureCommunityMember(item.communityId, userId);

    // Check permission
    const canUpdate = await this.canManageItems(userId, item.communityId);
    if (!canUpdate) {
      throw new AppError(
        'You do not have permission to manage items in this community. You need the item_manager role or sufficient trust level.',
        403
      );
    }

    // If name is being changed, check uniqueness
    if (dto.name && dto.name.toLowerCase() !== item.name.toLowerCase()) {
      const existing = await itemsRepository.findByName(item.communityId, dto.name);
      if (existing && existing.id !== itemId) {
        throw new AppError(
          `An item with the name "${dto.name}" already exists in this community`,
          400
        );
      }

      // Validate name length
      if (dto.name.trim().length === 0) {
        throw new AppError('Item name cannot be empty', 400);
      }

      if (dto.name.length > 200) {
        throw new AppError('Item name cannot exceed 200 characters', 400);
      }
    }

    // Update item
    const updated = await itemsRepository.update(itemId, {
      name: dto.name?.trim(),
      description: dto.description !== undefined ? dto.description?.trim() || null : undefined,
      kind: dto.kind,
      wealthValue: dto.wealthValue,
    });

    if (!updated) {
      throw new AppError('Failed to update item', 500);
    }

    return updated;
  }

  /**
   * Delete an item (soft delete)
   */
  async deleteItem(itemId: string, userId: string): Promise<void> {
    const item = await itemsRepository.findById(itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Check if already deleted
    if (item.deletedAt) {
      throw new AppError('Item is already deleted', 400);
    }

    // Verify user is a member
    await this.ensureCommunityMember(item.communityId, userId);

    // Check permission
    const canDelete = await this.canManageItems(userId, item.communityId);
    if (!canDelete) {
      throw new AppError(
        'You do not have permission to manage items in this community. You need the item_manager role or sufficient trust level.',
        403
      );
    }

    // Prevent deletion of default items
    if (item.isDefault) {
      throw new AppError('Cannot delete default items', 400);
    }

    // Check if item has active wealth references
    const hasActiveReferences = await itemsRepository.hasActiveWealthReferences(itemId);
    if (hasActiveReferences) {
      throw new AppError(
        'Cannot delete item that has active wealth shares. Please wait for them to be fulfilled or cancelled.',
        400
      );
    }

    // Soft delete
    await itemsRepository.softDelete(itemId);
  }

  /**
   * Search items by name or description
   */
  async searchItems(
    communityId: string,
    userId: string,
    query?: string,
    kind?: 'object' | 'service'
  ): Promise<Item[]> {
    // Verify user is a member of the community
    await this.ensureCommunityMember(communityId, userId);

    return await itemsRepository.search(communityId, query, kind);
  }

  /**
   * Ensure default items exist for a community
   * Called when creating a community to create comprehensive default item categories
   */
  async ensureDefaultItem(communityId: string, creatorId: string): Promise<Item> {
    // Define all default items with specific, valuable items
    const defaultItems = [
      // Objects (physical items with clear value)
      {
        name: 'Fresh Vegetables (kg)',
        description: 'Fresh vegetables sold by weight',
        kind: 'object' as const,
        wealthValue: '5',
      },
      {
        name: 'Canned Food (unit)',
        description: 'Non-perishable canned food items',
        kind: 'object' as const,
        wealthValue: '3',
      },
      {
        name: 'Bread (loaf)',
        description: 'Fresh baked bread',
        kind: 'object' as const,
        wealthValue: '2',
      },
      {
        name: 'Clothing Item',
        description: 'Clothing items (shirts, pants, jackets, etc.)',
        kind: 'object' as const,
        wealthValue: '10',
      },
      {
        name: 'Hand Tool',
        description: 'Manual hand tools (hammer, screwdriver, wrench, etc.)',
        kind: 'object' as const,
        wealthValue: '15',
      },
      {
        name: 'Power Tool',
        description: 'Electric or battery-powered tools',
        kind: 'object' as const,
        wealthValue: '50',
      },
      {
        name: 'Book',
        description: 'Books, textbooks, or reading materials',
        kind: 'object' as const,
        wealthValue: '8',
      },
      {
        name: 'Bicycle',
        description: 'Bicycle for transportation or recreation',
        kind: 'object' as const,
        wealthValue: '100',
      },
      {
        name: 'Furniture Item',
        description: 'Household furniture (chair, table, shelf, etc.)',
        kind: 'object' as const,
        wealthValue: '50',
      },
      {
        name: 'Bedding/Linens Set',
        description: 'Bedding, sheets, pillows, or towels',
        kind: 'object' as const,
        wealthValue: '25',
      },

      // Services (specific services with clear value)
      {
        name: 'Home Repair (hour)',
        description: 'Home repair and maintenance services',
        kind: 'service' as const,
        wealthValue: '20',
      },
      {
        name: 'Gardening Help (hour)',
        description: 'Gardening, landscaping, and yard work',
        kind: 'service' as const,
        wealthValue: '15',
      },
      {
        name: 'Childcare (hour)',
        description: 'Babysitting and child supervision',
        kind: 'service' as const,
        wealthValue: '18',
      },
      {
        name: 'Tutoring (hour)',
        description: 'Educational tutoring and teaching',
        kind: 'service' as const,
        wealthValue: '25',
      },
      {
        name: 'Cooking/Meal Prep (meal)',
        description: 'Meal preparation and cooking services',
        kind: 'service' as const,
        wealthValue: '10',
      },
      {
        name: 'Transportation/Ride (trip)',
        description: 'Transportation and ride sharing',
        kind: 'service' as const,
        wealthValue: '8',
      },
      {
        name: 'Pet Care (day)',
        description: 'Pet sitting, walking, and care',
        kind: 'service' as const,
        wealthValue: '12',
      },
      {
        name: 'Tech Support (hour)',
        description: 'Computer and technology assistance',
        kind: 'service' as const,
        wealthValue: '30',
      },
      {
        name: 'Cleaning Service (hour)',
        description: 'House and office cleaning',
        kind: 'service' as const,
        wealthValue: '20',
      },
      {
        name: 'Moving Help (hour)',
        description: 'Moving and heavy lifting assistance',
        kind: 'service' as const,
        wealthValue: '18',
      },
    ];

    // Create all default items
    const createdItems: Item[] = [];
    for (const itemData of defaultItems) {
      // Check if item already exists (by exact name)
      const existing = await itemsRepository.findByName(communityId, itemData.name);
      if (!existing) {
        const item = await itemsRepository.create({
          communityId,
          name: itemData.name,
          description: itemData.description,
          kind: itemData.kind,
          wealthValue: itemData.wealthValue,
          isDefault: true,
          createdBy: creatorId,
        });
        createdItems.push(item);
      } else {
        createdItems.push(existing);
      }
    }

    // Return the first created item (for backward compatibility)
    // In practice, all items will be created together
    return createdItems[0];
  }
}

export const itemsService = new ItemsService();
