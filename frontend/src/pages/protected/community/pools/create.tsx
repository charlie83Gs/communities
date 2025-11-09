import { Component, Show, createMemo } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { PoolCreateForm } from '@/components/features/pools/PoolCreateForm';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolsCreateDict } from './create.i18n';
import { useManagedCouncilsQuery } from '@/hooks/queries/useCouncils';

const useManagedCouncils = (communityId: () => string) => {
  const councilsQuery = useManagedCouncilsQuery(communityId);

  const managedCouncils = createMemo(() => {
    if (!councilsQuery.data) return [];

    // Map councils to the format expected by the form
    return councilsQuery.data.councils.map(council => ({
      id: council.id,
      name: council.name,
    }));
  });

  return {
    data: managedCouncils(),
    isLoading: councilsQuery.isLoading,
  };
};

const PoolsCreatePage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = makeTranslator(poolsCreateDict, 'poolsCreate');

  const managedCouncils = useManagedCouncils(() => params.id);

  const handleGoBack = () => {
    navigate(`/communities/${params.id}`);
  };

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('title')} />

      <div class="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <button
          onClick={handleGoBack}
          class="inline-flex items-center gap-2 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-6 cursor-pointer"
        >
          <Icon name="arrow-left" size={16} />
          {t('backToPools')}
        </button>

        {/* No Councils Warning */}
        <Show when={!managedCouncils.isLoading && managedCouncils.data?.length === 0}>
          <div class="bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200 px-6 py-4 rounded-md mb-6">
            <h3 class="font-semibold mb-2">{t('noCouncils')}</h3>
            <p class="text-sm mb-4">{t('noCouncilsDesc')}</p>
            <Button variant="secondary" size="sm">
              {t('createCouncil')}
            </Button>
          </div>
        </Show>

        {/* Create Form */}
        <Show when={managedCouncils.data && managedCouncils.data.length > 0}>
          <PoolCreateForm
            communityId={params.id}
            managedCouncils={managedCouncils.data!}
          />
        </Show>
      </div>
    </>
  );
};

export default PoolsCreatePage;
