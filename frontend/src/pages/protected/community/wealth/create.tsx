import { Component } from 'solid-js';
import { useParams, useNavigate, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { WealthCreateForm } from '@/components/features/wealth/WealthCreateForm';
import { Icon } from '@/components/common/Icon';
import { useCommunity, CommunityProvider } from '@/contexts/CommunityContext';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthCreateDict } from './create.i18n';

const WealthCreatePageContent: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = makeTranslator(wealthCreateDict, 'wealthCreate');
  const community = useCommunity();

  const handleCreated = () => {
    navigate(`/communities/${params.id}/wealth`);
  };

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back link */}
        <A
          href={`/communities/${params.id}/wealth`}
          class="inline-flex items-center text-sm text-stone-600 dark:text-stone-400 hover:text-ocean-600 dark:hover:text-ocean-400 mb-4"
        >
          <Icon name="arrow-left" size={16} class="mr-1" />
          {t('backToWealth')}
        </A>

        {/* Header */}
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h1>
          <p class="text-stone-600 dark:text-stone-400 mt-1">{t('subtitle')}</p>
        </div>

        {/* Create Form */}
        <WealthCreateForm
          communityId={params.id}
          canManageItems={community.canManageItems()}
          onCreated={handleCreated}
        />
      </div>
    </>
  );
};

const WealthCreatePage: Component = () => {
  const params = useParams<{ id: string }>();

  return (
    <CommunityProvider communityId={params.id}>
      <WealthCreatePageContent />
    </CommunityProvider>
  );
};

export default WealthCreatePage;
