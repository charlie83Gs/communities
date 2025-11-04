import { Component } from 'solid-js';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

/**
 * Theme Demo Page
 *
 * This page showcases all the colors and design tokens in the nature-inspired theme.
 * Useful for designers and developers to see the full palette and ensure consistency.
 *
 * To view: Navigate to /theme-demo in your browser
 */

const ColorSwatch: Component<{ name: string; color: string }> = (props) => {
  return (
    <div class="flex flex-col items-center">
      <div
        class={`w-20 h-20 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 ${props.color}`}
      />
      <span class="mt-2 text-xs text-stone-600 dark:text-stone-400 font-mono">
        {props.name}
      </span>
    </div>
  );
};

const ColorPalette: Component<{ title: string; colors: Array<{ name: string; class: string }> }> = (props) => {
  return (
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-stone-900 dark:text-stone-100">
        {props.title}
      </h3>
      <div class="grid grid-cols-5 md:grid-cols-10 gap-4">
        {props.colors.map((color) => (
          <ColorSwatch name={color.name} color={color.class} />
        ))}
      </div>
    </div>
  );
};

const ThemeDemo: Component = () => {
  const oceanColors = [
    { name: '50', class: 'bg-ocean-50' },
    { name: '100', class: 'bg-ocean-100' },
    { name: '200', class: 'bg-ocean-200' },
    { name: '300', class: 'bg-ocean-300' },
    { name: '400', class: 'bg-ocean-400' },
    { name: '500', class: 'bg-ocean-500' },
    { name: '600', class: 'bg-ocean-600' },
    { name: '700', class: 'bg-ocean-700' },
    { name: '800', class: 'bg-ocean-800' },
    { name: '900', class: 'bg-ocean-900' },
    { name: '950', class: 'bg-ocean-950' },
  ];

  const forestColors = [
    { name: '50', class: 'bg-forest-50' },
    { name: '100', class: 'bg-forest-100' },
    { name: '200', class: 'bg-forest-200' },
    { name: '300', class: 'bg-forest-300' },
    { name: '400', class: 'bg-forest-400' },
    { name: '500', class: 'bg-forest-500' },
    { name: '600', class: 'bg-forest-600' },
    { name: '700', class: 'bg-forest-700' },
    { name: '800', class: 'bg-forest-800' },
    { name: '900', class: 'bg-forest-900' },
    { name: '950', class: 'bg-forest-950' },
  ];

  const skyColors = [
    { name: '50', class: 'bg-sky-50' },
    { name: '100', class: 'bg-sky-100' },
    { name: '200', class: 'bg-sky-200' },
    { name: '300', class: 'bg-sky-300' },
    { name: '400', class: 'bg-sky-400' },
    { name: '500', class: 'bg-sky-500' },
    { name: '600', class: 'bg-sky-600' },
    { name: '700', class: 'bg-sky-700' },
    { name: '800', class: 'bg-sky-800' },
    { name: '900', class: 'bg-sky-900' },
  ];

  const leafColors = [
    { name: '50', class: 'bg-leaf-50' },
    { name: '100', class: 'bg-leaf-100' },
    { name: '200', class: 'bg-leaf-200' },
    { name: '300', class: 'bg-leaf-300' },
    { name: '400', class: 'bg-leaf-400' },
    { name: '500', class: 'bg-leaf-500' },
    { name: '600', class: 'bg-leaf-600' },
    { name: '700', class: 'bg-leaf-700' },
    { name: '800', class: 'bg-leaf-800' },
    { name: '900', class: 'bg-leaf-900' },
  ];

  const sageColors = [
    { name: '50', class: 'bg-sage-50' },
    { name: '100', class: 'bg-sage-100' },
    { name: '200', class: 'bg-sage-200' },
    { name: '300', class: 'bg-sage-300' },
    { name: '400', class: 'bg-sage-400' },
    { name: '500', class: 'bg-sage-500' },
    { name: '600', class: 'bg-sage-600' },
    { name: '700', class: 'bg-sage-700' },
    { name: '800', class: 'bg-sage-800' },
    { name: '900', class: 'bg-sage-900' },
  ];

  const successColors = [
    { name: '100', class: 'bg-success-100' },
    { name: '200', class: 'bg-success-200' },
    { name: '300', class: 'bg-success-300' },
    { name: '500', class: 'bg-success-500' },
    { name: '600', class: 'bg-success-600' },
    { name: '800', class: 'bg-success-800' },
  ];

  const warningColors = [
    { name: '100', class: 'bg-warning-100' },
    { name: '200', class: 'bg-warning-200' },
    { name: '300', class: 'bg-warning-300' },
    { name: '500', class: 'bg-warning-500' },
    { name: '600', class: 'bg-warning-600' },
    { name: '800', class: 'bg-warning-800' },
  ];

  const dangerColors = [
    { name: '100', class: 'bg-danger-100' },
    { name: '200', class: 'bg-danger-200' },
    { name: '300', class: 'bg-danger-300' },
    { name: '500', class: 'bg-danger-500' },
    { name: '600', class: 'bg-danger-600' },
    { name: '800', class: 'bg-danger-800' },
  ];

  const stoneColors = [
    { name: '50', class: 'bg-stone-50' },
    { name: '100', class: 'bg-stone-100' },
    { name: '200', class: 'bg-stone-200' },
    { name: '300', class: 'bg-stone-300' },
    { name: '400', class: 'bg-stone-400' },
    { name: '500', class: 'bg-stone-500' },
    { name: '600', class: 'bg-stone-600' },
    { name: '700', class: 'bg-stone-700' },
    { name: '800', class: 'bg-stone-800' },
    { name: '900', class: 'bg-stone-900' },
    { name: '950', class: 'bg-stone-950' },
  ];

  return (
    <div class="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <header class="bg-white dark:bg-stone-800 shadow-sm border-b border-stone-200 dark:border-stone-700">
        <div class="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">
              Nature-Inspired Theme
            </h1>
            <p class="text-stone-600 dark:text-stone-400 mt-1">
              Color palette and design tokens reference
            </p>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction */}
        <section class="mb-12">
          <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
            <h2 class="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">
              About This Theme
            </h2>
            <p class="text-stone-700 dark:text-stone-300 mb-4">
              This nature-inspired color palette features ocean blues and forest greens,
              designed to evoke natural landscapes while maintaining excellent readability
              and WCAG AA/AAA compliance.
            </p>
            <p class="text-stone-700 dark:text-stone-300">
              All colors use the <code class="bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded text-sm">OKLCH</code> color
              space for perceptual uniformity and consistent contrast ratios.
            </p>
          </div>
        </section>

        {/* Color Palettes */}
        <section class="space-y-8">
          <ColorPalette title="Ocean Blue (Primary)" colors={oceanColors} />
          <ColorPalette title="Forest Green (Secondary)" colors={forestColors} />
          <ColorPalette title="Sky Blue (Accent)" colors={skyColors} />
          <ColorPalette title="Leaf Green (Accent)" colors={leafColors} />
          <ColorPalette title="Sage Green (Accent)" colors={sageColors} />
          <ColorPalette title="Success (Semantic)" colors={successColors} />
          <ColorPalette title="Warning (Semantic)" colors={warningColors} />
          <ColorPalette title="Danger (Semantic)" colors={dangerColors} />
          <ColorPalette title="Stone (Neutral)" colors={stoneColors} />
        </section>

        {/* Component Examples */}
        <section class="mt-12">
          <h2 class="text-2xl font-bold mb-6 text-stone-900 dark:text-stone-100">
            Component Examples
          </h2>

          <div class="grid md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
              <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                Buttons
              </h3>
              <div class="space-y-3">
                <button class="w-full px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-md transition-colors">
                  Primary Button
                </button>
                <button class="w-full px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-md transition-colors">
                  Secondary Button
                </button>
                <button class="w-full px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-md transition-colors">
                  Danger Button
                </button>
              </div>
            </div>

            {/* Badges */}
            <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
              <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                Badges
              </h3>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 rounded-full text-sm">
                  Primary
                </span>
                <span class="px-3 py-1 bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 rounded-full text-sm">
                  Success
                </span>
                <span class="px-3 py-1 bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200 rounded-full text-sm">
                  Warning
                </span>
                <span class="px-3 py-1 bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 rounded-full text-sm">
                  Danger
                </span>
                <span class="px-3 py-1 bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-full text-sm">
                  Neutral
                </span>
              </div>
            </div>

            {/* Cards */}
            <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
              <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                Cards
              </h3>
              <div class="bg-stone-50 dark:bg-stone-700 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                <h4 class="font-medium text-stone-900 dark:text-stone-100 mb-2">
                  Example Card
                </h4>
                <p class="text-stone-600 dark:text-stone-300 text-sm">
                  This is an example of a card component using the theme colors.
                </p>
              </div>
            </div>

            {/* Form Elements */}
            <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
              <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                Form Elements
              </h3>
              <div class="space-y-3">
                <input
                  type="text"
                  placeholder="Input field"
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                />
                <select class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100">
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section class="mt-12">
          <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
            <h2 class="text-2xl font-bold mb-6 text-stone-900 dark:text-stone-100">
              Typography Scale
            </h2>
            <div class="space-y-4">
              <div>
                <p class="text-xs text-stone-600 dark:text-stone-400 mb-1">text-xs</p>
                <p class="text-xs text-stone-900 dark:text-stone-100">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-600 dark:text-stone-400 mb-1">text-sm</p>
                <p class="text-sm text-stone-900 dark:text-stone-100">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-600 dark:text-stone-400 mb-1">text-base</p>
                <p class="text-base text-stone-900 dark:text-stone-100">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-600 dark:text-stone-400 mb-1">text-lg</p>
                <p class="text-lg text-stone-900 dark:text-stone-100">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-600 dark:text-stone-400 mb-1">text-xl</p>
                <p class="text-xl text-stone-900 dark:text-stone-100">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-600 dark:text-stone-400 mb-1">text-2xl</p>
                <p class="text-2xl text-stone-900 dark:text-stone-100">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer class="bg-stone-900 dark:bg-stone-950 text-stone-300 dark:text-stone-400 py-8 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <p>Theme Version 1.0.0 • Built with Tailwind CSS v4 • OKLCH Color Space</p>
        </div>
      </footer>
    </div>
  );
};

export default ThemeDemo;
