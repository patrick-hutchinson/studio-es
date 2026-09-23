import { useLayoutEffect, useRef, useState } from "react";

import styles from "@/styles/pages/Id.module.css";

import Text from "@/components/Text/Text";
import { getInfo } from "@/lib/sanity/fetch";
import Link from "next/link";

export default function Id({ info = {} }) {
  const currentYear = String(new Date().getFullYear()).slice(-2);
  const aboutTextRef = useRef(null);
  const callToActionRef = useRef(null);
  const copyrightRef = useRef(null);
  const [aboutOverflows, setAboutOverflows] = useState(false);

  useLayoutEffect(() => {
    const updateOverflowState = () => {
      const aboutText = aboutTextRef.current;
      const callToAction = callToActionRef.current;
      const copyright = copyrightRef.current;

      if (!aboutText || !callToAction || !copyright) return;

      const margin = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--margin")) || 0;
      const availableHeight = window.innerHeight - margin * 2 - Math.max(callToAction.offsetHeight, copyright.offsetHeight);

      setAboutOverflows(aboutText.scrollHeight > availableHeight);
    };

    const resizeObserver = new ResizeObserver(updateOverflowState);

    [aboutTextRef.current, callToActionRef.current, copyrightRef.current]
      .filter(Boolean)
      .forEach((element) => resizeObserver.observe(element));
    window.addEventListener("resize", updateOverflowState);
    updateOverflowState();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOverflowState);
    };
  }, [info.about]);

  return (
    <div className={`page ${styles.page}`}>
      <main className="main">
        <div className={`${styles.idPage} content grid`} data-about-overflow={aboutOverflows ? "" : undefined}>
          <Link href="/" className={styles.idTag} typo="h3 compensate">{`Id-000-${currentYear}`}</Link>
          <div className={styles.aboutText} typo="h3">
            <Text ref={aboutTextRef} className={styles.aboutTextInner} text={info.about} />
          </div>

          <div ref={copyrightRef} className={styles.copyright} typo="h3 compensate">
            {info.copyright}
          </div>
          <Text ref={callToActionRef} text={info.callToAction} className={styles.callToAction} typo="h3 compensate" />
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const [info] = await Promise.all([getInfo()]);

  return {
    props: {
      info,
    },
    // Refresh static preview and production pages from Sanity at most once per minute.
    revalidate: 5,
  };
}
