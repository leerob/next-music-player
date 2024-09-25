import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';

export let songs = pgTable('songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  artist: text('artist').notNull(),
  album: text('album'),
  duration: integer('duration').notNull(), // Duration in seconds
  genre: text('genre'),
  bpm: integer('bpm'),
  key: text('key'),
  imageUrl: text('image_url'),
  audioUrl: text('audio_url').notNull(),
  isLocal: boolean('is_local').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export let playlists = pgTable('playlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export let playlistSongs = pgTable('playlist_songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  playlistId: uuid('playlist_id')
    .notNull()
    .references(() => playlists.id),
  songId: uuid('song_id')
    .notNull()
    .references(() => songs.id),
  order: integer('order').notNull(),
});

export let songsRelations = relations(songs, ({ many }) => ({
  playlistSongs: many(playlistSongs),
}));

export let playlistsRelations = relations(playlists, ({ many }) => ({
  playlistSongs: many(playlistSongs),
}));

export let playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));
