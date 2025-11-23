-- Remove pool distribution type enum and column
-- Simplifies pools to be generic - owners choose distribution method at distribution time

ALTER TABLE "pools" DROP COLUMN "distribution_type";
DROP TYPE "pool_distribution_type";
