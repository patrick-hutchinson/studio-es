import { useEffect } from "react";

import { useLenisContext } from "@/context/LenisContext";

const ENTRY_DELAY = 650;
const ENTRY_DURATION = 1.2;

const usePageEntryMediaScroll = (targetRef, entryKey) => {
  const lenis = useLenisContext();

  useEffect(() => {
    if (!lenis || !targetRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setTimeout(() => {
      const target = targetRef.current;
      if (!target) return;

      lenis.start();
      lenis.scrollTo(target, { duration: ENTRY_DURATION, offset: 0 });
    }, ENTRY_DELAY);

    return () => window.clearTimeout(timer);
  }, [entryKey, lenis, targetRef]);
};

export default usePageEntryMediaScroll;
