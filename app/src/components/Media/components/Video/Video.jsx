import { useEffect, useState } from "react";

import { getVideoPlaybackUrl, getVideoStaticRenditionUrl } from "@/lib/media/getVideoRenditionUrl";

const Video = ({ medium, objectFit = "cover", playerState, playerControls }) => {
  const staticRenditionUrl = getVideoStaticRenditionUrl(medium);
  const playbackUrl = getVideoPlaybackUrl(medium);
  const [usePlaybackFallback, setUsePlaybackFallback] = useState(false);
  const src = usePlaybackFallback || !staticRenditionUrl ? playbackUrl : staticRenditionUrl;
  const isHlsStream = src?.endsWith(".m3u8");

  useEffect(() => {
    setUsePlaybackFallback(false);
  }, [medium.playbackId]);

  useEffect(() => {
    const player = playerControls.playerRef.current;
    if (!player || !playerState.isInView || !src) return;

    let hls;
    let cancelled = false;

    if (!isHlsStream) {
      player.src = src;
      player.load();
      return;
    }

    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;

      if (!Hls.isSupported()) {
        player.src = src;
        player.load();
        return;
      }

      hls = new Hls();
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        playerState.setIsLoaded(true);

        const playPromise = player.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
      hls.loadSource(src);
      hls.attachMedia(player);
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [isHlsStream, playerControls.playerRef, playerState.isInView, src]);

  useEffect(() => {
    const player = playerControls.playerRef.current;
    if (!player) return;

    player.muted = playerControls.muted ?? true;

    if (playerControls.paused) {
      player.pause();
      return;
    }

    const playPromise = player.play();
    if (playPromise?.catch) playPromise.catch(() => {});
  }, [playerControls.muted, playerControls.paused, playerControls.playerRef]);

  if (!playerState.isInView || !src) return null;

  return (
    <video
      ref={playerControls.playerRef}
      autoPlay
      playsInline
      loop
      muted={playerControls.muted ?? true}
      preload={playerState.eager ? "auto" : "metadata"}
      poster={`https://image.mux.com/${medium.playbackId}/thumbnail.jpg?width=1200`}
      style={{
        position: "relative",
        opacity: 1,
        zIndex: 0,
        width: "100%",
        height: "100%",
        objectFit,
      }}
      onCanPlay={() => playerState.setIsLoaded(true)}
      onLoadedData={() => playerState.setIsLoaded(true)}
      onPlaying={() => playerState.setIsLoaded(true)}
      onTimeUpdate={playerControls.onTimeUpdate}
      onLoadedMetadata={playerControls.onLoadedMetadata}
      onError={() => {
        if (staticRenditionUrl && !usePlaybackFallback) setUsePlaybackFallback(true);
      }}
    />
  );
};

export default Video;
