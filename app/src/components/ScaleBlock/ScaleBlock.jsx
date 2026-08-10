import { useEffect, useRef } from "react";

import styles from "./ScaleBlock.module.css";

const getPixelValue = (value) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

const getDocumentTop = (element) => element.getBoundingClientRect().top + window.scrollY;

const getVerticalFollowingElement = (region) => {
  const regionTop = getDocumentTop(region);
  let element = region;

  while (element) {
    let sibling = element.nextElementSibling;

    while (sibling) {
      if (getDocumentTop(sibling) > regionTop) {
        return sibling;
      }

      sibling = sibling.nextElementSibling;
    }

    element = element.parentElement;
  }

  return null;
};

const ScaleBlock = ({ children, className = "", contentClassName = "", scaleContent = false, style }) => {
  const regionRef = useRef(null);
  const stageRef = useRef(null);
  const scaleContainerRef = useRef(null);
  const contentRef = useRef(null);
  const frameRef = useRef(null);
  const loopFrameRef = useRef(null);
  const timeoutRefs = useRef([]);
  const lastHeightRef = useRef("");
  const lastPinnedRef = useRef(false);
  const lastScaleRef = useRef("");
  const lastStageHeightRef = useRef("");

  useEffect(() => {
    const updateScaleHeight = () => {
      frameRef.current = null;

      const region = regionRef.current;
      const scaleContainer = scaleContainerRef.current;
      const stage = stageRef.current;
      const content = contentRef.current;
      const followingElement = region ? getVerticalFollowingElement(region) : null;

      if (!region || !scaleContainer || !stage) return;

      const rootStyles = window.getComputedStyle(document.documentElement);
      const margin = getPixelValue(rootStyles.getPropertyValue("--margin"));
      const stageBox = stage.getBoundingClientRect();
      const followingBox = followingElement?.getBoundingClientRect();
      const baseHeight = Math.max(content?.scrollHeight || content?.getBoundingClientRect().height || 0, 0);
      const baseHeightValue = `${baseHeight}px`;
      const pinnedBottom = margin + baseHeight;
      const shrink = followingBox ? Math.max(pinnedBottom - followingBox.top, 0) : 0;
      const nextHeightValue = Math.min(Math.max(baseHeight - shrink, 0), baseHeight);
      const nextHeight = `${nextHeightValue}px`;
      const nextScale = baseHeight ? Math.max(nextHeightValue / baseHeight, 0) : 0;
      const isPinned = stageBox.top <= margin && nextHeightValue > 0;

      if (baseHeightValue !== lastStageHeightRef.current) {
        stage.style.height = baseHeightValue;
        lastStageHeightRef.current = baseHeightValue;
      }

      if (nextHeight !== lastHeightRef.current) {
        scaleContainer.style.height = nextHeight;
        lastHeightRef.current = nextHeight;
      }

      if (scaleContent && content) {
        const scaleValue = `${nextScale}`;

        if (scaleValue !== lastScaleRef.current) {
          content.style.setProperty("--scale-progress", scaleValue);
          lastScaleRef.current = scaleValue;
        }
      }

      if (isPinned !== lastPinnedRef.current) {
        scaleContainer.toggleAttribute("data-pinned", isPinned);
        lastPinnedRef.current = isPinned;
      }

      if (isPinned) {
        scaleContainer.style.left = `${stageBox.left}px`;
        scaleContainer.style.width = `${stageBox.width}px`;
      } else {
        scaleContainer.style.left = "";
        scaleContainer.style.width = "";
      }
    };

    const scheduleUpdate = () => {
      if (frameRef.current) return;

      frameRef.current = window.requestAnimationFrame(updateScaleHeight);
    };

    const scheduleSettledUpdates = () => {
      scheduleUpdate();

      for (let index = 0; index < 3; index += 1) {
        window.requestAnimationFrame(scheduleUpdate);
      }

      timeoutRefs.current = [100, 300, 600].map((delay) => window.setTimeout(scheduleUpdate, delay));
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    const observedElements = [regionRef.current, stageRef.current, scaleContainerRef.current, contentRef.current].filter(Boolean);
    const runMeasurementLoop = () => {
      updateScaleHeight();
      loopFrameRef.current = window.requestAnimationFrame(runMeasurementLoop);
    };

    observedElements.forEach((element) => resizeObserver.observe(element));
    scheduleSettledUpdates();
    loopFrameRef.current = window.requestAnimationFrame(runMeasurementLoop);

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
      timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
      timeoutRefs.current = [];

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (loopFrameRef.current) {
        window.cancelAnimationFrame(loopFrameRef.current);
      }
    };
  }, [scaleContent]);

  return (
    <div ref={regionRef} className={[styles.scaleRegion, className].filter(Boolean).join(" ")} style={style}>
      <div ref={stageRef} className={styles.scaleStage}>
        <div ref={scaleContainerRef} className={styles.scaleContainer}>
          <div
            ref={contentRef}
            className={[styles.scaleContent, scaleContent ? styles.scaleContentTransform : "", contentClassName].filter(Boolean).join(" ")}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleBlock;
