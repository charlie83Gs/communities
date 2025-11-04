import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const KeycloakSignupPage: Component = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = createSignal({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = formData();

    // Validation
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Call backend signup endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          email: data.email,
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }
      );

      console.log('Signup successful:', response.data);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/keycloak-login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950 py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            Create your account
          </h2>
        </div>

        {success() ? (
          <div class="rounded-md bg-success-50 dark:bg-success-900 p-4">
            <p class="text-sm text-success-800 dark:text-success-200">
              Account created successfully! Please check your email to verify your account.
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error() && (
              <div class="rounded-md bg-danger-50 dark:bg-danger-900 p-4">
                <p class="text-sm text-danger-800 dark:text-danger-200">{error()}</p>
              </div>
            )}

            <div class="rounded-md shadow-sm space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  class="appearance-none relative block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 placeholder-stone-500 dark:placeholder-stone-400 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 sm:text-sm"
                  placeholder="Email address"
                  value={formData().email}
                  onInput={(e) => setFormData({ ...formData(), email: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="username" class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  class="appearance-none relative block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 placeholder-stone-500 dark:placeholder-stone-400 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 sm:text-sm"
                  placeholder="Username"
                  value={formData().username}
                  onInput={(e) => setFormData({ ...formData(), username: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="firstName" class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  First name (optional)
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  class="appearance-none relative block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 placeholder-stone-500 dark:placeholder-stone-400 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 sm:text-sm"
                  placeholder="First name"
                  value={formData().firstName}
                  onInput={(e) => setFormData({ ...formData(), firstName: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Last name (optional)
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  class="appearance-none relative block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 placeholder-stone-500 dark:placeholder-stone-400 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 sm:text-sm"
                  placeholder="Last name"
                  value={formData().lastName}
                  onInput={(e) => setFormData({ ...formData(), lastName: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  class="appearance-none relative block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 placeholder-stone-500 dark:placeholder-stone-400 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 sm:text-sm"
                  placeholder="Password (min. 8 characters)"
                  value={formData().password}
                  onInput={(e) => setFormData({ ...formData(), password: e.currentTarget.value })}
                />
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  class="appearance-none relative block w-full px-3 py-2 border border-stone-300 dark:border-stone-600 placeholder-stone-500 dark:placeholder-stone-400 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 sm:text-sm"
                  placeholder="Confirm password"
                  value={formData().confirmPassword}
                  onInput={(e) => setFormData({ ...formData(), confirmPassword: e.currentTarget.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading()}
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading() ? 'Creating account...' : 'Sign up'}
              </button>
            </div>

            <div class="text-center">
              <a href="/keycloak-login" class="text-sm text-ocean-600 hover:text-ocean-500 dark:text-ocean-400 dark:hover:text-ocean-300">
                Already have an account? Sign in
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default KeycloakSignupPage;
