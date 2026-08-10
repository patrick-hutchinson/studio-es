import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./ShuffleGallery.module.css";

const INTERVAL = 200;
const MIN_SIDE_COUNT = 2;
const MIN_LAYOUT_HEIGHT = 2;

const getPixelValue = (value) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

const getImageAtOffset = (images, index, offset) => {
  const length = images.length;
  const nextIndex = ((index + offset) % length + length) % length;

  return images[nextIndex];
};

const getImageWidth = (image, height) => {
  if (height < MIN_LAYOUT_HEIGHT) return 0;

  const aspectRatio = image.width && image.height ? image.width / image.height : 1;

  return Math.max(height * aspectRatio, MIN_LAYOUT_HEIGHT);
};

const ShuffleGallery = ({ className = "", images = [] }) => {
  const regionRef = useRef(null);
  const galleryRef = useRef(null);
  const loopFrameRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [layout, setLayout] = useState({ itemSize: 0, sideCount: MIN_SIDE_COUNT });

  const visibleImages = useMemo(() => images.filter((image) => image?.url), [images]);
  const canShuffle = visibleImages.length > 1 && layout.itemSize >= MIN_LAYOUT_HEIGHT && !isPaused;

  useEffect(() => {
    if (!canShuffle) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % visibleImages.length);
    }, INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [canShuffle, visibleImages.length]);

  const togglePaused = () => {
    setIsPaused((paused) => !paused);
  };

  useEffect(() => {
    if (!isPaused || visibleImages.length < 2) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();

      setActiveIndex((index) => {
        const direction = event.key === "ArrowRight" ? 1 : -1;

        return (index + direction + visibleImages.length) % visibleImages.length;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaused, visibleImages.length]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return undefined;

    const updateLayout = () => {
      const { width, height } = gallery.getBoundingClientRect();
      const itemSize = height >= MIN_LAYOUT_HEIGHT ? height : 0;

      if (!itemSize) {
        setLayout((current) => {
          if (current.itemSize === 0 && current.sideCount === MIN_SIDE_COUNT) return current;

          return { itemSize: 0, sideCount: MIN_SIDE_COUNT };
        });
        return;
      }

      const minItemWidth = visibleImages.reduce(
        (minWidth, image) => Math.min(minWidth, getImageWidth(image, itemSize)),
        itemSize,
      );
      const sideCount = Math.max(Math.ceil(width / minItemWidth / 2) + 1, MIN_SIDE_COUNT);

      setLayout((current) => {
        if (current.itemSize === itemSize && current.sideCount === sideCount) return current;

        return { itemSize, sideCount };
      });
    };

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(gallery);
    updateLayout();

    return () => {
      resizeObserver.disconnect();
    };
  }, [visibleImages]);

  useEffect(() => {
    const updateGallery = () => {
      const region = regionRef.current;
      const gallery = galleryRef.current;

      if (!region || !gallery) return;

      const rootStyles = window.getComputedStyle(document.documentElement);
      const margin = getPixelValue(rootStyles.getPropertyValue("--margin"));
      const maxHeight = Math.max(window.innerHeight - margin * 2, 0);
      const regionBox = region.getBoundingClientRect();
      const followingBox = region.nextElementSibling?.getBoundingClientRect();
      const followingTop = followingBox?.top ?? window.innerHeight;
      const height = Math.min(Math.max(followingTop - margin, 0), maxHeight);
      const nextHeight = `${height}px`;
      const isPinned = regionBox.top <= margin && regionBox.bottom > margin && height > 0;

      if (gallery.style.height !== nextHeight) {
        gallery.style.height = nextHeight;
      }

      if (gallery.hasAttribute("data-pinned") !== isPinned) {
        gallery.toggleAttribute("data-pinned", isPinned);
      }

      if (isPinned) {
        gallery.style.left = `${regionBox.left}px`;
        gallery.style.width = `${regionBox.width}px`;
      } else {
        gallery.style.left = "";
        gallery.style.width = "";
      }
    };

    const runMeasurementLoop = () => {
      updateGallery();
      loopFrameRef.current = window.requestAnimationFrame(runMeasurementLoop);
    };

    loopFrameRef.current = window.requestAnimationFrame(runMeasurementLoop);

    return () => {
      if (loopFrameRef.current) {
        window.cancelAnimationFrame(loopFrameRef.current);
      }
    };
  }, []);

  if (!visibleImages.length) return null;

  const canRenderStrip = layout.itemSize >= MIN_LAYOUT_HEIGHT;
  const offsets = canRenderStrip
    ? Array.from({ length: layout.sideCount * 2 + 1 }, (_, index) => index - layout.sideCount)
    : [];
  const items = offsets.map((offset) => {
    const image = getImageAtOffset(visibleImages, activeIndex, offset);

    return {
      image,
      offset,
      width: getImageWidth(image, layout.itemSize),
    };
  });
  const activeLeft = canRenderStrip ? items.slice(0, layout.sideCount).reduce((sum, item) => sum + item.width, 0) : 0;

  return (
    <section ref={regionRef} className={[styles.region, className].filter(Boolean).join(" ")}>
      <div
        ref={galleryRef}
        className={styles.gallery}
        data-paused={isPaused ? "" : undefined}
        onClick={togglePaused}
        style={{
          "--shuffle-active-left": `${activeLeft}px`,
          "--shuffle-item-size": `${layout.itemSize}px`,
        }}
      >
        <div className={styles.track}>
          {items.map(({ image, offset, width }) => {
            return (
              <div
                className={styles.item}
                data-active={offset === 0 ? "" : undefined}
                key={`${offset}-${image._id}`}
                style={{ "--shuffle-item-width": `${width}px` }}
              >
                <img alt={image.alt || ""} className={styles.image} draggable={false} src={image.url} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShuffleGallery;
