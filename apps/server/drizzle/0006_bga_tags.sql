CREATE TABLE "game_themes" (
	"game_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL,
	CONSTRAINT "game_themes_game_id_theme_id_pk" PRIMARY KEY("game_id","theme_id")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"bga_tag_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "themes_name_length" CHECK (char_length("name") BETWEEN 1 AND 100)
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "name_en" text;--> statement-breakpoint
ALTER TABLE "mechanisms" ADD COLUMN "name_en" text;--> statement-breakpoint
ALTER TABLE "mechanisms" ADD COLUMN "bga_tag_id" integer;--> statement-breakpoint
ALTER TABLE "game_themes" ADD CONSTRAINT "game_themes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_themes" ADD CONSTRAINT "game_themes_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_themes_theme_id" ON "game_themes" USING btree ("theme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "themes_name_lower" ON "themes" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "themes_bga_tag_id" ON "themes" USING btree ("bga_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mechanisms_bga_tag_id" ON "mechanisms" USING btree ("bga_tag_id");--> statement-breakpoint
-- 機制改用 BGA 的機制標籤：舊的自訂機制與對應整批換掉（遊戲的機制之後從 BGA 同步）
DELETE FROM "game_mechanisms";--> statement-breakpoint
DELETE FROM "mechanisms";--> statement-breakpoint
-- 名稱取自 BGA 繁中與英文介面（2026-10-25）；BGA 之後新增的標籤在同步時補上
INSERT INTO "mechanisms" ("id", "name", "name_en", "bga_tag_id") VALUES
  (gen_random_uuid(), '卡牌', 'Cards', 200),
  (gen_random_uuid(), '骰子', 'Dice', 201),
  (gen_random_uuid(), '工人放置', 'Worker placement', 203),
  (gen_random_uuid(), '手牌管理', 'Hand management', 204),
  (gen_random_uuid(), '吹牛', 'Bluffing', 205),
  (gen_random_uuid(), '板塊拼放', 'Tile placement', 206),
  (gen_random_uuid(), '連擊', 'Combos', 207),
  (gen_random_uuid(), '區域控制', 'Area Majority', 208),
  (gen_random_uuid(), '搶快', 'Race', 209),
  (gen_random_uuid(), '收集', 'Collection', 210),
  (gen_random_uuid(), '合作', 'Cooperative', 211),
  (gen_random_uuid(), '隨機', 'Random', 212),
  (gen_random_uuid(), '競速', 'Speed', 213),
  (gen_random_uuid(), '不對等', 'Asymmetrical', 214),
  (gen_random_uuid(), '溝通', 'Communication', 215),
  (gen_random_uuid(), '征服', 'Conquest', 216),
  (gen_random_uuid(), '團隊', 'Team', 217),
  (gen_random_uuid(), '競標', 'Auction', 218),
  (gen_random_uuid(), '目標', 'Objectives', 219),
  (gen_random_uuid(), '吃墩', 'Trick-taking', 220),
  (gen_random_uuid(), '資源管理', 'Resource management', 221),
  (gen_random_uuid(), '角色扮演', 'Roles', 222),
  (gen_random_uuid(), '骰寫', 'Roll & Write', 223),
  (gen_random_uuid(), '風險評估', 'Push your luck', 224),
  (gen_random_uuid(), '投票', 'Voting', 225),
  (gen_random_uuid(), '文字遊戲', 'Word games', 226),
  (gen_random_uuid(), '牌組構築', 'Deck Building', 227),
  (gen_random_uuid(), '引擎構築', 'Engine building', 228),
  (gen_random_uuid(), '輪抽', 'Drafting', 229),
  (gen_random_uuid(), '玩家淘汰', 'Player elimination', 230),
  (gen_random_uuid(), '劇情', 'Campaign', 231);--> statement-breakpoint
INSERT INTO "themes" ("id", "name", "name_en", "bga_tag_id") VALUES
  (gen_random_uuid(), '奇幻', 'Fantasy', 100),
  (gen_random_uuid(), '科幻', 'Science fiction', 101),
  (gen_random_uuid(), '歷史', 'Historical', 102),
  (gen_random_uuid(), '冒險', 'Adventure', 103),
  (gen_random_uuid(), '探索', 'Exploration', 104),
  (gen_random_uuid(), '征服', 'Conquest', 105),
  (gen_random_uuid(), '建設', 'Building', 106),
  (gen_random_uuid(), '西部風格', 'Western', 107),
  (gen_random_uuid(), '間諜', 'Espionage', 108),
  (gen_random_uuid(), '鐵路', 'Trains', 109),
  (gen_random_uuid(), '運動', 'Sport', 110),
  (gen_random_uuid(), '經濟', 'Economy', 111),
  (gen_random_uuid(), '航空', 'Aviation', 112),
  (gen_random_uuid(), '超現實／滑稽／荒誕', 'Surreal/Silly/Absurd', 113),
  (gen_random_uuid(), '動物', 'Animals', 114),
  (gen_random_uuid(), '戰爭遊戲', 'Wargame', 115),
  (gen_random_uuid(), '食物', 'Food', 116);