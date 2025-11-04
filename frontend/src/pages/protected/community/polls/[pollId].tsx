import { Component } from 'solid-js';
import { useParams } from '@solidjs/router';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';
import { PollDetail } from '@/components/features/polls/PollDetail';
import { Title } from '@solidjs/meta';

const PollDetailPage: Component = () => {
  const params = useParams();
  const { community, role, isAdmin } = useCommunity();

  return (
    <>
      <Title>Poll Details - {community()?.name || 'Community'}</Title>
      <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
        <div class="container mx-auto p-4 max-w-4xl">
          <PollDetail
            communityId={params.id}
            pollId={params.pollId}
            currentUserId={role()?.userId}
            isAdmin={isAdmin()}
          />
        </div>
      </div>
    </>
  );
};

const PollDetailPageWrapper: Component = () => {
  const params = useParams();
  return (
    <CommunityProvider communityId={params.id}>
      <PollDetailPage />
    </CommunityProvider>
  );
};

export default PollDetailPageWrapper;
