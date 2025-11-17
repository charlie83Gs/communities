-- Migration: Integrate Contributions with Items Table
-- Instead of separate community_value_categories table, use existing items table
-- This unifies wealth and contribution tracking under one item system

-- Step 1: Drop foreign key constraints from recognized_contributions and value_calibration_history
ALTER TABLE "recognized_contributions" DROP CONSTRAINT IF EXISTS "recognized_contributions_category_id_community_value_categories_id_fk";
ALTER TABLE "value_calibration_history" DROP CONSTRAINT IF EXISTS "value_calibration_history_category_id_community_value_categories_id_fk";

-- Step 2: Rename category_id to item_id in both tables
ALTER TABLE "recognized_contributions" RENAME COLUMN "category_id" TO "item_id";
ALTER TABLE "value_calibration_history" RENAME COLUMN "category_id" TO "item_id";

-- Step 3: Add new foreign key constraints referencing items table
ALTER TABLE "recognized_contributions"
  ADD CONSTRAINT "recognized_contributions_item_id_items_id_fk"
  FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE cascade;

ALTER TABLE "value_calibration_history"
  ADD CONSTRAINT "value_calibration_history_item_id_items_id_fk"
  FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE cascade;

-- Step 4: Add contribution_metadata column to items table
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "contribution_metadata" jsonb;

-- Step 5: Drop the community_value_categories table (no longer needed)
DROP TABLE IF EXISTS "community_value_categories";

-- Step 6: Drop unused enums (category_type and unit_type)
DROP TYPE IF EXISTS "category_type";
DROP TYPE IF EXISTS "unit_type";

-- Step 7: Add comment to items table explaining dual purpose
COMMENT ON TABLE "items" IS 'Standardized resource/service names used for both wealth sharing AND contribution tracking. wealthValue serves dual purpose: monetary value for wealth, recognition value per unit for contributions.';
COMMENT ON COLUMN "items"."wealth_value" IS 'Value for aggregate wealth statistics AND contribution recognition value per unit';
COMMENT ON COLUMN "items"."contribution_metadata" IS 'Optional metadata for contribution categories: {categoryType, examples}';
