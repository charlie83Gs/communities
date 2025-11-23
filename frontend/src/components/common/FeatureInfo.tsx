import { Component, createSignal, Show, For } from 'solid-js';

interface FeatureInfoProps {
  title: string;
  purpose: string;
  howToSteps: string[];
  features: string[];
  note?: string;
  howToLabel: string;
  featuresLabel: string;
  infoLabel: string;
}

export const FeatureInfo: Component<FeatureInfoProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <div class="mb-4 border border-stone-200 dark:border-stone-700 rounded overflow-hidden bg-transparent">
      <button
        onClick={() => setIsExpanded(!isExpanded())}
        class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm">ℹ️</span>
          <span class="text-sm text-stone-600 dark:text-stone-400">
            {props.infoLabel}
          </span>
        </div>
        <Show when={isExpanded()}>
          <span class="text-stone-400 dark:text-stone-500 text-xs">▼</span>
        </Show>
      </button>

      <Show when={isExpanded()}>
        <div class="px-3 py-3 border-t border-stone-200 dark:border-stone-700 space-y-3 bg-stone-50 dark:bg-stone-900/30">
          {/* Purpose */}
          <div>
            <h4 class="font-medium text-stone-900 dark:text-stone-100 mb-1 text-sm">
              {props.title}
            </h4>
            <p class="text-stone-600 dark:text-stone-400 text-xs leading-relaxed">
              {props.purpose}
            </p>
          </div>

          {/* Note if present */}
          <Show when={props.note}>
            <div class="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded px-2 py-1.5">
              <p class="text-ocean-800 dark:text-ocean-200 text-xs">
                {props.note}
              </p>
            </div>
          </Show>

          {/* How to use */}
          <Show when={props.howToSteps.length > 0}>
            <div>
              <h5 class="font-medium text-stone-900 dark:text-stone-100 mb-1.5 text-xs">
                {props.howToLabel}
              </h5>
              <ol class="list-decimal list-inside space-y-0.5 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                <For each={props.howToSteps}>
                  {(step) => <li>{step}</li>}
                </For>
              </ol>
            </div>
          </Show>

          {/* Key features */}
          <Show when={props.features.length > 0}>
            <div>
              <h5 class="font-medium text-stone-900 dark:text-stone-100 mb-1.5 text-xs">
                {props.featuresLabel}
              </h5>
              <ul class="list-disc list-inside space-y-0.5 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                <For each={props.features}>
                  {(feature) => <li>{feature}</li>}
                </For>
              </ul>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
