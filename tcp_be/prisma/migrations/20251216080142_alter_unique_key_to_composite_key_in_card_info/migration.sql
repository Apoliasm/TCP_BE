/*
  Warnings:

  - A unique constraint covering the columns `[cardCode,rarity]` on the table `CardInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."CardInfo_cardCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "CardInfo_cardCode_rarity_key" ON "public"."CardInfo"("cardCode", "rarity");
