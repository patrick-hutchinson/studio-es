const DEFAULT_RENDITION = "highest.mp4";

export function getVideoPlaybackUrl(medium) {
  if (!medium?.playbackId) return null;

  return `https://stream.mux.com/${medium.playbackId}.m3u8`;
}

export function getVideoRenditionUrl(medium, rendition = DEFAULT_RENDITION) {
  if (!medium?.playbackId) return null;

  const selectedRendition = medium.staticRendition || rendition;
  const renditionName =
    selectedRendition.endsWith(".mp4") || selectedRendition.endsWith(".m4a")
      ? selectedRendition
      : `${selectedRendition}.mp4`;

  return `https://stream.mux.com/${medium.playbackId}/${renditionName}`;
}
