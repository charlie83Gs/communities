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
        <label class="block text-sm font-medium text-stone-700 mb-1">{local.label}</label>
      </Show>
      <input
        class="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        {...rest}
      />
      <Show when={local.error}>
        <p class="mt-1 text-sm text-danger-600">{local.error}</p>
      </Show>
    </div>
  );
};