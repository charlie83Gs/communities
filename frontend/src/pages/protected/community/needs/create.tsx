import { Component } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { NeedCreateForm } from '@/components/features/needs/NeedCreateForm';
import { Button } from '@/components/common/Button';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';

const CreateNeedPageContent: Component<{ communityId: string }> = (props) => {
  const navigate = useNavigate();
  const { canManageItems } = useCommunity();

  const handleCreated = () => {
    navigate(`/communities/${props.communityId}/needs`);
  };

  const handleCancel = () => {
    navigate(`/communities/${props.communityId}/needs`);
  };

  return (
    <>
      <Title>Publish Need</Title>
      <Meta name="description" content="Publish a new need for the community" />

      <div class="container mx-auto px-4 py-6 max-w-4xl">
        <div class="mb-6">
          <Button variant="secondary" onClick={handleCancel}>
            ← Back to Needs
          </Button>
        </div>

        <NeedCreateForm
          communityId={props.communityId}
          canManageItems={canManageItems()}
          onCreated={handleCreated}
        />
      </div>
    </>
  );
};

const CreateNeedPage: Component = () => {
  const params = useParams();
  const communityId = () => params.id;

  return (
    <CommunityProvider communityId={communityId()}>
      <CreateNeedPageContent communityId={communityId()} />
    </CommunityProvider>
  );
};

export default CreateNeedPage;
