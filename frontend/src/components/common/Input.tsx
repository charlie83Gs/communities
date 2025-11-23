import { Component, JSX, splitProps, Show } from 'solid-js';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'error']);

  return (
    <div class="mb-4">
      <Show when={local.label}>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{local.label}</label>
      </Show>
      <input
        class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        {...rest}
      />
      <Show when={local.error}>
        <p class="mt-1 text-sm text-danger-600 dark:text-danger-400">{local.error}</p>
      </Show>
    </div>
  );
};
