import { useEffect, useRef } from "react";

import RenderSVG from "@/components/RenderSVG/RenderSVG";

import styles from "./ScaleText.module.css";

const getPixelValue = (value) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

const getDocumentTop = (element) => element.getBoundingClientRect().top + window.scrollY;

const getVerticalFollowingElement = (region) => {
  const regionTop = getDocumentTop(region);
  let element = region.nextElementSibling;

  while (element) {
    if (getDocumentTop(element) > regionTop) {
      return element;
    }

    element = element.nextElementSibling;
  }

  return null;
};

const getSvgAspectRatio = (svg) => {
  const viewBox = svg?.getAttribute("viewBox")?.split(/\s+/).map(Number);

  if (!viewBox || viewBox.length !== 4) return 0;

  const [, , width, height] = viewBox;

  return width > 0 && height > 0 ? width / height : 0;
};

const ScaleText = ({ text, className = "", fullViewport = false, style, letterSpacing = 0 }) => {
  const regionRef = useRef(null);
  const stageRef = useRef(null);
  const scaleContainerRef = useRef(null);
  const frameRef = useRef(null);
  const loopFrameRef = useRef(null);
  const timeoutRefs = useRef([]);
  const lastHeightRef = useRef("");
  const lastPinnedRef = useRef(false);
  const lastStageHeightRef = useRef("");

  useEffect(() => {
    const updateScaleHeight = () => {
      frameRef.current = null;

      const region = regionRef.current;
      const scaleContainer = scaleContainerRef.current;
      const stage = stageRef.current;
      const followingElement = region ? getVerticalFollowingElement(region) : null;

      if (!region || !scaleContainer || !stage) return;

      const rootStyles = window.getComputedStyle(document.documentElement);
      const regionStyles = window.getComputedStyle(region);
      const margin = getPixelValue(rootStyles.getPropertyValue("--margin"));
      const paddingTop = getPixelValue(regionStyles.paddingTop);
      const verticalPadding = paddingTop + getPixelValue(regionStyles.paddingBottom);
      const pinTop = paddingTop || margin;
      const availableHeight = fullViewport ? window.innerHeight : window.innerHeight - margin * 2;
      // Keep the padded region within the available height instead of adding its block padding on top.
      const maxHeight = Math.max(availableHeight - verticalPadding, 0);
      const contentBottom = fullViewport ? window.innerHeight : window.innerHeight - margin;
      const stageBox = stage.getBoundingClientRect();
      const followingBox = followingElement?.getBoundingClientRect();
      const svg = scaleContainer.querySelector("svg");
      const svgAspectRatio = getSvgAspectRatio(svg);
      const minSvgWidth = svg ? getPixelValue(window.getComputedStyle(svg).minWidth) : 0;
      const minHeight = svgAspectRatio ? minSvgWidth / svgAspectRatio : 0;
      const shrink = followingBox ? Math.max(contentBottom - followingBox.top, 0) : 0;
      const nextHeightValue = Math.min(Math.max(maxHeight - shrink, minHeight), maxHeight);
      const nextHeight = `${nextHeightValue}px`;
      const stageHeight = `${maxHeight}px`;
      const isPinned = stageBox.top <= pinTop && nextHeightValue > 0;

      scaleContainer.style.setProperty("--scale-container-top", `${pinTop}px`);

      if (stageHeight !== lastStageHeightRef.current) {
        stage.style.height = stageHeight;
        lastStageHeightRef.current = stageHeight;
      }

      if (nextHeight !== lastHeightRef.current) {
        scaleContainer.style.height = nextHeight;
        lastHeightRef.current = nextHeight;
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
    const observedElements = [regionRef.current, stageRef.current, scaleContainerRef.current].filter(Boolean);
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
  }, [fullViewport]);

  return (
    <div ref={regionRef} className={[styles.scaleRegion, className].filter(Boolean).join(" ")} style={style}>
      <div ref={stageRef} className={styles.scaleStage}>
        <div ref={scaleContainerRef} className={styles.scaleContainer}>
          <RenderSVG text={text} className={styles.lead} letterSpacing={letterSpacing} />
        </div>
      </div>
    </div>
  );
};

export default ScaleText;
