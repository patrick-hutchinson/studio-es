"use client";

import { useEffect, useState } from "react";
import { urlForRef } from "@/lib/sanity";
import styles from "./Storyboard.module.scss";

function adjustSizeMobile(size, factor = 0.5) {
  return Math.min(100, Math.round(size + (100 - size) * factor));
}

export default function ProjectsGallery({ items, onIndexChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      if (autoRotate) {
        setCurrentIndex((value) => (value + 1) % items.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRotate, items.length]);

  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  if (!items.length) return null;

  const nextImage = () => {
    setAutoRotate(false);
    setCurrentIndex((value) => (value + 1) % items.length);
  };

  return (
    <section className={styles.section} onClick={nextImage}>
      {items.map((item, i) => {
        const ref = item.asset?._ref;
        const url = ref
          ? urlForRef(ref).width(1280).fit("clip").url()
          : item.video?.asset?.data?.playback_ids?.[0]?.id
            ? `https://image.mux.com/${item.video.asset.data.playback_ids[0].id}/storyboard.webp`
            : "";

        let backgroundSize = "auto";
        let backgroundRepeat = "repeat";

        if (item.size === "fullscreen") {
          backgroundSize = "cover";
          backgroundRepeat = "no-repeat";
        } else if (item.size === "size-100") {
          backgroundSize = "contain";
          backgroundRepeat = "repeat";
        } else if (item.size?.startsWith("size-")) {
          const baseFactor = Number.parseInt(item.size.replace("size-", ""), 10) || 100;
          const effectiveFactor = isMobile ? adjustSizeMobile(baseFactor, 0.5) : baseFactor;
          backgroundSize = `${effectiveFactor}% auto`;
          backgroundRepeat = "repeat";
        }

        return (
          <div key={item._id} className={`${styles.img} ${i === currentIndex ? styles.visible : ""}`}>
            <div
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize,
                backgroundRepeat,
                backgroundPosition: "top left",
              }}
            />
          </div>
        );
      })}
    </section>
  );
}
