/*
  Warnings:

  - The primary key for the `CardInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CardInfo` table. All the data in the column will be lost.
  - You are about to drop the column `cardInfoId` on the `ListingItem` table. All the data in the column will be lost.
  - Added the required column `itemInfoId` to the `CardInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CardInfo" DROP CONSTRAINT "CardInfo_cardNameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingItem" DROP CONSTRAINT "ListingItem_cardInfoId_fkey";

-- AlterTable
ALTER TABLE "public"."CardInfo" DROP CONSTRAINT "CardInfo_pkey",
DROP COLUMN "id",
ADD COLUMN     "candidateId" INTEGER,
ADD COLUMN     "itemInfoId" INTEGER NOT NULL,
ALTER COLUMN "cardNameId" DROP NOT NULL,
ADD CONSTRAINT "CardInfo_pkey" PRIMARY KEY ("itemInfoId");

-- AlterTable
ALTER TABLE "public"."ListingItem" DROP COLUMN "cardInfoId",
ADD COLUMN     "infoId" INTEGER;

-- CreateTable
CREATE TABLE "public"."ItemInfo" (
    "id" SERIAL NOT NULL,
    "type" "public"."ListingItemType" NOT NULL,

    CONSTRAINT "ItemInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AccessoryInfo" (
    "itemInfoId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AccessoryInfo_pkey" PRIMARY KEY ("itemInfoId")
);

-- CreateTable
CREATE TABLE "public"."CardCandidates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CardCandidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardCandidates_name_key" ON "public"."CardCandidates"("name");

-- AddForeignKey
ALTER TABLE "public"."ListingItem" ADD CONSTRAINT "ListingItem_infoId_fkey" FOREIGN KEY ("infoId") REFERENCES "public"."ItemInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccessoryInfo" ADD CONSTRAINT "AccessoryInfo_itemInfoId_fkey" FOREIGN KEY ("itemInfoId") REFERENCES "public"."ItemInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardInfo" ADD CONSTRAINT "CardInfo_itemInfoId_fkey" FOREIGN KEY ("itemInfoId") REFERENCES "public"."ItemInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardInfo" ADD CONSTRAINT "CardInfo_cardNameId_fkey" FOREIGN KEY ("cardNameId") REFERENCES "public"."CardName"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardInfo" ADD CONSTRAINT "CardInfo_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."CardCandidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
