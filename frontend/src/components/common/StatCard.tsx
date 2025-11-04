import { Component, JSX } from 'solid-js';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: JSX.Element;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: Component<StatCardProps> = (props) => {
  const trendColors = {
    up: 'text-success-600 dark:text-success-400',
    down: 'text-danger-600 dark:text-danger-400',
    neutral: 'text-stone-500 dark:text-stone-400',
  };

  return (
    <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
            {props.title}
          </p>
          <p class="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            {props.value}
          </p>
          {props.subtitle && (
            <p class="text-sm text-stone-500 dark:text-stone-400">
              {props.subtitle}
            </p>
          )}
          {props.trend && props.trendValue && (
            <div class={`flex items-center gap-1 mt-2 text-sm font-medium ${trendColors[props.trend]}`}>
              <span>{props.trend === 'up' ? '↑' : props.trend === 'down' ? '↓' : '→'}</span>
              <span>{props.trendValue}</span>
            </div>
          )}
        </div>
        {props.icon && (
          <div class="ml-4 p-3 bg-ocean-100 dark:bg-ocean-900 rounded-lg">
            {props.icon}
          </div>
        )}
      </div>
    </div>
  );
};
