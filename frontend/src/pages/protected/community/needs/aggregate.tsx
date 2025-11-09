import { Component } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { NeedsAggregationView } from '@/components/features/needs/NeedsAggregationView';
import { Button } from '@/components/common/Button';

const AggregatedNeedsPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const communityId = () => params.id;

  const handleBack = () => {
    navigate(`/communities/${communityId()}/needs`);
  };

  return (
    <>
      <Title>Aggregated Community Needs</Title>
      <Meta name="description" content="View aggregated community needs for planning" />

      <div class="container mx-auto px-4 py-6 max-w-6xl">
        <div class="mb-6">
          <Button variant="secondary" onClick={handleBack}>
            ← Back to Needs
          </Button>
        </div>

        <NeedsAggregationView communityId={communityId()} />
      </div>
    </>
  );
};

export default AggregatedNeedsPage;
