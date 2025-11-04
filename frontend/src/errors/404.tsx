import { makeTranslator } from '@/i18n/makeTranslator';
import { notFoundDict } from './404.i18n';

export default function NotFound() {
  const t = makeTranslator(notFoundDict, 'notFound');

  return (
    <section class="text-stone-700 dark:text-stone-300 p-8">
      <h1 class="text-2xl font-bold">{t('title')}</h1>
      <p class="mt-4">{t('message')}</p>
    </section>
  );
}
