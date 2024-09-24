'use server';

import { createPlaylist } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { playlists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

export async function createPlaylistAction() {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  const playlist = await createPlaylist('New Playlist');
  revalidatePath('/', 'layout');
  redirect(`/p/${playlist.id}`);
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
      .where(eq(playlists.id, parseInt(playlistId)));

    revalidatePath(`/p/${playlistId}`);

    return { success: true, coverUrl: blob.url };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function updatePlaylistNameAction(
  playlistId: number,
  name: string
) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  await db.update(playlists).set({ name }).where(eq(playlists.id, playlistId));

  revalidatePath(`/p/${playlistId}`);
}

export async function deletePlaylistAction(
  id: number,
  shouldRedirect: boolean
) {
  // Let's only handle this on local for now
  if (process.env.VERCEL_ENV === 'production') {
    return;
  }

  await db.delete(playlists).where(eq(playlists.id, id));
  revalidatePath('/', 'layout');

  if (shouldRedirect) {
    redirect('/');
  }
}
