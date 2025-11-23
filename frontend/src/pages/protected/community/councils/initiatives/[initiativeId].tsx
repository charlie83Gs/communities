import { Component, Show, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { useInitiativeDetailQuery } from '@/hooks/queries/useInitiatives';
import { VoteButtons } from '@/components/features/initiatives/VoteButtons';
import { InitiativeComments } from '@/components/features/initiatives/InitiativeComments';
import { ReportsList } from '@/components/features/initiatives/ReportsList';
import { CreateReportModal } from '@/components/features/initiatives/CreateReportModal';
import { renderMarkdown } from '@/utils/markdown';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Badge } from '@/components/common/Badge';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativeDetailsDict } from './[initiativeId].i18n';
import { authStore } from '@/stores/auth.store';

const InitiativeDetailsPage: Component = () => {
  const params = useParams<{ id: string; councilId: string; initiativeId: string }>();
  const navigate = useNavigate();
  const t = makeTranslator(initiativeDetailsDict, 'initiativeDetails');

  const [showCreateReport, setShowCreateReport] = createSignal(false);

  const initiativeQuery = useInitiativeDetailQuery(
    () => params.id,
    () => params.councilId,
    () => params.initiativeId
  );

  // For now, assume managers can create reports
  // In production, this should check if user is a council manager
  const canCreateReport = () => {
    return !!authStore.user;
  };

  const handleGoBack = () => {
    navigate(`/communities/${params.id}/councils/${params.councilId}`);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusVariant = (status: 'active' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: 'active' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'active':
        return t('statusActive');
      case 'completed':
        return t('statusCompleted');
      case 'cancelled':
        return t('statusCancelled');
      default:
        return status;
    }
  };

  return (
    <>
      <Title>{initiativeQuery.data?.title ?? 'Initiative Details'}</Title>
      <Meta name="description" content={initiativeQuery.data?.description ?? ''} />

      <div class="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <button
          onClick={handleGoBack}
          class="inline-flex items-center gap-2 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-6 cursor-pointer"
        >
          <Icon name="arrow-left" size={16} />
          {t('backToCouncil')}
        </button>

        {/* Loading State */}
        <Show when={initiativeQuery.isLoading}>
          <div class="text-center py-12">
            <p class="text-stone-600 dark:text-stone-400">{t('loading')}</p>
          </div>
        </Show>

        {/* Error State */}
        <Show when={initiativeQuery.isError}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md">
            {t('error')}
          </div>
        </Show>

        {/* Initiative Details */}
        <Show when={initiativeQuery.data}>
          <div class="space-y-6">
            {/* Header Card */}
            <Card>
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">
                        {initiativeQuery.data!.title}
                      </h1>
                      <Badge variant={getStatusVariant(initiativeQuery.data!.status)}>
                        {getStatusLabel(initiativeQuery.data!.status)}
                      </Badge>
                    </div>
                    <div class="flex flex-wrap gap-4 text-sm text-stone-600 dark:text-stone-400">
                      <span class="flex items-center gap-1">
                        <Icon name="members" size={16} />
                        {t('createdBy')}: {initiativeQuery.data!.createdBy || 'Unknown'}
                      </span>
                      <span class="flex items-center gap-1">
                        <Icon name="activity" size={16} />
                        {formatDateTime(initiativeQuery.data!.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vote buttons */}
                <div class="border-t border-stone-200 dark:border-stone-700 pt-4">
                  <VoteButtons
                    communityId={params.id}
                    councilId={params.councilId}
                    initiativeId={params.initiativeId}
                    upvotes={initiativeQuery.data!.upvotes || 0}
                    downvotes={initiativeQuery.data!.downvotes || 0}
                    userVote={initiativeQuery.data!.userVote}
                  />
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <div class="p-6">
                <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
                  {t('description')}
                </h2>
                <div
                  class="prose dark:prose-invert max-w-none"
                  innerHTML={renderMarkdown(initiativeQuery.data!.description)}
                />
              </div>
            </Card>

            {/* Reports Section */}
            <Card>
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {t('reports')}
                  </h2>
                  <Show when={canCreateReport()}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowCreateReport(true)}
                    >
                      <Icon name="plus" size={16} class="mr-1" />
                      {t('createReport')}
                    </Button>
                  </Show>
                </div>
                <ReportsList
                  communityId={params.id}
                  councilId={params.councilId}
                  initiativeId={params.initiativeId}
                />
              </div>
            </Card>

            {/* Comments Section */}
            <Card>
              <div class="p-6">
                <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
                  {t('comments')}
                </h2>
                <InitiativeComments
                  communityId={params.id}
                  councilId={params.councilId}
                  initiativeId={params.initiativeId}
                />
              </div>
            </Card>
          </div>
        </Show>
      </div>

      {/* Create Report Modal */}
      <CreateReportModal
        communityId={params.id}
        councilId={params.councilId}
        initiativeId={params.initiativeId}
        isOpen={showCreateReport()}
        onClose={() => setShowCreateReport(false)}
      />
    </>
  );
};

export default InitiativeDetailsPage;
