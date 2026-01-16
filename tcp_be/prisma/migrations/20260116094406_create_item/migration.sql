-- AlterTable
ALTER TABLE "public"."ListingItem" ADD COLUMN     "itemId" INTEGER;

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "public"."Item"("name");

-- AddForeignKey
ALTER TABLE "public"."ListingItem" ADD CONSTRAINT "ListingItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
