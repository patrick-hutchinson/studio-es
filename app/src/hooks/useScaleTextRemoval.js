import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const useScaleTextRemoval = (compensateScroll) => {
  const titleRef = useRef(null);
  const pendingRemovalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  const remove = useCallback(() => {
    pendingRemovalRef.current = {
      scrollTop: window.scrollY,
      titleHeight: titleRef.current?.getBoundingClientRect().height ?? 0,
    };
    setIsVisible(false);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (isVisible || !pendingRemovalRef.current) return;

    const { scrollTop, titleHeight } = pendingRemovalRef.current;
    pendingRemovalRef.current = null;

    // Keep the formerly visible section in place while the title is removed above it.
    compensateScroll(Math.max(scrollTop - titleHeight, 0));
  }, [compensateScroll, isVisible]);

  return { isVisible, remove, titleRef };
};

export default useScaleTextRemoval;
