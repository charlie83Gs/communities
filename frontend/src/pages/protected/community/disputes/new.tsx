/**
 * Create Dispute Page
 * Location per architecture: /pages/protected (route component)
 */

import { Component } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import { DisputeForm } from '@/components/features/disputes/DisputeForm';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from '@/components/features/disputes/disputes.i18n';

const CreateDisputePage: Component = () => {
  const t = makeTranslator(disputesDict, 'disputes');
  const params = useParams();
  const navigate = useNavigate();

  const communityId = () => params.id;

  const handleSuccess = (disputeId: string) => {
    navigate(`/communities/${communityId()}/disputes/${disputeId}`);
  };

  const handleCancel = () => {
    navigate(`/communities/${communityId()}`);
  };

  return (
    <>
      <Title>{t('createDisputeTitle')}</Title>

      <div class="max-w-3xl mx-auto p-6">
        <DisputeForm
          communityId={communityId()!}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
};

export default CreateDisputePage;
