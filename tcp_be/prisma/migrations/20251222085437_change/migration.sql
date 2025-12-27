ALTER TABLE "public"."CardInfo"
ADD CONSTRAINT "cardinfo_exactly_one_source"
CHECK (
  ("cardNameId" IS NOT NULL AND "candidateId" IS NULL)
  OR
  ("cardNameId" IS NULL AND "candidateId" IS NOT NULL)
);