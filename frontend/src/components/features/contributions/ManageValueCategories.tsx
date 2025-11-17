import { Component } from 'solid-js';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { manageValueCategoriesDict } from './ManageValueCategories.i18n';
import { useNavigate } from '@solidjs/router';

interface ManageValueCategoriesProps {
  communityId: string;
}

export const ManageValueCategories: Component<ManageValueCategoriesProps> = (props) => {
  const t = makeTranslator(manageValueCategoriesDict, 'manageValueCategories');
  const navigate = useNavigate();

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t('title')}
        </h2>
      </div>

      {/* Unified Items Message */}
      <div class="p-8 border-2 border-ocean-200 dark:border-ocean-800 rounded-lg bg-ocean-50 dark:bg-ocean-900/20">
        <div class="text-center space-y-4">
          <div class="text-6xl mb-4">🎁</div>
          <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100">
            {t('unifiedTitle')}
          </h3>
          <p class="text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
            {t('unifiedMessage')}
          </p>
          <div class="flex justify-center gap-4 mt-6">
            <Button
              variant="primary"
              onClick={() => navigate(`/communities/${props.communityId}/items`)}
            >
              {t('manageItemsButton')}
            </Button>
          </div>
          <div class="mt-6 p-4 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700">
            <p class="text-sm text-stone-600 dark:text-stone-400">
              <strong>{t('howItWorks')}</strong>
            </p>
            <ul class="mt-2 text-sm text-stone-700 dark:text-stone-300 text-left space-y-1 max-w-xl mx-auto">
              <li>• {t('benefit1')}</li>
              <li>• {t('benefit2')}</li>
              <li>• {t('benefit3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
