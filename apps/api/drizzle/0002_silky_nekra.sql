ALTER TABLE "document_versions" ADD COLUMN "annotation" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "pin_order" integer DEFAULT 0;