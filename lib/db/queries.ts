import { eq, sql, desc, asc, and } from 'drizzle-orm';
import { db } from './drizzle';
import { songs, playlists, playlistSongs } from './schema';

export let getAllSongs = async () => {
  return db.select().from(songs).orderBy(asc(songs.name));
};

export let getSongById = async (id: string) => {
  return db.query.songs.findFirst({
    where: eq(songs.id, id),
  });
};

export let getAllPlaylists = async () => {
  return db.select().from(playlists).orderBy(desc(playlists.createdAt));
};

export let getPlaylistWithSongs = async (id: string) => {
  const result = await db.query.playlists.findFirst({
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

  const songs = result.playlistSongs.map((ps) => ({
    ...ps.song,
    order: ps.order,
  }));

  const trackCount = songs.length;
  const duration = songs.reduce((total, song) => total + song.duration, 0);

  return {
    ...result,
    songs,
    trackCount,
    duration,
  };
};

export let addSongToPlaylist = async (
  playlistId: string,
  songId: string,
  order: number
) => {
  return db.insert(playlistSongs).values({ playlistId, songId, order });
};

export let removeSongFromPlaylist = async (
  playlistId: string,
  songId: string
) => {
  return db
    .delete(playlistSongs)
    .where(
      and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId)
      )
    );
};

export let createPlaylist = async (
  id: string,
  name: string,
  coverUrl?: string
) => {
  const result = await db
    .insert(playlists)
    .values({ id, name, coverUrl })
    .returning();
  return result[0];
};

export let updatePlaylist = async (
  id: string,
  name: string,
  coverUrl?: string
) => {
  const result = await db
    .update(playlists)
    .set({ name, coverUrl, updatedAt: new Date() })
    .where(eq(playlists.id, id))
    .returning();
  return result[0];
};

export let deletePlaylist = async (id: string) => {
  // First, delete all playlist songs
  await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, id));
  // Then delete the playlist
  return db.delete(playlists).where(eq(playlists.id, id));
};

export let searchSongs = async (query: string) => {
  return db
    .select()
    .from(songs)
    .where(
      sql`${songs.name} ILIKE ${`%${query}%`} OR ${songs.artist} ILIKE ${`%${query}%`} OR ${songs.album} ILIKE ${`%${query}%`}`
    )
    .orderBy(asc(songs.name));
};

export let getRecentlyAddedSongs = async (limit: number = 10) => {
  return db.select().from(songs).orderBy(desc(songs.createdAt)).limit(limit);
};
