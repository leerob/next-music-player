import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(durationInSeconds: number) {
  if (isNaN(durationInSeconds) || durationInSeconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${minutes}:${formattedSeconds}`;
}
