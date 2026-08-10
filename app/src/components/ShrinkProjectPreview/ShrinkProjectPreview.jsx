import { useEffect, useRef } from "react";

import styles from "./ShrinkProjectPreview.module.css";
import Media from "@/components/Media/Media";
import Link from "next/link";

const getPixelValue = (value) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

const ShrinkProjectPreview = ({ backgroundImage, className = "", medium, index, href }) => {
  const regionRef = useRef(null);
  const previewRef = useRef(null);
  const loopFrameRef = useRef(null);

  useEffect(() => {
    const updatePreview = () => {
      const region = regionRef.current;
      const preview = previewRef.current;

      if (!region || !preview) return;

      const rootStyles = window.getComputedStyle(document.documentElement);
      const margin = getPixelValue(rootStyles.getPropertyValue("--margin"));
      const maxHeight = Math.max(window.innerHeight - margin * 2, 0);
      const regionBox = region.getBoundingClientRect();
      const followingBox = region.nextElementSibling?.getBoundingClientRect();
      const followingTop = followingBox?.top ?? window.innerHeight;
      const height = Math.min(Math.max(followingTop - margin, 0), maxHeight);
      const nextHeight = `${height}px`;
      const isPinned = regionBox.top <= margin && regionBox.bottom > margin && height > 0;

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
        }}
      >
        {/* {medium ? (
          <Media className={styles.projectMedia} eager={index === 0} medium={medium} objectFit="contain" />
        ) : null} */}
      </article>
    </RegionElement>
  );
};

export default ShrinkProjectPreview;
