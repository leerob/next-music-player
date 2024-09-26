import { db } from './drizzle';
import { songs } from './schema';
import { eq, desc } from 'drizzle-orm';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export let cleanupMetadata = async () => {
  console.log('Starting metadata cleanup process...');

  let allSongs = await db.select().from(songs).orderBy(desc(songs.createdAt));

  for (let song of allSongs) {
    console.log(`Processing song: ${song.name}`);

    try {
      let result = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: z.object({
          cleanTitle: z.string(),
          mainArtist: z.string(),
          featuringArtists: z.array(z.string()).nullable(),
          album: z.string(),
          genre: z.string(),
        }),
        prompt: `
          As an AI assistant specializing in music metadata, clean up and enhance the following song information:

          Title: ${song.name}
          Artist: ${song.artist}
          Album: ${song.album}
          Genre: ${song.genre}

          Provide:
          1. A cleaned-up version of the title, removing any unnecessary information (e.g., featuring artists, version info).
          2. The main artist(s) of the song.
          3. Any featuring artists, if applicable (as an array of strings, or null if none).
          4. The correct album name, if you can determine it.
          5. A more specific genre, if possible.
          6. Don't remove (Remix) in the title, if applicable.

          If you're unsure about any information, keep the original data. If unknown genre, do Electronic.
        `,
      });

      let cleanedMetadata = result.object;

      let updatedSong = {
        name: cleanedMetadata.cleanTitle || song.name,
        artist: cleanedMetadata.mainArtist || song.artist,
        album: cleanedMetadata.album || song.album,
        genre: cleanedMetadata.genre || song.genre,
        featuring: cleanedMetadata.featuringArtists
          ? cleanedMetadata.featuringArtists.join(', ')
          : null,
      };

      console.log(updatedSong);

      await db.update(songs).set(updatedSong).where(eq(songs.id, song.id));
      console.log(`Updated metadata for song: ${updatedSong.name}`);
    } catch (error) {
      console.error(`Error processing song ${song.name}:`, error);
    }
  }

  console.log('Metadata cleanup process completed successfully.');
};

export let runCleanup = async () => {
  try {
    await cleanupMetadata();
  } catch (error) {
    console.error('Metadata cleanup process failed:', error);
    process.exit(1);
  } finally {
    console.log('Metadata cleanup process finished. Exiting...');
    process.exit(0);
  }
};

runCleanup();
