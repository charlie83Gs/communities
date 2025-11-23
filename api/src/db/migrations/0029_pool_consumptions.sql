-- Pool Consumptions - Track when councils consume items from pools
CREATE TABLE IF NOT EXISTS "pool_consumptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pool_id" uuid NOT NULL REFERENCES "pools"("id") ON DELETE CASCADE,
  "council_id" uuid NOT NULL REFERENCES "councils"("id") ON DELETE CASCADE,
  "item_id" uuid NOT NULL REFERENCES "items"("id") ON DELETE CASCADE,
  "units" integer NOT NULL,
  "description" text NOT NULL,
  "report_id" uuid REFERENCES "council_usage_reports"("id") ON DELETE SET NULL,
  "consumed_by" text NOT NULL REFERENCES "app_users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Index for fast lookups by council
CREATE INDEX IF NOT EXISTS "pool_consumptions_council_id_idx" ON "pool_consumptions"("council_id");

-- Index for finding consumptions without reports
CREATE INDEX IF NOT EXISTS "pool_consumptions_report_id_idx" ON "pool_consumptions"("report_id");
