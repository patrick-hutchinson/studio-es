"use client";

import { useEffect, useState } from "react";
import ProjectsSlider from "@/components/Projects/ProjectsSlider";

import styles from "./home.module.scss";

export default function HomeClient({ data }) {
  const [showIndex, setShowIndex] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [colors, setColors] = useState({ font: "#fff", background: "#000" });

  const randomColors = () => {
    const items = data?.projects ?? [];
    if (!items.length) return;

    const appearance = items[Math.floor(Math.random() * items.length)];
    setColors({
      font: appearance.font?.hex || "#000000",
      background: appearance.background?.hex || "#ffffff",
    });
  };

  useEffect(() => {
    if (showIndex) randomColors();
  }, [showIndex]);

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
        <div className={`${styles.projects} ${styles.introWrap}`}>
          <p className={styles.intro}>{data?.home?.intro ?? ""}</p>
        </div>
      </section>
    </main>
  );
}
