import { Component, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import type { Pool } from "@/types/pools.types";
import { makeTranslator } from "@/i18n/makeTranslator";
import { poolCardDict } from "./PoolCard.i18n";

interface PoolCardProps {
  pool: Pool;
  communityId: string;
}

export const PoolCard: Component<PoolCardProps> = (props) => {
  const t = makeTranslator(poolCardDict, "poolCard");

  const totalItems = () =>
    props.pool.inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

  return (
    <A
      href={`/communities/${props.communityId}/pools/${props.pool.id}`}
      class="block p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-ocean-400 dark:hover:border-ocean-600 transition-colors"
    >
      {/* Header with name */}
      <div class="mb-2">
        <h3 class="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
          {props.pool.name}
        </h3>
      </div>

      {/* Council */}
      <p class="text-xs text-stone-600 dark:text-stone-400 truncate mb-2">
        {t("managedBy")}: {props.pool.councilName}
      </p>

      {/* Inventory Summary */}
      <div class="pt-2 border-t border-stone-200 dark:border-stone-700">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-stone-700 dark:text-stone-300">
            {t("inventory")}
          </span>
          <span class="text-xs font-medium text-ocean-600 dark:text-ocean-400">
            {totalItems()} {t("items")}
          </span>
        </div>

        <Show
          when={props.pool.inventory.length > 0}
          fallback={
            <p class="text-xs text-stone-500 dark:text-stone-400 italic">
              {t("emptyInventory")}
            </p>
          }
        >
          <div class="space-y-0.5">
            <For each={props.pool.inventory.slice(0, 2)}>
              {(item) => (
                <div class="flex items-center justify-between text-xs">
                  <span class="text-stone-600 dark:text-stone-400 truncate">
                    {item.itemName}
                  </span>
                  <span class="font-medium text-stone-700 dark:text-stone-300 ml-2">
                    {item.unitsAvailable}
                  </span>
                </div>
              )}
            </For>
            <Show when={props.pool.inventory.length > 2}>
              <p class="text-xs text-stone-500 dark:text-stone-400 italic">
                +{props.pool.inventory.length - 2} {t("more")}
              </p>
            </Show>
          </div>
        </Show>
      </div>
    </A>
  );
};
