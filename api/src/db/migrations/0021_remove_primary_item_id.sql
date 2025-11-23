-- Migration: Remove primary_item_id from pools table
-- Reason: Pools can contain multiple different items in their inventory,
-- so a single "primary item" field is non-functional and misleading.
-- The pool_inventory table already tracks which items are in each pool.

ALTER TABLE "pools" DROP COLUMN IF EXISTS "primary_item_id";
