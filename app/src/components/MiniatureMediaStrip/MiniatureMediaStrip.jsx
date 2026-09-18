import { forwardRef } from "react";

import VideoFrameStrip from "@/components/VideoFrameStrip/VideoFrameStrip";
import styles from "./MiniatureMediaStrip.module.scss";

const getMiniatureImageUrl = (url) => {
  if (!url) return "";

  const separator = url.includes("?") ? "&" : "?";

  // Archive strips render at 20 CSS pixels tall; a 3x source remains crisp while staying lightweight.
  return `${url}${separator}h=40&fit=max&auto=format`;
};

const MiniatureMediaStrip = forwardRef(function MediaStrip({ appearance, className = "", medium, title }, forwardedRef) {
  const isVideo = medium?.type === "video";
  const background = appearance?.background?.hex || "#ffffff";
  const foreground = appearance?.font?.hex || "#000000";

  return (
    <section
      ref={forwardedRef}
      className={[styles.preview, className].filter(Boolean).join(" ")}
      style={{
        "--preview-background-image": !isVideo && medium?.url ? `url("${getMiniatureImageUrl(medium.url)}")` : "none",
        "--preview-title-background": background,
        "--preview-title-foreground": foreground,
      }}
    >
      {isVideo ? <VideoFrameStrip frameWidth={160} medium={medium} /> : null}
      {title ? (
        <p className={styles.title} typo="h3 compensate">
          {title}
        </p>
      ) : null}
    </section>
  );
});

export default MiniatureMediaStrip;
