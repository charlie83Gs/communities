import { Component, JSX } from 'solid-js';

interface InfoTooltipProps {
  text: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  width?: 'sm' | 'md' | 'lg';
  iconSize?: 'xs' | 'sm' | 'md';
}

/**
 * InfoTooltip - A standardized info icon with hover tooltip
 *
 * Used to provide contextual help for features, filters, and UI elements.
 * Displays a small info icon that shows explanatory text on hover.
 */
export const InfoTooltip: Component<InfoTooltipProps> = (props) => {
  const getWidthClass = () => {
    switch (props.width) {
      case 'sm':
        return 'w-48';
      case 'lg':
        return 'w-80';
      case 'md':
      default:
        return 'w-64';
    }
  };

  const getIconSizeClass = () => {
    switch (props.iconSize) {
      case 'xs':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'sm':
      default:
        return 'w-3.5 h-3.5';
    }
  };

  const getPositionClasses = () => {
    switch (props.position) {
      case 'top':
        return 'bottom-full left-0 mb-1';
      case 'right':
        return 'left-full top-0 ml-1';
      case 'left':
        return 'right-full top-0 mr-1';
      case 'bottom':
      default:
        return 'left-0 top-full mt-1';
    }
  };

  return (
    <div class="relative group inline-flex items-center">
      <span class="cursor-help text-stone-400 dark:text-stone-500 hover:text-stone-500 dark:hover:text-stone-400 transition-colors">
        <svg class={getIconSizeClass()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
      <div
        class={`
          absolute hidden group-hover:block z-50 p-2 text-xs
          bg-stone-900 dark:bg-stone-100
          text-white dark:text-stone-900
          rounded shadow-lg
          ${getWidthClass()}
          ${getPositionClasses()}
        `}
      >
        {props.text}
      </div>
    </div>
  );
};
