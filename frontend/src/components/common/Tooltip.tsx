import { Component, JSX, ParentProps, createSignal, Show, onCleanup } from 'solid-js';

interface TooltipProps extends ParentProps {
  content: string;
  class?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}

export const Tooltip: Component<TooltipProps> = (props) => {
  const [isVisible, setIsVisible] = createSignal(false);
  let timeoutId: number | undefined;

  const showTooltip = () => {
    if (props.disabled) return;
    timeoutId = window.setTimeout(() => {
      setIsVisible(true);
    }, 300);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  onCleanup(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });

  const getPositionClasses = () => {
    const position = props.position || 'top';
    switch (position) {
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    const position = props.position || 'top';
    switch (position) {
      case 'right':
        return 'absolute w-2 h-2 bg-stone-900 transform rotate-45 -left-1 top-1/2 -translate-y-1/2';
      case 'bottom':
        return 'absolute w-2 h-2 bg-stone-900 transform rotate-45 left-1/2 -translate-x-1/2 -top-1';
      case 'left':
        return 'absolute w-2 h-2 bg-stone-900 transform rotate-45 -right-1 top-1/2 -translate-y-1/2';
      case 'top':
      default:
        return 'absolute w-2 h-2 bg-stone-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1';
    }
  };

  return (
    <div class={`relative inline-block ${props.class || ''}`}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {props.children}
      </div>
      <Show when={isVisible() && !props.disabled}>
        <div
          class={`absolute z-[9999] px-3 py-2 text-sm text-white bg-stone-900 rounded-lg shadow-lg whitespace-normal max-w-xs pointer-events-none ${getPositionClasses()}`}
          role="tooltip"
        >
          {props.content}
          <div class={getArrowClasses()}></div>
        </div>
      </Show>
    </div>
  );
};
