import { Component, JSX, Show, createEffect, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: JSX.Element;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: Component<ModalProps> = (props) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Handle escape key press
  createEffect(() => {
    if (props.isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          props.onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      onCleanup(() => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      });
    } else {
      document.body.style.overflow = '';
    }
  });

  return (
    <Show when={props.isOpen}>
      <Portal>
        {/* Backdrop */}
        <div
          class="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={props.onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            class={`relative bg-white dark:bg-stone-800 rounded-lg shadow-xl w-full ${
              sizeClasses[props.size || 'md']
            } transform transition-all`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={props.title ? 'modal-title' : undefined}
          >
            {/* Header */}
            <Show when={props.title}>
              <div class="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700">
                <h2
                  id="modal-title"
                  class="text-xl font-semibold text-stone-900 dark:text-stone-100"
                >
                  {props.title}
                </h2>
                <button
                  onClick={props.onClose}
                  class="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </Show>

            {/* Content */}
            <div class="p-6">{props.children}</div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
