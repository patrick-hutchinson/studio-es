"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { getVideoFrameUrls } from "@/lib/media/getVideoFrameUrls";

import styles from "./VideoFrameStrip.module.css";

const EXTRA_FRAME_COUNT = 1;

const getAspectRatio = (value) => {
  const [width, height] = (value || "16:9").split(":").map(Number);

  return Number.isFinite(width) && Number.isFinite(height) && height > 0 ? { width, height } : { width: 16, height: 9 };
};

const VideoFrameStrip = ({ medium }) => {
  const stripRef = useRef(null);
  const frames = getVideoFrameUrls(medium);
  const [repeatCount, setRepeatCount] = useState(1);
  const { width: aspectWidth, height: aspectHeight } = getAspectRatio(medium?.aspect_ratio);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip || !frames.length) return undefined;

    const updateRepeatCount = () => {
      const { width, height } = strip.getBoundingClientRect();
      const frameWidth = height * (aspectWidth / aspectHeight);
      const requiredFrameCount = frameWidth > 0 ? Math.ceil(width / frameWidth) + EXTRA_FRAME_COUNT : frames.length;
      const nextRepeatCount = Math.max(1, Math.ceil(requiredFrameCount / frames.length));

      setRepeatCount((current) => (current === nextRepeatCount ? current : nextRepeatCount));
    };

    const resizeObserver = new ResizeObserver(updateRepeatCount);
    resizeObserver.observe(strip);
    updateRepeatCount();

    return () => resizeObserver.disconnect();
  }, [aspectHeight, aspectWidth, frames.length]);

  if (!frames.length) return null;

  const repeatedFrames = Array.from({ length: repeatCount }, () => frames).flat();

  return (
    <div
      ref={stripRef}
      className={styles.strip}
      aria-hidden="true"
      style={{ "--video-frame-aspect-ratio": `${aspectWidth} / ${aspectHeight}` }}
    >
      {repeatedFrames.map((src, index) => (
        <img
          alt=""
          className={styles.frame}
          key={`${src}-${index}`}
          src={src}
          loading="eager"
          fetchPriority={index < 3 ? "high" : "auto"}
        />
      ))}
    </div>
  );
};

export default VideoFrameStrip;
