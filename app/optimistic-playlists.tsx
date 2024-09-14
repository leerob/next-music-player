'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { useOptimistic, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Playlist } from '@/lib/db/types';

export function OptimisticPlaylists({
  initialPlaylists,
}: {
  initialPlaylists: Playlist[];
}) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [optimisticPlaylists, addOptimisticPlaylist] = useOptimistic(
    playlists,
    (state, newPlaylist: Playlist) => [...state, newPlaylist]
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNewPlaylist = () => {
    const newPlaylist: Playlist = {
      id: Math.floor(Math.random() * 10000).toString(),
      name: 'New',
      coverUrl:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-W3SJ4jU3qrj1Dpi1V5DgUXbJKsrD2k.png',
      trackCount: 0,
      duration: '0',
      tracks: [],
    };
    addOptimisticPlaylist(newPlaylist);
    setPlaylists((prev) => [...prev, newPlaylist]);
  };

  return (
    <div className="hidden md:block w-56 bg-[#121212] h-screen overflow-auto">
      <div className="m-4">
        <Input
          ref={searchInputRef}
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
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={addNewPlaylist}
          >
            <Plus className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-180px)]">
        <ul className="space-y-0.5 text-xs mt-[1px]">
          {optimisticPlaylists.map((playlist, index) => (
            <li key={index}>
              <Link
                href={`/p/${playlist.id}`}
                className={`block py-1 px-4 cursor-pointer hover:bg-[#1A1A1A] text-[#d1d5db] focus:outline-none focus:ring-[0.5px] focus:ring-gray-400 ${
                  pathname === `/p/${playlist.id}` ? 'bg-[#1A1A1A]' : ''
                }`}
              >
                {playlist.name}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
