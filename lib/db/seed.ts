import fs from 'fs/promises';
import path from 'path';
import { parseBuffer } from 'music-metadata';
import { db } from './drizzle';
import { songs, playlists, playlistSongs } from './schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

async function seed() {
  console.log('Starting seed process...');
  await seedSongs();
  await seedPlaylists();
  console.log('Seed process completed successfully.');
}

async function seedSongs() {
  let tracksDir = path.join(process.cwd(), 'tracks');
  let files = await fs.readdir(tracksDir);

  for (let file of files.filter(
    (file) => path.extname(file).toLowerCase() === '.mp3'
  )) {
    let filePath = path.join(tracksDir, file);
    let buffer = await fs.readFile(filePath);
    let metadata = await parseBuffer(buffer, { mimeType: 'audio/mpeg' });

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
      name: metadata.common.title || path.parse(file).name,
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      duration: Math.round(metadata.format.duration || 0),
      genre: metadata.common.genre?.[0] || 'Unknown Genre',
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
}

async function seedPlaylists() {
  const playlistNames = [
    'Techno Essentials',
    'Deep House Vibes',
    'EDM Bangers',
    'Ambient Chill',
    'Drum and Bass Mix',
    'Trance Classics',
    'Dubstep Drops',
    'Electro Swing',
    'Synthwave Retrowave',
    'Progressive House',
    'Minimal Techno',
    'Future Bass',
  ];

  for (let name of playlistNames) {
    // Check if the playlist already exists
    const existingPlaylist = await db
      .select()
      .from(playlists)
      .where(eq(playlists.name, name))
      .limit(1);

    let playlist;
    if (existingPlaylist.length > 0) {
      playlist = existingPlaylist[0];
      console.log(`Playlist already exists: ${name}`);
    } else {
      const [newPlaylist] = await db
        .insert(playlists)
        .values({
          name,
          coverUrl:
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
        })
        .returning();
      playlist = newPlaylist;
      console.log(`Seeded new playlist: ${name}`);
    }

    // Add some random songs to the playlist
    const allSongs = await db.select().from(songs);
    const playlistSongCount = Math.floor(Math.random() * 10) + 5; // 5 to 14 songs
    const shuffledSongs = allSongs.sort(() => 0.5 - Math.random());

    // Remove existing playlist songs
    await db
      .delete(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlist.id));

    // Add new playlist songs
    for (let i = 0; i < playlistSongCount; i++) {
      await db.insert(playlistSongs).values({
        playlistId: playlist.id,
        songId: shuffledSongs[i].id,
        order: i,
      });
    }

    console.log(`Added ${playlistSongCount} songs to playlist: ${name}`);
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
