'use server';

import { createPlaylist } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { playlists, playlistSongs, songs } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { put } from '@vercel/blob';

export async function createPlaylistAction(id: string, name: string) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  await createPlaylist(id, name);
}

export async function uploadPlaylistCoverAction(_: any, formData: FormData) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  const playlistId = formData.get('playlistId') as string;
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('No file provided');
  }

  try {
    const blob = await put(`playlist-covers/${playlistId}-${file.name}`, file, {
      access: 'public',
    });

    await db
      .update(playlists)
      .set({ coverUrl: blob.url })
      .where(eq(playlists.id, playlistId));

    revalidatePath(`/p/${playlistId}`);

    return { success: true, coverUrl: blob.url };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function updatePlaylistNameAction(
  playlistId: string,
  name: string
) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  await db.update(playlists).set({ name }).where(eq(playlists.id, playlistId));

  revalidatePath('/', 'layout');
}

export async function deletePlaylistAction(id: string) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(playlistSongs)
      .where(eq(playlistSongs.playlistId, id))
      .execute();

    await tx.delete(playlists).where(eq(playlists.id, id)).execute();
  });
}

export async function addToPlaylistAction(playlistId: string, songId: string) {
  // Check if the song is already in the playlist
  const existingEntry = await db
    .select()
    .from(playlistSongs)
    .where(
      and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId)
      )
    )
    .execute();

  if (existingEntry.length > 0) {
    return { success: false, message: 'Song is already in the playlist' };
  }

  // Get the current maximum order for the playlist
  const maxOrderResult = await db
    .select({ maxOrder: sql<number>`MAX(${playlistSongs.order})` })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .execute();

  const newOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

  await db
    .insert(playlistSongs)
    .values({
      playlistId,
      songId,
      order: newOrder,
    })
    .execute();

  revalidatePath('/', 'layout');

  return { success: true, message: 'Song added to playlist successfully' };
}

export async function updateTrackAction(_: any, formData: FormData) {
  let trackId = formData.get('trackId') as string;
  let field = formData.get('field') as string;
  let value = formData.get(field) as keyof typeof songs.$inferInsert | number;

  if (value === 'bpm' && typeof value === 'number') {
    value = parseInt(value as string);
  } else {
    return { success: false, error: 'bpm should be a valid number' };
  }

  let data: Partial<typeof songs.$inferInsert> = { [field]: value };
  await db.update(songs).set(data).where(eq(songs.id, trackId));
  revalidatePath('/', 'layout');

  return { success: true, error: '' };
}

export async function updateTrackImageAction(_: any, formData: FormData) {
  let trackId = formData.get('trackId') as string;
  let file = formData.get('file') as File;

  if (!trackId || !file) {
    throw new Error('Missing trackId or file');
  }

  try {
    const blob = await put(`track-images/${trackId}-${file.name}`, file, {
      access: 'public',
    });

    await db
      .update(songs)
      .set({ imageUrl: blob.url })
      .where(eq(songs.id, trackId));

    revalidatePath('/', 'layout');

    return { success: true, imageUrl: blob.url };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}
