import { motion } from "framer-motion";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { DeviceContext } from "@/context/DeviceContext";
import styles from "./RepeatMediaGrid.module.css";

const DESKTOP_CELL_COUNT = 12;
const MOBILE_CELL_COUNT = 8;
const DESKTOP_COLUMNS = 4;
const DESKTOP_ROWS = 3;
const MOBILE_COLUMNS = 2;
const MOBILE_ROWS = 4;
const LOOP_COPY_COUNT = 3;
const CELL_TRANSITION_DURATION = 550;

const RepeatMediaGrid = ({ gallery = [], className = "" }) => {
  const [activeCell, setActiveCell] = useState(null);
  const [isAligningCell, setIsAligningCell] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const { isMobile } = useContext(DeviceContext);
  const viewportRef = useRef(null);
  const alignmentRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const openCellTimerRef = useRef(null);
  const dragRef = useRef(null);
  const inertiaFrameRef = useRef(null);
  const suppressClickRef = useRef(false);
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

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollLeft = viewport.scrollWidth / LOOP_COPY_COUNT;
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      window.clearTimeout(openCellTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || isAligningCell) return undefined;

    const repeatTrack = () => {
      const constellationWidth = viewport.scrollWidth / LOOP_COPY_COUNT;

      if (viewport.scrollLeft < constellationWidth * 0.5) {
        viewport.scrollLeft += constellationWidth;
      } else if (viewport.scrollLeft > constellationWidth * 1.5) {
        viewport.scrollLeft -= constellationWidth;
      }
    };

    viewport.addEventListener("scroll", repeatTrack, { passive: true });
    return () => viewport.removeEventListener("scroll", repeatTrack);
  }, [isAligningCell]);

  useEffect(() => {
    if (!isAligningCell) return undefined;

    const viewport = viewportRef.current;
    const alignment = alignmentRef.current;
    if (!viewport || !alignment) return undefined;

    const finishAlignment = () => {
      window.clearTimeout(scrollEndTimerRef.current);
      setActiveCell({ copyIndex: alignment.copyIndex, index: alignment.index });
      setIsAligningCell(false);
    };
    const waitForScrollToSettle = () => {
      window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = window.setTimeout(finishAlignment, 120);
    };

    viewport.addEventListener("scroll", waitForScrollToSettle, { passive: true });
    viewport.scrollTo({ left: alignment.left, behavior: "smooth" });
    waitForScrollToSettle();

    return () => {
      viewport.removeEventListener("scroll", waitForScrollToSettle);
      window.clearTimeout(scrollEndTimerRef.current);
    };
  }, [isAligningCell]);

  useEffect(() => {
    if (activeCell === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveCell(null);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveCell((currentCell) => {
          if (currentCell === null) return currentCell;
          return {
            ...currentCell,
            index: (currentCell.index - 1 + repeatedImages.length) % repeatedImages.length,
          };
        });
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActiveCell((currentCell) => {
          if (currentCell === null) return currentCell;
          return {
            ...currentCell,
            index: (currentCell.index + 1) % repeatedImages.length,
          };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCell, repeatedImages.length]);

  if (!repeatedImages.length) return null;

  const openCell = (copyIndex, index, event) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (activeCell?.copyIndex === copyIndex && activeCell.index === index) {
      setActiveCell(null);
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;
    const cell = event.currentTarget;
    const startAlignment = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();

      alignmentRef.current = {
        copyIndex,
        index,
        left: viewport.scrollLeft + cellRect.left - viewportRect.left,
      };
      setIsAligningCell(true);
    };

    if (activeCell !== null || isAligningCell) {
      closeActiveCellForInteraction();
      window.clearTimeout(openCellTimerRef.current);
      openCellTimerRef.current = window.setTimeout(() => {
        startAlignment();
      }, CELL_TRANSITION_DURATION);
      return;
    }

    startAlignment();
  };

  const stopInertia = () => {
    window.cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = null;
  };

  const closeActiveCellForInteraction = () => {
    if (activeCell === null && !isAligningCell) return false;

    const viewport = viewportRef.current;

    if (isAligningCell && viewport) {
      viewport.scrollTo({ left: viewport.scrollLeft, behavior: "auto" });
    }

    window.clearTimeout(scrollEndTimerRef.current);
    window.clearTimeout(openCellTimerRef.current);
    alignmentRef.current = null;
    setActiveCell(null);
    setIsAligningCell(false);

    return true;
  };

  const startInertia = (initialVelocity) => {
    const viewport = viewportRef.current;
    if (!viewport || Math.abs(initialVelocity) < 0.01) return;

    let velocity = initialVelocity;
    let previousTime = window.performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - previousTime;
      previousTime = currentTime;
      viewport.scrollLeft += velocity * elapsed;
      velocity *= Math.pow(0.92, elapsed / 16.67);

      if (Math.abs(velocity) < 0.01) {
        inertiaFrameRef.current = null;
        return;
      }

      inertiaFrameRef.current = window.requestAnimationFrame(animate);
    };

    inertiaFrameRef.current = window.requestAnimationFrame(animate);
  };

  const beginDrag = (event) => {
    const viewport = viewportRef.current;
    if (!viewport || event.pointerType !== "mouse") return;

    const isCellInteraction = event.target.closest(`.${styles.cell}`);
    const closedActiveCell = isCellInteraction ? false : closeActiveCellForInteraction();

    stopInertia();

    // Do not retain a previous drag's suppression state for the next click.
    suppressClickRef.current = closedActiveCell;
    dragRef.current = {
      lastScrollLeft: viewport.scrollLeft,
      lastTime: window.performance.now(),
      moved: false,
      startScrollLeft: viewport.scrollLeft,
      startX: event.clientX,
      velocity: 0,
    };
  };

  const drag = (event) => {
    const viewport = viewportRef.current;
    const dragState = dragRef.current;
    if (!viewport || !dragState) return;

    const distance = event.clientX - dragState.startX;
    const nextScrollLeft = dragState.startScrollLeft - distance;
    const currentTime = window.performance.now();
    const elapsed = currentTime - dragState.lastTime;

    if (Math.abs(distance) > 4 && !dragState.moved) {
      dragState.moved = true;

      if (closeActiveCellForInteraction()) {
        suppressClickRef.current = true;
      }
    }
    viewport.scrollLeft = nextScrollLeft;

    if (elapsed > 0) {
      dragState.velocity = (nextScrollLeft - dragState.lastScrollLeft) / elapsed;
      dragState.lastScrollLeft = nextScrollLeft;
      dragState.lastTime = currentTime;
    }
  };

  const endDrag = () => {
    const viewport = viewportRef.current;
    const dragState = dragRef.current;
    if (!viewport || !dragState) return;

    suppressClickRef.current = suppressClickRef.current || dragState.moved;
    dragRef.current = null;

    if (dragState.moved) startInertia(dragState.velocity);
  };

  const activeColumn = activeCell === null ? null : activeCell.index % columnCount;
  const activeRow = activeCell === null ? null : Math.floor(activeCell.index / columnCount);
  const defaultColumnWidth = `${100 / columnCount}vw`;
  const defaultRowHeight = `${100 / rowCount}%`;
  const activeMedium = activeCell === null ? null : repeatedImages[activeCell.index];
  const activeAspectRatio = Number(activeMedium?.width) / Number(activeMedium?.height);
  const activeMediaWidth = Number.isFinite(activeAspectRatio) && viewportSize.height > 0
    ? Math.min(viewportSize.width, viewportSize.height * activeAspectRatio)
    : null;
  const expandedGridWidth = activeMediaWidth === null
    ? "100vw"
    : `calc(100vw - ${defaultColumnWidth} + ${activeMediaWidth}px)`;

  return (
    <section
      ref={viewportRef}
      className={[styles.viewport, className].filter(Boolean).join(" ")}
      onPointerDown={beginDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div className={styles.track}>
        {Array.from({ length: LOOP_COPY_COUNT }, (_, copyIndex) => {
          const isActiveGrid = activeCell?.copyIndex === copyIndex;

          return (
            <motion.div
              key={copyIndex}
              className={styles.grid}
              data-expanded={isActiveGrid ? "" : undefined}
              animate={{ width: isActiveGrid ? expandedGridWidth : "100vw" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {Array.from({ length: columnCount }, (_, columnIndex) => {
                const isActiveColumn = isActiveGrid && activeColumn === columnIndex;

                return (
                  <motion.div
                    key={columnIndex}
                    className={styles.column}
                    animate={{ width: isActiveColumn && activeMediaWidth !== null ? `${activeMediaWidth}px` : defaultColumnWidth }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {Array.from({ length: rowCount }, (_, rowIndex) => {
                      const index = rowIndex * columnCount + columnIndex;
                      const image = repeatedImages[index];
                      const isActiveCell = isActiveColumn && activeRow === rowIndex;

                      return (
                        <motion.button
                          type="button"
                          key={image._repeatKey}
                          className={styles.cell}
                          data-active={isActiveCell ? "" : undefined}
                          onClick={(event) => openCell(copyIndex, index, event)}
                          animate={{ height: isActiveColumn ? (isActiveCell ? "100%" : "0%") : defaultRowHeight }}
                          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <img
                            alt={image.alt || ""}
                            className={styles.image}
                            draggable={false}
                            src={image.url}
                          />
                        </motion.button>
                      );
                    })}
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default RepeatMediaGrid;
