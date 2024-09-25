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
