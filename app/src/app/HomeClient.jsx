"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainNav from "@/components/Main/MainNav";
import ProjectsSlider from "@/components/Projects/ProjectsSlider";
import Text from "@/components/Text/Text";

import styles from "./home.module.scss";

export default function HomeClient({ data }) {
  const [showIndex, setShowIndex] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loopCopies, setLoopCopies] = useState(1);
  const [loopIsActive, setLoopIsActive] = useState(false);
  const [isShortList, setIsShortList] = useState(false);
  const [colors, setColors] = useState({ font: "#fff", background: "#000" });
  const [sliderReady, setSliderReady] = useState(false);
  const listEl = useRef(null);

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

  const handleLoopScroll = () => {
    if (!loopIsActive) return;
    const container = listEl.current;
    if (!container) return;

    const fullHeight = container.scrollHeight;
    const pixelThird = fullHeight / 3;
    const scroll = container.scrollTop;
    const relative = scroll % pixelThird;

    if (scroll < pixelThird / 4 || scroll > pixelThird * 1.75) {
      container.scrollTop = pixelThird + relative;
    }
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
        target.closest(
          "a, button, input, textarea, select, label, [role='button'], [data-no-slider-toggle='true']",
        )
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

  return (
    <main className={styles.main} style={mainStyle}>
      {sliderItems.length ? (
        <ProjectsSlider
          items={sliderItems}
          activeIndex={activeIndex}
          isActive={showIndex}
          onReadyChange={setSliderReady}
        />
      ) : null}

      <section className={sectionClassName}>
        <Link href="mailto:info@studio-es.at" className={styles.mobileContact} data-no-slider-toggle="true">
          Contact
        </Link>

        <Text className={styles.intro} text={data?.home?.intro} />

        <MainNav activeCategory={activeCategory} onSetCategory={toggleCategory} />
      </section>
    </main>
  );
}
