export interface Track {
  name: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
  bpm: number;
  key: string;
  imageUrl: string | undefined;
  audioUrl: string | undefined;
}

export interface Playlist {
  id: string;
  name: string;
  coverUrl: string;
  trackCount: number;
  duration: string;
  tracks: Track[];
}
