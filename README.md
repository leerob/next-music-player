# Next.js Music Player

A nice GUI for playing/viewing local media files.

![CleanShot 2024-09-14 at 15 34 26@2x](https://github.com/user-attachments/assets/d1b747a4-bc0e-45fc-9df9-ecdba5fd0115)

## Getting Started

```bash
git clone https://github.com/leerob/next-music-player
cd next-music-player
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Add local audio files to a top level `tracks/` folder (git ignored). One option to download files is `yt-dlp`. You can provide arguments to download the song metadata, as well as the cover image, too.

```bash
yt-dlp -x --audio-format mp3 --add-metadata --embed-thumbnail "https://www.youtube.com/playlist?list=..."
```

Then, run the database migrations and seed the database with a songs and playlists:

```bash
pnpm db:migrate
pnpm db:seed
```

Finally, run the Next.js development server:

```bash
pnpm dev
```

You can view your database contents with Drizzle Studio locally:

```bash
pnpm db:studio
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Features

- ✅ Uses MediaSession API to sync track metadata with system controls
- ✅ Press space to play/pause from anywhere in the app
- ✅ View for all tracks
- ✅ Click on song row to play
- ✅ Move between songs in tracklist with up/down or j/k
- ✅ Move between playlists panel and tracklist with h/l
- ✅ Now playing animation in track row
- ✅ Support for both local or remote files
- ✅ Mobile responsiveness
- ✅ Drag on the progress bar to seek song
- ✅ Create a new playlist in the UI
- ✅ Image upload to Vercel Blob for playlist images
- ✅ Add/remove songs to a playist in the UI
- ✅ Basic search over songs
- Persist active song to storage
- Hook up the volume controls
