"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { urlForRef } from "@/lib/sanity";
import styles from "./ProjectsSlider.module.scss";

function getImageDimensions(ref) {
  const match = ref?.match(/-(\d+)x(\d+)-[^-]+$/);
  if (!match) return null;

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

export default function ProjectsSlider({ items, activeIndex, isActive, onReadyChange }) {
  const MOBILE_BREAKPOINT = 768;
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [pixelRatio, setPixelRatio] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadTimeoutReached, setLoadTimeoutReached] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const nextIsMobile = nextWidth <= MOBILE_BREAKPOINT;
      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      setViewportWidth(nextWidth);
      setViewportHeight(nextHeight);
      setPixelRatio(nextPixelRatio);
      setIsMobileViewport((previousIsMobile) => {
        if (previousIsMobile !== nextIsMobile) {
          return nextIsMobile;
        }

        return previousIsMobile;
      });
    };

    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    setViewportWidth(initialWidth);
    setViewportHeight(initialHeight);
    setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    setIsMobileViewport(initialWidth <= MOBILE_BREAKPOINT);

    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const imageMeta = useMemo(() => {
    return items.map((item) => {
      const ref = item.asset?._ref;
      const dimensions = getImageDimensions(ref);

      return {
        ref,
        isPortrait: dimensions ? dimensions.height > dimensions.width : false,
      };
    });
  }, [items]);

  const imageUrls = useMemo(() => {
    const mobileWidth = Math.max(Math.round(viewportWidth * pixelRatio), viewportWidth);
    const viewportPixelHeight = Math.max(Math.round(viewportHeight * pixelRatio), viewportHeight);

    return imageMeta.map(({ ref, isPortrait }) => {
      if (!ref) return null;

      if (isPortrait) {
        return urlForRef(ref).height(viewportPixelHeight).fit("max").url();
      }

      if (isMobileViewport) {
        return urlForRef(ref).width(mobileWidth).fit("max").url();
      }

      return urlForRef(ref).width(viewportWidth).height(viewportHeight).fit("fill").url();
    });
  }, [imageMeta, isMobileViewport, pixelRatio, viewportHeight, viewportWidth]);

  const validImageUrls = useMemo(() => imageUrls.filter(Boolean), [imageUrls]);
  const totalCount = validImageUrls.length;

  useEffect(() => {
    if (!totalCount) {
      setLoadedCount(0);
      setLoadTimeoutReached(false);
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
  }, [totalCount, validImageUrls]);

  const formatCount = (value) => String(value).padStart(3, "0");
  const yearSuffix = String(new Date().getFullYear()).slice(-2);
  const shouldShowCounter = !isActive && loadTimeoutReached && totalCount > 0 && loadedCount < totalCount;
  const allImagesLoaded = totalCount === 0 || loadedCount >= totalCount;

  useEffect(() => {
    onReadyChange?.(allImagesLoaded);
  }, [allImagesLoaded, onReadyChange]);

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
          const isPortrait = imageMeta[i]?.isPortrait;

          return (
            <div
              key={item._id}
              className={`${styles.slide} ${isPortrait ? styles.slidePortrait : ""} ${
                i === activeIndex ? styles.slideActive : ""
              }`}
              style={{ backgroundImage: allImagesLoaded && imageUrl ? `url(${imageUrl})` : "none" }}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
