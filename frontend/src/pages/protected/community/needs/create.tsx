import { Component } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { NeedCreateForm } from '@/components/features/needs/NeedCreateForm';
import { Button } from '@/components/common/Button';

const CreateNeedPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const communityId = () => params.id;

  const handleCreated = () => {
    navigate(`/communities/${communityId()}/needs`);
  };

  const handleCancel = () => {
    navigate(`/communities/${communityId()}/needs`);
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
          communityId={communityId()}
          canManageItems={true}
          onCreated={handleCreated}
        />
      </div>
    </>
  );
};

export default CreateNeedPage;
