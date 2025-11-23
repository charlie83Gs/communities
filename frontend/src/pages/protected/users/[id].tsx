import { Component, Show, createMemo, For, createSignal } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { useParams, useNavigate } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { useAuth } from '@/hooks/useAuth';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { Card } from '@/components/common/Card';
import { usersService } from '@/services/api/users.service';
import { useUserPreferencesByIdQuery } from '@/hooks/queries/useUserPreferencesByIdQuery';
import { useUserCommunitiesQuery } from '@/hooks/queries/useUserCommunitiesQuery';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import { SkillsProfile } from '@/components/features/skills/SkillsProfile';
import type { SearchUser, UserPreferences } from '@/types/user.types';
import type { Community } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { userProfileDict } from './[id].i18n';

const UserProfile: Component = () => {
  const t = makeTranslator(userProfileDict, 'userProfile');
  const params = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const userId = createMemo(() => params.id);

  const userQuery = createQuery(() => ({
    queryKey: ['user', userId()],
    queryFn: () => usersService.getUser(userId()!),
    enabled: !!userId(),
  })) as ReturnType<typeof createQuery<SearchUser, Error>>;

  const preferencesQuery = useUserPreferencesByIdQuery(userId);
  const communitiesQuery = useUserCommunitiesQuery(userId);

  const isOwnProfile = createMemo(() => currentUser()?.id === userId());

  // Skills section state
  const [selectedCommunityId, setSelectedCommunityId] = createSignal<string | undefined>(undefined);

  // Auto-select first community when communities load
  createMemo(() => {
    const communities = communitiesQuery.data;
    if (communities && communities.length > 0 && !selectedCommunityId()) {
      setSelectedCommunityId(communities[0].id);
    }
  });

  // Get trust summary for the selected community to check endorsement permission
  const trustSummaryQuery = useMyTrustSummaryQuery(() => selectedCommunityId());

  // Check permission to endorse skills (using canAwardTrust as proxy - same threshold)
  const canEndorse = () => trustSummaryQuery.data?.canAwardTrust || false;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId())) {
    navigate('/not-found', { replace: true });
    return null;
  }

  const baseUrl = import.meta.env.VITE_API_URL as string;

  const preferences = () => preferencesQuery.data as UserPreferences || {};

  return (
    <>
      <Title>{userQuery.data?.displayName ? `${userQuery.data.displayName}${t('profileOf')}` : t('genericTitle')}{t('titleSuffix')}</Title>
      <Meta name="description" content={t('metaDescription')} />

      <div class="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
        <Show
          when={!userQuery.isLoading && userQuery.data}
          fallback={
            <div class="text-center py-8">
              <p class="text-stone-600 dark:text-stone-300">{userQuery.isLoading ? t('loading') : t('notFound')}</p>
            </div>
          }
        >
          {(profileUser) => (
            <div class="bg-stone-50 dark:bg-stone-800 shadow-md rounded-lg max-w-2xl mx-auto border border-stone-200 dark:border-stone-700 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-ocean-600/10 to-forest-600/10 dark:from-ocean-500/20 dark:to-forest-500/20"></div>
              <div class="relative p-6">
                {/* Basic User Info */}
                <div class="mb-6">
                  <h1 class="text-3xl font-bold mb-4 text-stone-900 dark:text-stone-100">{profileUser().displayName || profileUser().username || t('genericTitle')}</h1>
                  <div class="flex flex-col items-center md:items-start md:flex-row md:items-center gap-6 mb-6">
                    <Show when={preferences().profileImage}>
                      <div class="relative">
                        <div class="absolute inset-0 bg-gradient-to-br from-ocean-400 to-forest-400 rounded-full blur-sm opacity-30"></div>
                        <CredentialedImage
                          src={`${baseUrl}/api/v1/images/${preferences().profileImage}`}
                          alt={t('profileAlt')}
                          class="relative w-20 h-20 rounded-full object-cover ring-2 ring-ocean-200 dark:ring-ocean-800"
                          fallbackText={t('noProfileImage')}
                        />
                      </div>
                    </Show>
                    <Show when={!preferences().profileImage}>
                      <div class="relative">
                        <div class="absolute inset-0 bg-gradient-to-br from-ocean-400 to-forest-400 rounded-full blur-sm opacity-30"></div>
                        <div class="relative w-20 h-20 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center text-stone-900 dark:text-stone-100 text-2xl font-bold ring-2 ring-ocean-200 dark:ring-ocean-800">
                          {(profileUser().displayName || profileUser().username || '?').charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </Show>
                  <div class="flex-1">
                    <Show when={isOwnProfile()}>
                      <p class="text-sm text-stone-500 dark:text-stone-400 mb-2">{t('thisIsYou')}</p>
                    </Show>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('usernameLabel')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{profileUser().username || t('notSet')}</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('emailLabel')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{profileUser().email}</p>
                      </div>
                      <Show when={profileUser().displayName}>
                        <div>
                          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('displayNameLabel')}</label>
                          <p class="text-stone-900 dark:text-stone-100">{profileUser().displayName}</p>
                        </div>
                      </Show>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('descriptionLabel')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{preferences().description || t('notSet')}</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('joinedLabel')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{t('createdNA')} {/* Requires createdAt in user response */}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Show when={preferencesQuery.isError}>
                <div class="text-red-500 dark:text-red-400 mb-4">{t('errorPreferences')}</div>
              </Show>
              <Show when={preferencesQuery.isLoading}>
                <div class="text-center py-4 text-stone-600 dark:text-stone-300">{t('loadingPreferences')}</div>
              </Show>

                {/* Communities Section */}
                <div class="mb-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-forest-100 dark:bg-forest-900 rounded-full flex items-center justify-center">
                      <span class="text-xl">🏘️</span>
                    </div>
                    <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">{t('communitiesTitle')}</h2>
                  </div>
                <Show when={!communitiesQuery.isLoading && communitiesQuery.data && communitiesQuery.data.length > 0}>
                  <div class="space-y-3">
                    <For each={communitiesQuery.data}>
                      {(community) => (
                        <Card>
                          <a href={`/communities/${community.id}`} class="block p-4 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                            <h3 class="font-medium text-stone-900 dark:text-stone-100">{community.name}</h3>
                            <p class="text-sm text-stone-600 dark:text-stone-300">{community.description || t('communityNoDescription')}</p>
                          </a>
                        </Card>
                      )}
                    </For>
                  </div>
                </Show>
                <Show when={communitiesQuery.data && communitiesQuery.data.length === 0}>
                  <p class="text-stone-500 dark:text-stone-400">{t('communitiesEmpty')}</p>
                </Show>
                <Show when={communitiesQuery.isError}>
                  <div class="text-red-500 dark:text-red-400">{t('errorCommunities')}</div>
                </Show>
                  <Show when={communitiesQuery.isLoading}>
                    <div class="text-center py-4 text-stone-600 dark:text-stone-300">{t('loadingCommunities')}</div>
                  </Show>
                </div>

                {/* Skills & Endorsements Section */}
                <div class="mb-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
                      <span class="text-xl">🎯</span>
                    </div>
                    <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">{t('skillsTitle')}</h2>
                  </div>

                  <Show
                    when={!communitiesQuery.isLoading && communitiesQuery.data && communitiesQuery.data.length > 0}
                    fallback={
                      <p class="text-stone-500 dark:text-stone-400">{t('noCommunitiesForSkills')}</p>
                    }
                  >
                    {/* Community selector if user is in multiple communities */}
                    <Show when={(communitiesQuery.data?.length || 0) > 1}>
                      <div class="mb-4">
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                          {t('selectCommunity')}
                        </label>
                        <select
                          class="w-full md:w-auto px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                          value={selectedCommunityId()}
                          onChange={(e) => setSelectedCommunityId(e.currentTarget.value)}
                        >
                          <For each={communitiesQuery.data}>
                            {(community) => (
                              <option value={community.id}>{community.name}</option>
                            )}
                          </For>
                        </select>
                      </div>
                    </Show>

                    {/* Display selected community name if only one */}
                    <Show when={(communitiesQuery.data?.length || 0) === 1}>
                      <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">
                        {t('skillsDescription')} <strong>{communitiesQuery.data?.[0]?.name}</strong>
                      </p>
                    </Show>

                    {/* Skills Profile Component */}
                    <Show when={selectedCommunityId()}>
                      <SkillsProfile
                        userId={userId()!}
                        communityId={selectedCommunityId()!}
                        canEndorseSkills={canEndorse()}
                      />
                    </Show>
                  </Show>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </>
  );
};

export default UserProfile;
