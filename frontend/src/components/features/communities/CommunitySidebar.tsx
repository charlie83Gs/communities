import { Component, createSignal, Show, For, createEffect, onCleanup } from 'solid-js';
import { A } from '@solidjs/router';
import { Icon, IconName } from '@/components/common/Icon';

export type SidebarTab = 'wealth' | 'members' | 'invites' | 'trust-grants' | 'settings' | 'forum' | 'polls' | 'councils' | 'needs' | 'items' | 'trust-timeline' | 'health' | 'pools' | 'activity' | 'disputes' | 'contributions';

interface SidebarItem {
  id: SidebarTab;
  label: string;
  icon: IconName;
  visible: boolean;
  href?: string; // If provided, renders as navigation link instead of tab button
}

interface CommunitySidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  items: SidebarItem[];
}

export const CommunitySidebar: Component<CommunitySidebarProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [isMobile, setIsMobile] = createSignal(false);

  // Detect mobile screen size
  createEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse on mobile
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    onCleanup(() => {
      window.removeEventListener('resize', checkMobile);
    });
  });

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded());
  };

  return (
    <aside
      class={`
        bg-white dark:bg-stone-800
        border-r border-stone-200 dark:border-stone-700
        transition-all duration-300 ease-in-out
        flex flex-col
        rounded-lg
        shadow-sm
        ${isExpanded() ? 'w-64' : 'w-16'}
        ${isMobile() && !isExpanded() ? 'w-14' : ''}
      `}
    >
      {/* Toggle Button */}
      <div class="flex items-center justify-end p-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
        <button
          onClick={toggleSidebar}
          class="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={isExpanded() ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded() ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Icon
            name={isExpanded() ? 'chevron-left' : 'chevron-right'}
            size={20}
            class="text-stone-600 dark:text-stone-400 transition-transform duration-200"
          />
        </button>
      </div>

      {/* Navigation Items */}
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-2">
          <For each={props.items?.filter(item => item.visible) ?? []}>
            {(item) => (
              <li>
                <Show
                  when={item.href}
                  fallback={
                    <button
                      onClick={() => props.onTabChange(item.id)}
                      class={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-lg
                        transition-all duration-200
                        hover:scale-[1.02] active:scale-[0.98]
                        ${
                          props.activeTab === item.id
                            ? 'bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 font-medium shadow-sm'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                        }
                        ${!isExpanded() && 'justify-center'}
                      `}
                      aria-label={item.label}
                      aria-current={props.activeTab === item.id ? 'page' : undefined}
                      title={!isExpanded() ? item.label : undefined}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        class={`
                          transition-colors duration-200
                          ${props.activeTab === item.id
                            ? 'text-ocean-600 dark:text-ocean-400'
                            : 'text-stone-500 dark:text-stone-400'
                          }
                        `}
                      />
                      <Show when={isExpanded()}>
                        <span class="truncate text-sm transition-opacity duration-200">{item.label}</span>
                      </Show>
                    </button>
                  }
                >
                  <A
                    href={item.href!}
                    class={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200
                      hover:scale-[1.02] active:scale-[0.98]
                      text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700
                      ${!isExpanded() && 'justify-center'}
                    `}
                    aria-label={item.label}
                    title={!isExpanded() ? item.label : undefined}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      class="transition-colors duration-200 text-stone-500 dark:text-stone-400"
                    />
                    <Show when={isExpanded()}>
                      <span class="truncate text-sm transition-opacity duration-200">{item.label}</span>
                    </Show>
                  </A>
                </Show>
              </li>
            )}
          </For>
        </ul>
      </nav>

      {/* Footer - Optional branding or info */}
      <Show when={isExpanded()}>
        <div class="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 transition-all duration-200">
          <p class="text-xs text-stone-500 dark:text-stone-400 text-center font-medium">
            Community Dashboard
          </p>
        </div>
      </Show>
    </aside>
  );
};
