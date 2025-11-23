import {
  Component,
  For,
  Show,
  createMemo,
  createSignal,
  createEffect,
  onMount,
} from "solid-js";
import { A } from "@solidjs/router";
import { WealthCard } from "@/components/features/wealth/WealthCard";
import { useSearchWealthQuery } from "@/hooks/queries/useSearchWealthQuery";
import { createDebouncedSignal } from "@/utils/debounce";
import type {
  WealthDistributionType,
  WealthDurationType,
  WealthStatus,
} from "@/types/wealth.types";
import { makeTranslator } from "@/i18n/makeTranslator";
import { wealthListDict } from "@/components/features/wealth/WealthList.i18n";
import { InfoTooltip } from "@/components/common/InfoTooltip";

interface WealthListProps {
  communityId: string;
}

export const WealthList: Component<WealthListProps> = (props) => {
  const t = makeTranslator(wealthListDict, "wealthList");

  // Mount guard to ensure query only runs after component is fully mounted
  // This prevents reactive scope issues when component is inside Show/Match
  const [isMounted, setIsMounted] = createSignal(false);
  onMount(() => setIsMounted(true));

  // Filters and controls
  const [displayQ, debouncedQ, setQ] = createDebouncedSignal<string>("", 300);
  const [showFilters, setShowFilters] = createSignal<boolean>(false);
  const [showPoolContributions, setShowPoolContributions] =
    createSignal<boolean>(false);
  const [durationType, setDurationType] = createSignal<WealthDurationType | "">(
    "",
  );
  const [distributionType, setDistributionType] = createSignal<
    WealthDistributionType | ""
  >("");
  const [status, setStatus] = createSignal<WealthStatus | "">("");
  const [endDateAfter, setEndDateAfter] = createSignal<string>("");
  const [endDateBefore, setEndDateBefore] = createSignal<string>("");
  const [page, setPage] = createSignal<number>(1);
  const [limit, setLimit] = createSignal<number>(12);

  // Reset page to 1 when filters (except page/limit) change
  // Use createEffect instead of standalone on() for proper reactive tracking
  createEffect(() => {
    // Track all filter dependencies
    debouncedQ();
    showPoolContributions();
    durationType();
    distributionType();
    status();
    endDateAfter();
    endDateBefore();
    // Reset page to 1 when any filter changes
    setPage(1);
  });

  // Build params for search endpoint
  // Guard against undefined communityId during unmount and ensure mounted before querying
  const params = createMemo(() => {
    // Don't enable query until component is fully mounted to avoid reactive scope issues
    if (!isMounted()) {
      return undefined;
    }
    const communityId = props.communityId;
    if (!communityId) {
      return undefined;
    }
    return {
      q: debouncedQ() ?? "",
      communityId,
      durationType: (durationType() || undefined) as
        | WealthDurationType
        | undefined,
      distributionType: (distributionType() || undefined) as
        | WealthDistributionType
        | undefined,
      status: (status() || undefined) as WealthStatus | undefined,
      endDateAfter: endDateAfter()
        ? new Date(endDateAfter()).toISOString()
        : undefined,
      endDateBefore: endDateBefore()
        ? new Date(endDateBefore()).toISOString()
        : undefined,
      page: page(),
      limit: limit(),
    };
  });

  const query = useSearchWealthQuery(() => params());

  // Safe accessors that handle undefined data properly
  // Filter out pool contributions unless explicitly requested
  const items = createMemo(() => {
    const allItems = query.data?.items ?? [];
    if (showPoolContributions()) {
      return allItems;
    }
    // By default, hide wealth items where sharingTarget === 'pool'
    return allItems.filter((item) => item.sharingTarget !== "pool");
  });
  const pagination = createMemo(() => query.data?.pagination);
  const hasMore = createMemo(() => {
    const pag = pagination();
    return pag ? !!pag.hasMore : false;
  });
  const currentPage = createMemo(() => {
    const pag = pagination();
    return pag?.page ?? page();
  });
  const pageSize = createMemo(() => {
    const pag = pagination();
    return pag?.limit ?? limit();
  });
  const total = createMemo(() => {
    const pag = pagination();
    return pag?.total;
  });

  return (
    <div class="space-y-4">
      {/* Search and Filters */}
      <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Query automatically reacts to signal changes, no manual refetch needed
          }}
        >
          {/* Search Row */}
          <div class="flex gap-3">
            <div class="flex-1">
              <input
                type="text"
                placeholder={t("filters.searchPlaceholder")}
                value={displayQ()}
                onInput={(e) =>
                  setQ((e.currentTarget as HTMLInputElement).value)
                }
                class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>
            <button
              type="submit"
              disabled={query.isFetching}
              class="px-4 py-2 text-sm bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {query.isFetching
                ? t("filters.submitting")
                : t("filters.submit")}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters())}
              class="px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
            >
              {t("filters.advancedSearch")} {showFilters() ? "▲" : "▼"}
            </button>
          </div>

          {/* Collapsible Filters */}
          <Show when={showFilters()}>
            <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
              {/* Pool Contributions Checkbox */}
              <div class="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={showPoolContributions()}
                  onChange={(e) =>
                    setShowPoolContributions(e.currentTarget.checked)
                  }
                  class="mr-2 text-ocean-600 focus:ring-ocean-500"
                />
                <label class="text-sm text-stone-700 dark:text-stone-300">
                  {t("filters.showPoolContributions")}
                </label>
              </div>

              {/* Filter Grid */}
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div>
                  <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300">
                    {t("filters.duration")}
                  </label>
                  <select
                    class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    value={durationType() || ""}
                    onInput={(e) =>
                      setDurationType(
                        (e.currentTarget as HTMLSelectElement).value as any,
                      )
                    }
                  >
                    <option value="">{t("filters.any")}</option>
                    <option value="timebound">{t("filters.timebound")}</option>
                    <option value="unlimited">{t("filters.unlimited")}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    {t("filters.distribution")}
                    <InfoTooltip text={t("filters.tooltips.distribution")} position="bottom" iconSize="xs" />
                  </label>
                  <select
                    class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    value={distributionType() || ""}
                    onInput={(e) =>
                      setDistributionType(
                        (e.currentTarget as HTMLSelectElement).value as any,
                      )
                    }
                  >
                    <option value="">{t("filters.any")}</option>
                    <option value="request_based">
                      {t("filters.request_based")}
                    </option>
                    <option value="unit_based">
                      {t("filters.unit_based")}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300">
                    {t("filters.status")}
                  </label>
                  <select
                    class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    value={status() || ""}
                    onInput={(e) =>
                      setStatus(
                        (e.currentTarget as HTMLSelectElement).value as any,
                      )
                    }
                  >
                    <option value="">{t("filters.any")}</option>
                    <option value="active">{t("filters.active")}</option>
                    <option value="fulfilled">{t("filters.fulfilled")}</option>
                    <option value="expired">{t("filters.expired")}</option>
                    <option value="cancelled">{t("filters.cancelled")}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300">
                    {t("filters.perPage")}
                  </label>
                  <select
                    class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    value={String(limit())}
                    onInput={(e) =>
                      setLimit(
                        Number((e.currentTarget as HTMLSelectElement).value),
                      )
                    }
                  >
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="18">18</option>
                    <option value="24">24</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300">
                    {t("filters.endDateAfter")}
                  </label>
                  <input
                    type="datetime-local"
                    value={endDateAfter()}
                    onInput={(e) =>
                      setEndDateAfter(
                        (e.currentTarget as HTMLInputElement).value,
                      )
                    }
                    class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300">
                    {t("filters.endDateBefore")}
                  </label>
                  <input
                    type="datetime-local"
                    value={endDateBefore()}
                    onInput={(e) =>
                      setEndDateBefore(
                        (e.currentTarget as HTMLInputElement).value,
                      )
                    }
                    class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          </Show>
        </form>
      </div>

      <Show
        when={!query.isLoading}
        fallback={
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-center text-stone-600 dark:text-stone-400">
            {t("loading")}
          </div>
        }
      >
        <Show
          when={items().length > 0}
          fallback={
            <div class="p-6 text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              {t("empty")}
            </div>
          }
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <For each={items()}>
              {(wealth: any) => (
                <WealthCard wealth={wealth} />
              )}
            </For>
          </div>

          <div class="flex items-center justify-between mt-4">
            <div class="text-xs text-stone-600 dark:text-stone-400">
              {t("pagination.pageX").replace("{{page}}", String(currentPage()))}{" "}
              •{" "}
              {t("pagination.perPageX").replace(
                "{{limit}}",
                String(pageSize()),
              )}
              {total() != null
                ? ` • ${t("pagination.totalX").replace("{{total}}", String(total()))}`
                : ""}
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 dark:text-stone-300"
                disabled={currentPage() <= 1 || query.isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("pagination.prev")}
              </button>
              <button
                class="px-3 py-1.5 text-sm border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 dark:text-stone-300"
                disabled={!hasMore() || query.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("pagination.next")}
              </button>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default WealthList;
