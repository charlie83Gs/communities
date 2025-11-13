import {
  itemsRepository,
  type ItemTranslations,
  type SupportedLanguage,
} from '@repositories/items.repository';
import { communityMemberRepository } from '@repositories/communityMember.repository';
import { communityRepository } from '@repositories/community.repository';
import { AppError } from '@utils/errors';
import { openFGAService } from './openfga.service';
import type { Item } from '@db/schema';
import {
  DEFAULT_ITEMS,
  DEFAULT_ITEM_LANGUAGE,
  type SupportedLanguage as ConfigSupportedLanguage,
} from '@config/defaultItems.constants';

export type CreateItemDto = {
  communityId: string;
  translations: ItemTranslations;
  kind: 'object' | 'service';
  wealthValue: string;
};

export type UpdateItemDto = {
  translations?: ItemTranslations;
  kind?: 'object' | 'service';
  wealthValue?: string;
};

// Item with flattened name/description for display
export interface ItemWithDisplay extends Item {
  name: string;
  description?: string;
}

export interface ItemListItem extends ItemWithDisplay {
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
   * @param language - Language for returned items (default: 'en')
   */
  async listItems(
    communityId: string,
    userId: string,
    language: SupportedLanguage = 'en',
    includeDeleted = false
  ): Promise<ItemListItem[]> {
    // Verify user is a member of the community
    await this.ensureCommunityMember(communityId, userId);

    const items = await itemsRepository.listByCommunity(communityId, includeDeleted);

    // Extract the requested language from translations and flatten to name/description
    return items.map((item) => {
      const translations = item.translations as ItemTranslations;
      const langTranslation = translations[language] || translations.en;

      return {
        ...item,
        name: langTranslation.name,
        description: langTranslation.description,
      } as ItemListItem;
    });
  }

  /**
   * Get item by ID
   * @param language - Language for returned item (default: 'en')
   */
  async getItemById(
    itemId: string,
    userId: string,
    language: SupportedLanguage = 'en'
  ): Promise<ItemWithDisplay> {
    const item = await itemsRepository.findById(itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Verify user is a member of the community
    await this.ensureCommunityMember(item.communityId, userId);

    // Extract the requested language from translations and flatten to name/description
    const translations = item.translations as ItemTranslations;
    const langTranslation = translations[language] || translations.en;

    return {
      ...item,
      name: langTranslation.name,
      description: langTranslation.description,
    };
  }

  /**
   * Create a new item
   */
  async createItem(dto: CreateItemDto, userId: string): Promise<ItemWithDisplay> {
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

    // Validate translations - at least 'en' must be provided
    if (!dto.translations.en || !dto.translations.en.name) {
      throw new AppError('English (en) translation with name is required', 400);
    }

    // Validate name length for all provided languages
    for (const [lang, trans] of Object.entries(dto.translations)) {
      if (trans.name.trim().length === 0) {
        throw new AppError(`Item name cannot be empty for language ${lang}`, 400);
      }
      if (trans.name.length > 200) {
        throw new AppError(`Item name cannot exceed 200 characters for language ${lang}`, 400);
      }
    }

    // Check name uniqueness (case-insensitive) - check English name
    const existing = await itemsRepository.findByName(dto.communityId, dto.translations.en.name);
    if (existing) {
      throw new AppError(
        `An item with the name "${dto.translations.en.name}" already exists in this community`,
        400
      );
    }

    // Trim whitespace from all translations
    const trimmedTranslations: ItemTranslations = {
      en: {
        name: dto.translations.en.name.trim(),
        description: dto.translations.en.description?.trim(),
      },
    };

    if (dto.translations.es) {
      trimmedTranslations.es = {
        name: dto.translations.es.name.trim(),
        description: dto.translations.es.description?.trim(),
      };
    }

    if (dto.translations.hi) {
      trimmedTranslations.hi = {
        name: dto.translations.hi.name.trim(),
        description: dto.translations.hi.description?.trim(),
      };
    }

    // Create item
    const item = await itemsRepository.create({
      communityId: dto.communityId,
      translations: trimmedTranslations,
      kind: dto.kind,
      wealthValue: dto.wealthValue,
      createdBy: userId,
    });

    // Flatten translations to name/description (use English by default)
    const langTranslation = trimmedTranslations.en;

    return {
      ...item,
      name: langTranslation.name,
      description: langTranslation.description,
    };
  }

  /**
   * Update an item
   */
  async updateItem(itemId: string, dto: UpdateItemDto, userId: string): Promise<ItemWithDisplay> {
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

    // If translations are being updated
    if (dto.translations) {
      // Validate name length for all provided languages
      for (const [lang, trans] of Object.entries(dto.translations)) {
        if (trans?.name && trans.name.trim().length === 0) {
          throw new AppError(`Item name cannot be empty for language ${lang}`, 400);
        }
        if (trans?.name && trans.name.length > 200) {
          throw new AppError(`Item name cannot exceed 200 characters for language ${lang}`, 400);
        }
      }

      // If English name is being changed, check uniqueness
      if (
        dto.translations.en?.name &&
        dto.translations.en.name.toLowerCase() !==
          (item.translations as ItemTranslations).en.name.toLowerCase()
      ) {
        const existing = await itemsRepository.findByName(
          item.communityId,
          dto.translations.en.name
        );
        if (existing && existing.id !== itemId) {
          throw new AppError(
            `An item with the name "${dto.translations.en.name}" already exists in this community`,
            400
          );
        }
      }

      // Trim whitespace from translations
      const trimmedTranslations: ItemTranslations = { en: { name: '' } };
      for (const [lang, trans] of Object.entries(dto.translations)) {
        if (trans) {
          (trimmedTranslations as any)[lang] = {
            name: trans.name?.trim(),
            description: trans.description?.trim(),
          };
        }
      }
      dto.translations = trimmedTranslations;
    }

    // Update item
    const updated = await itemsRepository.update(itemId, {
      translations: dto.translations,
      kind: dto.kind,
      wealthValue: dto.wealthValue,
    });

    if (!updated) {
      throw new AppError('Failed to update item', 500);
    }

    // Flatten translations to name/description (use English by default)
    const translations = updated.translations as ItemTranslations;
    const langTranslation = translations.en;

    return {
      ...updated,
      name: langTranslation.name,
      description: langTranslation.description,
    };
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
   * Search items by name or description in the specified language
   * @param language - Language to search in (default: 'en')
   */
  async searchItems(
    communityId: string,
    userId: string,
    language: SupportedLanguage = 'en',
    query?: string,
    kind?: 'object' | 'service'
  ): Promise<ItemWithDisplay[]> {
    // Verify user is a member of the community
    await this.ensureCommunityMember(communityId, userId);

    const items = await itemsRepository.search(communityId, language, query, kind);

    // Extract the requested language from translations and flatten to name/description
    return items.map((item) => {
      const translations = item.translations as ItemTranslations;
      const langTranslation = translations[language] || translations.en;

      return {
        ...item,
        name: langTranslation.name,
        description: langTranslation.description,
      };
    });
  }

  /**
   * Ensure default items exist for a community
   * Called when creating a community to create comprehensive default item categories
   *
   * @param communityId - The community ID to create items for
   * @param creatorId - The user ID creating the community
   * @param language - Primary language for fallback (default: 'en')
   * @returns The first created item (for backward compatibility)
   */
  async ensureDefaultItem(
    communityId: string,
    creatorId: string,
    _language: ConfigSupportedLanguage = DEFAULT_ITEM_LANGUAGE
  ): Promise<Item> {
    // Create all default items from the comprehensive constants file with all translations
    const createdItems: Item[] = [];

    for (const itemTemplate of DEFAULT_ITEMS) {
      // Check if item already exists (by English name)
      const enTranslation = itemTemplate.translations.en;
      const existing = await itemsRepository.findByName(communityId, enTranslation.name);

      if (!existing) {
        // Create item with all available translations
        const item = await itemsRepository.create({
          communityId,
          translations: {
            en: {
              name: itemTemplate.translations.en.name,
              description: itemTemplate.translations.en.description,
            },
            es: itemTemplate.translations.es
              ? {
                  name: itemTemplate.translations.es.name,
                  description: itemTemplate.translations.es.description,
                }
              : undefined,
            hi: itemTemplate.translations.hi
              ? {
                  name: itemTemplate.translations.hi.name,
                  description: itemTemplate.translations.hi.description,
                }
              : undefined,
          },
          kind: itemTemplate.kind,
          wealthValue: itemTemplate.wealthValue.toString(),
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
