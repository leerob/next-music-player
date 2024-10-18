'use cache';

import { eq, sql, desc, asc } from 'drizzle-orm';
import {
  unstable_cacheTag as cacheTag,
  unstable_cacheLife as cacheLife,
} from 'next/cache';
import { db } from './drizzle';
import { songs, playlists, playlistSongs } from './schema';

export async function getAllSongs() {
  cacheTag('songs');

  return db.select().from(songs).orderBy(asc(songs.name));
}

export async function getSongById(id: string) {
  cacheTag('songs');

  return db.query.songs.findFirst({
    where: eq(songs.id, id),
  });
}

export async function getAllPlaylists() {
  cacheTag('playlists');

  return db.select().from(playlists).orderBy(desc(playlists.createdAt));
}

export async function getPlaylistWithSongs(id: string) {
  cacheTag('playlists');

  let result = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    with: {
      playlistSongs: {
        columns: {
          order: true,
        },
        with: {
          song: true,
        },
        orderBy: asc(playlistSongs.order),
      },
    },
  });

  if (!result) return null;

  let songs = result.playlistSongs.map((ps) => ({
    ...ps.song,
    order: ps.order,
  }));

  let trackCount = songs.length;
  let duration = songs.reduce((total, song) => total + song.duration, 0);

  return {
    ...result,
    songs,
    trackCount,
    duration,
  };
}

export async function searchSongs(searchTerm: string) {
  cacheTag('songs');

  const similarityExpression = sql`GREATEST(
      similarity(${songs.name}, ${searchTerm}),
      similarity(${songs.artist}, ${searchTerm}),
      similarity(COALESCE(${songs.album}, ''), ${searchTerm})
    )`;

  return db
    .select({
      id: songs.id,
      name: songs.name,
      artist: songs.artist,
      album: songs.album,
      duration: songs.duration,
      imageUrl: songs.imageUrl,
      audioUrl: songs.audioUrl,
      similarity: sql`${similarityExpression}::float`,
    })
    .from(songs)
    .orderBy(desc(similarityExpression), asc(songs.name))
    .limit(50);
}

export async function getRecentlyAddedSongs(limit: number = 10) {
  cacheTag('songs');

  return db.select().from(songs).orderBy(desc(songs.createdAt)).limit(limit);
}
