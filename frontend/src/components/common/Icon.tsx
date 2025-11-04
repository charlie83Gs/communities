import { Component, Match, Switch } from 'solid-js';

export type IconName =
  | 'wealth'
  | 'members'
  | 'invites'
  | 'trust'
  | 'settings'
  | 'forum'
  | 'polls'
  | 'items'
  | 'health'
  | 'chevron-left'
  | 'chevron-right'
  | 'menu'
  | 'info'
  | 'edit'
  | 'trash'
  | 'lock'
  | 'check';

interface IconProps {
  name: IconName;
  class?: string;
  size?: number;
}

export const Icon: Component<IconProps> = (props) => {
  const size = () => props.size || 20;
  const baseClass = () => props.class || 'text-current';

  return (
    <Switch>
      <Match when={props.name === 'wealth'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
          <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
        </svg>
      </Match>

      <Match when={props.name === 'members'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </Match>

      <Match when={props.name === 'invites'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </Match>

      <Match when={props.name === 'trust'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </Match>

      <Match when={props.name === 'settings'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6" />
          <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
          <path d="M1 12h6m6 0h6" />
          <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
        </svg>
      </Match>

      <Match when={props.name === 'forum'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </Match>

      <Match when={props.name === 'polls'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      </Match>

      <Match when={props.name === 'items'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </Match>

      <Match when={props.name === 'health'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </Match>

      <Match when={props.name === 'chevron-left'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Match>

      <Match when={props.name === 'chevron-right'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Match>

      <Match when={props.name === 'menu'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </Match>

      <Match when={props.name === 'info'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </Match>

      <Match when={props.name === 'edit'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Match>

      <Match when={props.name === 'trash'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </Match>

      <Match when={props.name === 'lock'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </Match>

      <Match when={props.name === 'check'}>
        <svg
          class={baseClass()}
          width={size()}
          height={size()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </Match>
    </Switch>
  );
};
