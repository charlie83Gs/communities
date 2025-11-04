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

// Time Range Type
export type TimeRange = '7d' | '30d' | '90d' | '1y';
