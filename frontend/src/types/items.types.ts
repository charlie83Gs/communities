export type ItemKind = 'object' | 'service';

export interface Item {
  id: string;
  communityId: string;
  name: string;
  description?: string;
  kind: ItemKind;
  wealthValue: string; // Numeric string for precise decimal handling
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateItemDto {
  communityId: string;
  name: string;
  description?: string;
  kind: ItemKind;
  wealthValue: string; // Numeric string matching pattern /^\d+(\.\d{1,2})?$/
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  kind?: ItemKind;
  wealthValue?: string; // Numeric string matching pattern /^\d+(\.\d{1,2})?$/
}

export interface ItemListItem extends Item {
  _count?: {
    wealthEntries: number;
  };
}
