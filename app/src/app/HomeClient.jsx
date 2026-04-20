"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MainNav from "@/components/Main/MainNav";
import ProjectsListItem from "@/components/Projects/ProjectsListItem";
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

  const loopedItems = useMemo(() => {
    if (!loopIsActive) return filteredItems;
    return Array(loopCopies).fill(filteredItems).flat();
  }, [filteredItems, loopCopies, loopIsActive]);

  const randomColors = () => {
    const items = data?.projects ?? [];
    if (!items.length) return;

    const appearance = items[Math.floor(Math.random() * items.length)];
    setColors({
      font: appearance.font?.hex || "#000000",
      background: appearance.background?.hex || "#ffffff",
    });
  };

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
      randomColors();
    }
  }, [showIndex, filteredItems.length]);

  useEffect(() => {
    evaluateLoopState();
    randomColors();
  }, [activeCategory]);

  useEffect(() => {
    randomColors();

    const interval = setInterval(() => {
      const imageLength = data?.home?.images?.length ?? 0;
      if (!showIndex && imageLength > 0) {
        setActiveIndex((value) => (value + 1) % imageLength);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [data?.home?.images, showIndex]);

  const sectionClassName = `${styles.index} ${showIndex ? styles.active : ""}`;
  const mainStyle = {
    "--background-color": colors.background,
    "--font-color": colors.font,
  };

  if (!data || data.length == 0) return null;

  console.log(data, data.home, "data");

  return (
    <main className={styles.main} style={mainStyle}>
      {data?.home?.images?.length ? (
        <ProjectsSlider
          items={data.home.images}
          activeIndex={activeIndex}
          onToggle={() => setShowIndex((current) => !current)}
          isActive={showIndex}
        />
      ) : null}

      <section className={sectionClassName}>
        <ul ref={listEl} className={`${styles.projects} ${isShortList ? styles.short : ""}`} onScroll={handleLoopScroll}>
          {loopedItems.map((item, i) => {
            const baseLength = Math.max(filteredItems.length, 1);
            const isLastClass = !activeCategory && i % baseLength === 0;

            return (
              <ProjectsListItem
                key={`${item.slug ?? item._id}-${i}`}
                title={item.title}
                slug={item.slug}
                category={item.category}
                font={item.size === "small" ? "#0000ff" : item.font?.hex}
                background={item.background?.hex}
                className={isLastClass ? styles.last : ""}
              />
            );
          })}
        </ul>
        <Text text={data.about} />
        <MainNav activeCategory={activeCategory} onSetCategory={toggleCategory} />
      </section>
    </main>
  );
}
