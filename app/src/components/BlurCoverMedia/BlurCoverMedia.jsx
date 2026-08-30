import { useEffect, useRef } from "react";

import { useLenisContext } from "@/context/LenisContext";
import styles from "./BlurCoverMedia.module.css";
import MediaSpotlight from "../MediaSpotlight/MediaSpotlight";

const MAX_BLUR = 50;
const MAX_BRIGHTNESS_INCREASE = 0.5;

const BlurCoverMedia = ({ medium, className = "" }) => {
  const rootRef = useRef(null);
  const lenis = useLenisContext();

  useEffect(() => {
    const updateBlur = () => {
      const root = rootRef.current;

      if (!root) {
        root?.style.setProperty("--blur-amount", "0px");
        root?.style.setProperty("--brightness-amount", "1");
        return;
      }

      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1);
      root.style.setProperty("--blur-amount", `${progress * MAX_BLUR}px`);
      root.style.setProperty("--brightness-amount", `${1 + progress * MAX_BRIGHTNESS_INCREASE}`);
    };

    updateBlur();

    const unsubscribe = lenis?.on?.("scroll", updateBlur);
    window.addEventListener("scroll", updateBlur, { passive: true });
    window.addEventListener("resize", updateBlur);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      } else {
        lenis?.off?.("scroll", updateBlur);
      }

      window.removeEventListener("scroll", updateBlur);
      window.removeEventListener("resize", updateBlur);
    };
  }, [lenis]);

  if (!medium) return null;

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} aria-hidden="true">
      <div className={styles.mediaFrame}>
        {/* <Media className={styles.media} eager medium={medium} objectFit="contain" /> */}
        <MediaSpotlight medium={medium} />
      </div>
    </div>
  );
};

export default BlurCoverMedia;
