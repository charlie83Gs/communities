import { Component, JSX, splitProps, Show } from 'solid-js';

export interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

export const Textarea: Component<TextareaProps> = (props) => {
  const [local, rest] = splitProps(props, ['label', 'error', 'rows']);
  
  return (
    <div class="mb-4">
      <Show when={local.label}>
        <label class="block text-sm font-medium text-stone-700 mb-1">{local.label}</label>
      </Show>
      <textarea
        class="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        rows={local.rows || 4}
        {...rest}
      />
      <Show when={local.error}>
        <p class="mt-1 text-sm text-danger-600">{local.error}</p>
      </Show>
    </div>
  );
};