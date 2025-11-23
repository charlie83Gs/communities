import { Component, createSignal, createMemo, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Badge } from "@/components/common/Badge";
import { useCreatePool } from "@/hooks/queries/usePools";
import { useSearchItems } from "@/hooks/queries/useItems";
import type { CreatePoolRequest } from "@/types/pools.types";
import { makeTranslator } from "@/i18n/makeTranslator";
import { poolCreateFormDict } from "./PoolCreateForm.i18n";
import { createDebouncedSignal } from "@/utils/debounce";

interface PoolCreateFormProps {
  communityId: string;
  managedCouncils: Array<{ id: string; name: string }>;
  onCreated?: (poolId: string) => void;
  onCancel?: () => void;
  /** If true, form won't navigate after creation - useful for modal usage */
  stayInPlace?: boolean;
}

export const PoolCreateForm: Component<PoolCreateFormProps> = (props) => {
  const t = makeTranslator(poolCreateFormDict, "poolCreateForm");
  const navigate = useNavigate();

  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [councilId, setCouncilId] = createSignal("");
  const [maxUnitsPerUser, setMaxUnitsPerUser] = createSignal<
    number | undefined
  >(undefined);
  const [minimumContribution, setMinimumContribution] = createSignal<
    number | undefined
  >(undefined);
  const [selectedItemIds, setSelectedItemIds] = createSignal<string[]>([]);
  const [displayItemQuery, debouncedItemQuery, setItemSearchQuery] = createDebouncedSignal('', 300);
  const [isItemDropdownOpen, setIsItemDropdownOpen] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const createMutation = useCreatePool();

  // Fetch community items for the selector
  const itemsQuery = useSearchItems(
    () => props.communityId,
    () => debouncedItemQuery(),
    () => undefined // no kind filter
  );

  // Filter items based on search and exclude already selected
  const filteredItems = createMemo(() => {
    if (!itemsQuery.data) return [];
    const query = displayItemQuery().toLowerCase();
    const selected = selectedItemIds();
    return itemsQuery.data.filter((item) => {
      const matchesQuery = !query || (item.name?.toLowerCase().includes(query) ?? false);
      const notSelected = !selected.includes(item.id);
      return matchesQuery && notSelected;
    });
  });

  // Get selected item details
  const selectedItems = createMemo(() => {
    if (!itemsQuery.data) return [];
    const selected = selectedItemIds();
    return itemsQuery.data.filter((item) => selected.includes(item.id));
  });

  const handleAddItem = (itemId: string) => {
    setSelectedItemIds((prev) => [...prev, itemId]);
    setItemSearchQuery('');
    setIsItemDropdownOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!name().trim()) {
      setError(t("nameRequired"));
      return;
    }

    if (!councilId()) {
      setError(t("councilRequired"));
      return;
    }

    const dto: CreatePoolRequest = {
      name: name().trim(),
      description: description().trim() || "",
      maxUnitsPerUser: maxUnitsPerUser() || undefined,
      minimumContribution: minimumContribution() || undefined,
      allowedItemIds: selectedItemIds().length > 0 ? selectedItemIds() : undefined,
    };

    try {
      const pool = await createMutation.mutateAsync({
        communityId: props.communityId,
        councilId: councilId(),
        dto,
      });
      props.onCreated?.(pool.id);
      if (!props.stayInPlace) {
        navigate(`/communities/${props.communityId}/pools/${pool.id}`);
      }
    } catch (err: any) {
      setError(err?.message ?? t("createFailed"));
    }
  };

  return (
    <Card>
      <form class="p-6 space-y-6" onSubmit={onSubmit}>
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t("title")}
        </h2>

        <Show when={error()}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md text-sm">
            {error()}
          </div>
        </Show>

        {/* Pool Name */}
        <Input
          label={t("nameLabel")}
          placeholder={t("namePlaceholder")}
          value={name()}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          required
        />

        {/* Description */}
        <div>
          <Textarea
            label={t("descriptionLabel")}
            placeholder={t("descriptionPlaceholder")}
            value={description()}
            onInput={(e) =>
              setDescription((e.target as HTMLTextAreaElement).value)
            }
            rows={4}
          />
        </div>

        {/* Council Selector */}
        <div>
          <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
            {t("councilLabel")} <span class="text-danger-600">*</span>
          </label>
          <select
            class="w-full border rounded-md px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            value={councilId()}
            onChange={(e) =>
              setCouncilId((e.target as HTMLSelectElement).value)
            }
            required
          >
            <option value="">{t("councilPlaceholder")}</option>
            <For each={props.managedCouncils}>
              {(council) => <option value={council.id}>{council.name}</option>}
            </For>
          </select>
        </div>

        {/* Max Units Per User */}
        <Input
          label={t("maxUnitsPerUserLabel")}
          type="number"
          min="1"
          value={maxUnitsPerUser() ?? ""}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            setMaxUnitsPerUser(val ? Number(val) : undefined);
          }}
        />

        {/* Minimum Contribution */}
        <Input
          label={t("minimumContributionLabel")}
          type="number"
          min="1"
          value={minimumContribution() ?? ""}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            setMinimumContribution(val ? Number(val) : undefined);
          }}
        />

        {/* Allowed Items Selector */}
        <div>
          <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
            {t("allowedItemsLabel")}
          </label>
          <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
            {t("allowedItemsHelp")}
          </p>

          {/* Item Search Dropdown */}
          <div class="relative">
            <input
              type="text"
              class="w-full border rounded-md px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              placeholder={t("allowedItemsPlaceholder")}
              value={displayItemQuery()}
              onInput={(e) => setItemSearchQuery((e.target as HTMLInputElement).value)}
              onFocus={() => setIsItemDropdownOpen(true)}
            />

            <Show when={isItemDropdownOpen()}>
              <div class="absolute z-10 mt-1 w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md shadow-lg max-h-48 overflow-auto">
                <Show
                  when={filteredItems().length > 0}
                  fallback={
                    <div class="p-3 text-center text-sm text-stone-500 dark:text-stone-400">
                      {t("noItemsFound")}
                    </div>
                  }
                >
                  <For each={filteredItems()}>
                    {(item) => (
                      <div
                        class="px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer flex items-center justify-between"
                        onClick={() => handleAddItem(item.id)}
                      >
                        <span class="text-sm text-stone-900 dark:text-stone-100">
                          {item.name || "Unnamed Item"}
                        </span>
                        <Badge variant={item.kind === "object" ? "ocean" : "forest"} class="text-xs">
                          {item.kind}
                        </Badge>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </Show>
          </div>

          {/* Selected Items */}
          <div class="mt-3">
            <p class="text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">
              {t("selectedItems")}
            </p>
            <Show
              when={selectedItems().length > 0}
              fallback={
                <p class="text-xs text-stone-400 dark:text-stone-500 italic">
                  {t("noItemsSelected")}
                </p>
              }
            >
              <div class="flex flex-wrap gap-2">
                <For each={selectedItems()}>
                  {(item) => (
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
                      {item.name || "Unnamed Item"}
                      <button
                        type="button"
                        class="ml-1 text-ocean-600 dark:text-ocean-400 hover:text-ocean-800 dark:hover:text-ocean-200"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        x
                      </button>
                    </span>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>

        {/* Actions */}
        <div class="flex gap-3 pt-4">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t("creating") : t("createPool")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (props.onCancel) {
                props.onCancel();
              } else {
                navigate(`/communities/${props.communityId}/pools`);
              }
            }}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </Card>
  );
};
