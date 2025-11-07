import { Component, Show, createSignal, createMemo } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { createQuery } from '@tanstack/solid-query';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferencesQuery } from '@/hooks/queries/useUserPreferencesQuery';
import { useUpdateUserPreferences } from '@/hooks/queries/useUpdateUserPreferences';
import { useUploadProfileImageMutation } from '@/hooks/queries/useUploadProfileImageMutation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { i18nLocale } from '@/stores/i18n.store';
import { usersService } from '@/services/api/users.service';
import type { User, UserPreferences, UpdateUserPreferencesDto, SearchUser } from '@/types/user.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { profileDict } from './profile.i18n';

const Profile: Component = () => {
  const { user } = useAuth();
  const userId = createMemo(() => user()?.id);
  const fullUserQuery = createQuery(() => ({
    queryKey: ['user', userId()],
    queryFn: () => usersService.getUser(userId()!),
    enabled: !!userId(),
  })) as ReturnType<typeof createQuery<SearchUser, Error>>;
  const preferencesQuery = useUserPreferencesQuery();
  const updatePreferencesMutation = useUpdateUserPreferences();
  const uploadProfileImageMutation = useUploadProfileImageMutation();
  const [isEditing, setIsEditing] = createSignal(false);
  const [formData, setFormData] = createSignal<UpdateUserPreferencesDto>({
    displayName: '',
    description: '',
  });
  const t = makeTranslator(profileDict, 'profile');

  const handleDisplayNameChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, displayName: target.value }));
  };

  const handleDescriptionChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setFormData((prev) => ({ ...prev, description: target.value }));
  };

  const handleEdit = () => {
    if (preferencesQuery.data) {
      setFormData({
        displayName: preferencesQuery.data.displayName || '',
        description: preferencesQuery.data.description || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(formData(), {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const currentPreferences = () => preferencesQuery.data || { displayName: '', description: '', profileImage: '' };
  const baseUrl = import.meta.env.VITE_API_URL as string;

  // Language display helper (view mode) — uses current i18n store
  const currentLocale = i18nLocale.locale;
  const localeLabel = () => {
    const map: Record<ReturnType<typeof currentLocale>, string> = {
      en: 'English',
      es: 'Español',
      hi: 'हिन्दी',
    };
    return map[currentLocale()];
  };

  return (
    <>
      <Title>{fullUserQuery.data?.username ? `${fullUserQuery.data.username}'s ${t('title')}` : t('title')} - YourApp</Title>
      <Meta name="description" content="Your profile information" />

      <div class="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
        <h1 class="text-3xl font-bold mb-6 text-stone-900 dark:text-stone-100">
          {fullUserQuery.data?.username ? `${fullUserQuery.data.username}'s ${t('title')}` : t('userProfile')}
        </h1>
        <Show
          when={user()}
          fallback={
            <div class="text-center py-8">
              <p class="text-stone-600 dark:text-stone-300">{t('loadingProfile')}</p>
            </div>
          }
        >
          {(currentUser) => (
            <Show when={!fullUserQuery.isLoading} fallback={<div class="text-center py-4 text-stone-600 dark:text-stone-300">{t('loadingUserDetails')}</div>}>
              <div class="bg-stone-50 dark:bg-stone-800 shadow-md rounded-lg max-w-2xl mx-auto border border-stone-200 dark:border-stone-700 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-ocean-600/10 to-forest-600/10 dark:from-ocean-500/20 dark:to-forest-500/20"></div>
                <div class="relative p-6">
                  {/* Basic User Info */}
                  <div class="mb-6">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
                        <span class="text-xl">👤</span>
                      </div>
                      <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">{t('basicInformation')}</h2>
                    </div>
                    <div class="flex flex-col items-center md:items-start md:flex-row md:items-center gap-6 mb-6">
                      <Show when={currentPreferences().profileImage}>
                        <div class="relative">
                          <div class="absolute inset-0 bg-gradient-to-br from-ocean-400 to-forest-400 rounded-full blur-sm opacity-30"></div>
                          <CredentialedImage
                            src={`${baseUrl}/api/v1/images/${currentPreferences().profileImage}`}
                            alt="Profile"
                            class="relative w-20 h-20 rounded-full object-cover ring-2 ring-ocean-200 dark:ring-ocean-800"
                          />
                        </div>
                      </Show>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('username')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{fullUserQuery.data?.username || t('notSet')}</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('id')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{currentUser().id}</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('email')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{currentUser().email}</p>
                      </div>
                      <Show when={currentUser().firstName || currentUser().lastName}>
                        <div>
                          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('name')}</label>
                          <p class="text-stone-900 dark:text-stone-100">
                            {currentUser().firstName} {currentUser().lastName}
                          </p>
                        </div>
                      </Show>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('created')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{new Date(currentUser().createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('updated')}</label>
                        <p class="text-stone-900 dark:text-stone-100">{new Date(currentUser().updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Preferences Section */}
                  <div class="mb-6">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 bg-sage-100 dark:bg-sage-900 rounded-full flex items-center justify-center">
                        <span class="text-xl">⚙️</span>
                      </div>
                      <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">{t('preferences')}</h2>
                    </div>
                <Show
                  when={!isEditing()}
                  fallback={
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('profileImage')}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              uploadProfileImageMutation.mutate(file);
                            }
                          }}
                          class="w-full p-2 border border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 rounded-md"
                        />
                        <Show when={uploadProfileImageMutation.isPending}>
                          <p class="text-sm text-stone-500 dark:text-stone-400">{t('uploading')}</p>
                        </Show>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('displayName')}</label>
                        <Input
                          value={formData().displayName}
                          onInput={handleDisplayNameChange}
                          placeholder={t('displayNamePlaceholder')}
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('description')}</label>
                        <textarea
                          value={formData().description}
                          onInput={handleDescriptionChange}
                          class="w-full p-2 border border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 rounded-md h-24"
                          placeholder={t('descriptionPlaceholder')}
                        />
                      </div>

                      {/* Language selection (Edit Mode) */}
                      <div class="flex items-center gap-3">
                        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('language')}</label>
                        <LanguageSwitcher />
                      </div>

                      <div class="flex gap-2">
                        <Button onClick={handleCancel} variant="secondary">{t('cancel')}</Button>
                        <Button onClick={handleSave} loading={updatePreferencesMutation.isPending} disabled={!formData().displayName}>
                          {t('savePreferences')}
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('displayName')}:</label>
                      <p class="text-stone-900 dark:text-stone-100">{currentPreferences().displayName || t('notSet')}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('description')}:</label>
                      <p class="text-stone-900 dark:text-stone-100">{currentPreferences().description || t('notSet')}</p>
                    </div>

                    {/* Language display (View Mode) */}
                    <div class="flex items-center gap-3">
                      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{t('language')}:</label>
                      <p class="text-stone-900 dark:text-stone-100">{localeLabel()}</p>
                    </div>

                    <Button onClick={handleEdit}>{t('editPreferences')}</Button>
                  </div>
                </Show>
              </div>

              <Show when={preferencesQuery.isError}>
                <div class="text-red-500 dark:text-red-400 mb-4">{t('errorLoadingPreferences')}</div>
              </Show>
                  <Show when={preferencesQuery.isLoading}>
                    <div class="text-center py-4 text-stone-600 dark:text-stone-300">{t('loadingPreferences')}</div>
                  </Show>
                </div>
              </div>
            </Show>
          )}
        </Show>
      </div>
  </>
);
};

export default Profile;
