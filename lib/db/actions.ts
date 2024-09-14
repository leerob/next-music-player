'use server';

import { revalidatePath } from 'next/cache';
import { setNowPlayingTrack } from './queries';
import { Track } from './types';

export async function updateNowPlayingAction(newTrack: Track) {
  setNowPlayingTrack(newTrack);
  revalidatePath('/', 'layout');
}
