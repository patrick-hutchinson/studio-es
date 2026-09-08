export function getVideoPlaybackUrl(medium) {
  if (!medium?.playbackId) return null;

  return `https://stream.mux.com/${medium.playbackId}.m3u8`;
}

const getStaticMp4Files = (medium) => {
  const files = medium?.staticRenditions?.files;
  if (!Array.isArray(files)) return [];

  return files.filter((file) => {
    const isMp4 = file?.ext === "mp4" || file?.name?.endsWith(".mp4");
    return isMp4 && (!file.status || file.status === "ready");
  });
};

export function getVideoStaticRenditionUrl(medium, rendition) {
  if (!medium?.playbackId) return null;

  const files = getStaticMp4Files(medium);
  if (!files.length) return null;

  const requestedRendition = medium.staticRendition || rendition;
  const matchingFile = requestedRendition
    ? files.find((file) => file.name === requestedRendition || file.name === `${requestedRendition}.mp4`)
    : null;
  const bestFile = [...files].sort(
    (first, second) => (second.width || 0) - (first.width || 0) || (second.bitrate || 0) - (first.bitrate || 0),
  )[0];
  const renditionName = (matchingFile || bestFile)?.name;

  if (!renditionName) return null;

  return `https://stream.mux.com/${medium.playbackId}/${renditionName}`;
}

export function getVideoRenditionUrl(medium, rendition) {
  return getVideoStaticRenditionUrl(medium, rendition) || getVideoPlaybackUrl(medium);
}
