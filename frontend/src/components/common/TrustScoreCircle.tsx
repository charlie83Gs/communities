import { Component } from 'solid-js';

interface TrustScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

/**
 * A circular badge component for prominently displaying trust scores
 * Features a gradient background, shadow effects, and optional label
 * Used for floating trust score displays on cards
 */
export const TrustScoreCircle: Component<TrustScoreCircleProps> = (props) => {
  const size = () => props.size || 'md';

  // Size configurations
  const sizeConfig = () => {
    switch (size()) {
      case 'sm':
        return {
          container: 'w-14 h-14',
          text: 'text-xl',
          label: 'text-[9px]',
          ring: 'ring-3',
        };
      case 'lg':
        return {
          container: 'w-24 h-24',
          text: 'text-5xl',
          label: 'text-xs',
          ring: 'ring-4',
        };
      default: // md
        return {
          container: 'w-20 h-20',
          text: 'text-3xl',
          label: 'text-[10px]',
          ring: 'ring-4',
        };
    }
  };

  return (
    <div class="flex flex-col items-center gap-1.5">
      <div
        class={`${sizeConfig().container} rounded-full bg-gradient-to-br from-forest-500 via-forest-600 to-forest-700 dark:from-forest-400 dark:via-forest-500 dark:to-forest-600 shadow-lg flex items-center justify-center ${sizeConfig().ring} ring-forest-100 dark:ring-forest-900/50 transform hover:scale-105 transition-all duration-200 hover:shadow-xl`}
      >
        <span class={`${sizeConfig().text} font-bold text-white drop-shadow-lg`}>
          {props.score}
        </span>
      </div>
      {props.showLabel !== false && (
        <span class={`${sizeConfig().label} font-semibold text-forest-700 dark:text-forest-300 uppercase tracking-wider`}>
          {props.label || 'Trust'}
        </span>
      )}
    </div>
  );
};
