import { Component, JSX } from 'solid-js';
import { Icon } from '@/components/common/Icon';

interface SectionDisclaimerProps {
  children: JSX.Element;
  class?: string;
}

export const SectionDisclaimer: Component<SectionDisclaimerProps> = (props) => {
  return (
    <div
      class={`
        flex items-start gap-3 p-3 mb-4 rounded-lg
        bg-ocean-50 dark:bg-ocean-950/30
        border border-ocean-200 dark:border-ocean-800
        ${props.class || ''}
      `}
    >
      <Icon
        name="info"
        size={18}
        class="text-ocean-600 dark:text-ocean-400 flex-shrink-0 mt-0.5"
      />
      <p class="text-sm text-ocean-800 dark:text-ocean-200 leading-relaxed">
        {props.children}
      </p>
    </div>
  );
};
