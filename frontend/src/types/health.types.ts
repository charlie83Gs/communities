// Community Health Analytics Types

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

// Wealth Health Types
export interface WealthOverview {
  openShares: number;
  totalShares: number;
  activeCategories: number;
  timeSeries: {
    shares: TimeSeriesDataPoint[];
    requests: TimeSeriesDataPoint[];
    fulfilled: TimeSeriesDataPoint[];
  };
}

export interface WealthItemStats {
  category: string;
  subcategory: string | null;
  shareCount: number;
  valuePoints: number;
  trend: number[]; // Sparkline data points
}

export interface WealthHealthData {
  overview: WealthOverview;
  items: WealthItemStats[];
}

// Trust Health Types
export interface TrustOverview {
  totalTrust: number;
  averageTrust: number;
  trustPerDay: number;
  timeSeries: {
    awarded: TimeSeriesDataPoint[];
    removed: TimeSeriesDataPoint[];
    net: TimeSeriesDataPoint[];
  };
}

export interface TrustDistribution {
  levelName: string;
  scoreRange: string;
  userCount: number;
}

export interface TrustHealthData {
  overview: TrustOverview;
  distribution: TrustDistribution[];
}

// Needs Health Types
export interface NeedsOverview {
  totalActiveNeeds: number;
  totalActiveWants: number;
  activeMembers: number;
  activeCouncils: number;
  objectsVsServices: {
    objects: number;
    services: number;
  };
  timeSeries: {
    needs: TimeSeriesDataPoint[];
    wants: TimeSeriesDataPoint[];
  };
}

export interface NeedsItemStats {
  categoryName: string;
  itemName: string;
  priority: 'need' | 'want';
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  totalUnitsNeeded: number;
  memberCount: number;
  source: 'member' | 'council' | 'both';
}

export interface NeedsHealthData {
  overview: NeedsOverview;
  items: NeedsItemStats[];
}

// Aggregated Needs Types
export interface AggregatedNeedsItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  needsTotal: number;
  wantsTotal: number;
  totalUnits: number;
  participantCount: number;
}

export interface AggregatedNeedsData {
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  items: AggregatedNeedsItem[];
}

// Aggregated Wealth Types
export interface AggregatedWealthData {
  itemId: string;
  itemName: string;
  categoryName: string;
  activeShares: number;
  totalValuePoints: number;
  sharerCount: number;
  totalQuantity: number;
}

// Time Range Type
export type TimeRange = '7d' | '30d' | '90d' | '1y';
