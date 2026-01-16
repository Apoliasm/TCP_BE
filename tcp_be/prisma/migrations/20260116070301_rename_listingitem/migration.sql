

-- 1) 테이블 이름만 변경 (데이터 유지)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname='public' AND tablename='Item'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname='public' AND tablename='ListingItem'
  ) THEN
    ALTER TABLE "public"."Item" RENAME TO "ListingItem";
  END IF;
END $$;

ALTER INDEX IF EXISTS "public"."Item_listingId_idx" RENAME TO "ListingItem_listingId_idx";
ALTER INDEX IF EXISTS "public"."Item_listingImageId_idx" RENAME TO "ListingItem_listingImageId_idx";

ALTER SEQUENCE IF EXISTS "public"."Item_id_seq" RENAME TO "ListingItem_id_seq";
