/**
 * Disputes List Page
 * Location per architecture: /pages/protected (route component)
 */

import { Component } from 'solid-js';
import { useParams } from '@solidjs/router';
import { Title } from '@solidjs/meta';
import { DisputesList } from '@/components/features/disputes/DisputesList';
import { useCommunity } from '@/contexts/CommunityContext';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from '@/components/features/disputes/disputes.i18n';

const DisputesListPage: Component = () => {
  const t = makeTranslator(disputesDict, 'disputes');
  const params = useParams();
  const { canViewDisputes } = useCommunity();

  const communityId = () => params.id;

  return (
    <>
      <Title>{t('title')}</Title>

      <div class="max-w-5xl mx-auto p-6">
        <DisputesList
          communityId={communityId()!}
          canCreateDispute={canViewDisputes()}
        />
      </div>
    </>
  );
};

export default DisputesListPage;
