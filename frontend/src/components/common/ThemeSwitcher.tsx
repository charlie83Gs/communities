import { Component, createSignal, createEffect, onMount } from 'solid-js';
import styles from './ThemeSwitcher.module.css';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme-preference';

export const ThemeSwitcher: Component = () => {
  const [theme, setTheme] = createSignal<Theme>('light');

  // Initialize theme from localStorage on mount
  onMount(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme = storedTheme || 'light';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  });

  // Apply theme changes to DOM and localStorage
  createEffect(() => {
    const currentTheme = theme();
    applyTheme(currentTheme);
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  });

  const applyTheme = (themeValue: Theme) => {
    const htmlElement = document.documentElement;
    if (themeValue === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = () => theme() === 'dark';

  return (
    <button
      class={styles.themeSwitcher}
      onClick={toggleTheme}
      aria-label={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      {/* Sun Icon (Light Mode) */}
      <svg
        class={`${styles.icon} ${styles.sunIcon}`}
        classList={{ [styles.active]: !isDark() }}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Moon Icon (Dark Mode) */}
      <svg
        class={`${styles.icon} ${styles.moonIcon}`}
        classList={{ [styles.active]: isDark() }}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
};
