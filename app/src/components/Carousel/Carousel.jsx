import { useContext, useEffect, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Media from "@/components/Media/Media";

import styles from "./Carousel.module.css";

import { motion } from "framer-motion";

import { DeviceContext } from "@/context/DeviceContext";

const Carousel = ({ array, onIndexChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { isTouch } = useContext(DeviceContext);
  const media = array ?? [];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: media.length > 1, dragResistance: 1, dragFree: isTouch ? true : false },
    [],
  );

  useEffect(() => {
    if (!emblaApi || !media.length) return;

    const updateIndex = () => {
      const index = emblaApi.selectedScrollSnap();
      onIndexChange?.(index);
    };

    updateIndex();
    emblaApi.on("select", updateIndex);
    emblaApi.on("scroll", updateIndex);

    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("scroll", updateIndex);
    };
  }, [emblaApi, media.length, onIndexChange]);

  useEffect(() => {
    if (!emblaApi || media.length < 2) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        emblaApi.scrollNext();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emblaApi.scrollPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onDragStart = () => setIsDragging(true);
    const onDragEnd = () => setIsDragging(false);

    emblaApi.on("pointerDown", onDragStart);
    emblaApi.on("pointerUp", onDragEnd);
    emblaApi.on("dragEnd", onDragEnd);

    return () => {
      emblaApi.off("pointerDown", onDragStart);
      emblaApi.off("pointerUp", onDragEnd);
      emblaApi.off("dragEnd", onDragEnd);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (!isDragging) {
        emblaApi.scrollNext();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [emblaApi, isDragging, media.length]);

  if (!media.length) return null;

  return (
    <motion.div className={`${styles.carousel_outer} embla`} ref={emblaRef}>
      <div className={`${styles.carousel_inner} embla__container`}>
        {media.map((item, index) => {
          return (
            <li key={item._key ?? item.medium?._id ?? index} className={`${styles.slide} embla__slide`}>
              <Media medium={item.medium} />
            </li>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Carousel;
