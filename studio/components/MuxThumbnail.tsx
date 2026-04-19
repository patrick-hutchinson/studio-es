import React from 'react';

interface MuxThumbnailProps {
  playbackId: string;
}

export function MuxThumbnail({ playbackId }: MuxThumbnailProps) {
  if (!playbackId) return null;

  const thumbnailUrl = `https://image.mux.com/${playbackId}/animated.webp?time=1`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '0.5rem',
      }}
    >
      <img
        src={thumbnailUrl}
        alt="Video preview"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}
