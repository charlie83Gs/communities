import { Component, createSignal, Show } from 'solid-js';
import { useCreateItemMutation } from '@/hooks/queries/useItems';
import type { ItemKind, Item } from '@/types/items.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

interface ItemCreateFormProps {
  communityId: string;
  initialKind?: ItemKind;
  onSuccess: (item: Item) => void;
  onCancel: () => void;
}

export const ItemCreateForm: Component<ItemCreateFormProps> = (props) => {
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [kind, setKind] = createSignal<ItemKind>(props.initialKind || 'object');
  const [wealthValue, setWealthValue] = createSignal('1.0');
  const [error, setError] = createSignal<string | null>(null);

  const createMutation = useCreateItemMutation();

  const validateWealthValue = (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'Wealth value is required';
    }

    // Check pattern /^\d+(\.\d{1,2})?$/
    const pattern = /^\d+(\.\d{1,2})?$/;
    if (!pattern.test(value)) {
      return 'Please enter a valid number (max 2 decimal places)';
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    if (numValue <= 0) {
      return 'Wealth value must be greater than 0';
    }

    if (numValue > 10000) {
      return 'Wealth value cannot exceed 10,000';
    }

    return null;
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!name().trim()) {
      setError('Name is required');
      return;
    }

    if (name().trim().length > 200) {
      setError('Name must be 200 characters or less');
      return;
    }

    const wealthValidationError = validateWealthValue(wealthValue());
    if (wealthValidationError) {
      setError(wealthValidationError);
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        communityId: props.communityId,
        name: name().trim(),
        description: description().trim() || undefined,
        kind: kind(),
        wealthValue: wealthValue(),
      });

      props.onSuccess(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create item');
    }
  };

  return (
    <Card class="p-4">
      <form onSubmit={onSubmit} class="space-y-4">
        <h3 class="text-lg font-semibold">Create New Item</h3>

        <Show when={error()}>
          <div class="text-danger-600 text-sm">{error()}</div>
        </Show>

        <Input
          label="Name"
          placeholder="e.g., Carrots, Car Repair Service"
          value={name()}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          required
        />

        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            class="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            rows={3}
            placeholder="Optional description"
            value={description()}
            onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">Kind</label>
          <select
            class="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            value={kind()}
            onChange={(e) => setKind((e.target as HTMLSelectElement).value as ItemKind)}
          >
            <option value="object">Object</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            <span class="flex items-center gap-1">
              <span>Wealth Value</span>
              <span class="text-lg">📊</span>
            </span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            max="10000"
            placeholder="1.0"
            value={wealthValue()}
            onInput={(e) => {
              setWealthValue((e.target as HTMLInputElement).value);
            }}
            required
          />
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Numeric value for community wealth statistics (0.01 - 10,000, max 2 decimal places)
          </p>
        </div>

        <div class="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Item'}
          </Button>
          <Button type="button" variant="secondary" onClick={props.onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
