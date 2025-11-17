import { Component, JSX } from 'solid-js';

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const Card: Component<CardProps> = (props) => {
  const padding = props.noPadding ? '' : 'p-6';
  return (
    <div {...props} class={`bg-stone-50 dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 ${padding} ${props.class || ''}`}>
      {props.children}
    </div>
  );
};
