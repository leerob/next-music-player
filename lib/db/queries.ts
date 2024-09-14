import 'server-only';
import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';
import { promisify } from 'util';
import { Playlist, Track } from './types';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

export async function getPlaylist(id: string): Promise<Playlist> {
  const tracksDir = path.join(process.cwd(), 'tracks');
  const files = await readdir(tracksDir);

  const tracks: Track[] = await Promise.all(
    files
      .filter((file) => path.extname(file).toLowerCase() === '.mp3')
      .map(async (file) => {
        const filePath = path.join(tracksDir, file);
        const buffer = await readFile(filePath);
        const metadata = await mm.parseBuffer(buffer);

        let imageUrl;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const picture = metadata.common.picture[0];
          const base64Image = Buffer.from(picture.data).toString('base64');
          imageUrl = `data:${picture.format};base64,${base64Image}`;
        }

        return {
          name: metadata.common.title || path.parse(file).name,
          artist: metadata.common.artist || 'Unknown Artist',
          album: metadata.common.album || 'Unknown Album',
          duration: formatDuration(metadata.format.duration || 0),
          genre: metadata.common.genre?.[0] || 'Unknown Genre',
          bpm: metadata.common.bpm || 0,
          key: metadata.common.key || 'Unknown',
          imageUrl: imageUrl,
          audioUrl: `file://${filePath}`,
        };
      })
  );

  const totalDuration = tracks.reduce((sum, track) => {
    const [minutes, seconds] = track.duration.split(':').map(Number);
    return sum + minutes * 60 + seconds;
  }, 0);

  return {
    id,
    name: "Lee's Jams",
    coverUrl:
      'https://pbs.twimg.com/profile_images/1587647097670467584/adWRdqQ6_400x400.jpg',
    trackCount: tracks.length,
    duration: formatDuration(totalDuration),
    tracks,
  };
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function getAllPlaylists(): Promise<Playlist[]> {
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

  return playlistNames.map((name, index) => ({
    id: `playlist-${index + 1}`,
    name,
    coverUrl: 'https://example.com/default-cover.jpg',
    trackCount: 0,
    duration: '0 minutes',
    tracks: [],
  }));
}

export let nowPlayingTrack = await getCurrentTrack();

export function setNowPlayingTrack(track: Track) {
  nowPlayingTrack = track;
}

export async function getCurrentTrack(): Promise<Track> {
  const playlist = await getPlaylist('1');
  return playlist.tracks[0];
}
