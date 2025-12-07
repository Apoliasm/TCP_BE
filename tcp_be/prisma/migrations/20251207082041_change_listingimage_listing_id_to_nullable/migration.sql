-- DropForeignKey
ALTER TABLE "public"."ListingImage" DROP CONSTRAINT "ListingImage_listingId_fkey";

-- AlterTable
ALTER TABLE "public"."ListingImage" ALTER COLUMN "listingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
