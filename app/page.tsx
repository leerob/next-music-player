import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TrackTable } from './p/[id]/track-table';
import { getAllSongs } from '@/lib/db/queries';

export default async function AllTracksPage() {
  const allSongs = await getAllSongs();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A] pb-[69px] pt-2">
      <ScrollArea className="flex-1">
        <div className="min-w-max">
          {/* @ts-ignore */}
          <TrackTable playlist={{ songs: allSongs }} />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
