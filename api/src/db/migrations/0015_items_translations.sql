-- Add translations JSONB column to items table
ALTER TABLE "items" ADD COLUMN "translations" jsonb;

-- Migrate existing data: convert name and description to translations object with 'en' language
UPDATE "items"
SET "translations" = jsonb_build_object(
  'en', jsonb_build_object(
    'name', COALESCE("name", ''),
    'description', "description"
  )
)
WHERE "translations" IS NULL;

-- Make translations column NOT NULL after data migration
ALTER TABLE "items" ALTER COLUMN "translations" SET NOT NULL;

-- Drop old name and description columns
ALTER TABLE "items" DROP COLUMN "name";
ALTER TABLE "items" DROP COLUMN "description";
