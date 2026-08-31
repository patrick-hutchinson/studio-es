import { LayoutGroup, motion } from "framer-motion";
import { useContext, useEffect, useMemo, useState } from "react";

import { DeviceContext } from "@/context/DeviceContext";
import styles from "./RepeatMediaGrid.module.css";

const DESKTOP_CELL_COUNT = 12;
const MOBILE_CELL_COUNT = 8;
const DESKTOP_COLUMNS = 4;
const DESKTOP_ROWS = 3;
const MOBILE_COLUMNS = 2;
const MOBILE_ROWS = 4;

const RepeatMediaGrid = ({ gallery = [], className = "" }) => {
  const [activeCellIndex, setActiveCellIndex] = useState(null);
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

  const columnCount = isMobile ? MOBILE_COLUMNS : DESKTOP_COLUMNS;
  const rowCount = isMobile ? MOBILE_ROWS : DESKTOP_ROWS;
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
        className={[styles.grid, className].filter(Boolean).join(" ")}
        animate={{
          gridTemplateColumns: columnTemplate,
          gridTemplateRows: rowTemplate,
        }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {repeatedImages.map((image, index) => {
          return (
            <motion.button
              type="button"
              layout
              key={image._repeatKey}
              className={styles.cell}
              onClick={() => setActiveCellIndex((currentIndex) => (currentIndex === index ? null : index))}
              transition={{
                layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <motion.img
                layoutId={`repeat-media-${image._repeatKey}`}
                alt={image.alt || ""}
                className={styles.image}
                draggable={false}
                src={image.url}
              />
            </motion.button>
          );
        })}
      </motion.section>
    </LayoutGroup>
  );
};

export default RepeatMediaGrid;
