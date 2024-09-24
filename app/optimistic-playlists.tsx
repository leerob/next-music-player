'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MoreVertical, Trash } from 'lucide-react';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePlayback } from '@/app/playback-context';
import { createPlaylistAction, deletePlaylistAction } from './actions';
import { usePlaylist } from './playlist-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Playlist } from '@/lib/db/types';

function PlaylistRow({ playlist }: { playlist: Playlist }) {
  const pathname = usePathname();
  const { deletePlaylist } = usePlaylist();

  async function handleDeletePlaylist(id: number) {
    deletePlaylist(playlist.id);
    let shouldRedirect = pathname === `/p/${id}`;
    await deletePlaylistAction(id, shouldRedirect);
  }
  return (
    <li className="group relative">
      <Link
        prefetch={true}
        href={`/p/${playlist.id}`}
        className={`block py-1 px-4 cursor-pointer hover:bg-[#1A1A1A] text-[#d1d5db] focus:outline-none focus:ring-[0.5px] focus:ring-gray-400 ${
          pathname === `/p/${playlist.id}` ? 'bg-[#1A1A1A]' : ''
        }`}
        tabIndex={0}
      >
        {playlist.name}
      </Link>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white focus:text-white"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Playlist options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => handleDeletePlaylist(playlist.id)}
              className="text-xs"
            >
              <Trash className="mr-2 size-3" />
              Delete Playlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

export function OptimisticPlaylists() {
  const { playlists, updatePlaylist } = usePlaylist();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const playlistsContainerRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const { registerPanelRef, handleKeyNavigation, setActivePanel } =
    usePlayback();

  useEffect(() => {
    registerPanelRef('sidebar', playlistsContainerRef);
  }, [registerPanelRef]);

  async function addPlaylistAction() {
    const newPlaylist = {
      id: Math.floor(Math.random() * 10000),
      name: 'New Playlist',
      coverUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    updatePlaylist(newPlaylist.id, newPlaylist);
    await createPlaylistAction();
  }

  return (
    <div
      className="hidden md:block w-56 bg-[#121212] h-[100dvh] overflow-auto"
      onClick={() => setActivePanel('sidebar')}
    >
      <div className="m-4">
        <Input
          ref={searchInputRef}
          type="search"
          className="mb-4 bg-[#1A1A1A] border-[#333] text-xs h-8 focus-visible:ring-0"
          placeholder="Search"
        />
        <div className="mb-6">
          <Link
            href="/"
            className={`block py-1 px-4 -mx-4 text-xs text-[#d1d5db] hover:bg-[#1A1A1A] transition-colors focus:outline-none focus:ring-[0.5px] focus:ring-gray-400 ${
              pathname === '/' ? 'bg-[#1A1A1A]' : ''
            }`}
          >
            All Tracks
          </Link>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Playlists
          </Link>
          <form action={addPlaylistAction}>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              type="submit"
            >
              <Plus className="w-3 h-3 text-gray-400" />
              <span className="sr-only">Add new playlist</span>
            </Button>
          </form>
        </div>
      </div>
      <ScrollArea className="h-[calc(100dvh-180px)]">
        <ul
          ref={playlistsContainerRef}
          className="space-y-0.5 text-xs mt-[1px]"
          onKeyDown={(e) => handleKeyNavigation(e, 'sidebar')}
        >
          {playlists.map((playlist) => (
            <PlaylistRow key={playlist.id} playlist={playlist} />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
