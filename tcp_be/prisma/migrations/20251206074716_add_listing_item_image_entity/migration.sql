/*
  Warnings:

  - Added the required column `listingImageId` to the `ListingItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ListingItem" ADD COLUMN     "listingImageId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."ListingImage" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListingItem" ADD CONSTRAINT "ListingItem_listingImageId_fkey" FOREIGN KEY ("listingImageId") REFERENCES "public"."ListingImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
