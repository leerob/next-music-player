import { nowPlayingTrack } from '@/lib/db/queries';
import { PlaybackControls } from './playback-controls';

export async function NowPlaying() {
  const currentTrack = nowPlayingTrack;

  return (
    <>
      <div className="hidden md:block w-56 p-4 bg-[#121212] overflow-auto">
        <h2 className="mb-3 text-sm font-semibold text-gray-200">
          Now Playing
        </h2>
        <img
          src={currentTrack.imageUrl}
          alt="Current track"
          className="w-full aspect-square object-cover mb-3"
        />
        <div className="space-y-1 text-xs">
          <div>
            <p className="text-gray-400">Title</p>
            <p className="text-gray-200 truncate">{currentTrack.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Artist</p>
            <p className="text-gray-200 truncate">{currentTrack.artist}</p>
          </div>
          <div>
            <p className="text-gray-400">Album</p>
            <p className="text-gray-200 truncate">{currentTrack.album}</p>
          </div>
          <div>
            <p className="text-gray-400">Genre</p>
            <p className="text-gray-200 truncate">{currentTrack.genre}</p>
          </div>
          <div>
            <p className="text-gray-400">BPM</p>
            <p className="text-gray-200 tabular-nums">{currentTrack.bpm}</p>
          </div>
          <div>
            <p className="text-gray-400">Key</p>
            <p className="text-gray-200">{currentTrack.key}</p>
          </div>
        </div>
      </div>
      <PlaybackControls currentTrack={currentTrack} />
    </>
  );
}
