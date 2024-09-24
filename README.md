# Next.js Music Player

A nice GUI for playing/viewing local media files.

![CleanShot 2024-09-14 at 15 34 26@2x](https://github.com/user-attachments/assets/d1b747a4-bc0e-45fc-9df9-ecdba5fd0115)

## Running Locally

- Add local audio files to a top level `tracks/` folder (git ignored)
- Create a new Postgres database
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm dev`
- Go to http://localhost:3000 🎉

## Features

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
- Add/remove songs to a playist in the UI
- Persist active song to storage
- Hook up search (playlists or songs? Not sure)
- Hook up the volume control
