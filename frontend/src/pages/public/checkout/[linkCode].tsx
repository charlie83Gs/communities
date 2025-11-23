import {
  Component,
  createSignal,
  createMemo,
  Show,
  onMount,
} from 'solid-js';
import { useParams, useNavigate, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import {
  useCheckoutLinkDetails,
  useCompleteCheckout,
} from '@/hooks/queries/useCheckoutLinks';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Icon } from '@/components/common/Icon';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { makeTranslator } from '@/i18n/makeTranslator';
import { checkoutPageDict } from './[linkCode].i18n';

const PublicCheckoutPage: Component = () => {
  const params = useParams<{ linkCode: string }>();
  const navigate = useNavigate();
  const t = makeTranslator(checkoutPageDict, 'checkoutPage');
  const { user, isAuthenticated } = useAuth();

  // Query hooks
  const checkoutDetails = useCheckoutLinkDetails(() => params.linkCode);
  const checkoutMutation = useCompleteCheckout();

  // Form state
  const [units, setUnits] = createSignal('');
  const [checkoutComplete, setCheckoutComplete] = createSignal(false);
  const [checkoutResult, setCheckoutResult] = createSignal<{
    unitsReceived: number;
    trustAwarded?: number;
    message: string;
  } | null>(null);

  // Validation
  const unitsError = createMemo(() => {
    const value = parseFloat(units());
    const details = checkoutDetails.data;

    if (!units() || !details) return null;

    if (isNaN(value) || value <= 0) {
      return t('mustBePositive');
    }

    if (details.maxUnitsPerCheckout && value > details.maxUnitsPerCheckout) {
      return t('exceedsMax')
        .replace('{{max}}', String(details.maxUnitsPerCheckout))
        .replace('{{unit}}', details.item.unit);
    }

    if (details.availableUnits !== null && value > details.availableUnits) {
      return t('exceedsAvailable')
        .replace('{{available}}', String(details.availableUnits))
        .replace('{{unit}}', details.item.unit);
    }

    return null;
  });

  const canCheckout = createMemo(() => {
    return (
      isAuthenticated() &&
      !!units() &&
      !unitsError() &&
      checkoutDetails.data?.isActive &&
      !checkoutMutation.isPending &&
      !checkoutComplete()
    );
  });

  // Handle checkout
  const handleCheckout = async () => {
    if (!canCheckout()) return;

    try {
      const result = await checkoutMutation.mutateAsync({
        linkCode: params.linkCode,
        dto: {
          units: parseFloat(units()),
        },
      });

      setCheckoutResult(result);
      setCheckoutComplete(true);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      // Error is shown via mutation.error
    }
  };

  // Handle login redirect
  const handleLogin = () => {
    // Store intended destination
    sessionStorage.setItem('checkoutRedirect', window.location.pathname);
    navigate('/login');
  };

  // Check for redirect after login
  onMount(() => {
    const checkoutRedirect = sessionStorage.getItem('checkoutRedirect');
    if (checkoutRedirect && window.location.pathname === checkoutRedirect) {
      sessionStorage.removeItem('checkoutRedirect');
    }
  });

  return (
    <>
      <Title>{t('scanToCheckout')}</Title>
      <Meta name="description" content={t('mobileFriendly')} />

      <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950 py-6 px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto">
          {/* Back to community link */}
          <Show when={checkoutDetails.data?.community}>
            <div class="mb-4">
              <A
                href={`/communities/${checkoutDetails.data!.community.id}`}
                class="inline-flex items-center gap-2 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300"
              >
                <Icon name="arrow-left" size={16} />
                {t('backToCommunity').replace('{{community}}', checkoutDetails.data!.community.name)}
              </A>
            </div>
          </Show>

          {/* Loading State */}
          <Show
            when={!checkoutDetails.isLoading}
            fallback={
              <Card>
                <div class="text-center py-12">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
                  <p class="text-stone-600 dark:text-stone-400">{t('loading')}</p>
                </div>
              </Card>
            }
          >
            {/* Error State */}
            <Show
              when={!checkoutDetails.error}
              fallback={
                <Card>
                  <div class="text-center py-12">
                    <Icon name="alert" size={48} class="mx-auto mb-4 text-danger-600" />
                    <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                      {t('notFound')}
                    </h2>
                    <p class="text-stone-600 dark:text-stone-400 mb-6">
                      {t('loadingFailed')}
                    </p>
                    <Button onClick={() => navigate('/')}>
                      Go Home
                    </Button>
                  </div>
                </Card>
              }
            >
              {/* Success State */}
              <Show
                when={!checkoutComplete()}
                fallback={
                  <Card>
                    <div class="text-center py-12">
                      <div class="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center mx-auto mb-6">
                        <Icon name="check" size={32} class="text-success-600 dark:text-success-400" />
                      </div>
                      <h2 class="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                        {t('successTitle')}
                      </h2>
                      <p class="text-lg text-stone-700 dark:text-stone-300 mb-6">
                        {t('successMessage')
                          .replace('{{units}}', String(checkoutResult()?.unitsReceived))
                          .replace('{{unit}}', checkoutDetails.data?.item.unit || '')
                          .replace('{{item}}', checkoutDetails.data?.item.name || '')}
                      </p>
                      <Show when={checkoutResult()?.trustAwarded}>
                        <div class="inline-flex items-center gap-2 px-4 py-2 bg-forest-100 dark:bg-forest-900 rounded-lg mb-6">
                          <Icon name="trust" size={20} class="text-forest-600 dark:text-forest-400" />
                          <span class="text-forest-800 dark:text-forest-200 font-semibold">
                            {t('trustAwarded').replace('{{trust}}', String(checkoutResult()?.trustAwarded))}
                          </span>
                        </div>
                      </Show>
                      <p class="text-xl text-stone-600 dark:text-stone-400 mb-8">
                        {t('thankYou')}
                      </p>
                      <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="secondary"
                          onClick={() => navigate('/')}
                        >
                          {t('done')}
                        </Button>
                        <Show when={checkoutDetails.data?.community}>
                          <Button
                            onClick={() => navigate(`/communities/${checkoutDetails.data!.community.id}`)}
                          >
                            {t('goToCommunity')}
                          </Button>
                        </Show>
                      </div>
                    </div>
                  </Card>
                }
              >
                {/* Main Checkout Form */}
                <Show when={checkoutDetails.data}>
                  {(details) => (
                    <>
                      {/* Inactive Link */}
                      <Show
                        when={details().isActive}
                        fallback={
                          <Card>
                            <div class="text-center py-12">
                              <Icon name="x-circle" size={48} class="mx-auto mb-4 text-stone-400" />
                              <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                                {t('linkInactive')}
                              </h2>
                              <p class="text-stone-600 dark:text-stone-400 mb-2">
                                {details().message || t('linkExpired')}
                              </p>
                              <Show when={details().type === 'share' && details().availableUnits === 0}>
                                <p class="text-stone-600 dark:text-stone-400">
                                  {t('shareDepleted')}
                                </p>
                              </Show>
                            </div>
                          </Card>
                        }
                      >
                        <Card>
                          {/* Community Header */}
                          <div class="text-center mb-6">
                            <Show when={details().community.imageUrl}>
                              <CredentialedImage
                                src={details().community.imageUrl!}
                                alt={details().community.name}
                                class="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                              />
                            </Show>
                            <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                              {details().community.name}
                            </h1>
                            <p class="text-sm text-stone-600 dark:text-stone-400">
                              {t('from')} {details().sourceName}
                            </p>
                          </div>

                          {/* Item Display */}
                          <div class="mb-6 p-6 bg-stone-50 dark:bg-stone-800 rounded-lg">
                            <Show when={details().item.imageUrl}>
                              <CredentialedImage
                                src={details().item.imageUrl!}
                                alt={details().item.name}
                                class="w-32 h-32 rounded-lg mx-auto mb-4 object-cover"
                              />
                            </Show>
                            <h2 class="text-3xl font-bold text-stone-900 dark:text-stone-100 text-center mb-4">
                              {details().item.name}
                            </h2>

                            {/* Info Grid */}
                            <div class="grid grid-cols-2 gap-4">
                              <div class="text-center">
                                <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                                  {t('maxAllowed')}
                                </p>
                                <p class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                                  {details().maxUnitsPerCheckout
                                    ? `${details().maxUnitsPerCheckout}${details().item.unit ? ' ' + details().item.unit : ''}`
                                    : t('unlimited')}
                                </p>
                              </div>
                              <Show when={details().availableUnits !== null}>
                                <div class="text-center">
                                  <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                                    {t('available')}
                                  </p>
                                  <p class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                                    {details().availableUnits}{details().item.unit ? ' ' + details().item.unit : ''}
                                  </p>
                                </div>
                              </Show>
                            </div>
                          </div>

                          {/* Auth Check */}
                          <Show
                            when={isAuthenticated()}
                            fallback={
                              <div class="text-center py-6">
                                <p class="text-stone-700 dark:text-stone-300 mb-4">
                                  {t('loginPrompt')}
                                </p>
                                <Button onClick={handleLogin} size="lg">
                                  {t('loginToCheckout')}
                                </Button>
                              </div>
                            }
                          >
                            {/* Units Input */}
                            <div class="space-y-4">
                              <div>
                                <label class="block text-lg font-medium text-stone-700 dark:text-stone-300 mb-2 text-center">
                                  {t('selectUnits')}
                                </label>
                                <div class="flex items-center gap-3">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    max={
                                      details().maxUnitsPerCheckout ||
                                      details().availableUnits ||
                                      undefined
                                    }
                                    value={units()}
                                    onInput={(e) => setUnits(e.currentTarget.value)}
                                    placeholder={t('unitsPlaceholder')}
                                    class="text-2xl text-center font-semibold"
                                  />
                                  <Show when={details().item.unit}>
                                    <span class="text-2xl font-semibold text-stone-700 dark:text-stone-300 flex-shrink-0">
                                      {details().item.unit}
                                    </span>
                                  </Show>
                                </div>
                                <Show when={unitsError()}>
                                  <p class="text-danger-600 dark:text-danger-400 text-sm mt-2 text-center">
                                    {unitsError()}
                                  </p>
                                </Show>
                              </div>

                              {/* Checkout Button */}
                              <Button
                                onClick={handleCheckout}
                                disabled={!canCheckout()}
                                size="lg"
                                class="w-full"
                              >
                                {checkoutMutation.isPending
                                  ? t('processing')
                                  : t('completeCheckout')}
                              </Button>

                              {/* Error Display */}
                              <Show when={checkoutMutation.error}>
                                <div class="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                                  <p class="text-danger-800 dark:text-danger-200 text-sm text-center">
                                    {(checkoutMutation.error as any)?.response?.data?.message ||
                                      t('checkoutFailed')}
                                  </p>
                                </div>
                              </Show>
                            </div>
                          </Show>
                        </Card>
                      </Show>
                    </>
                  )}
                </Show>
              </Show>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
};

export default PublicCheckoutPage;
