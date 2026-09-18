import { forwardRef } from "react";

import Media from "@/components/Media/Media";
import VideoFrameStrip from "@/components/VideoFrameStrip/VideoFrameStrip";
import styles from "./MiniatureMediaStrip.module.scss";

const getAspectRatio = (value) => {
  if (typeof value !== "string") return "16 / 9";

  const [width, height] = value.split(":").map(Number);

  return Number.isFinite(width) && Number.isFinite(height) && height > 0 ? `${width} / ${height}` : "16 / 9";
};

const MiniatureMediaStrip = forwardRef(function MediaStrip({ className = "", medium }, forwardedRef) {
  const isVideo = medium?.type === "video";
  const hasMedium = medium?.type === "image" || isVideo;

  return (
    <section
      ref={forwardedRef}
      className={[styles.preview, className].filter(Boolean).join(" ")}
      style={{
        "--preview-background-image": !isVideo && medium?.url ? `url("${medium.url}")` : "none",
        "--preview-media-aspect-ratio": getAspectRatio(medium?.aspect_ratio),
      }}
    >
      {isVideo && hasMedium ? <VideoFrameStrip medium={medium} /> : null}
      {isVideo && hasMedium ? (
        <div className={styles.projectMedia}>
          <Media className={styles.projectMediaContent} eager medium={medium} objectFit="cover" showPlaceholder={false} />
        </div>
      ) : null}
    </section>
  );
});

export default MiniatureMediaStrip;
