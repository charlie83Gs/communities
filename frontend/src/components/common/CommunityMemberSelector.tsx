/**
 * CommunityMemberSelector Component
 * Location per architecture: /components/common (reusable UI component)
 *
 * A reusable component for selecting community members with search functionality.
 * Can be used in single or multi-select mode.
 */

import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import type { CommunityMember } from '@/types/community.types';
import { createDebouncedSignal } from '@/utils/debounce';

interface CommunityMemberSelectorProps {
  communityId: string;
  mode: 'single' | 'multi';
  selectedIds: string[];
  onSelect: (userId: string) => void;
  onDeselect: (userId: string) => void;
  excludeIds?: string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export const CommunityMemberSelector: Component<CommunityMemberSelectorProps> = (props) => {
  const [displayQuery, debouncedQuery, setSearchQuery] = createDebouncedSignal<string>('', 300);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

  const membersQuery = useCommunityMembersQuery(
    () => props.communityId,
    () => debouncedQuery() || undefined
  );

  // Filter out excluded members
  const availableMembers = createMemo(() => {
    if (!membersQuery.data) return [];
    const excludeSet = new Set(props.excludeIds || []);
    return membersQuery.data.filter(member => !excludeSet.has(member.userId));
  });

  // Get selected members for display
  const selectedMembers = createMemo(() => {
    if (!membersQuery.data) return [];
    return membersQuery.data.filter(member => props.selectedIds.includes(member.userId));
  });

  const handleMemberClick = (member: CommunityMember) => {
    if (props.selectedIds.includes(member.userId)) {
      props.onDeselect(member.userId);
    } else {
      props.onSelect(member.userId);
      if (props.mode === 'single') {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    }
  };

  const getMemberDisplay = (member: CommunityMember) => {
    return member.displayName || `@${member.userId}`;
  };

  return (
    <div class="space-y-2">
      <Show when={props.label}>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300">
          {props.label}
        </label>
      </Show>

      {/* Selected Members Display (for multi-select) */}
      <Show when={props.mode === 'multi' && selectedMembers().length > 0}>
        <div class="flex flex-wrap gap-2 p-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-900">
          <For each={selectedMembers()}>
            {(member) => (
              <span class="inline-flex items-center gap-1 px-2 py-1 bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 rounded-md text-sm">
                {getMemberDisplay(member)}
                <button
                  type="button"
                  onClick={() => props.onDeselect(member.userId)}
                  class="hover:text-ocean-900 dark:hover:text-ocean-100"
                  disabled={props.disabled}
                >
                  ×
                </button>
              </span>
            )}
          </For>
        </div>
      </Show>

      {/* Search Input */}
      <div class="relative">
        <input
          type="text"
          value={displayQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder={props.placeholder || 'Search members...'}
          disabled={props.disabled}
          class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Dropdown */}
        <Show when={isDropdownOpen() && !props.disabled}>
          <div class="absolute z-10 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <Show when={membersQuery.isLoading}>
              <div class="p-3 text-sm text-stone-500 dark:text-stone-400">
                Loading members...
              </div>
            </Show>

            <Show when={!membersQuery.isLoading && availableMembers().length === 0}>
              <div class="p-3 text-sm text-stone-500 dark:text-stone-400">
                {debouncedQuery() ? 'No members found' : 'No available members'}
              </div>
            </Show>

            <Show when={!membersQuery.isLoading && availableMembers().length > 0}>
              <For each={availableMembers()}>
                {(member) => {
                  const isSelected = () => props.selectedIds.includes(member.userId);
                  return (
                    <div
                      class="p-3 hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer border-b border-stone-200 dark:border-stone-600 last:border-b-0"
                      onClick={() => handleMemberClick(member)}
                    >
                      <div class="flex items-center gap-2">
                        <Show when={props.mode === 'multi'}>
                          <input
                            type="checkbox"
                            checked={isSelected()}
                            class="h-4 w-4 rounded border-stone-300 text-ocean-600 focus:ring-ocean-500"
                            readOnly
                          />
                        </Show>
                        <div class="flex-1">
                          <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {getMemberDisplay(member)}
                          </div>
                          <div class="text-xs text-stone-500 dark:text-stone-400">
                            @{member.userId}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </Show>

            {/* Close dropdown button */}
            <div class="sticky bottom-0 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-600 p-2">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setSearchQuery('');
                }}
                class="w-full text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300"
              >
                Close
              </button>
            </div>
          </div>
        </Show>
      </div>

      {/* Selection count (for multi-select) */}
      <Show when={props.mode === 'multi' && props.selectedIds.length > 0}>
        <p class="text-sm text-stone-600 dark:text-stone-400">
          {props.selectedIds.length} member(s) selected
        </p>
      </Show>
    </div>
  );
};
