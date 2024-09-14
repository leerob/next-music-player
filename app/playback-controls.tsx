'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Track } from '@/lib/db/types';
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';

export function PlaybackControls({ currentTrack }: { currentTrack: Track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setVolume(percentage);
      if (audioRef.current) {
        audioRef.current.volume = percentage / 100;
      }
      setIsMuted(percentage === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleVolumeVisibility = () => {
    setIsVolumeVisible(!isVolumeVisible);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAudioSrc = (url: string) => {
    if (url.startsWith('file://')) {
      const filename = url.split('/').pop();
      return `/api/audio/${encodeURIComponent(filename)}`;
    }
    return url;
  };

  const audioSrc = getAudioSrc(currentTrack.audioUrl);

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-[#181818] border-t border-[#282828]">
      <audio ref={audioRef} src={audioSrc} />
      <div className="flex items-center space-x-3 w-1/3">
        <img
          src={currentTrack.imageUrl}
          alt="Now playing"
          className="w-10 h-10 object-cover"
        />
        <div className="flex-shrink min-w-0">
          <div className="text-sm font-medium truncate max-w-[120px] sm:max-w-[200px] text-gray-200">
            {currentTrack.name}
          </div>
          <div className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[200px]">
            {currentTrack.artist}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 hidden sm:flex"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipBack className="w-4 h-4 stroke-[1.5]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 stroke-[1.5]" />
            ) : (
              <Play className="w-5 h-5 stroke-[1.5]" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SkipForward className="w-4 h-4 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex items-center w-full mt-1">
          <span className="text-xs tabular-nums text-gray-400">
            {formatTime(currentTime)}
          </span>
          <div className="flex-grow mx-2 h-1 bg-[#3E3E3E] rounded-full">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: `${(currentTime / (parseFloat(currentTrack.duration.split(':')[0]) * 60 + parseFloat(currentTrack.duration.split(':')[1]))) * 100}%`,
              }}
            ></div>
          </div>
          <span className="text-xs tabular-nums text-gray-400">
            {currentTrack.duration}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 w-1/3">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleVolumeVisibility}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          {isVolumeVisible && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#282828] rounded-md shadow-lg">
              <div
                ref={volumeBarRef}
                className="w-20 h-1 bg-[#3E3E3E] rounded-full cursor-pointer"
                onClick={handleVolumeChange}
              >
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${volume}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
