import { Component } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { NeedsList } from '@/components/features/needs/NeedsList';
import { Button } from '@/components/common/Button';

const CommunityNeedsPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const communityId = () => params.id;

  return (
    <>
      <Title>Community Needs</Title>
      <Meta name="description" content="View and manage community needs" />

      <div class="container mx-auto px-4 py-6 max-w-6xl">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">Community Needs</h1>
          <div class="flex gap-2">
            <Button onClick={() => navigate(`/communities/${communityId()}/needs/aggregate`)}>
              View Aggregation
            </Button>
            <Button onClick={() => navigate(`/communities/${communityId()}/needs/create`)}>
              Publish Need
            </Button>
          </div>
        </div>

        <NeedsList communityId={communityId()} />
      </div>
    </>
  );
};

export default CommunityNeedsPage;
