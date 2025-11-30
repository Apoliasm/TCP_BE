-- DropForeignKey
ALTER TABLE "public"."ListingItem" DROP CONSTRAINT "ListingItem_cardInfoId_fkey";

-- AlterTable
ALTER TABLE "public"."ListingItem" ALTER COLUMN "cardInfoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ListingItem" ADD CONSTRAINT "ListingItem_cardInfoId_fkey" FOREIGN KEY ("cardInfoId") REFERENCES "public"."CardInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
