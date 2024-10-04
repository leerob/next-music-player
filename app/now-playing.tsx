'use client';

import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { PencilIcon, Loader2 } from 'lucide-react';
import { updateTrackAction, updateTrackImageAction } from './actions';
import { usePlayback } from './playback-context';
import { songs } from '@/lib/db/schema';

export function NowPlaying() {
  const { currentTrack } = usePlayback();
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [imageState, imageFormAction, imagePending] = useActionState(
    updateTrackImageAction,
    {
      success: false,
      imageUrl: '',
    }
  );

  if (!currentTrack) {
    return null;
  }

  const currentImageUrl = imageState?.success
    ? imageState.imageUrl
    : currentTrack.imageUrl;

  return (
    <div className="flex flex-col w-56 p-4 bg-[#121212] overflow-auto">
      <h2 className="mb-3 text-sm font-semibold text-gray-200">Now Playing</h2>
      <div
        className="relative w-full aspect-square mb-3"
        onMouseEnter={() => setIsHoveringImage(true)}
        onMouseLeave={() => setIsHoveringImage(false)}
      >
        <img
          src={currentImageUrl || '/placeholder.svg'}
          alt={currentTrack.name}
          className="w-full h-full object-cover"
        />
        {isHoveringImage && (
          <form action={imageFormAction}>
            <input type="hidden" name="trackId" value={currentTrack.id} />
            <label
              htmlFor="imageUpload"
              className="absolute bottom-2 right-2 cursor-pointer"
            >
              <input
                id="imageUpload"
                type="file"
                name="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    e.target.form?.requestSubmit();
                  }
                }}
              />
              {imagePending ? (
                <Loader2 className="w-6 h-6 text-white bg-black bg-opacity-50 rounded-full p-1 animate-spin" />
              ) : (
                <PencilIcon className="w-6 h-6 text-white bg-black bg-opacity-50 rounded-full p-1" />
              )}
            </label>
          </form>
        )}
      </div>
      <div className="w-full space-y-1">
        <EditableInput
          initialValue={currentTrack.name}
          trackId={currentTrack.id}
          field="name"
          label="Title"
        />
        <EditableInput
          initialValue={currentTrack.artist}
          trackId={currentTrack.id}
          field="artist"
          label="Artist"
        />
        <EditableInput
          initialValue={currentTrack.album || ''}
          trackId={currentTrack.id}
          field="album"
          label="Album"
        />
        <EditableInput
          initialValue={currentTrack.bpm?.toString() || ''}
          trackId={currentTrack.id}
          field="bpm"
          label="BPM"
        />
        <EditableInput
          initialValue={currentTrack.key || ''}
          trackId={currentTrack.id}
          field="key"
          label="Key"
        />
      </div>
    </div>
  );
}

interface EditableInputProps {
  initialValue: string;
  trackId: string;
  field: keyof typeof songs.$inferInsert;
  label: string;
}

function EditableInput({
  initialValue,
  trackId,
  field,
  label,
}: EditableInputProps) {
  let [isEditing, setIsEditing] = useState(false);
  let [value, setValue] = useState(initialValue);
  let inputRef = useRef<HTMLInputElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);
  let [state, formAction, pending] = useActionState(updateTrackAction, {
    success: false,
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (value !== initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  function submitFormOnBlur() {
    if (value.trim() !== '' && value !== initialValue) {
      buttonRef.current?.click();
    }
    setIsEditing(false);
  }

  return (
    <form action={formAction}>
      <label className="text-xs text-muted-foreground">{label}</label>
      {isEditing ? (
        <>
          <input type="hidden" name="trackId" value={trackId} />
          <input type="hidden" name="field" value={field} />
          <input
            ref={inputRef}
            type="text"
            name={field}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={submitFormOnBlur}
            className="bg-transparent border-none focus:ring-0 p-0 h-4 text-xs w-full"
          />
          <button ref={buttonRef} type="submit" hidden>
            Submit
          </button>
        </>
      ) : (
        <div
          className="h-4 text-xs group relative cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          <span className={value ? '' : 'text-muted-foreground'}>
            {value || '-'}
          </span>
          {pending ? (
            <Loader2 className="size-3 absolute top-1/2 right-1 transform -translate-y-1/2 animate-spin" />
          ) : (
            <PencilIcon className="size-3 absolute top-1/2 right-1 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </form>
  );
}
