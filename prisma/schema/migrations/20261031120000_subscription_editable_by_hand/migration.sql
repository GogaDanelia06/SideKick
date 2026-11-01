-- A founder can add or edit a plan by hand in the table editor: the id fills
-- itself in, and a new row stays locked until its status is set.
ALTER TABLE "Subscription" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'PENDING';
