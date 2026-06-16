"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { urlForRef } from "@/lib/sanity";
import styles from "./Slideshow.module.scss";

function getImageDimensions(ref) {
  const match = ref?.match(/-(\d+)x(\d+)-[^-]+$/);
  if (!match) return null;

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

function shouldFitHeight(dimensions, viewportSize) {
  if (!dimensions || !viewportSize.width || !viewportSize.height) return true;

  const imageRatio = dimensions.width / dimensions.height;
  const viewportRatio = viewportSize.width / viewportSize.height;

  return imageRatio <= viewportRatio;
}

export default function Slideshow({ items, activeIndex, isActive, onReadyChange }) {
  const MOBILE_BREAKPOINT = 768;
  const [viewportSize, setViewportSize] = useState({
    width: 1920,
    height: 1080,
  });
  const [requestedSize, setRequestedSize] = useState({
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    isMobileViewport: false,
  });
  const [renderedImageUrls, setRenderedImageUrls] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadTimeoutReached, setLoadTimeoutReached] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const nextIsMobile = nextWidth <= MOBILE_BREAKPOINT;
      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      setViewportSize({
        width: nextWidth,
        height: nextHeight,
      });

      setRequestedSize((previousSize) => {
        const crossedBreakpoint = previousSize.isMobileViewport !== nextIsMobile;
        const needsLargerSource =
          nextWidth > previousSize.width || nextHeight > previousSize.height || nextPixelRatio > previousSize.pixelRatio;

        if (!crossedBreakpoint && !needsLargerSource) {
          return previousSize;
        }

        return {
          width: crossedBreakpoint ? nextWidth : Math.max(previousSize.width, nextWidth),
          height: crossedBreakpoint ? nextHeight : Math.max(previousSize.height, nextHeight),
          pixelRatio: Math.max(previousSize.pixelRatio, nextPixelRatio),
          isMobileViewport: nextIsMobile,
        };
      });
    };

    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    setViewportSize({
      width: initialWidth,
      height: initialHeight,
    });
    setRequestedSize({
      width: initialWidth,
      height: initialHeight,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      isMobileViewport: initialWidth <= MOBILE_BREAKPOINT,
    });

    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const imageMeta = useMemo(() => {
    return items.map((item) => {
      const ref = item.asset?._ref;
      const dimensions = getImageDimensions(ref);

      return {
        ref,
        dimensions,
      };
    });
  }, [items]);

  const imageUrls = useMemo(() => {
    const viewportPixelWidth = Math.max(Math.round(requestedSize.width * requestedSize.pixelRatio), requestedSize.width);
    const viewportPixelHeight = Math.max(Math.round(requestedSize.height * requestedSize.pixelRatio), requestedSize.height);

    return imageMeta.map(({ ref, dimensions }) => {
      if (!ref) return null;

      if (shouldFitHeight(dimensions, requestedSize)) {
        return urlForRef(ref).height(viewportPixelHeight).fit("max").url();
      }

      return urlForRef(ref).width(viewportPixelWidth).fit("max").url();
    });
  }, [imageMeta, requestedSize]);

  const validImageUrls = useMemo(() => imageUrls.filter(Boolean), [imageUrls]);
  const preloadKey = useMemo(() => validImageUrls.join("\n"), [validImageUrls]);
  const totalCount = validImageUrls.length;

  useEffect(() => {
    if (!totalCount) {
      setLoadedCount(0);
      setLoadTimeoutReached(false);
      setRenderedImageUrls([]);
      return;
    }

    let cancelled = false;
    const settled = new Set();
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setLoadTimeoutReached(true);
      }
    }, 2000);

    setLoadedCount(0);
    setLoadTimeoutReached(false);

    const markSettled = (index) => {
      if (cancelled || settled.has(index)) return;
      settled.add(index);
      setLoadedCount(settled.size);

      if (settled.size >= totalCount) {
        setRenderedImageUrls(imageUrls);
      }
    };

    validImageUrls.forEach((url, index) => {
      const img = new Image();
      const markAfterDecode = () => {
        if (typeof img.decode === "function") {
          img
            .decode()
            .catch(() => undefined)
            .finally(() => markSettled(index));
          return;
        }

        markSettled(index);
      };

      img.onload = () => markAfterDecode();
      img.onerror = () => markSettled(index);
      img.src = url;

      if (img.complete) {
        if (img.naturalWidth > 0) {
          markAfterDecode();
        } else {
          markSettled(index);
        }
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [preloadKey, totalCount]);

  const formatCount = (value) => String(value).padStart(3, "0");
  const yearSuffix = String(new Date().getFullYear()).slice(-2);
  const hasRenderedImages = renderedImageUrls.some(Boolean);
  const shouldShowCounter =
    !hasRenderedImages && !isActive && loadTimeoutReached && totalCount > 0 && loadedCount < totalCount;
  const allImagesLoaded = totalCount === 0 || loadedCount >= totalCount;

  useEffect(() => {
    onReadyChange?.(hasRenderedImages || allImagesLoaded);
  }, [allImagesLoaded, hasRenderedImages, onReadyChange]);

  return (
    <motion.section
      className={styles.imgs}
      aria-hidden={isActive}
      animate={{ opacity: isActive ? 0 : 1 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      style={{
        pointerEvents: "none",
      }}
    >
      {shouldShowCounter ? (
        <div className={styles.counter}>
          Id–{formatCount(loadedCount)}–{yearSuffix}
        </div>
      ) : null}

      <div className={styles.imageWrapper}>
        {items.map((item, i) => {
          const imageUrl = imageUrls[i];
          const renderedImageUrl = renderedImageUrls[i] ?? (allImagesLoaded ? imageUrl : null);
          const fitHeight = shouldFitHeight(imageMeta[i]?.dimensions, viewportSize);

          return (
            <div
              key={item._id}
              className={`${styles.slide} ${fitHeight ? styles.slideFitHeight : styles.slideFitWidth} ${
                i === activeIndex ? styles.slideActive : ""
              }`}
              style={{ backgroundImage: renderedImageUrl ? `url(${renderedImageUrl})` : "none" }}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
