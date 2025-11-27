/*
  Warnings:

  - You are about to drop the column `price` on the `Listing` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ListingItemType" AS ENUM ('CARD', 'ACCESSORY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CardNation" AS ENUM ('KR', 'JP', 'EN', 'Other');

-- CreateEnum
CREATE TYPE "public"."Rarity" AS ENUM ('N', 'R', 'ParallelR', 'SuperR', 'UltraR', 'UltimateR', 'PrismaticR', 'Other');

-- AlterTable
ALTER TABLE "public"."Listing" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "public"."ListingItem" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "type" "public"."ListingItemType" NOT NULL,
    "cardInfoId" INTEGER NOT NULL,
    "detail" TEXT,
    "condition" TEXT,
    "quantity" INTEGER NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardName" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CardName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardInfo" (
    "id" SERIAL NOT NULL,
    "cardNameId" INTEGER NOT NULL,
    "cardCode" TEXT NOT NULL,
    "nation" "public"."CardNation" NOT NULL,
    "rarity" "public"."Rarity" NOT NULL,

    CONSTRAINT "CardInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardName_name_key" ON "public"."CardName"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CardInfo_cardCode_key" ON "public"."CardInfo"("cardCode");

-- AddForeignKey
ALTER TABLE "public"."ListingItem" ADD CONSTRAINT "ListingItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListingItem" ADD CONSTRAINT "ListingItem_cardInfoId_fkey" FOREIGN KEY ("cardInfoId") REFERENCES "public"."CardInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardInfo" ADD CONSTRAINT "CardInfo_cardNameId_fkey" FOREIGN KEY ("cardNameId") REFERENCES "public"."CardName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
