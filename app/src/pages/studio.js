import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import styles from "@/styles/pages/Studio.module.scss";

import ScaleMediaStrip from "@/components/ScaleMediaStrip/ScaleMediaStrip";
import Post from "@/components/Post/Post";
import { useLenisContext } from "@/context/LenisContext";
import { DEFAULT_COLOR_PAIR, getRandomColorPair } from "@/lib/getRandomColorPair";
import { getAppearances, getContact, getPosts, getProjects } from "@/lib/sanity";
import { useRouter } from "next/router";

import Text from "@/components/Text/Text";

const getPreviewBackgroundImage = (medium) => {
  if (medium?.type === "image") return medium.url;
  if (medium?.type === "video" && medium.playbackId) {
    return `https://image.mux.com/${medium.playbackId}/thumbnail.jpg?width=1200`;
  }

  return undefined;
};

export default function Studio({ appearances = [], contact = null, projects = [], posts = [] }) {
  const [colors, setColors] = useState(DEFAULT_COLOR_PAIR);
  const endCapRef = useRef(null);
  const lenis = useLenisContext();
  const router = useRouter();
  const isContactRoute = router.asPath.includes("contact=1");
  const content = useMemo(
    () => [...projects, ...posts].sort((a, b) => (a.orderRank || "~").localeCompare(b.orderRank || "~")),
    [posts, projects],
  );

  useEffect(() => {
    setColors(getRandomColorPair(appearances));
  }, [appearances]);

  useLayoutEffect(() => {
    if (!isContactRoute || !endCapRef.current) return undefined;

    const scrollToContact = () => {
      lenis?.resize?.();

      if (lenis) {
        lenis.scrollTo(endCapRef.current, { force: true, immediate: true, offset: 0 });
        return;
      }

      endCapRef.current.scrollIntoView({ behavior: "auto", block: "start" });
    };

    scrollToContact();
    const frameId = window.requestAnimationFrame(scrollToContact);

    return () => window.cancelAnimationFrame(frameId);
  }, [isContactRoute, lenis]);

  return (
    <div
      className="page"
      style={{
        "--random-background": colors["random-background"],
        "--random-foreground": colors["random-foreground"],
      }}
    >
      <main className="main">
        <div className="content grid">
          <div className={styles.projects} data-project-count={content.length}>
            {content.map((project, index) => {
              const isPost = project._type === "post";

              if (isPost) {
                return <Post key={project._id} post={project} />;
              }

              const cover = project.homePageCover || [];
              const medium = cover[0]?.medium;
              const href = project.openable !== false && project.slug ? `/projects/${project.slug}` : undefined;
              const code = project.slug?.toUpperCase();
              const gallery = cover.length > 1 ? cover : undefined;

              return (
                <ScaleMediaStrip
                  backgroundImage={gallery ? undefined : getPreviewBackgroundImage(medium)}
                  backgroundMedium={gallery || medium?.type !== "image" ? undefined : medium}
                  code={code}
                  foregroundMedium={gallery || medium?.type !== "video" ? undefined : medium}
                  gallery={gallery}
                  href={href}
                  index={index}
                  key={project._id}
                  title={project.title}
                />
              );
            })}
            <div ref={endCapRef} className={`grid ${styles.contactContainer}`} id="contact" hide-header="">
              <Text text={contact.text} className={styles.contactText} typo="h3 compensate" />
              <Text text={contact.callToAction} className={styles.callToAction} typo="h3 compensate" />
              <div className={styles.copyright} typo="h3 compensate">
                {contact.copyright}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const [projects, appearances, contact, posts] = await Promise.all([
    getProjects(),
    getAppearances(),
    getContact(),
    getPosts(),
  ]);

  return {
    props: {
      appearances,
      contact,
      projects,
      posts,
    },
    // Refresh static preview and production pages from Sanity at most once per minute.
    revalidate: 5,
  };
}
