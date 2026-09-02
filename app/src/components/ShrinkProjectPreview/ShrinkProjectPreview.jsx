import { useEffect, useRef } from "react";

import styles from "./ShrinkProjectPreview.module.css";
import Media from "@/components/Media/Media";
import VideoFrameStrip from "@/components/VideoFrameStrip/VideoFrameStrip";
import Link from "next/link";

const getAspectRatio = (value) => {
  if (typeof value !== "string") return "16 / 9";

  const [width, height] = value.split(":").map(Number);

  return Number.isFinite(width) && Number.isFinite(height) && height > 0 ? `${width} / ${height}` : "16 / 9";
};

const ShrinkProjectPreview = ({ backgroundImage, className = "", foregroundMedium, index, href }) => {
  const regionRef = useRef(null);
  const previewRef = useRef(null);
  const loopFrameRef = useRef(null);

  useEffect(() => {
    const updatePreview = () => {
      const region = regionRef.current;
      const preview = previewRef.current;

      if (!region || !preview) return;

      const maxHeight = Math.max(window.innerHeight, 0);
      const regionBox = region.getBoundingClientRect();
      const followingBox = region.nextElementSibling?.getBoundingClientRect();
      const followingTop = followingBox?.top ?? window.innerHeight;
      const height = Math.min(Math.max(followingTop, 0), maxHeight);
      const nextHeight = `${height}px`;
      const isPinned = regionBox.top <= 0 && regionBox.bottom > 0 && height > 0;

      if (preview.style.height !== nextHeight) {
        preview.style.height = nextHeight;
      }

      if (preview.hasAttribute("data-pinned") !== isPinned) {
        preview.toggleAttribute("data-pinned", isPinned);
      }

      if (isPinned) {
        preview.style.left = `${regionBox.left}px`;
        preview.style.width = `${regionBox.width}px`;
      } else {
        preview.style.left = "";
        preview.style.width = "";
      }
    };

    const runMeasurementLoop = () => {
      updatePreview();
      loopFrameRef.current = window.requestAnimationFrame(runMeasurementLoop);
    };

    loopFrameRef.current = window.requestAnimationFrame(runMeasurementLoop);

    return () => {
      if (loopFrameRef.current) {
        window.cancelAnimationFrame(loopFrameRef.current);
      }
    };
  }, []);

  const RegionElement = href ? Link : "section";
  const regionProps = href ? { href, prefetch: false } : {};

  return (
    <RegionElement
      ref={regionRef}
      {...regionProps}
      aria-label={href ? "Open project" : undefined}
      className={[styles.region, className].filter(Boolean).join(" ")}
    >
      <article
        ref={previewRef}
        className={styles.preview}
        style={{
          "--preview-background-image": backgroundImage ? `url("${backgroundImage}")` : "none",
          "--preview-media-aspect-ratio": getAspectRatio(foregroundMedium?.aspect_ratio),
        }}
      >
        {foregroundMedium?.type === "video" ? <VideoFrameStrip medium={foregroundMedium} /> : null}
        {foregroundMedium ? (
          <div className={styles.projectMedia}>
            <Media
              className={styles.projectMediaContent}
              eager={index === 0}
              medium={foregroundMedium}
              objectFit="cover"
              showPlaceholder={false}
            />
          </div>
        ) : null}
      </article>
    </RegionElement>
  );
};

export default ShrinkProjectPreview;
