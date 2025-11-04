import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { makeTranslator } from '@/i18n/makeTranslator';
import { homeDict } from './home.i18n';

export default function Home() {
  const navigate = useNavigate();
  const t = makeTranslator(homeDict, 'home');

  return (
    <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
      {/* Hero Section */}
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-ocean-600/20 to-forest-600/20 dark:from-ocean-500/30 dark:to-forest-500/30"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-stone-900 dark:text-stone-100 mb-6">
              {t('title').split('Communities')[0]}
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-ocean-600 to-forest-600 dark:from-ocean-400 dark:to-forest-400">Communities</span>
            </h1>
            <p class="text-xl md:text-2xl text-stone-600 dark:text-stone-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/login')}
                class="bg-ocean-600 hover:bg-ocean-700 dark:bg-ocean-500 dark:hover:bg-ocean-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {t('ctaLogin')}
              </button>
              <button
                onClick={() => navigate('/register')}
                class="border-2 border-ocean-600 text-ocean-600 hover:bg-ocean-600 hover:text-white dark:border-ocean-400 dark:text-ocean-400 dark:hover:bg-ocean-500 dark:hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                {t('ctaRegister')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section class="py-20 bg-stone-50 dark:bg-stone-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">{t('philosophyTitle')}</h2>
            <p class="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
              {t('philosophySubtitle')}
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center p-6 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
              <div class="w-12 h-12 mx-auto mb-4 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
                <span class="text-2xl">🎁</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('philosophy.noMoney.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('philosophy.noMoney.desc')}</p>
            </div>
            <div class="text-center p-6 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
              <div class="w-12 h-12 mx-auto mb-4 bg-sage-100 dark:bg-sage-900 rounded-full flex items-center justify-center">
                <span class="text-2xl">👁️</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('philosophy.communityFirst.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('philosophy.communityFirst.desc')}</p>
            </div>
            <div class="text-center p-6 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
              <div class="w-12 h-12 mx-auto mb-4 bg-forest-100 dark:bg-forest-900 rounded-full flex items-center justify-center">
                <span class="text-2xl">🤝</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('philosophy.trust.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('philosophy.trust.desc')}</p>
            </div>
            <div class="text-center p-6 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
              <div class="w-12 h-12 mx-auto mb-4 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
                <span class="text-2xl">🌱</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('philosophy.collab.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('philosophy.collab.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class="py-20 bg-gradient-to-r from-sky-50 to-sage-50 dark:from-stone-800 dark:to-forest-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">{t('featuresTitle')}</h2>
            <p class="text-lg text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-stone-50 dark:bg-stone-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-200 dark:border-stone-700">
              <div class="w-12 h-12 mb-4 bg-ocean-100 dark:bg-ocean-900 rounded-lg flex items-center justify-center">
                <span class="text-2xl">💎</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">{t('features.wealth.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('features.wealth.desc')}</p>
            </div>
            <div class="bg-stone-50 dark:bg-stone-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-200 dark:border-stone-700">
              <div class="w-12 h-12 mb-4 bg-sage-100 dark:bg-sage-900 rounded-lg flex items-center justify-center">
                <span class="text-2xl">🔗</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">{t('features.trust.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('features.trust.desc')}</p>
            </div>
            <div class="bg-stone-50 dark:bg-stone-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-200 dark:border-stone-700">
              <div class="w-12 h-12 mb-4 bg-forest-100 dark:bg-forest-900 rounded-lg flex items-center justify-center">
                <span class="text-2xl">🏛️</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">{t('features.councils.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('features.councils.desc')}</p>
            </div>
            <div class="bg-stone-50 dark:bg-stone-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-stone-200 dark:border-stone-700">
              <div class="w-12 h-12 mb-4 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
                <span class="text-2xl">📊</span>
              </div>
              <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">{t('features.planning.title')}</h3>
              <p class="text-stone-600 dark:text-stone-300">{t('features.planning.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section class="py-20 bg-stone-50 dark:bg-stone-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">{t('capabilitiesTitle')}</h2>
          </div>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-stone-800 rounded-xl p-8 shadow-md border border-stone-200 dark:border-stone-700">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex-shrink-0 bg-ocean-100 dark:bg-ocean-900 rounded-lg flex items-center justify-center">
                  <span class="text-xl">🔐</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('capabilities.trustBased.title')}</h3>
                  <p class="text-stone-600 dark:text-stone-300">{t('capabilities.trustBased.desc')}</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-stone-800 rounded-xl p-8 shadow-md border border-stone-200 dark:border-stone-700">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex-shrink-0 bg-sage-100 dark:bg-sage-900 rounded-lg flex items-center justify-center">
                  <span class="text-xl">📝</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('capabilities.tracking.title')}</h3>
                  <p class="text-stone-600 dark:text-stone-300">{t('capabilities.tracking.desc')}</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-stone-800 rounded-xl p-8 shadow-md border border-stone-200 dark:border-stone-700">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex-shrink-0 bg-forest-100 dark:bg-forest-900 rounded-lg flex items-center justify-center">
                  <span class="text-xl">✅</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('capabilities.accountability.title')}</h3>
                  <p class="text-stone-600 dark:text-stone-300">{t('capabilities.accountability.desc')}</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-stone-800 rounded-xl p-8 shadow-md border border-stone-200 dark:border-stone-700">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 flex-shrink-0 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
                  <span class="text-xl">📈</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">{t('capabilities.analytics.title')}</h3>
                  <p class="text-stone-600 dark:text-stone-300">{t('capabilities.analytics.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section class="py-12 bg-stone-900 dark:bg-stone-950 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 class="text-2xl font-bold mb-4">{t('footer.title')}</h3>
          <p class="text-stone-300 dark:text-stone-400 mb-6">{t('footer.subtitle')}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              class="bg-ocean-600 hover:bg-ocean-700 dark:bg-ocean-500 dark:hover:bg-ocean-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('footer.signup')}
            </button>
            <button
              onClick={() => navigate('/login')}
              class="border-2 border-white text-white hover:bg-white hover:text-stone-900 dark:border-stone-300 dark:hover:bg-stone-300 dark:hover:text-stone-900 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('footer.already')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
