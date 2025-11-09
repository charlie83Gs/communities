export type CreateWealthDto = {
  communityId: string;
  itemId: string;
  title: string;
  description?: string | null;
  image?: string | null;
  durationType: 'timebound' | 'unlimited';
  endDate?: string | Date | null;
  distributionType: 'unit_based';
  unitsAvailable?: number | null;
  maxUnitsPerUser?: number | null;
  // Recurrent fields
  isRecurrent?: boolean;
  recurrentFrequency?: 'weekly' | 'monthly' | null;
  recurrentReplenishValue?: number | null;
  automationEnabled?: boolean;
};

export type UpdateWealthDto = Partial<
  Pick<
    CreateWealthDto,
    | 'title'
    | 'description'
    | 'image'
    | 'endDate'
    | 'unitsAvailable'
    | 'maxUnitsPerUser'
    | 'recurrentFrequency'
    | 'recurrentReplenishValue'
    | 'automationEnabled'
  >
> & {
  status?: 'active' | 'fulfilled' | 'expired' | 'cancelled';
};

export type CreateWealthCommentDto = {
  wealthId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
};

export type UpdateWealthCommentDto = {
  content?: string;
};
