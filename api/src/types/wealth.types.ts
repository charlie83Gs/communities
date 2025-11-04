export type CreateWealthDto = {
  communityId: string;
  title: string;
  description?: string | null;
  image?: string | null;
  durationType: 'timebound' | 'unlimited';
  endDate?: string | Date | null;
  distributionType: 'request_based' | 'unit_based';
  unitsAvailable?: number | null;
  maxUnitsPerUser?: number | null;
  automationEnabled?: boolean;
};

export type UpdateWealthDto = Partial<Pick<CreateWealthDto, 'title' | 'description' | 'image' | 'endDate' | 'unitsAvailable' | 'maxUnitsPerUser' | 'automationEnabled'>> & {
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
