import { Component } from 'solid-js';
import { useParams, useNavigate, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { CreatePollForm } from '@/components/features/polls/CreatePollForm';
import { CommunityProvider } from '@/contexts/CommunityContext';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pollsDict } from '@/components/features/polls/polls.i18n';

const CreatePollPageContent: Component<{ communityId: string }> = (props) => {
  const navigate = useNavigate();
  const t = makeTranslator(pollsDict, 'polls');

  const handleSuccess = () => {
    navigate(`/communities/${props.communityId}/discussion`);
  };

  const handleCancel = () => {
    navigate(`/communities/${props.communityId}/discussion`);
  };

  return (
    <>
      <Title>{t('createPollTitle')}</Title>
      <Meta name="description" content={t('createPollTitle')} />

      <div class="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Link */}
        <A
          href={`/communities/${props.communityId}/discussion`}
          class="inline-flex items-center gap-1 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-4"
        >
          <span>←</span> Back to Discussion
        </A>

        {/* Form Container */}
        <div class="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
          <CreatePollForm
            communityId={props.communityId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
};

const CreatePollPage: Component = () => {
  const params = useParams<{ id: string }>();

  return (
    <CommunityProvider communityId={params.id}>
      <CreatePollPageContent communityId={params.id} />
    </CommunityProvider>
  );
};

export default CreatePollPage;
