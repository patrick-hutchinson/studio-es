import { useEffect } from "react";

import { useLenisContext } from "@/context/LenisContext";

const ENTRY_DELAY = 650;
const ENTRY_DURATION = 1.2;
const NATIVE_SCROLL_SETTLE_DELAY = 1200;

const usePageEntryMediaScroll = (targetRef, entryKey, { enabled = true, native = false, onComplete } = {}) => {
  const lenis = useLenisContext();

  useEffect(() => {
    if (!enabled) return undefined;
    if ((!lenis && !native) || !targetRef.current) return undefined;

    if (native) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let nativeSettleTimer;
    let hasCompleted = false;

    const complete = () => {
      if (hasCompleted) return;

      hasCompleted = true;
      window.removeEventListener("scrollend", complete);
      window.clearTimeout(nativeSettleTimer);
      onComplete?.();
    };

    const timer = window.setTimeout(() => {
      const target = targetRef.current;
      if (!target) return;

      if (lenis) {
        lenis.start();
        lenis.scrollTo(target, { duration: ENTRY_DURATION, offset: 0, onComplete });
        return;
      }

      window.addEventListener("scrollend", complete, { once: true });
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "smooth",
      });
      nativeSettleTimer = window.setTimeout(complete, NATIVE_SCROLL_SETTLE_DELAY);
    }, ENTRY_DELAY);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(nativeSettleTimer);
      window.removeEventListener("scrollend", complete);
    };
  }, [enabled, entryKey, lenis, native, onComplete, targetRef]);
};

export default usePageEntryMediaScroll;
