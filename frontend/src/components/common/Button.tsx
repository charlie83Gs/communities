import { Component, JSX, splitProps } from 'solid-js';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['variant', 'size', 'loading', 'children']);
  
  const baseClasses = 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  const variants = {
    primary: 'bg-ocean-600 text-white hover:bg-ocean-700 focus:ring-ocean-500',
    secondary: 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300 focus:ring-ocean-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
  };
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      class={`${baseClasses} ${variants[local.variant || 'primary']} ${sizes[local.size || 'md']}`}
      disabled={local.loading}
      {...rest}
    >
      {local.loading ? (
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {local.children}
    </button>
  );
};