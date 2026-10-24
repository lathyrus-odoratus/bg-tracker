CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_identities" (
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text NOT NULL,
	"global_name" text,
	"avatar" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_identities_provider_provider_user_id_pk" PRIMARY KEY("provider","provider_user_id"),
	CONSTRAINT "user_identities_user_provider" UNIQUE("user_id","provider"),
	CONSTRAINT "user_identities_provider" CHECK ("provider" IN ('discord'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"system_role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_display_name_length" CHECK (char_length("display_name") BETWEEN 1 AND 50),
	CONSTRAINT "users_system_role" CHECK ("system_role" IN ('admin', 'user'))
);
--> statement-breakpoint
CREATE TABLE "game_mechanisms" (
	"game_id" uuid NOT NULL,
	"mechanism_id" uuid NOT NULL,
	CONSTRAINT "game_mechanisms_game_id_mechanism_id_pk" PRIMARY KEY("game_id","mechanism_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"min_players" integer,
	"max_players" integer,
	"play_minutes" integer,
	"bgg_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "games_name_length" CHECK (char_length("name") BETWEEN 1 AND 100),
	CONSTRAINT "games_players" CHECK (("min_players" IS NULL OR "min_players" >= 1) AND ("max_players" IS NULL OR "min_players" IS NULL OR "max_players" >= "min_players")),
	CONSTRAINT "games_play_minutes" CHECK ("play_minutes" IS NULL OR "play_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "mechanisms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mechanisms_name_length" CHECK (char_length("name") BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE TABLE "external_accounts" (
	"provider" text NOT NULL,
	"external_name" text NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "external_accounts_provider_external_name_pk" PRIMARY KEY("provider","external_name"),
	CONSTRAINT "external_accounts_provider" CHECK ("provider" IN ('bga'))
);
--> statement-breakpoint
CREATE TABLE "play_participants" (
	"play_id" uuid NOT NULL,
	"external_name" text NOT NULL,
	"rank" integer,
	"score" integer,
	CONSTRAINT "play_participants_play_id_external_name_pk" PRIMARY KEY("play_id","external_name"),
	CONSTRAINT "play_participants_name_length" CHECK (char_length("external_name") BETWEEN 1 AND 50),
	CONSTRAINT "play_participants_rank" CHECK ("rank" IS NULL OR "rank" >= 1)
);
--> statement-breakpoint
CREATE TABLE "plays" (
	"id" uuid PRIMARY KEY NOT NULL,
	"game_id" uuid NOT NULL,
	"played_at" timestamp with time zone NOT NULL,
	"source" text NOT NULL,
	"external_id" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plays_source_external_id" UNIQUE("source","external_id"),
	CONSTRAINT "plays_source" CHECK ("source" IN ('bga')),
	CONSTRAINT "plays_external_id" CHECK ("source" <> 'bga' OR "external_id" ~ '^[0-9]+$')
);
--> statement-breakpoint
CREATE TABLE "wishes" (
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishes_user_id_game_id_pk" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_mechanisms" ADD CONSTRAINT "game_mechanisms_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_mechanisms" ADD CONSTRAINT "game_mechanisms_mechanism_id_mechanisms_id_fk" FOREIGN KEY ("mechanism_id") REFERENCES "public"."mechanisms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_accounts" ADD CONSTRAINT "external_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_accounts" ADD CONSTRAINT "external_accounts_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_participants" ADD CONSTRAINT "play_participants_play_id_plays_id_fk" FOREIGN KEY ("play_id") REFERENCES "public"."plays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plays" ADD CONSTRAINT "plays_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plays" ADD CONSTRAINT "plays_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishes" ADD CONSTRAINT "wishes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "game_mechanisms_mechanism_id" ON "game_mechanisms" USING btree ("mechanism_id");--> statement-breakpoint
CREATE UNIQUE INDEX "games_name_lower" ON "games" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "games_bgg_id" ON "games" USING btree ("bgg_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mechanisms_name_lower" ON "mechanisms" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "external_accounts_name_lower" ON "external_accounts" USING btree ("provider",lower("external_name"));--> statement-breakpoint
CREATE INDEX "external_accounts_user_id" ON "external_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "play_participants_name_lower" ON "play_participants" USING btree (lower("external_name"));--> statement-breakpoint
CREATE INDEX "plays_game_id_played_at" ON "plays" USING btree ("game_id","played_at");--> statement-breakpoint
CREATE INDEX "wishes_game_id" ON "wishes" USING btree ("game_id");