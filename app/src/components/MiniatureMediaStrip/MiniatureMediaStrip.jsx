import { forwardRef, useMemo } from "react";

import Carousel from "@/components/Carousel/Carousel";
import { MediaPlaceholderProvider } from "@/components/Media/MediaPlaceholderContext";
import VideoFrameStrip from "@/components/VideoFrameStrip/VideoFrameStrip";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./MiniatureMediaStrip.module.scss";

const COLLAPSED_HEIGHT = 32;
const EXPANDED_HEIGHT = COLLAPSED_HEIGHT * 5;

const getMiniatureImageUrl = (url) => {
  if (!url) return "";

  const separator = url.includes("?") ? "&" : "?";

  // Archive strips render at 20 CSS pixels tall; a 3x source remains crisp while staying lightweight.
  return `${url}${separator}h=40&fit=max&auto=format`;
};

const MiniatureMediaStrip = forwardRef(function MediaStrip(
  { appearance, className = "", code, href, isExpanded = false, media = [], medium, onExpand, title },
  forwardedRef,
) {
  const isVideo = medium?.type === "video";
  const background = appearance?.background?.hex || "#ffffff";
  const foreground = appearance?.font?.hex || "#000000";
  const carouselMedia = useMemo(
    () => (media ?? []).filter((item) => item?.medium?.type === "image" || item?.medium?.type === "video"),
    [media],
  );
  const canExpand = !href && carouselMedia.length > 0;

  const expand = () => {
    if (canExpand) onExpand?.();
  };

  const preview = (
    <motion.section
      animate={{ height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT }}
      aria-expanded={canExpand ? isExpanded : undefined}
      aria-label={canExpand ? `${isExpanded ? "Hide" : "Show"} header media for ${title || "project"}` : undefined}
      className={[styles.preview, href ? "" : className].filter(Boolean).join(" ")}
      data-expanded={isExpanded ? "" : undefined}
      onClick={expand}
      ref={forwardedRef}
      role={canExpand ? "button" : undefined}
      style={{
        "--preview-hover-background": background,
        "--preview-hover-foreground": foreground,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {!isExpanded ? (
        <div
          className={styles.mediaPreview}
          style={{
            "--preview-background-image": !isVideo && medium?.url ? `url("${getMiniatureImageUrl(medium.url)}")` : "none",
          }}
        >
          {isVideo ? <VideoFrameStrip frameWidth={160} medium={medium} /> : null}
        </div>
      ) : null}
      {!isExpanded && title ? (
        <p className={styles.title} typo="h3">
          {code ? <span className={styles.code}>{code}</span> : null}
          {title}
        </p>
      ) : null}
      {isExpanded ? (
        <MediaPlaceholderProvider color={background}>
          <Carousel array={carouselMedia} autoScrollDelay={6000} contained infinite showCounter={false} />
        </MediaPlaceholderProvider>
      ) : null}
    </motion.section>
  );

  return href ? (
    <Link aria-label={`Open ${title || "project"}`} className={[styles.link, className].filter(Boolean).join(" ")} href={href}>
      {preview}
    </Link>
  ) : (
    preview
  );
});

export default MiniatureMediaStrip;
