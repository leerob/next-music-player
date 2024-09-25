'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
  use,
} from 'react';
import { Playlist } from '@/lib/db/types';

type PlaylistContextType = {
  playlists: Playlist[];
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
};

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

type OptimisticAction =
  | { type: 'update'; id: string; updates: Partial<Playlist> }
  | { type: 'delete'; id: string };

export function PlaylistProvider({
  children,
  playlistsPromise,
}: {
  children: React.ReactNode;
  playlistsPromise: Promise<Playlist[]>;
}) {
  const initialPlaylists = use(playlistsPromise);

  const [playlists, setOptimisticPlaylists] = useOptimistic(
    initialPlaylists,
    (state: Playlist[], action: OptimisticAction) => {
      switch (action.type) {
        case 'update':
          return state.map((playlist) =>
            playlist.id === action.id
              ? { ...playlist, ...action.updates }
              : playlist
          );
        case 'delete':
          return state.filter((playlist) => playlist.id !== action.id);
        default:
          return state;
      }
    }
  );

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    setOptimisticPlaylists({ type: 'update', id, updates });
  };

  const deletePlaylist = (id: string) => {
    setOptimisticPlaylists({ type: 'delete', id });
  };

  const value = useMemo(
    () => ({
      playlists,
      updatePlaylist,
      deletePlaylist,
    }),
    [playlists]
  );

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}
