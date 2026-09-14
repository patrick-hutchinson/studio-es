import { useEffect } from "react";

import styles from "./Snap.module.css";

const SnapContainer = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;

    // Snap the page's natural scroll position instead of creating a nested scroll area.
    root.classList.remove("lenis", "lenis-stopped", "lenis-locked", "lenis-scrolling", "lenis-smooth");
    root.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
    root.classList.add(styles.nativeScroll);

    return () => root.classList.remove(styles.nativeScroll);
  }, []);

  return children;
};

export default SnapContainer;
