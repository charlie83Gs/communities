import { Component, createSignal, Show } from 'solid-js';
import { useAuth } from '@/hooks/useAuth';
import { Title } from '@solidjs/meta';
import { useQueryClient } from '@tanstack/solid-query';
import { useMyInvitesQuery } from '@/hooks/queries/useMyInvitesQuery';
import { useCreateCommunity } from '@/hooks/queries/useCreateCommunity';
import MyInvitesList from '@/components/features/invites/MyInvitesList';
import { CommunityList } from '@/components/features/communities/CommunityList';
import { CreateCommunityForm } from '@/components/features/communities/CreateCommunityForm';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { dashboardDict } from './dashboard.i18n';

const Dashboard: Component = () => {
  const { user } = useAuth();
  const myInvitesQuery = useMyInvitesQuery(() => user()?.id);
  const t = makeTranslator(dashboardDict, 'dashboard');
  const [showForm, setShowForm] = createSignal(false);
  const queryClient = useQueryClient();
  const createCommunity = useCreateCommunity();

  const handleCreateSuccess = () => {
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['communities', 'search'] });
  };

  return (
    <>
      <Title>{t('title')}</Title>
      <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div class="relative overflow-hidden bg-stone-50 dark:bg-stone-800 shadow rounded-lg mb-6 border border-stone-200 dark:border-stone-700">
            <div class="absolute inset-0 bg-gradient-to-r from-ocean-600/10 to-forest-600/10 dark:from-ocean-500/20 dark:to-forest-500/20"></div>
            <div class="relative p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
                  <span class="text-2xl">👋</span>
                </div>
                <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">{t('heading')}</h1>
              </div>
              <p class="text-stone-600 dark:text-stone-300 mb-4">{t('welcome')}, {user()?.displayName || user()?.username || 'User'}!</p>
            </div>
          </div>

          {/* Invites Section */}
          <div class="bg-stone-50 dark:bg-stone-800 shadow rounded-lg p-6 border border-stone-200 dark:border-stone-700 mb-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-sage-100 dark:bg-sage-900 rounded-full flex items-center justify-center">
                <span class="text-xl">📧</span>
              </div>
              <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">{t('yourInvites')}</h2>
            </div>
            <MyInvitesList
              invites={myInvitesQuery.data || []}
              isLoading={myInvitesQuery.isLoading}
              isError={myInvitesQuery.isError}
            />
          </div>

          {/* My Communities Section */}
          <div class="bg-stone-50 dark:bg-stone-800 shadow rounded-lg p-6 border border-stone-200 dark:border-stone-700">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-forest-100 dark:bg-forest-900 rounded-full flex items-center justify-center">
                  <span class="text-xl">🏘️</span>
                </div>
                <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">{t('myCommunities')}</h2>
              </div>
              <Button
                onClick={() => setShowForm(!showForm())}
                class="bg-ocean-600 hover:bg-ocean-700 dark:bg-ocean-500 dark:hover:bg-ocean-600"
              >
                {showForm() ? t('btnCancel') : t('btnCreateCommunity')}
              </Button>
            </div>

            <Show when={showForm()}>
              <Card class="mb-6 p-6">
                <CreateCommunityForm onSuccess={handleCreateSuccess} />
              </Card>
            </Show>

            <CommunityList />

            <Show when={createCommunity.isPending}>
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">{t('creatingOverlay')}</div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
