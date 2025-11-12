import { Component, JSX } from 'solid-js';

interface BadgeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ocean' | 'forest' | 'sage' | 'sky' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: Component<BadgeProps> = (props) => {
  const { variant = 'secondary', size = 'md', children, class: className, ...rest } = props;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
  };

  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  const variantClasses = {
    primary: 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200',
    secondary: 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
    ocean: 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200',
    forest: 'bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200',
    sage: 'bg-sage-100 text-sage-800 dark:bg-sage-900 dark:text-sage-200',
    sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    default: 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200',
  };

  return (
    <div
      class={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`}
      {...rest}
    >
      {children}
    </div>
  );
};
