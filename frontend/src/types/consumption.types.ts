/**
 * Pool Consumption types
 * Consumptions track when councils use items from pools
 */

export interface PoolConsumption {
  id: string;
  poolId: string;
  councilId: string;
  itemId: string;
  units: number;
  description: string;
  reportId: string | null;
  reportTitle: string | null;
  consumedBy: string;
  consumerName: string;
  poolName: string;
  itemName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsumptionDto {
  poolId: string;
  itemId: string;
  units: number;
  description: string;
  reportId?: string;
}

export interface UpdateConsumptionDto {
  description?: string;
  reportId?: string | null;
}

export interface LinkToReportDto {
  consumptionIds: string[];
  reportId: string;
}

export interface ConsumptionsListResponse {
  consumptions: PoolConsumption[];
  total: number;
  page: number;
  limit: number;
}
