import { Component, onMount } from 'solid-js';
import { useAuth } from '@/hooks/useAuth';
import { makeTranslator } from '@/i18n/makeTranslator';
import { registerDict } from './register.i18n';

const Register: Component = () => {
  const t = makeTranslator(registerDict, 'register');
  const { signUp } = useAuth();

  // Redirect to Keycloak registration page immediately on mount
  onMount(() => {
    signUp();
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950 py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-lg space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {t('redirecting')}
          </h2>
          <p class="mt-4 text-center text-stone-600 dark:text-stone-400">
            {t('redirectingMessage')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
