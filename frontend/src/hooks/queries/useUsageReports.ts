import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { councilUsageReportsService } from '@/services/api/councilUsageReports.service';
import type {
  CreateUsageReportDto,
  UpdateUsageReportDto,
} from '@/types/council.types';

/**
 * Queries and mutations for Council Usage Reports feature
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

export const useUsageReportsQuery = (
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
      'usage-reports',
      params?.page?.(),
      params?.limit?.(),
    ],
    queryFn: async () => {
      const cid = communityId();
      const cnid = councilId();
      if (!cid || !cnid) return { reports: [], total: 0, page: 1, limit: 20 };
      return councilUsageReportsService.getReports(cid, cnid, {
        page: params?.page?.(),
        limit: params?.limit?.(),
      });
    },
    enabled: !!communityId() && !!councilId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};

export const useUsageReportQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>,
  reportId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['councils', councilId(), 'usage-reports', reportId()],
    queryFn: () =>
      councilUsageReportsService.getReport(communityId()!, councilId()!, reportId()!),
    enabled: !!communityId() && !!councilId() && !!reportId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};

export const useCreateUsageReportMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      dto: CreateUsageReportDto;
    }) =>
      councilUsageReportsService.createReport(vars.communityId, vars.councilId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate usage reports list for the council
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports'],
        exact: false,
      });
    },
  }));
};

export const useUpdateUsageReportMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      reportId: string;
      dto: UpdateUsageReportDto;
    }) =>
      councilUsageReportsService.updateReport(
        vars.communityId,
        vars.councilId,
        vars.reportId,
        vars.dto
      ),
    onSuccess: (_data, vars) => {
      // Invalidate specific report and reports list
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports', vars.reportId],
      });
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports'],
        exact: false,
      });
    },
  }));
};

export const useDeleteUsageReportMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; reportId: string }) =>
      councilUsageReportsService.deleteReport(
        vars.communityId,
        vars.councilId,
        vars.reportId
      ),
    onSuccess: (_data, vars) => {
      // Invalidate usage reports list
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports'],
        exact: false,
      });
      // Remove specific report from cache
      void qc.removeQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports', vars.reportId],
      });
    },
  }));
};

export const useAddAttachmentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      reportId: string;
      file: File;
    }) =>
      councilUsageReportsService.addAttachment(
        vars.communityId,
        vars.councilId,
        vars.reportId,
        vars.file
      ),
    onSuccess: (_data, vars) => {
      // Invalidate specific report to refresh attachments
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports', vars.reportId],
      });
    },
  }));
};

export const useRemoveAttachmentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      reportId: string;
      attachmentId: string;
    }) =>
      councilUsageReportsService.removeAttachment(
        vars.communityId,
        vars.councilId,
        vars.reportId,
        vars.attachmentId
      ),
    onSuccess: (_data, vars) => {
      // Invalidate specific report to refresh attachments
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'usage-reports', vars.reportId],
      });
    },
  }));
};
