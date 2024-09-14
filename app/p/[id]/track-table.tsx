'use client';

import { updateNowPlayingAction } from '@/lib/db/actions';
import { Playlist, Track } from '@/lib/db/types';
import { useEffect, useRef } from 'react';

export function TrackTable({
  playlist,
  nowPlayingTrack,
}: {
  playlist: Playlist;
  nowPlayingTrack: Track;
}) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!tableRef.current) return;

      const rows = Array.from(tableRef.current.querySelectorAll('tbody tr'));
      const currentFocusedRow = document.activeElement as HTMLElement;
      const currentIndex = rows.indexOf(currentFocusedRow);

      let newIndex: number;

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          newIndex = Math.min(currentIndex + 1, rows.length - 1);
          break;
        case 'k':
        case 'ArrowUp':
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Enter':
          if (currentFocusedRow && currentFocusedRow.tagName === 'TR') {
            const track = playlist.tracks[currentIndex];
            updateNowPlayingAction(track);
          }
          return;
        default:
          return;
      }

      e.preventDefault();
      (rows[newIndex] as HTMLElement).focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [playlist.tracks]);

  function onClickTrackRow(
    e: React.MouseEvent<HTMLTableRowElement>,
    track: Track
  ) {
    if (e.detail === 2) {
      updateNowPlayingAction(track);
    }
  }

  return (
    <table ref={tableRef} className="w-full text-xs">
      <thead className="sticky top-0 bg-[#0A0A0A] z-10 border-b border-[#282828]">
        <tr className="text-left text-gray-400">
          <th className="py-2 pl-3 pr-2 font-medium w-8">#</th>
          <th className="py-2 px-2 font-medium">Title</th>
          <th className="py-2 px-2 font-medium hidden sm:table-cell">Artist</th>
          <th className="py-2 px-2 font-medium hidden md:table-cell">Album</th>
          <th className="py-2 px-2 font-medium">Duration</th>
        </tr>
      </thead>
      <tbody className="mt-[1px]">
        {playlist.tracks.map((track, index) => (
          <tr
            key={index}
            className={`group hover:bg-[#1A1A1A] focus-within:bg-[#1A1A1A] focus-within:outline-none focus-within:ring-[0.5px] focus-within:ring-gray-400 ${
              nowPlayingTrack.name === track.name ? 'bg-[#1A1A1A]' : ''
            }`}
            tabIndex={0}
            onClick={(e) => onClickTrackRow(e, track)}
          >
            <td className="py-1 pl-3 pr-2 tabular-nums w-8">
              {nowPlayingTrack.name === track.name ? (
                <div className="flex items-end space-x-[2px] size-[0.65rem]">
                  <div className="w-1 bg-neutral-600 animate-now-playing-1"></div>
                  <div className="w-1 bg-neutral-600 animate-now-playing-2 [animation-delay:0.2s]"></div>
                  <div className="w-1 bg-neutral-600 animate-now-playing-3 [animation-delay:0.4s]"></div>
                </div>
              ) : (
                index + 1
              )}
            </td>
            <td className="py-1 px-2">
              <div className="flex items-center">
                <img
                  src={track.imageUrl}
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
              {track.duration}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
