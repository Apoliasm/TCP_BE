/*
  Warnings:

  - The values [ParallelR,SuperR,UltraR,UltimateR,PrismaticR] on the enum `Rarity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Rarity_new" AS ENUM ('N', 'R', 'SR', 'UR', 'UL', 'Prismatic', 'UPR', 'NPR', 'Other');
ALTER TABLE "public"."CardInfo" ALTER COLUMN "rarity" TYPE "public"."Rarity_new" USING ("rarity"::text::"public"."Rarity_new");
ALTER TYPE "public"."Rarity" RENAME TO "Rarity_old";
ALTER TYPE "public"."Rarity_new" RENAME TO "Rarity";
DROP TYPE "public"."Rarity_old";
COMMIT;
