import { LayoutGroup, motion } from "framer-motion";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { DeviceContext } from "@/context/DeviceContext";
import Placeholder from "@/components/Media/components/Placeholder";
import styles from "./RepeatMediaGrid.module.css";

const DESKTOP_CELL_COUNT = 12;
const MOBILE_CELL_COUNT = 8;
const DESKTOP_COLUMNS = 4;
const DESKTOP_ROWS = 3;
const MOBILE_COLUMNS = 2;
const MOBILE_ROWS = 4;

const getCoverScale = (image, cellAspectRatio) => {
  const imageAspectRatio = image.width && image.height ? image.width / image.height : 1;

  return Math.max(cellAspectRatio / imageAspectRatio, imageAspectRatio / cellAspectRatio, 1);
};

const RepeatMediaGrid = ({ gallery = [], className = "" }) => {
  const gridRef = useRef(null);
  const [activeCellIndex, setActiveCellIndex] = useState(null);
  const [pendingCellIndex, setPendingCellIndex] = useState(null);
  const [cellAspectRatio, setCellAspectRatio] = useState(1);
  const { isMobile } = useContext(DeviceContext);
  const images = useMemo(() => gallery.filter((item) => item?.url), [gallery]);

  const repeatedImages = useMemo(() => {
    if (!images.length) return [];

    const targetCount = isMobile ? MOBILE_CELL_COUNT : DESKTOP_CELL_COUNT;

    return Array.from({ length: targetCount }, (_, index) => {
      const image = images[index % images.length];

      return {
        ...image,
        _repeatKey: `${image._id}-${index}`,
      };
    });
  }, [images, isMobile]);

  const columnCount = isMobile ? MOBILE_COLUMNS : DESKTOP_COLUMNS;
  const rowCount = isMobile ? MOBILE_ROWS : DESKTOP_ROWS;

  useLayoutEffect(() => {
    if (activeCellIndex !== null) return undefined;

    const grid = gridRef.current;
    if (!grid) return undefined;

    const updateCellAspectRatio = () => {
      const { height, width } = grid.getBoundingClientRect();
      const nextCellAspectRatio = height > 0 ? (width / columnCount) / (height / rowCount) : 1;

      setCellAspectRatio((current) => (current === nextCellAspectRatio ? current : nextCellAspectRatio));
    };

    const resizeObserver = new ResizeObserver(updateCellAspectRatio);
    resizeObserver.observe(grid);
    updateCellAspectRatio();

    return () => resizeObserver.disconnect();
  }, [activeCellIndex, columnCount, rowCount]);

  useEffect(() => {
    if (activeCellIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveCellIndex(null);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveCellIndex((currentIndex) => {
          if (currentIndex === null) return currentIndex;
          return (currentIndex - 1 + repeatedImages.length) % repeatedImages.length;
        });
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActiveCellIndex((currentIndex) => {
          if (currentIndex === null) return currentIndex;
          return (currentIndex + 1) % repeatedImages.length;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCellIndex, repeatedImages.length]);

  if (!repeatedImages.length) return null;

  const pendingImage = pendingCellIndex === null ? null : repeatedImages[pendingCellIndex];

  const openCell = (index) => {
    if (activeCellIndex === index) {
      setActiveCellIndex(null);
      return;
    }

    if (pendingCellIndex !== null) return;

    setPendingCellIndex(index);
  };

  const revealPendingCell = (index) => {
    setActiveCellIndex(index);
    setPendingCellIndex(null);
  };

  const activeColumn = activeCellIndex === null ? null : activeCellIndex % columnCount;
  const activeRow = activeCellIndex === null ? null : Math.floor(activeCellIndex / columnCount);
  const columnTemplate = Array.from({ length: columnCount }, (_, index) =>
    activeColumn === null ? "1fr" : index === activeColumn ? "1fr" : "0fr",
  ).join(" ");
  const rowTemplate = Array.from({ length: rowCount }, (_, index) =>
    activeRow === null ? "1fr" : index === activeRow ? "1fr" : "0fr",
  ).join(" ");

  return (
    <LayoutGroup>
      <motion.section
        ref={gridRef}
        className={[styles.grid, className].filter(Boolean).join(" ")}
        data-expanded={activeCellIndex === null ? undefined : ""}
        animate={{
          gridTemplateColumns: columnTemplate,
          gridTemplateRows: rowTemplate,
        }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {pendingImage ? (
          <div className={styles.placeholderPreload} aria-hidden="true">
            <Placeholder
              key={pendingImage._repeatKey}
              medium={pendingImage}
              persistent
              onError={() => revealPendingCell(pendingCellIndex)}
              onLoad={() => revealPendingCell(pendingCellIndex)}
            />
          </div>
        ) : null}
        {repeatedImages.map((image, index) => {
          return (
              <motion.button
                type="button"
                layout
                key={image._repeatKey}
                className={styles.cell}
                data-active={activeCellIndex === index ? "" : undefined}
                onClick={() => openCell(index)}
              transition={{
                layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              }}
              >
                {activeCellIndex === index ? <Placeholder className={styles.placeholder} medium={image} persistent /> : null}
                <motion.img
                  layoutId={`repeat-media-${image._repeatKey}`}
                alt={image.alt || ""}
                  className={styles.image}
                  draggable={false}
                  src={image.url}
                  animate={{ scale: activeCellIndex === index ? 1 : getCoverScale(image, cellAspectRatio) }}
                  initial={false}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
            </motion.button>
          );
        })}
      </motion.section>
    </LayoutGroup>
  );
};

export default RepeatMediaGrid;
