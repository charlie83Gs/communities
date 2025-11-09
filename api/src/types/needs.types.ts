export type CreateNeedDto = {
  communityId: string;
  itemId: string;
  title: string;
  description?: string | null;
  priority: 'need' | 'want';
  unitsNeeded: number;
  // Recurrence fields
  isRecurring: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly' | null;
};

export type UpdateNeedDto = Partial<
  Pick<
    CreateNeedDto,
    'title' | 'description' | 'priority' | 'unitsNeeded' | 'isRecurring' | 'recurrence'
  >
> & {
  status?: 'active' | 'fulfilled' | 'cancelled' | 'expired';
};

export type CreateCouncilNeedDto = {
  councilId: string;
  communityId: string;
  itemId: string;
  title: string;
  description?: string | null;
  priority: 'need' | 'want';
  unitsNeeded: number;
  // Recurrence fields
  isRecurring: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly' | null;
};

export type UpdateCouncilNeedDto = Partial<
  Pick<
    CreateCouncilNeedDto,
    'title' | 'description' | 'priority' | 'unitsNeeded' | 'isRecurring' | 'recurrence'
  >
> & {
  status?: 'active' | 'fulfilled' | 'cancelled' | 'expired';
};

export type NeedAggregation = {
  itemId: string;
  itemName: string;
  itemKind: 'object' | 'service';
  priority: 'need' | 'want';
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  totalUnitsNeeded: number;
  memberCount: number;
};

export type CommunityNeedsAggregation = {
  needs: NeedAggregation[];
  wants: NeedAggregation[];
};
