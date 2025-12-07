-- DropForeignKey
ALTER TABLE "public"."ListingItem" DROP CONSTRAINT "ListingItem_listingImageId_fkey";

-- AlterTable
ALTER TABLE "public"."ListingItem" ALTER COLUMN "listingImageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ListingItem" ADD CONSTRAINT "ListingItem_listingImageId_fkey" FOREIGN KEY ("listingImageId") REFERENCES "public"."ListingImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
