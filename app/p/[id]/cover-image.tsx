'use client';

import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { PencilIcon, Loader2 } from 'lucide-react';
import { usePlayback } from '@/app/playback-context';
import { updateTrackAction, updateTrackImageAction } from '@/app/actions';

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
    <div className="flex flex-col w-full max-w-[200px] bg-background rounded-lg">
      <div
        className="relative w-full aspect-square mb-4"
        onMouseEnter={() => setIsHoveringImage(true)}
        onMouseLeave={() => setIsHoveringImage(false)}
      >
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={currentTrack.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 rounded flex items-center justify-center">
            <PencilIcon className="w-8 h-8 text-neutral-400" />
          </div>
        )}
        {isHoveringImage && (
          <form action={imageFormAction}>
            <input type="hidden" name="trackId" value={currentTrack.id} />
            <label
              htmlFor="imageUpload"
              className="absolute bottom-2 right-2 cursor-pointer w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
            >
              <input
                id="imageUpload"
                type="file"
                name="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size <= 5 * 1024 * 1024) {
                      e.target.form?.requestSubmit();
                    } else {
                      alert('File size exceeds 5MB limit');
                      e.target.value = '';
                    }
                  }
                }}
              />
              {imagePending ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <PencilIcon className="w-5 h-5 text-white" />
              )}
            </label>
          </form>
        )}
      </div>
      <div className="w-full space-y-2 px-4 pb-4">
        <EditableInput
          initialValue={currentTrack.name}
          trackId={currentTrack.id}
          field="name"
          label="Title"
          className="text-xs font-semibold"
        />
        <EditableInput
          initialValue={currentTrack.artist}
          trackId={currentTrack.id}
          field="artist"
          label="Artist"
          className="text-xs"
        />
        <EditableInput
          initialValue={currentTrack.album || ''}
          trackId={currentTrack.id}
          field="album"
          label="Album"
          className="text-xs"
        />
        <EditableInput
          initialValue={currentTrack.bpm?.toString() || ''}
          trackId={currentTrack.id}
          field="bpm"
          label="BPM"
          className="text-xs"
        />
        <EditableInput
          initialValue={currentTrack.key || ''}
          trackId={currentTrack.id}
          field="key"
          label="Key"
          className="text-xs"
        />
      </div>
    </div>
  );
}

interface EditableInputProps {
  initialValue: string;
  trackId: string;
  field: string;
  label: string;
  className?: string;
}

function EditableInput({
  initialValue,
  trackId,
  field,
  label,
  className,
}: EditableInputProps) {
  let [isEditing, setIsEditing] = useState(false);
  let [value, setValue] = useState(initialValue);
  let inputRef = useRef<HTMLInputElement>(null);
  let [state, formAction, pending] = useActionState(updateTrackAction, {
    success: false,
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsEditing(false);
    if (value.trim() !== '' && value !== initialValue) {
      e.currentTarget.requestSubmit();
    } else {
      setValue(initialValue);
    }
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {isEditing ? (
        <form action={formAction} onSubmit={handleSubmit}>
          <input type="hidden" name="trackId" value={trackId} />
          <input type="hidden" name="field" value={field} />
          <Input
            ref={inputRef}
            type="text"
            name="value"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValue(e.target.value)
            }
            onBlur={handleSubmit}
            className={`bg-transparent border-none focus:ring-0 p-0 h-6 ${className}`}
          />
        </form>
      ) : (
        <div
          className={`group relative cursor-pointer ${className}`}
          onClick={() => setIsEditing(true)}
        >
          <span className={value ? '' : 'text-muted-foreground'}>
            {value || 'None'}
          </span>
          {pending ? (
            <Loader2 className="w-4 h-4 absolute top-1/2 -right-5 transform -translate-y-1/2 animate-spin" />
          ) : (
            <PencilIcon className="w-4 h-4 absolute top-1/2 -right-5 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </div>
  );
}
