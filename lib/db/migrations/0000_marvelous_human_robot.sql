CREATE TABLE IF NOT EXISTS "playlist_songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playlist_id" uuid NOT NULL,
	"song_id" uuid NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "playlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cover_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"artist" text NOT NULL,
	"album" text,
	"duration" integer NOT NULL,
	"genre" text,
	"bpm" integer,
	"key" text,
	"image_url" text,
	"audio_url" text NOT NULL,
	"is_local" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "playlist_songs" ADD CONSTRAINT "playlist_songs_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "playlist_songs" ADD CONSTRAINT "playlist_songs_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_playlist_songs_playlist_id" ON "playlist_songs" USING btree ("playlist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_playlist_songs_song_id" ON "playlist_songs" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_playlist_songs_order" ON "playlist_songs" USING btree ("order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unq_playlist_song" ON "playlist_songs" USING btree ("playlist_id","song_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_playlists_name" ON "playlists" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_playlists_created_at" ON "playlists" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_name" ON "songs" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_artist" ON "songs" USING btree ("artist");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_album" ON "songs" USING btree ("album");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_genre" ON "songs" USING btree ("genre");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_bpm" ON "songs" USING btree ("bpm");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_key" ON "songs" USING btree ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_created_at" ON "songs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_name_trgm" ON "songs" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_artist_trgm" ON "songs" USING gin ("artist" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_songs_album_trgm" ON "songs" USING gin ("album" gin_trgm_ops);