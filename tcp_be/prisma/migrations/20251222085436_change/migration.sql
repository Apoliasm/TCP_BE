/*
  Warnings:

  - A unique constraint covering the columns `[cardNameId,rarity]` on the table `CardInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[candidateId,rarity]` on the table `CardInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."CardInfo_itemInfoId_rarity_key";

-- CreateIndex
CREATE UNIQUE INDEX "CardInfo_cardNameId_rarity_key" ON "public"."CardInfo"("cardNameId", "rarity");

-- CreateIndex
CREATE UNIQUE INDEX "CardInfo_candidateId_rarity_key" ON "public"."CardInfo"("candidateId", "rarity");
