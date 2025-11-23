import { Component, JSX, splitProps } from 'solid-js';

export interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

export const Select: Component<SelectProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children', 'placeholder']);

  const baseClasses = 'w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <select
      class={`${baseClasses} ${local.class || ''}`}
      {...rest}
    >
      {local.children}
    </select>
  );
};
