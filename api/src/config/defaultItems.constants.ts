/**
 * Default Community Items Constants
 *
 * Comprehensive, internationalized default items for community creation.
 * Items are organized by category for clarity and include translations
 * for English (en), Spanish (es), and Hindi (hi).
 *
 * These items are automatically created when a new community is initialized,
 * providing a standardized starting point for wealth sharing.
 *
 * Structure:
 * - Items are split into separate files by category for maintainability
 * - Each item includes both specific items (e.g., Tomatoes, Potatoes) and
 *   general categories (e.g., Vegetables) to allow flexibility
 * - Unit references (kg, hour, liter, etc.) are removed from names -
 *   users specify units when creating wealth items
 */

// Import types and category items
import { FRESH_PRODUCE } from './defaultItems/freshProduce';
import { PACKAGED_FOOD } from './defaultItems/packagedFood';
import { BEVERAGES } from './defaultItems/beverages';
import { OBJECTS_OTHER } from './defaultItems/objectsOther';
import { SERVICES } from './defaultItems/services';
import type {
  DefaultItemTemplate,
  SupportedLanguage,
  DefaultItemTranslation,
} from './defaultItems/types';
import { DEFAULT_ITEM_LANGUAGE } from './defaultItems/types';

// Re-export types
export type { DefaultItemTemplate, SupportedLanguage, DefaultItemTranslation };
export { DEFAULT_ITEM_LANGUAGE };
export { SUPPORTED_LANGUAGES } from './defaultItems/types';

/**
 * All default items combined from all categories
 */
export const DEFAULT_ITEMS: DefaultItemTemplate[] = [
  // ==================== OBJECTS ====================
  ...FRESH_PRODUCE, // 85+ items: vegetables, fruits, herbs
  ...PACKAGED_FOOD, // 100+ items: grains, legumes, canned goods, spices, etc.
  ...BEVERAGES, // 60+ items: coffee, tea, juices, soft drinks, milk alternatives
  ...OBJECTS_OTHER, // 150+ items: clothing, tools, furniture, electronics, household, personal care

  // ==================== SERVICES ====================
  ...SERVICES, // 80+ services: home repair, care, education, transportation, professional, creative, food, health, cleaning, events
];

/**
 * Helper function to get item data in a specific language
 */
export function getItemTranslation(
  item: DefaultItemTemplate,
  language: SupportedLanguage = DEFAULT_ITEM_LANGUAGE
): DefaultItemTranslation {
  return item.translations[language];
}

/**
 * Statistics about default items
 */
export const DEFAULT_ITEMS_STATS = {
  total: DEFAULT_ITEMS.length,
  objects: DEFAULT_ITEMS.filter((i) => i.kind === 'object').length,
  services: DEFAULT_ITEMS.filter((i) => i.kind === 'service').length,
  categories: Array.from(new Set(DEFAULT_ITEMS.map((i) => i.category))).length,
  languages: 3, // en, es, hi
};

// Log stats on import (useful for debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('📦 Default Items Loaded:', DEFAULT_ITEMS_STATS);
}
