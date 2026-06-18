"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MainNav from "@/components/Main/MainNav";
import Slideshow from "@/components/Slideshow/Slideshow";
import Text from "@/components/Text/Text";

import styles from "./LandingPage.module.scss";

export default function LandingPage({ data }) {
  const [showIndex, setShowIndex] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [colors, setColors] = useState({ font: "#fff", background: "#000" });
  const [sliderReady, setSliderReady] = useState(false);
  const [hasMeasuredIntro, setHasMeasuredIntro] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [introNeedsScroll, setIntroNeedsScroll] = useState(false);
  const [introScrolledToEnd, setIntroScrolledToEnd] = useState(true);
  const indexEl = useRef(null);
  const introEl = useRef(null);

  const sliderItems = useMemo(() => {
    return (data?.home?.images ?? []).filter((item) => item?.asset?._ref);
  }, [data?.home?.images]);

  const randomColors = useCallback(() => {
    const items = data?.projects ?? [];
    if (!items.length) return;

    const appearance = items[Math.floor(Math.random() * items.length)];
    setColors({
      font: appearance.font?.hex || "#000000",
      background: appearance.background?.hex || "#ffffff",
    });
  }, [data?.projects]);

  useEffect(() => {
    const interval = setInterval(() => {
      const imageLength = sliderItems.length;
      if (!showIndex && sliderReady && imageLength > 0) {
        setActiveIndex((value) => (value + 1) % imageLength);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showIndex, sliderItems.length, sliderReady]);

  useEffect(() => {
    if (!sliderItems.length) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((value) => value % sliderItems.length);
  }, [sliderItems.length]);

  useEffect(() => {
    randomColors();
  }, [data?.projects]);

  const measureIntro = useCallback(() => {
    const container = indexEl.current;
    const intro = introEl.current;
    if (!container || !intro) return;

    const nextIsMobile = window.innerWidth <= 768;
    setIsMobileViewport(nextIsMobile);

    if (!nextIsMobile) {
      setIntroNeedsScroll(false);
      setIntroScrolledToEnd(true);
      setHasMeasuredIntro(true);
      return;
    }

    const nextNeedsScroll = intro.scrollHeight > container.clientHeight;
    const scrollRemaining = container.scrollHeight - container.scrollTop - container.clientHeight;

    setIntroNeedsScroll(nextNeedsScroll);
    setIntroScrolledToEnd(!nextNeedsScroll || scrollRemaining <= 4);
    setHasMeasuredIntro(true);
  }, []);

  useEffect(() => {
    const measureOnFrame = () => requestAnimationFrame(measureIntro);

    measureOnFrame();
    window.addEventListener("resize", measureOnFrame);

    return () => window.removeEventListener("resize", measureOnFrame);
  }, [measureIntro]);

  useEffect(() => {
    if (!showIndex || !isMobileViewport) return;

    const container = indexEl.current;
    if (!container) return;

    container.scrollTop = 0;
    requestAnimationFrame(measureIntro);
  }, [isMobileViewport, measureIntro, showIndex]);

  const sectionClassName = `${styles.index} ${showIndex ? styles.active : ""}`;
  const mainStyle = {
    "--background-color": colors.background,
    "--font-color": colors.font,
  };

  const handleSliderToggle = useCallback(() => {
    setShowIndex((current) => {
      const next = !current;

      if (!current && next) {
        randomColors();
      }

      return next;
    });
  }, [randomColors]);

  useEffect(() => {
    const handlePageClick = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("a, button, input, textarea, select, label, [role='button'], [data-no-slider-toggle='true']")
      ) {
        return;
      }

      const selection = window.getSelection?.();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

      handleSliderToggle();
    };

    document.addEventListener("click", handlePageClick);
    return () => document.removeEventListener("click", handlePageClick);
  }, [handleSliderToggle]);

  if (!data) return null;

  const shouldDelayMainNav = isMobileViewport && introNeedsScroll;
  const shouldShowMainNav = hasMeasuredIntro && (!shouldDelayMainNav || introScrolledToEnd);
  const introClassName = `${styles.intro} ${shouldDelayMainNav ? styles.introWithScrollTail : ""}`;

  return (
    <main className={styles.main} style={mainStyle}>
      {sliderItems.length ? (
        <Slideshow items={sliderItems} activeIndex={activeIndex} isActive={showIndex} onReadyChange={setSliderReady} />
      ) : null}

      <section ref={indexEl} className={sectionClassName} onScroll={measureIntro}>
        <div ref={introEl} className={introClassName}>
          <Text text={data?.home?.intro} />
        </div>

        <AnimatePresence initial={false}>
          {shouldShowMainNav ? (
            <motion.div
              key="main-nav"
              className={styles.navShell}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <MainNav data={data} />

              <Link href="mailto:info@studio-es.at" className={styles.mobileContact} data-no-slider-toggle="true">
                Contact
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}
