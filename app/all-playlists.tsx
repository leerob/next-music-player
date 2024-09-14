import { getAllPlaylists } from '@/lib/db/queries';
import { OptimisticPlaylists } from './optimistic-playlists';

export async function AllPlaylists() {
  const allPlaylists = await getAllPlaylists();
  return <OptimisticPlaylists initialPlaylists={allPlaylists} />;
}
