import { Component, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { CouncilNeedCreateForm } from '@/components/features/needs/CouncilNeedCreateForm';
import { Button } from '@/components/common/Button';

// This is a placeholder - in a real app, you'd fetch the user's managed councils
// and the community ID for the council
const CouncilCreateNeedPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const councilId = () => params.id;

  // Placeholder: In reality, fetch council details and user's managed councils
  const [communityId] = createSignal(''); // This should come from fetching council details
  const [managedCouncils] = createSignal([
    { id: councilId(), name: 'Current Council', communityId: '' },
  ]);

  const handleCreated = () => {
    navigate(`/councils/${councilId()}/needs`);
  };

  const handleCancel = () => {
    navigate(`/councils/${councilId()}/needs`);
  };

  return (
    <>
      <Title>Publish Council Need</Title>
      <Meta name="description" content="Publish a new need for the council" />

      <div class="container mx-auto px-4 py-6 max-w-4xl">
        <div class="mb-6">
          <Button variant="secondary" onClick={handleCancel}>
            ← Back to Council Needs
          </Button>
        </div>

        <CouncilNeedCreateForm
          communityId={communityId()}
          managedCouncils={managedCouncils()}
          canManageItems={true}
          onCreated={handleCreated}
        />
      </div>
    </>
  );
};

export default CouncilCreateNeedPage;
