import { Component, createSignal, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { useCouncilNeedsQuery } from '@/hooks/queries/useNeeds';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { NeedStatus, NeedPriority } from '@/types/needs.types';

const CouncilNeedsPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const councilId = () => params.id;

  // Filter states
  const [statusFilter, setStatusFilter] = createSignal<NeedStatus | undefined>('active');
  const [priorityFilter, setPriorityFilter] = createSignal<NeedPriority | undefined>(undefined);

  const needsQuery = useCouncilNeedsQuery(() => councilId(), {
    status: statusFilter,
    priority: priorityFilter,
  });

  return (
    <>
      <Title>Council Needs</Title>
      <Meta name="description" content="View and manage council needs" />

      <div class="container mx-auto px-4 py-6 max-w-6xl">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">Council Needs</h1>
          <Button onClick={() => navigate(`/councils/${councilId()}/needs/create`)}>
            Publish Council Need
          </Button>
        </div>

        {/* Filters */}
        <Card class="p-4 mb-4">
          <h4 class="text-sm font-semibold mb-3 text-stone-900 dark:text-stone-100">Filters</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium mb-1 text-stone-900 dark:text-stone-100">
                Status
              </label>
              <select
                class="w-full border rounded px-2 py-1 text-sm border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                value={statusFilter() || ''}
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  setStatusFilter(val ? (val as NeedStatus) : undefined);
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium mb-1 text-stone-900 dark:text-stone-100">
                Priority
              </label>
              <select
                class="w-full border rounded px-2 py-1 text-sm border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                value={priorityFilter() || ''}
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value;
                  setPriorityFilter(val ? (val as NeedPriority) : undefined);
                }}
              >
                <option value="">All Priorities</option>
                <option value="need">Need</option>
                <option value="want">Want</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Needs List */}
        <Show
          when={!needsQuery.isLoading}
          fallback={
            <Card class="p-4">
              <p class="text-center text-stone-600 dark:text-stone-400">Loading needs...</p>
            </Card>
          }
        >
          <Show
            when={needsQuery.data && needsQuery.data.length > 0}
            fallback={
              <Card class="p-8 text-center">
                <h4 class="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">
                  No council needs published
                </h4>
                <p class="text-stone-600 dark:text-stone-400">
                  Publish needs to help coordinate resource planning for this council
                </p>
              </Card>
            }
          >
            <div class="text-stone-900 dark:text-stone-100">
              {needsQuery.data!.length} council needs found
            </div>
          </Show>
        </Show>
      </div>
    </>
  );
};

export default CouncilNeedsPage;
