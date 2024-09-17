import fs from 'fs/promises';
import path from 'path';
import { parseBuffer } from 'music-metadata';
import { db } from './drizzle';
import { songs, playlists, playlistSongs } from './schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export let generateMetadata = async (filename: string) => {
  let result = await generateObject({
    model: openai('gpt-4-turbo'),
    schema: z.object({
      metadata: z.object({
        title: z.string(),
        artist: z.string(),
        album: z.string(),
        genre: z.string(),
      }),
    }),
    prompt: `Generate structured metadata for this music file: ${filename}. Include fields for title, artist, album, and genre.`,
  });

  return result.object.metadata;
};

export let seedSongs = async () => {
  let remoteDir = path.join(process.cwd(), 'remote');
  let files = await fs.readdir(remoteDir);

  for (let file of files.filter(
    (file) => path.extname(file).toLowerCase() === '.mp3'
  )) {
    let filePath = path.join(remoteDir, file);
    let buffer = await fs.readFile(filePath);
    let metadata = await parseBuffer(buffer, { mimeType: 'audio/mpeg' });
    let aiMetadata = await generateMetadata(file);

    let imageUrl;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      let picture = metadata.common.picture[0];
      let imageBuffer = Buffer.from(picture.data);
      let { url } = await put(
        `album_covers/${file}.${picture.format}`,
        imageBuffer,
        {
          access: 'public',
        }
      );
      imageUrl = url;
    }

    let { url: audioUrl } = await put(`audio/${file}`, buffer, {
      access: 'public',
    });

    let songData = {
      name: aiMetadata.title || metadata.common.title || path.parse(file).name,
      artist: aiMetadata.artist || metadata.common.artist || 'Unknown Artist',
      album: aiMetadata.album || metadata.common.album || 'Unknown Album',
      duration: Math.round(metadata.format.duration || 0),
      genre: aiMetadata.genre || metadata.common.genre?.[0] || 'Unknown Genre',
      bpm: metadata.common.bpm ? Math.round(metadata.common.bpm) : null,
      key: metadata.common.key || null,
      imageUrl,
      audioUrl,
      isLocal: false,
    };

    // Check if the song already exists
    let existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.audioUrl, songData.audioUrl))
      .limit(1);

    if (existingSong.length > 0) {
      // Update existing song
      await db
        .update(songs)
        .set(songData)
        .where(eq(songs.id, existingSong[0].id));
      console.log(`Updated song: ${songData.name}`);
    } else {
      // Insert new song
      await db.insert(songs).values(songData);
      console.log(`Seeded new song: ${songData.name}`);
    }
  }
};

export let createPlaylist = async () => {
  let playlistData = {
    name: 'YouTube',
    coverUrl:
      'https://t3.ftcdn.net/jpg/04/74/05/94/360_F_474059464_qldYuzxaUWEwNTtYBJ44VN89ARuFktHW.jpg',
  };

  // Check if the playlist already exists
  let existingPlaylist = await db
    .select()
    .from(playlists)
    .where(eq(playlists.name, playlistData.name))
    .limit(1);

  let playlist;
  if (existingPlaylist.length > 0) {
    playlist = existingPlaylist[0];
    console.log(`Playlist already exists: ${playlistData.name}`);
  } else {
    let [newPlaylist] = await db
      .insert(playlists)
      .values(playlistData)
      .returning();
    playlist = newPlaylist;
    console.log(`Created hardcoded playlist: ${playlistData.name}`);
  }

  // Add all songs to the playlist
  let allSongs = await db.select().from(songs);

  // Remove existing playlist songs
  await db
    .delete(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlist.id));

  // Add new playlist songs
  for (let i = 0; i < allSongs.length; i++) {
    await db.insert(playlistSongs).values({
      playlistId: playlist.id,
      songId: allSongs[i].id,
      order: i,
    });
  }

  console.log(
    `Added ${allSongs.length} songs to playlist: ${playlistData.name}`
  );
};

export let seed = async () => {
  console.log('Starting seed process...');
  await seedSongs();
  await createPlaylist();
  console.log('Seed process completed successfully.');
};

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
