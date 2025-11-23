export type ItemKind = 'object' | 'service';

export interface ItemTranslation {
  name: string;
  description?: string;
}

export interface ItemTranslations {
  en?: ItemTranslation;
  es?: ItemTranslation;
  hi?: ItemTranslation;
}

export interface Item {
  id: string;
  communityId: string;
  name: string;
  description?: string;
  translations?: ItemTranslations;
  kind: ItemKind;
  wealthValue: string; // Numeric string for precise decimal handling
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateItemDto {
  communityId: string;
  name?: string; // Optional when translations provided
  description?: string; // Optional when translations provided
  translations?: ItemTranslations; // New multi-language format
  kind: ItemKind;
  wealthValue: string; // Numeric string matching pattern /^\d+(\.\d{1,2})?$/
}

export interface UpdateItemDto {
  name?: string; // Optional when translations provided
  description?: string; // Optional when translations provided
  translations?: ItemTranslations; // New multi-language format
  kind?: ItemKind;
  wealthValue?: string; // Numeric string matching pattern /^\d+(\.\d{1,2})?$/
}

export interface ItemListItem extends Item {
  _count?: {
    wealthEntries: number;
  };
}
