import { Component, JSX, Show, createSignal, splitProps } from 'solid-js';

export interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: JSX.Element;
  class?: string;
}

export const Collapsible: Component<CollapsibleProps> = (props) => {
  const [local, rest] = splitProps(props, ['title', 'defaultOpen', 'children', 'class']);
  const [isOpen, setIsOpen] = createSignal(local.defaultOpen ?? false);

  return (
    <div class={`border border-stone-200 dark:border-stone-700 rounded-lg ${local.class || ''}`} {...rest}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen())}
        class="w-full flex items-center justify-between px-4 py-3 text-left bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-t-lg transition-colors"
      >
        <span class="text-base font-medium text-stone-900 dark:text-stone-100">{local.title}</span>
        <svg
          class={`w-5 h-5 text-stone-500 dark:text-stone-400 transition-transform ${isOpen() ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Show when={isOpen()}>
        <div class="px-4 py-4 bg-white dark:bg-stone-900">
          {local.children}
        </div>
      </Show>
    </div>
  );
};
