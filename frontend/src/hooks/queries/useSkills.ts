import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { skillsService } from '@/services/api/skills.service';
import type {
  GetUserSkillsResponse,
  CreateSkillDto,
  CreateSkillResponse,
  GetSkillSuggestionsResponse,
  EndorseSkillDto,
} from '@/types/skills.types';

/**
 * Query: Get user's skills with endorsement counts
 */
export const useUserSkillsQuery = (
  userId: Accessor<string | undefined>,
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['skills', 'user', userId(), communityId()],
    queryFn: () => skillsService.getUserSkills(userId()!, communityId()!),
    enabled: !!userId() && !!communityId(),
    staleTime: 30000, // 30 seconds
  })) as ReturnType<typeof createQuery<GetUserSkillsResponse, Error>>;
};

/**
 * Query: Get skill suggestions for endorsement
 */
export const useSkillSuggestionsQuery = (
  userId: Accessor<string | undefined>,
  communityId: Accessor<string | undefined>,
  itemId?: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['skills', 'suggestions', userId(), communityId(), itemId?.()],
    queryFn: () => skillsService.getSkillSuggestions(userId()!, communityId()!, itemId?.()),
    enabled: !!userId() && !!communityId(),
    staleTime: 30000,
  })) as ReturnType<typeof createQuery<GetSkillSuggestionsResponse, Error>>;
};

/**
 * Mutation: Create a new skill
 */
export const useCreateSkillMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (data: CreateSkillDto) => skillsService.createSkill(data),
    onSuccess: () => {
      // Invalidate all user skills queries
      void queryClient.invalidateQueries({ queryKey: ['skills', 'user'], exact: false });
      void queryClient.invalidateQueries({ queryKey: ['skills', 'suggestions'], exact: false });
    },
  })) as ReturnType<typeof createMutation<CreateSkillResponse, Error, CreateSkillDto>>;
};

/**
 * Mutation: Delete a skill
 */
export const useDeleteSkillMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (skillId: string) => skillsService.deleteSkill(skillId),
    onSuccess: () => {
      // Invalidate all user skills queries
      void queryClient.invalidateQueries({ queryKey: ['skills', 'user'], exact: false });
      void queryClient.invalidateQueries({ queryKey: ['skills', 'suggestions'], exact: false });
    },
  }));
};

/**
 * Mutation: Endorse a skill
 */
export const useEndorseSkillMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ skillId, data }: { skillId: string; data: EndorseSkillDto }) =>
      skillsService.endorseSkill(skillId, data),
    onSuccess: (_, variables) => {
      // Invalidate skills queries for the affected community
      void queryClient.invalidateQueries({
        queryKey: ['skills', 'user'],
        exact: false,
      });
      void queryClient.invalidateQueries({
        queryKey: ['skills', 'suggestions'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation: Remove endorsement
 */
export const useRemoveEndorsementMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ skillId, communityId }: { skillId: string; communityId: string }) =>
      skillsService.removeEndorsement(skillId, communityId),
    onSuccess: () => {
      // Invalidate skills queries
      void queryClient.invalidateQueries({
        queryKey: ['skills', 'user'],
        exact: false,
      });
      void queryClient.invalidateQueries({
        queryKey: ['skills', 'suggestions'],
        exact: false,
      });
    },
  }));
};
