import { Component, createSignal, createEffect } from 'solid-js';
import { useAuth } from '@/components/auth';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const KeycloakDashboard: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [profile, setProfile] = createSignal<any>(null);
  const [loading, setLoading] = createSignal(true);

  createEffect(() => {
    void (async () => {
      try {
        // Fetch full user profile from backend
        const token = auth.getToken();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(response.data.user);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    })();
  });

  const handleLogout = async () => {
    await auth.logout();
  };

  const handleManageAccount = () => {
    window.open(auth.getAccountUrl(), '_blank');
  };

  return (
    <div class="min-h-screen bg-stone-50 dark:bg-stone-900">
      <nav class="bg-white dark:bg-stone-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-stone-900 dark:text-stone-100">Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button
                onClick={handleManageAccount}
                class="text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
              >
                Manage Account
              </button>
              <button
                onClick={handleLogout}
                class="bg-danger-600 text-white px-4 py-2 rounded hover:bg-danger-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading() ? (
          <div class="text-center text-stone-600 dark:text-stone-400">Loading...</div>
        ) : (
          <div class="bg-white dark:bg-stone-800 shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-stone-900 dark:text-stone-100">
                User Profile
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
                Personal details and settings
              </p>
            </div>
            <div class="border-t border-stone-200 dark:border-stone-700">
              <dl>
                <div class="bg-stone-50 dark:bg-stone-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-stone-500 dark:text-stone-400">User ID</dt>
                  <dd class="mt-1 text-sm text-stone-900 dark:text-stone-100 sm:mt-0 sm:col-span-2">
                    {profile()?.id}
                  </dd>
                </div>
                <div class="bg-white dark:bg-stone-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-stone-500 dark:text-stone-400">Username</dt>
                  <dd class="mt-1 text-sm text-stone-900 dark:text-stone-100 sm:mt-0 sm:col-span-2">
                    {profile()?.username}
                  </dd>
                </div>
                <div class="bg-stone-50 dark:bg-stone-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-stone-500 dark:text-stone-400">Email</dt>
                  <dd class="mt-1 text-sm text-stone-900 dark:text-stone-100 sm:mt-0 sm:col-span-2">
                    {profile()?.email}
                  </dd>
                </div>
                <div class="bg-white dark:bg-stone-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-stone-500 dark:text-stone-400">Name</dt>
                  <dd class="mt-1 text-sm text-stone-900 dark:text-stone-100 sm:mt-0 sm:col-span-2">
                    {profile()?.firstName} {profile()?.lastName}
                  </dd>
                </div>
                <div class="bg-stone-50 dark:bg-stone-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-stone-500 dark:text-stone-400">Roles</dt>
                  <dd class="mt-1 text-sm text-stone-900 dark:text-stone-100 sm:mt-0 sm:col-span-2">
                    {profile()?.roles?.join(', ') || 'None'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KeycloakDashboard;
