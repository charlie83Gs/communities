import { Component, For, JSX, splitProps } from 'solid-js';

export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  class?: string;
}

export const Tabs: Component<TabsProps> = (props) => {
  const [local, rest] = splitProps(props, ['tabs', 'activeTab', 'onTabChange', 'class']);

  return (
    <div class={`border-b border-stone-200 dark:border-stone-700 ${local.class || ''}`} {...rest}>
      <nav class="flex space-x-4" aria-label="Tabs">
        <For each={local.tabs}>
          {(tab) => (
            <button
              type="button"
              onClick={() => local.onTabChange(tab.id)}
              class={`
                px-4 py-2 text-sm font-medium transition-colors duration-200
                border-b-2 -mb-px
                ${
                  local.activeTab === tab.id
                    ? 'border-ocean-600 dark:border-ocean-400 text-ocean-600 dark:text-ocean-400'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                }
              `}
              aria-current={local.activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          )}
        </For>
      </nav>
    </div>
  );
};
