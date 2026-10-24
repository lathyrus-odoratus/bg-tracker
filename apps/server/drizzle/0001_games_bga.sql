ALTER TABLE "games" ADD COLUMN "bga_slug" text;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "image_url" text;--> statement-breakpoint
CREATE UNIQUE INDEX "games_bga_slug" ON "games" USING btree ("bga_slug");--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_bga_slug_format" CHECK ("bga_slug" ~ '^[a-z0-9]+$');--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_image_url" CHECK ("image_url" LIKE 'https://%');