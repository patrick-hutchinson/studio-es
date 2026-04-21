"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { urlForRef } from "@/lib/sanity";
import styles from "./ProjectsSlider.module.scss";

export default function ProjectsSlider({ items, activeIndex, isActive, onReadyChange }) {
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadTimeoutReached, setLoadTimeoutReached] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const imageUrls = useMemo(() => {
    return items.map((item) => {
      const ref = item.asset?._ref;
      if (!ref) return null;
      return urlForRef(ref).width(viewportWidth).height(viewportHeight).fit("fill").url();
    });
  }, [items, viewportHeight, viewportWidth]);

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
          img.decode().catch(() => undefined).finally(() => markSettled(index));
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
  const shouldShowCounter = !isActive && loadTimeoutReached && totalCount > 0 && loadedCount < totalCount;
  const allImagesLoaded = totalCount === 0 || loadedCount >= totalCount;

  useEffect(() => {
    onReadyChange?.(allImagesLoaded);
  }, [allImagesLoaded, onReadyChange]);

  return (
    <motion.section
      className={styles.imgs}
      animate={{ opacity: isActive ? 0 : 1 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {shouldShowCounter ? (
        <div className={styles.counter}>P-{formatCount(loadedCount)}-{formatCount(totalCount)}</div>
      ) : null}

      <div className={styles.imageWrapper}>
        {items.map((item, i) => {
          const imageUrl = imageUrls[i];

          return (
            <div
              key={item._id}
              className={`${styles.slide} ${i === activeIndex ? styles.slideActive : ""}`}
              style={{ backgroundImage: allImagesLoaded && imageUrl ? `url(${imageUrl})` : "none" }}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
