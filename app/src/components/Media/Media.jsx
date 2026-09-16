"use client";

import ImageCompose from "./components/Image/ImageCompose";
import VideoCompose from "./components/Video/VideoCompose";
import { useMediaPlaceholderColor } from "./MediaPlaceholderContext";

const Media = ({ className, medium, eager = false, objectFit, paused, placeholderColor, showPlaceholder = true }) => {
  const projectPlaceholderColor = useMediaPlaceholderColor();
  const resolvedPlaceholderColor = placeholderColor ?? projectPlaceholderColor;

  if (!medium || (!medium.url && !medium.playbackId)) return undefined;

  switch (medium.type) {
    case "image":
      return (
        <ImageCompose
          medium={medium}
          className={className}
          eager={eager}
          objectFit={objectFit}
          placeholderColor={resolvedPlaceholderColor}
        />
      );
    case "video":
      return (
        <VideoCompose
          medium={medium}
          className={className}
          eager={eager}
          objectFit={objectFit}
          paused={paused}
          placeholderColor={resolvedPlaceholderColor}
          showPlaceholder={showPlaceholder}
        />
      );
    default:
      return null;
  }
};

Media.displayName = "Media";
export default Media;
