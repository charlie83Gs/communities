import { Component, createSignal, Show, For } from 'solid-js';
import { useParams } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { useTrustLevelsQuery } from '@/hooks/queries/useTrustLevelsQuery';
import {
  useCreateTrustLevelMutation,
  useUpdateTrustLevelMutation,
  useDeleteTrustLevelMutation,
} from '@/hooks/queries/useTrustLevelMutations';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import type { TrustLevel } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { trustLevelsDict } from './trust-levels.i18n';

const TrustLevelsPage: Component = () => {
  const params = useParams();
  const communityId = () => params.id;
  const t = makeTranslator(trustLevelsDict, 'trustLevels');

  const trustLevels = useTrustLevelsQuery(communityId);
  const createMutation = useCreateTrustLevelMutation();
  const updateMutation = useUpdateTrustLevelMutation();
  const deleteMutation = useDeleteTrustLevelMutation();

  const [showForm, setShowForm] = createSignal(false);
  const [editingLevel, setEditingLevel] = createSignal<TrustLevel | null>(null);
  const [formData, setFormData] = createSignal({ name: '', threshold: 0 });
  const [errors, setErrors] = createSignal<Record<string, string>>({});

  const sortedLevels = () => trustLevels.data?.sort((a: { threshold: number }, b: { threshold: number }) => a.threshold - b.threshold) || [];

  const validateForm = () => {
    const data = formData();
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      newErrors.name = t('validation.nameRequired');
    }

    if (data.threshold < 0) {
      newErrors.threshold = t('validation.thresholdPositive');
    }

    // Check for duplicate threshold
    const existingLevel = sortedLevels().find(
      (level: { threshold: number; id: string }) => level.threshold === data.threshold && level.id !== editingLevel()?.id
    );
    if (existingLevel) {
      newErrors.threshold = t('validation.thresholdUnique');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const data = formData();
    try {
      await createMutation.mutateAsync({
        communityId: communityId(),
        dto: { name: data.name, threshold: data.threshold },
      });
      alert(t('messages.createSuccess'));
      resetForm();
    } catch (error) {
      alert(t('messages.createError'));
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingLevel()) return;

    const data = formData();
    try {
      await updateMutation.mutateAsync({
        communityId: communityId(),
        id: editingLevel()!.id,
        dto: { name: data.name, threshold: data.threshold },
      });
      alert(t('messages.updateSuccess'));
      resetForm();
    } catch (error) {
      alert(t('messages.updateError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.confirmDelete'))) return;

    try {
      await deleteMutation.mutateAsync({ communityId: communityId(), id });
      alert(t('messages.deleteSuccess'));
    } catch (error) {
      alert(t('messages.deleteError'));
    }
  };

  const openCreateForm = () => {
    setEditingLevel(null);
    setFormData({ name: '', threshold: 0 });
    setErrors({});
    setShowForm(true);
  };

  const openEditForm = (level: TrustLevel) => {
    setEditingLevel(level);
    setFormData({ name: level.name, threshold: level.threshold });
    setErrors({});
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLevel(null);
    setFormData({ name: '', threshold: 0 });
    setErrors({});
  };

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('description')} />

      <div class="max-w-4xl mx-auto p-6">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">{t('title')}</h1>
          <p class="text-stone-600 dark:text-stone-400">{t('description')}</p>
        </div>

        <div class="mb-4">
          <Button onClick={openCreateForm}>{t('createButton')}</Button>
        </div>

        {/* Form (create/edit) */}
        <Show when={showForm()}>
          <Card>
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-4 text-stone-900 dark:text-stone-100">
                {editingLevel() ? t('form.editTitle') : t('form.createTitle')}
              </h2>

              <Input
                label={t('form.nameLabel')}
                placeholder={t('form.namePlaceholder')}
                value={formData().name}
                onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                error={errors().name}
              />

              <Input
                type="number"
                label={t('form.thresholdLabel')}
                placeholder={t('form.thresholdPlaceholder')}
                value={formData().threshold}
                onInput={(e) =>
                  setFormData({ ...formData(), threshold: parseInt(e.currentTarget.value, 10) || 0 })
                }
                error={errors().threshold}
                min="0"
              />

              <div class="flex gap-2">
                <Button
                  onClick={editingLevel() ? handleUpdate : handleCreate}
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingLevel() ? t('form.update') : t('form.create')}
                </Button>
                <Button variant="secondary" onClick={resetForm}>
                  {t('form.cancel')}
                </Button>
              </div>
            </div>
          </Card>
        </Show>

        {/* Trust levels table */}
        <Card>
          <div class="p-6">
            <Show when={!trustLevels.isLoading && sortedLevels().length > 0} fallback={
              <Show when={!trustLevels.isLoading}>
                <p class="text-stone-500 dark:text-stone-400 text-center py-8">{t('empty')}</p>
              </Show>
            }>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
                  <thead class="bg-stone-50 dark:bg-stone-800">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t('table.name')}
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t('table.threshold')}
                      </th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        {t('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                    <For each={sortedLevels()}>
                      {(level) => (
                        <tr>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-stone-100">
                            {level.name}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                            {level.threshold}+
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openEditForm(level)}
                              class="text-ocean-600 hover:text-ocean-900 dark:text-ocean-400 dark:hover:text-ocean-300 mr-4"
                            >
                              {t('table.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(level.id)}
                              class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              {t('table.delete')}
                            </button>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>

            <Show when={trustLevels.isLoading}>
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 dark:border-stone-100"></div>
              </div>
            </Show>
          </div>
        </Card>
      </div>
    </>
  );
};

export default TrustLevelsPage;
