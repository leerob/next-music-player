import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TrackTable } from './p/[id]/track-table';

export default function AllTracksPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
      <ScrollArea className="flex-1">
        <div className="min-w-max">
          <TrackTable />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
