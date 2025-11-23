-- Remove council inventory and transactions tables
-- Councils will now only have inventory through pools they manage

-- Drop council_transactions table
ALTER TABLE "council_transactions" DROP CONSTRAINT "council_transactions_council_id_councils_id_fk";
ALTER TABLE "council_transactions" DROP CONSTRAINT "council_transactions_item_id_items_id_fk";
ALTER TABLE "council_transactions" DROP CONSTRAINT "council_transactions_related_user_id_app_users_id_fk";
DROP TABLE "council_transactions";

-- Drop council_inventory table
ALTER TABLE "council_inventory" DROP CONSTRAINT "council_inventory_council_id_councils_id_fk";
ALTER TABLE "council_inventory" DROP CONSTRAINT "council_inventory_item_id_items_id_fk";
DROP TABLE "council_inventory";
