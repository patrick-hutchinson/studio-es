"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import MainNav from "@/components/Main/MainNav";
import Slideshow from "@/components/Slideshow/Slideshow";
import Text from "@/components/Text/Text";

import styles from "./LandingPage.module.scss";

export default function LandingPage({ data }) {
  const [showIndex, setShowIndex] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [colors, setColors] = useState({ font: "#fff", background: "#000" });
  const [sliderReady, setSliderReady] = useState(false);

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

  return (
    <main className={styles.main} style={mainStyle}>
      {sliderItems.length ? (
        <Slideshow items={sliderItems} activeIndex={activeIndex} isActive={showIndex} onReadyChange={setSliderReady} />
      ) : null}

      <section className={sectionClassName}>
        <div className={styles.intro}>
          <Text text={data?.home?.intro} />
        </div>

        <motion.div
          key="main-nav"
          className={styles.navShell}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <MainNav data={data} />

          <Link href="mailto:info@studio-es.at" className={styles.mobileContact} data-no-slider-toggle="true">
            Contact
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
