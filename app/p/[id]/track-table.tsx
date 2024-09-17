'use client';

import { usePlayback } from '@/app/playback-context';
import { PlaylistWithSongs, Song } from '@/lib/db/types';
import { formatDuration } from '@/lib/utils';
import { useRef, useEffect } from 'react';

export function TrackTable({ playlist }: { playlist: PlaylistWithSongs }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const {
    currentTrack,
    playTrack,
    togglePlayPause,
    isPlaying,
    registerPanelRef,
    handleKeyNavigation,
    setActivePanel,
    setPlaylist,
  } = usePlayback();

  useEffect(() => {
    registerPanelRef('tracklist', tableRef);
  }, [registerPanelRef]);

  useEffect(() => {
    setPlaylist(playlist.songs);
  }, [playlist.songs, setPlaylist]);

  function onClickTrackRow(
    e: React.MouseEvent<HTMLTableRowElement>,
    track: Song
  ) {
    setActivePanel('tracklist');
    if (currentTrack?.name === track.name) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  }

  function onKeyDownTrackRow(
    e: React.KeyboardEvent<HTMLTableRowElement>,
    track: Song
  ) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (currentTrack?.name === track.name) {
        togglePlayPause();
      } else {
        playTrack(track);
      }
    } else {
      handleKeyNavigation(e, 'tracklist');
    }
  }

  return (
    <table
      ref={tableRef}
      className="w-full text-xs"
      onClick={() => setActivePanel('tracklist')}
    >
      <thead className="sticky top-0 bg-[#0A0A0A] z-10 border-b border-[#282828]">
        <tr className="text-left text-gray-400">
          <th className="py-2 pl-3 pr-2 font-medium w-10">#</th>
          <th className="py-2 px-2 font-medium">Title</th>
          <th className="py-2 px-2 font-medium hidden sm:table-cell">Artist</th>
          <th className="py-2 px-2 font-medium hidden md:table-cell">Album</th>
          <th className="py-2 px-2 font-medium">Duration</th>
        </tr>
      </thead>
      <tbody className="mt-[1px]">
        {playlist.songs.map((track: Song, index: number) => (
          <tr
            key={track.id}
            className={`group cursor-pointer hover:bg-[#1A1A1A] focus-within:bg-[#1A1A1A] focus-within:outline-none focus-within:ring-[0.5px] focus-within:ring-gray-400 select-none ${
              currentTrack?.name === track.name ? 'bg-[#1A1A1A]' : ''
            }`}
            tabIndex={0}
            onClick={(e) => onClickTrackRow(e, track)}
            onKeyDown={(e) => onKeyDownTrackRow(e, track)}
          >
            <td className="py-1 pl-3 pr-2 tabular-nums w-10 text-center">
              {currentTrack?.name === track.name && isPlaying ? (
                <div className="flex items-end justify-center space-x-[2px] size-[0.65rem] mx-auto">
                  <div className="w-1 bg-neutral-600 animate-now-playing-1"></div>
                  <div className="w-1 bg-neutral-600 animate-now-playing-2 [animation-delay:0.2s]"></div>
                  <div className="w-1 bg-neutral-600 animate-now-playing-3 [animation-delay:0.4s]"></div>
                </div>
              ) : (
                <span className="text-gray-400">{index + 1}</span>
              )}
            </td>
            <td className="py-1 px-2">
              <div className="flex items-center">
                <img
                  src={track.imageUrl || '/placeholder.svg'}
                  alt={`${track.album} cover`}
                  className="size-4 mr-2 object-cover"
                />
                <div className="font-medium truncate max-w-[120px] sm:max-w-[200px] text-[#d1d5db]">
                  {track.name}
                  <span className="sm:hidden text-gray-400 ml-1">
                    • {track.artist}
                  </span>
                </div>
              </div>
            </td>
            <td className="py-1 px-2 hidden sm:table-cell text-[#d1d5db]">
              {track.artist}
            </td>
            <td className="py-1 px-2 hidden md:table-cell text-[#d1d5db]">
              {track.album}
            </td>
            <td className="py-1 px-2 tabular-nums text-[#d1d5db]">
              {formatDuration(track.duration)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
