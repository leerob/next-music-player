import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TrackTable } from './p/[id]/track-table';
import { getAllSongs, searchSongs } from '@/lib/db/queries';

export default async function AllTracksPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const query = (await searchParams).q;
  const songs = query ? await searchSongs(query) : await getAllSongs();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A] pb-[69px] pt-2">
      <ScrollArea className="flex-1">
        <div className="min-w-max">
          {/* @ts-ignore */}
          <TrackTable query={query} playlist={{ songs }} />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
