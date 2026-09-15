import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

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

const ScaleText = forwardRef(function ScaleText(
  { text, className = "", expandOnEnter = false, style, letterSpacing = 0 },
  forwardedRef,
) {
  const regionRef = useRef(null);
  const stageRef = useRef(null);
  const scaleContainerRef = useRef(null);
  const frameRef = useRef(null);
  const revealFrameRef = useRef(null);
  const loopFrameRef = useRef(null);
  const timeoutRefs = useRef([]);
  const lastHeightRef = useRef("");
  const lastPinnedRef = useRef(false);
  const lastStageHeightRef = useRef("");

  useImperativeHandle(forwardedRef, () => regionRef.current);

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
      // The stage plus the region's block padding should always occupy one viewport.
      const intendedStageHeight = Math.max(window.innerHeight - verticalPadding, 0);
      const intendedStageHeightValue = `${intendedStageHeight}px`;

      if (intendedStageHeightValue !== lastStageHeightRef.current) {
        stage.style.height = intendedStageHeightValue;
        lastStageHeightRef.current = intendedStageHeightValue;
      }

      // Respect any layout constraint on the stage before sizing its child container.
      const maxHeight = Math.min(intendedStageHeight, stage.clientHeight);
      const contentBottom = window.innerHeight - margin;
      const shrinkTrigger = contentBottom + pinTop;
      const stageBox = stage.getBoundingClientRect();
      const followingBox = followingElement?.getBoundingClientRect();
      const svg = scaleContainer.querySelector("svg");
      const svgAspectRatio = getSvgAspectRatio(svg);
      const minSvgWidth = svg ? getPixelValue(window.getComputedStyle(svg).minWidth) : 0;
      const minHeight = svgAspectRatio ? minSvgWidth / svgAspectRatio : 0;
      // Begin shrinking one inset before the following module reaches the stage.
      const shrink = followingBox ? Math.max(shrinkTrigger - followingBox.top, 0) : 0;
      const entryProgress = Math.min(Math.max((window.innerHeight - stageBox.top) / Math.max(maxHeight, 1), 0), 1);
      const shrinkingHeight = Math.min(Math.max(maxHeight - shrink, minHeight), maxHeight);
      const expandingHeight = Math.min(Math.max(maxHeight * entryProgress, minHeight), maxHeight);
      const nextHeightValue = expandOnEnter ? expandingHeight : shrinkingHeight;
      const nextHeight = `${nextHeightValue}px`;
      const isPinned = !expandOnEnter && stageBox.top <= pinTop && nextHeightValue > 0;

      scaleContainer.style.setProperty("--scale-container-top", `${pinTop}px`);

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

      if (!region.hasAttribute("data-ready") && maxHeight > 0) {
        // Reveal on the following frame, after the measured geometry can paint once.
        revealFrameRef.current = window.requestAnimationFrame(() => {
          region.setAttribute("data-ready", "");
          revealFrameRef.current = null;
        });
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

      if (revealFrameRef.current) {
        window.cancelAnimationFrame(revealFrameRef.current);
      }

      if (loopFrameRef.current) {
        window.cancelAnimationFrame(loopFrameRef.current);
      }
    };
  }, [expandOnEnter]);

  return (
    <div ref={regionRef} className={[styles.scaleRegion, className].filter(Boolean).join(" ")} style={style}>
      <div ref={stageRef} className={styles.scaleStage}>
        <div ref={scaleContainerRef} className={styles.scaleContainer}>
          <RenderSVG text={text} className={styles.lead} letterSpacing={letterSpacing} />
        </div>
      </div>
    </div>
  );
});

export default ScaleText;
