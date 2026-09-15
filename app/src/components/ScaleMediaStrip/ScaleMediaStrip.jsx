import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import styles from "./ScaleMediaStrip.module.css";
import Media from "@/components/Media/Media";
import ProjectHeader from "@/components/ProjectHeader/ProjectHeader";
import VideoFrameStrip from "@/components/VideoFrameStrip/VideoFrameStrip";
import { useLenisContext } from "@/context/LenisContext";
import Link from "next/link";

const getAspectRatio = (value) => {
  if (typeof value !== "string") return "16 / 9";

  const [width, height] = value.split(":").map(Number);

  return Number.isFinite(width) && Number.isFinite(height) && height > 0 ? `${width} / ${height}` : "16 / 9";
};

const BACKGROUND_TILE_OVERLAP = 1;
const MIN_LAYOUT_HEIGHT = 2;
const MIN_SIDE_COUNT = 2;
const COVERAGE_BUFFER = 2;

const getImageAtOffset = (images, offset) => images[(((offset % images.length) + images.length) % images.length)];

const getImageWidth = (image, height) => {
  if (height < MIN_LAYOUT_HEIGHT) return 0;

  const aspectRatio = image.width && image.height ? image.width / image.height : 1;

  return Math.max(height * aspectRatio, MIN_LAYOUT_HEIGHT);
};

const ScaleMediaStrip = ({
  backgroundImage,
  backgroundMedium,
  className = "",
  code,
  foregroundMedium,
  gallery = [],
  index,
  href,
  title,
  usePortraitPreviewSizing = false,
}) => {
  const regionRef = useRef(null);
  const previewRef = useRef(null);
  const galleryRef = useRef(null);
  const lenis = useLenisContext();
  const [galleryLayout, setGalleryLayout] = useState({ itemSize: 0, sideCount: MIN_SIDE_COUNT });
  const galleryImages = useMemo(
    () => gallery.map((item) => item?.medium ?? item).filter((medium) => medium?.type === "image" && medium.url),
    [gallery],
  );
  const hasGallery = galleryImages.length > 0;
  const isPortrait = backgroundMedium?.width && backgroundMedium?.height && backgroundMedium.height > backgroundMedium.width;

  const getPreviewMaxHeight = useCallback(() => {
    if (!isPortrait) return window.innerHeight;

    const portraitHeight = (window.innerWidth * 0.5 * backgroundMedium.height) / backgroundMedium.width;

    return Math.max(window.innerHeight, portraitHeight);
  }, [backgroundMedium?.height, backgroundMedium?.width, isPortrait]);

  useLayoutEffect(() => {
    if (!hasGallery) return undefined;

    const galleryElement = galleryRef.current;
    if (!galleryElement) return undefined;

    const updateLayout = () => {
      const { width, height } = galleryElement.getBoundingClientRect();
      const itemSize = height >= MIN_LAYOUT_HEIGHT ? height : 0;

      if (!itemSize) {
        setGalleryLayout({ itemSize: 0, sideCount: MIN_SIDE_COUNT });
        return;
      }

      const minItemWidth = galleryImages.reduce(
        (minimum, image) => Math.min(minimum, getImageWidth(image, itemSize)),
        itemSize,
      );
      const sideCount = Math.max(Math.ceil(width / minItemWidth) + COVERAGE_BUFFER, MIN_SIDE_COUNT);

      setGalleryLayout((current) =>
        current.itemSize === itemSize && current.sideCount === sideCount ? current : { itemSize, sideCount },
      );
    };

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(galleryElement);
    updateLayout();

    return () => resizeObserver.disconnect();
  }, [galleryImages, hasGallery]);

  const updatePreview = useCallback(() => {
    const region = regionRef.current;
    const preview = hasGallery ? galleryRef.current : previewRef.current;

    if (!region || !preview) return;

    const maxHeight = usePortraitPreviewSizing ? Math.max(getPreviewMaxHeight(), 0) : window.innerHeight;
    region.style.height = `${maxHeight}px`;
    const regionBox = region.getBoundingClientRect();
    const followingBox = region.nextElementSibling?.getBoundingClientRect();
    const followingTop = followingBox?.top ?? window.innerHeight;
    const height = Math.min(Math.max(followingTop, 0), maxHeight);
    const nextHeight = `${height}px`;
    const isPinned = regionBox.top <= 0 && regionBox.bottom > 0 && height > 0;
    const portraitWidth = (window.innerWidth * 0.5 * height) / Math.max(maxHeight, 1);
    const backgroundAspectRatio = Number(backgroundMedium?.width) / Number(backgroundMedium?.height);

    if (preview.style.height !== nextHeight) {
      preview.style.height = nextHeight;
    }

    if (usePortraitPreviewSizing && isPortrait) {
      preview.style.setProperty("--preview-portrait-width", `${portraitWidth}px`);
    }

    if (Number.isFinite(backgroundAspectRatio) && backgroundAspectRatio > 0) {
      preview.style.setProperty(
        "--preview-background-tile-width",
        `${height * backgroundAspectRatio + BACKGROUND_TILE_OVERLAP}px`,
      );
    } else {
      preview.style.removeProperty("--preview-background-tile-width");
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
  }, [backgroundMedium?.height, backgroundMedium?.width, getPreviewMaxHeight, hasGallery, isPortrait, usePortraitPreviewSizing]);

  useLayoutEffect(() => {
    let frameId = null;

    const scheduleUpdate = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updatePreview();
      });
    };

    updatePreview();
    const unsubscribe = lenis?.on?.("scroll", updatePreview);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      else lenis?.off?.("scroll", updatePreview);

      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [lenis, updatePreview]);

  const RegionElement = href ? Link : "section";
  const regionProps = href ? { href, prefetch: false } : {};
  const offsets =
    hasGallery && galleryLayout.itemSize >= MIN_LAYOUT_HEIGHT
      ? Array.from({ length: galleryLayout.sideCount * 2 + 1 }, (_, index) => index - galleryLayout.sideCount)
      : [];
  const galleryItems = offsets.map((offset) => {
    const image = getImageAtOffset(galleryImages, offset);

    return {
      image,
      offset,
      width: getImageWidth(image, galleryLayout.itemSize),
    };
  });
  const activeLeft = galleryItems
    .filter((item) => item.offset < 0)
    .reduce((sum, item) => sum + item.width, 0);

  return (
    <RegionElement
      ref={regionRef}
      {...regionProps}
      aria-label={href ? "Open project" : undefined}
      className={[styles.region, className].filter(Boolean).join(" ")}
    >
      {hasGallery ? (
        <article
          ref={galleryRef}
          className={styles.gallery}
          style={{
            "--gallery-active-left": `${activeLeft}px`,
          }}
        >
          <ProjectHeader code={code} title={title} />
          <div className={styles.galleryTrack}>
            {galleryItems.map(({ image, offset, width }) => (
              <div className={styles.galleryItem} key={`${offset}-${image._id}`} style={{ "--gallery-item-width": `${width}px` }}>
                <img
                  alt={image.alt || ""}
                  className={styles.galleryImage}
                  draggable={false}
                  fetchPriority="high"
                  loading="eager"
                  src={image.url}
                />
              </div>
            ))}
          </div>
        </article>
      ) : (
        <article
          ref={previewRef}
          className={[styles.preview, usePortraitPreviewSizing && isPortrait ? styles.portrait : ""].filter(Boolean).join(" ")}
          style={{
            "--preview-background-image": backgroundImage ? `url("${backgroundImage}")` : "none",
            "--preview-media-aspect-ratio": getAspectRatio(foregroundMedium?.aspect_ratio),
          }}
        >
          <ProjectHeader code={code} title={title} />
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
      )}
    </RegionElement>
  );
};

export default ScaleMediaStrip;
