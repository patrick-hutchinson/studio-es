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
  const [activeCategory, setActiveCategory] = useState(null);
  const [loopCopies, setLoopCopies] = useState(1);
  const [loopIsActive, setLoopIsActive] = useState(false);
  const [isShortList, setIsShortList] = useState(false);
  const [colors, setColors] = useState({ font: "#fff", background: "#000" });
  const [sliderReady, setSliderReady] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [introNeedsScroll, setIntroNeedsScroll] = useState(false);
  const [introScrolledToEnd, setIntroScrolledToEnd] = useState(false);
  const listEl = useRef(null);
  const indexEl = useRef(null);
  const introEl = useRef(null);

  const filteredItems = useMemo(() => {
    if (!data?.projects) return [];
    if (!activeCategory) return data.projects;

    return data.projects.filter((item) => {
      const mainCategory = item.category?._id;
      const additionalCategories = item.categories?.map((cat) => cat._id) ?? [];
      return mainCategory === activeCategory || additionalCategories.includes(activeCategory);
    });
  }, [activeCategory, data?.projects]);

  const sliderItems = useMemo(() => {
    return (data?.home?.images ?? []).filter((item) => item?.asset?._ref);
  }, [data?.home?.images]);

  const loopedItems = useMemo(() => {
    if (!loopIsActive) return filteredItems;
    return Array(loopCopies).fill(filteredItems).flat();
  }, [filteredItems, loopCopies, loopIsActive]);

  const randomColors = useCallback(() => {
    const items = data?.projects ?? [];
    if (!items.length) return;

    const appearance = items[Math.floor(Math.random() * items.length)];
    setColors({
      font: appearance.font?.hex || "#000000",
      background: appearance.background?.hex || "#ffffff",
    });
  }, [data?.projects]);

  const evaluateLoopState = () => {
    requestAnimationFrame(() => {
      const container = listEl.current;
      if (!container) return;

      const containerHeight = container.clientHeight;
      const listItems = container.querySelectorAll("li");

      if (!listItems.length) return;
      const itemHeight = listItems[0].offsetHeight || 64;
      const totalHeight = itemHeight * filteredItems.length;

      if (totalHeight < containerHeight || activeCategory) {
        setLoopIsActive(false);
        setLoopCopies(1);
        setIsShortList(true);
        container.scrollTop = 0;
        return;
      }

      setLoopIsActive(true);
      setIsShortList(false);

      requestAnimationFrame(() => {
        const scrollHeight = container.scrollHeight || 1;
        const minHeight = containerHeight * 2.5;
        const copies = Math.ceil(minHeight / scrollHeight);
        const nextCopies = Math.max(copies, 3);
        setLoopCopies(nextCopies);

        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight / 3 - 3;
        });
      });
    });
  };

  const toggleCategory = (newCategory) => {
    setActiveCategory((current) => (current === newCategory ? null : newCategory));
  };

  useEffect(() => {
    if (showIndex && filteredItems.length) {
      evaluateLoopState();
    }
  }, [showIndex, filteredItems.length]);

  useEffect(() => {
    evaluateLoopState();
  }, [activeCategory]);

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

  const updateIntroScrollState = useCallback(() => {
    const container = indexEl.current;
    const intro = introEl.current;
    if (!container) return;

    const nextNeedsScroll = Boolean(intro && intro.scrollHeight > container.clientHeight);
    setIntroNeedsScroll(nextNeedsScroll);

    if (!nextNeedsScroll) {
      setIntroScrolledToEnd(true);
      return;
    }

    const scrollRemaining = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIntroScrolledToEnd(scrollRemaining <= 4);
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const nextIsMobile = window.innerWidth <= 768;
      setIsMobileViewport(nextIsMobile);

      requestAnimationFrame(() => {
        if (nextIsMobile) {
          updateIntroScrollState();
          return;
        }

        setIntroScrolledToEnd(true);
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, [updateIntroScrollState]);

  useEffect(() => {
    if (!showIndex || !isMobileViewport) {
      setIntroScrolledToEnd(!isMobileViewport);
      return;
    }

    const container = indexEl.current;
    if (!container) return;

    container.scrollTop = 0;
    requestAnimationFrame(updateIntroScrollState);
  }, [isMobileViewport, showIndex, updateIntroScrollState]);

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

  if (!data || data.length == 0) return null;

  const shouldDelayMainNav = isMobileViewport && introNeedsScroll;
  const shouldShowMainNav = !shouldDelayMainNav || introScrolledToEnd;
  const introClassName = `${styles.intro} ${shouldDelayMainNav ? styles.introWithScrollTail : ""}`;

  return (
    <main className={styles.main} style={mainStyle}>
      {sliderItems.length ? (
        <Slideshow items={sliderItems} activeIndex={activeIndex} isActive={showIndex} onReadyChange={setSliderReady} />
      ) : null}

      <section ref={indexEl} className={sectionClassName} onScroll={updateIntroScrollState}>
        <div ref={introEl} className={introClassName}>
          <Text text={data?.home?.intro} />
        </div>

        <AnimatePresence initial={false}>
          {shouldShowMainNav ? (
            <>
              <motion.div
                key="main-nav"
                className={styles.navShell}
                initial={isMobileViewport ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isMobileViewport ? { opacity: 0 } : undefined}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <MainNav activeCategory={activeCategory} onSetCategory={toggleCategory} />

                <Link href="mailto:info@studio-es.at" className={styles.mobileContact} data-no-slider-toggle="true">
                  Contact
                </Link>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}
