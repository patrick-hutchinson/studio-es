import { forwardRef } from "react";

import Media from "@/components/Media/Media";
import VideoFrameStrip from "@/components/VideoFrameStrip/VideoFrameStrip";
import styles from "./ProjectSlideshowPreview.module.css";

const getAspectRatio = (value) => {
  if (typeof value !== "string") return "16 / 9";

  const [width, height] = value.split(":").map(Number);

  return Number.isFinite(width) && Number.isFinite(height) && height > 0 ? `${width} / ${height}` : "16 / 9";
};

const ProjectSlideshowPreview = forwardRef(function ProjectSlideshowPreview({ className = "", medium }, forwardedRef) {
  if (medium?.type !== "image" && medium?.type !== "video") return null;

  const isVideo = medium.type === "video";

  return (
    <section
      ref={forwardedRef}
      className={[styles.preview, className].filter(Boolean).join(" ")}
      style={{
        "--preview-background-image": !isVideo && medium.url ? `url("${medium.url}")` : "none",
        "--preview-media-aspect-ratio": getAspectRatio(medium.aspect_ratio),
      }}
    >
      {isVideo ? <VideoFrameStrip medium={medium} /> : null}
      {isVideo ? (
        <div className={styles.projectMedia}>
          <Media className={styles.projectMediaContent} eager medium={medium} objectFit="cover" showPlaceholder={false} />
        </div>
      ) : null}
    </section>
  );
});

export default ProjectSlideshowPreview;
