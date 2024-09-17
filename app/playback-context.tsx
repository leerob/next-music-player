'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { Song } from '@/lib/db/types';

type PlaybackContextType = {
  isPlaying: boolean;
  currentTrack: Song | null;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
  playTrack: (track: Song) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
};

let PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  let [isPlaying, setIsPlaying] = useState(false);
  let [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  let [currentTime, setCurrentTime] = useState(0);
  let [duration, setDuration] = useState(0);
  let audioRef = useRef<HTMLAudioElement>(null);

  let togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  let playTrack = (track: Song) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = getAudioSrc(track.audioUrl as string);
      audioRef.current.play();
    }
  };

  let getAudioSrc = (url: string) => {
    if (url.startsWith('file://')) {
      let filename = url.split('/').pop();
      return `/api/audio/${encodeURIComponent(filename || '')}`;
    }
    return url;
  };

  useEffect(() => {
    let handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        togglePlayPause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <PlaybackContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        togglePlayPause,
        playTrack,
        setCurrentTime,
        setDuration,
        audioRef,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  let context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}
