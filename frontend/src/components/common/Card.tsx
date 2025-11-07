import { Component, JSX } from 'solid-js';

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Card: Component<CardProps> = (props) => {
  return (
    <div {...props} class={`bg-stone-50 dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 ${props.class || ''}`}>
      {props.children}
    </div>
  );
};
