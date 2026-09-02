const DEFAULT_FRAME_COUNT = 16;

export function getVideoFrameUrls(medium, count = DEFAULT_FRAME_COUNT) {
  const playbackId = medium?.playbackId;
  const duration = Number(medium?.duration);

  if (!playbackId || !Number.isFinite(duration) || duration <= 0) return [];

  const frameCount = Math.max(1, Math.floor(count));

  return Array.from({ length: frameCount }, (_, index) => {
    // Avoid the first and final frames, which are often black during encoding.
    const progress = (index + 0.5) / frameCount;
    const time = Math.min(Math.max(duration * progress, 0.01), Math.max(duration - 0.01, 0.01));

    return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time.toFixed(2)}&width=1200`;
  });
}
