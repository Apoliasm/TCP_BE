-- AlterTable
ALTER TABLE "public"."ListingItem" RENAME CONSTRAINT "Item_pkey" TO "ListingItem_pkey";

-- RenameForeignKey
ALTER TABLE "public"."ListingItem" RENAME CONSTRAINT "Item_listingId_fkey" TO "ListingItem_listingId_fkey";

-- RenameForeignKey
ALTER TABLE "public"."ListingItem" RENAME CONSTRAINT "Item_listingImageId_fkey" TO "ListingItem_listingImageId_fkey";
