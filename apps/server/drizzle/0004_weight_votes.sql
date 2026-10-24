CREATE TABLE "weight_votes" (
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"weight_tenths" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weight_votes_user_id_game_id_pk" PRIMARY KEY("user_id","game_id"),
	CONSTRAINT "weight_votes_range" CHECK ("weight_tenths" BETWEEN 10 AND 99)
);
--> statement-breakpoint
ALTER TABLE "weight_votes" ADD CONSTRAINT "weight_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_votes" ADD CONSTRAINT "weight_votes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "weight_votes_game_id" ON "weight_votes" USING btree ("game_id");