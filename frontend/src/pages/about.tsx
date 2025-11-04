import { Component } from 'solid-js';
import { makeTranslator } from '@/i18n/makeTranslator';
import { aboutDict } from './about.i18n';

export default function About() {
  const t = makeTranslator(aboutDict, 'about');

  return (
    <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section class="relative overflow-hidden text-center mb-12">
          <div class="absolute inset-0 bg-gradient-to-r from-ocean-600/20 to-forest-600/20 dark:from-ocean-500/30 dark:to-forest-500/30 rounded-xl"></div>
          <div class="relative py-12">
            <h1 class="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              {t('title')}
            </h1>
            <p class="text-xl text-stone-600 dark:text-stone-300">
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section class="bg-stone-50 dark:bg-stone-800 rounded-xl shadow-md p-8 mb-12 border border-stone-200 dark:border-stone-700">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
              <span class="text-2xl">🎯</span>
            </div>
            <h2 class="text-2xl font-semibold text-stone-900 dark:text-stone-100">{t('missionTitle')}</h2>
          </div>
          <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
            {t('missionP1')}
          </p>
          <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed">
            {t('missionP2')}
          </p>
        </section>

        {/* How It Works Section */}
        <section class="bg-gradient-to-r from-ocean-50 to-sky-50 dark:from-stone-800 dark:to-ocean-950 rounded-xl p-8 mb-12 border border-stone-200 dark:border-stone-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-sage-100 dark:bg-sage-900 rounded-full flex items-center justify-center">
              <span class="text-2xl">🔄</span>
            </div>
            <h2 class="text-2xl font-semibold text-stone-900 dark:text-stone-100">{t('howItWorksTitle')}</h2>
          </div>
          <div class="space-y-4">
            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 bg-ocean-600 dark:bg-ocean-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                {t('howItWorksP1')}
              </p>
            </div>
            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 bg-ocean-600 dark:bg-ocean-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                {t('howItWorksP2')}
              </p>
            </div>
            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 bg-ocean-600 dark:bg-ocean-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                {t('howItWorksP3')}
              </p>
            </div>
            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 bg-ocean-600 dark:bg-ocean-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                {t('howItWorksP4')}
              </p>
            </div>
            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 bg-ocean-600 dark:bg-ocean-500 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                {t('howItWorksP5')}
              </p>
            </div>
          </div>
        </section>

        {/* Open Source Section */}
        <section class="bg-gradient-to-r from-sky-50 to-sage-50 dark:from-stone-800 dark:to-forest-950 rounded-xl p-8 mb-12 border border-stone-200 dark:border-stone-700">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-forest-100 dark:bg-forest-900 rounded-full flex items-center justify-center">
              <span class="text-2xl">💻</span>
            </div>
            <h2 class="text-2xl font-semibold text-stone-900 dark:text-stone-100">{t('ossTitle')}</h2>
          </div>
          <p class="text-lg text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
            {t('ossP1')}
          </p>
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="https://github.com/share-community/share-app"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-ocean-600 hover:bg-ocean-700 dark:bg-ocean-500 dark:hover:bg-ocean-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
            >
              {t('repoBtn')}
            </a>
            <a
              href="mailto:contact@shareapp.com"
              class="border-2 border-ocean-600 text-ocean-600 hover:bg-ocean-600 hover:text-white dark:border-ocean-400 dark:text-ocean-400 dark:hover:bg-ocean-500 dark:hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('contactBtnPrefix')} contact@shareapp.com
            </a>
          </div>
        </section>

        {/* Footer Note */}
        <footer class="text-center text-stone-500 dark:text-stone-400" innerHTML={t('footer')} />
      </div>
    </div>
  );
}
