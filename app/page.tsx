import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getPlaylist } from '@/lib/db/queries';
import { TrackTable } from './p/[id]/track-table';

export default async function AllTracksPage() {
  const playlist = await getPlaylist('1');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
      <ScrollArea className="flex-1">
        <div className="min-w-max">
          <TrackTable playlist={playlist} />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
