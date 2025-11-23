import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { consumptionsService } from '@/services/api/consumptions.service';
import type {
  CreateConsumptionDto,
  UpdateConsumptionDto,
  LinkToReportDto,
} from '@/types/consumption.types';

/**
 * Query for listing council consumptions
 */
export const useConsumptionsQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>,
  params?: {
    page?: Accessor<number | undefined>;
    limit?: Accessor<number | undefined>;
  }
) => {
  return createQuery(() => ({
    queryKey: [
      'councils',
      councilId(),
      'consumptions',
      params?.page?.(),
      params?.limit?.(),
    ],
    queryFn: async () => {
      const cid = communityId();
      const cnid = councilId();
      if (!cid || !cnid) return { consumptions: [], total: 0, page: 1, limit: 20 };
      return consumptionsService.listConsumptions(cid, cnid, {
        page: params?.page?.(),
        limit: params?.limit?.(),
      });
    },
    enabled: !!communityId() && !!councilId(),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Query for unreported consumptions
 */
export const useUnreportedConsumptionsQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['councils', councilId(), 'consumptions', 'unreported'],
    queryFn: async () => {
      const cid = communityId();
      const cnid = councilId();
      if (!cid || !cnid) return { consumptions: [], total: 0, page: 1, limit: 100 };
      return consumptionsService.listUnreportedConsumptions(cid, cnid);
    },
    enabled: !!communityId() && !!councilId(),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Mutation to create a consumption
 */
export const useCreateConsumptionMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      dto: CreateConsumptionDto;
    }) => consumptionsService.createConsumption(vars.communityId, vars.councilId, vars.dto),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'consumptions'],
        exact: false,
      });
      // Also invalidate pool inventory
      void qc.invalidateQueries({
        queryKey: ['pools'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation to update a consumption
 */
export const useUpdateConsumptionMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      consumptionId: string;
      dto: UpdateConsumptionDto;
    }) =>
      consumptionsService.updateConsumption(
        vars.communityId,
        vars.councilId,
        vars.consumptionId,
        vars.dto
      ),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'consumptions'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation to delete a consumption
 */
export const useDeleteConsumptionMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      consumptionId: string;
    }) =>
      consumptionsService.deleteConsumption(
        vars.communityId,
        vars.councilId,
        vars.consumptionId
      ),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'consumptions'],
        exact: false,
      });
      // Also invalidate pool inventory (units restored)
      void qc.invalidateQueries({
        queryKey: ['pools'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation to link consumptions to a report
 */
export const useLinkToReportMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      dto: LinkToReportDto;
    }) => consumptionsService.linkToReport(vars.communityId, vars.councilId, vars.dto),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'consumptions'],
        exact: false,
      });
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports'],
        exact: false,
      });
    },
  }));
};
