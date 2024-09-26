import { eq, sql, desc, asc, and } from 'drizzle-orm';
import { unstable_cache, revalidateTag } from 'next/cache';
import { db } from './drizzle';
import { songs, playlists, playlistSongs } from './schema';

export let getAllSongs = unstable_cache(
  async () => {
    return db.select().from(songs).orderBy(asc(songs.name));
  },
  ['all-songs'],
  { tags: ['songs'] }
);

export let getSongById = unstable_cache(
  async (id: string) => {
    return db.query.songs.findFirst({
      where: eq(songs.id, id),
    });
  },
  ['song-by-id'],
  { tags: ['songs'] }
);

export let getAllPlaylists = unstable_cache(
  async () => {
    return db.select().from(playlists).orderBy(desc(playlists.createdAt));
  },
  ['all-playlists'],
  { tags: ['playlists'] }
);

export let getPlaylistWithSongs = unstable_cache(
  async (id: string) => {
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
  },
  ['playlist-with-songs'],
  { tags: ['playlists', 'songs'] }
);

export let addSongToPlaylist = async (
  playlistId: string,
  songId: string,
  order: number
) => {
  let result = await db
    .insert(playlistSongs)
    .values({ playlistId, songId, order });
  revalidateTag('playlists');
  return result;
};

export let removeSongFromPlaylist = async (
  playlistId: string,
  songId: string
) => {
  let result = await db
    .delete(playlistSongs)
    .where(
      and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId)
      )
    );
  revalidateTag('playlists');
  return result;
};

export let createPlaylist = async (
  id: string,
  name: string,
  coverUrl?: string
) => {
  let result = await db
    .insert(playlists)
    .values({ id, name, coverUrl })
    .returning();
  revalidateTag('playlists');
  return result[0];
};

export let updatePlaylist = async (
  id: string,
  name: string,
  coverUrl?: string
) => {
  let result = await db
    .update(playlists)
    .set({ name, coverUrl, updatedAt: new Date() })
    .where(eq(playlists.id, id))
    .returning();
  revalidateTag('playlists');
  return result[0];
};

export let deletePlaylist = async (id: string) => {
  // First, delete all playlist songs
  await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, id));
  // Then delete the playlist
  let result = await db.delete(playlists).where(eq(playlists.id, id));

  revalidateTag('playlists');
  return result;
};

export let searchSongs = unstable_cache(
  async (searchTerm: string) => {
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
  },
  ['search-songs'],
  { tags: ['songs'] }
);

export let getRecentlyAddedSongs = unstable_cache(
  async (limit: number = 10) => {
    return db.select().from(songs).orderBy(desc(songs.createdAt)).limit(limit);
  },
  ['recently-added-songs'],
  { tags: ['songs'] }
);
