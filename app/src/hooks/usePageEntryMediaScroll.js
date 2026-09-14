import { useEffect } from "react";

import { useLenisContext } from "@/context/LenisContext";

const ENTRY_DELAY = 650;
const ENTRY_DURATION = 1.2;

const usePageEntryMediaScroll = (targetRef, entryKey, { native = false } = {}) => {
  const lenis = useLenisContext();

  useEffect(() => {
    if ((!lenis && !native) || !targetRef.current) return undefined;

    if (native) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setTimeout(() => {
      const target = targetRef.current;
      if (!target) return;

      if (lenis) {
        lenis.start();
        lenis.scrollTo(target, { duration: ENTRY_DURATION, offset: 0 });
        return;
      }

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "smooth",
      });
    }, ENTRY_DELAY);

    return () => window.clearTimeout(timer);
  }, [entryKey, lenis, native, targetRef]);
};

export default usePageEntryMediaScroll;
