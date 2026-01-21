ALTER TABLE "shares" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shares" ADD COLUMN "last_viewed_at" timestamp;