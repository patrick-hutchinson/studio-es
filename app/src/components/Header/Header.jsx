import { DeviceContext } from "@/context/DeviceContext";
import { useLenisContext } from "@/context/LenisContext";

import styles from "./Header.module.scss";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useState } from "react";

const HEADER_HIDE_THRESHOLD = 30;

const Header = ({ site = {} }) => {
  const { isMobile } = useContext(DeviceContext);
  const lenis = useLenisContext();
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(false);

  const updateVisibility = useCallback(() => {
    const shouldHide = [...document.querySelectorAll("[hide-header]")].some((element) => {
      const { top, bottom } = element.getBoundingClientRect();
      const topIsNearViewportTop = Math.abs(top) <= HEADER_HIDE_THRESHOLD;
      const overlapsViewportTop = top < 0 && bottom > 0;

      return topIsNearViewportTop || overlapsViewportTop;
    });

    setIsHidden((previous) => (previous === shouldHide ? previous : shouldHide));
  }, []);

  useEffect(() => {
    let frameId;
    const scheduleVisibilityUpdate = () => {
      if (frameId !== undefined) return;

      frameId = requestAnimationFrame(() => {
        frameId = undefined;
        updateVisibility();
      });
    };

    // Markers mount with the page transition, so watch the route and its DOM updates.
    const observer = new MutationObserver(scheduleVisibilityUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    const unsubscribe = lenis?.on?.("scroll", scheduleVisibilityUpdate);
    window.addEventListener("scroll", scheduleVisibilityUpdate, { passive: true });
    window.addEventListener("resize", scheduleVisibilityUpdate);
    scheduleVisibilityUpdate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleVisibilityUpdate);
      window.removeEventListener("resize", scheduleVisibilityUpdate);

      if (typeof unsubscribe === "function") {
        unsubscribe();
      } else {
        lenis?.off?.("scroll", scheduleVisibilityUpdate);
      }
    };
  }, [lenis, router.asPath, updateVisibility]);

  const DesktopNav = () => {
    return (
      <nav className={`${styles.nav} grid`}>
        <Link href="/studio">The Studio</Link>
        <Link href="/id">The ID</Link>
        <Link href="/studio?contact=1">Contact</Link>
      </nav>
    );
  };

  const MobileNav = () => {
    return <nav className={styles.nav}></nav>;
  };

  return (
    <motion.header
      animate={{ y: isHidden ? "-100%" : "0%" }}
      className={`${styles.header} grid`}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      typo="h3"
    >
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </motion.header>
  );
};

export default Header;
