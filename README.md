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
- ✅ Double click on song row to play
- ✅ Move between songs in tracklist with up/down or j/k
- ✅ Now playing animation in track row
- Create playlists
- Save playlist information
- Persist active song to storage
- Allow a version to be played online with fixed songs?
- Hook up search (playlists or songs? Not sure)
- Add/remove songs to playlists
- Hook up the volume control
- Ability to drag on the progress bar to seek song
