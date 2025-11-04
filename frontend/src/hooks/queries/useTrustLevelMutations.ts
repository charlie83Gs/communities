import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { trustLevelsService } from '@/services/api/trustLevels.service';
import type { CreateTrustLevelDto, UpdateTrustLevelDto, TrustLevel } from '@/types/community.types';

export const useCreateTrustLevelMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (data: { communityId: string; dto: CreateTrustLevelDto }) => {
      return trustLevelsService.createTrustLevel(data.communityId, data.dto);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trustLevels', variables.communityId] });
    },
  }));
};

export const useUpdateTrustLevelMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (data: { communityId: string; id: string; dto: UpdateTrustLevelDto }) => {
      return trustLevelsService.updateTrustLevel(data.communityId, data.id, data.dto);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trustLevels', variables.communityId] });
    },
  }));
};

export const useDeleteTrustLevelMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (data: { communityId: string; id: string }) => {
      return trustLevelsService.deleteTrustLevel(data.communityId, data.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trustLevels', variables.communityId] });
    },
  }));
};
