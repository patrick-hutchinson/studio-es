import { useEffect, useRef, useState } from "react";

import styles from "@/styles/pages/Studio.module.css";

import ScaleText from "@/components/ScaleText/ScaleText";
import ScaleMediaStrip from "@/components/ScaleMediaStrip/ScaleMediaStrip";
import { DEFAULT_COLOR_PAIR, getRandomColorPair } from "@/lib/getRandomColorPair";
import { getAppearances, getProjects } from "@/lib/sanity";
import usePageEntryMediaScroll from "@/hooks/usePageEntryMediaScroll";

const PROJECT_COUNT = 10;

const getPreviewBackgroundImage = (medium) => {
  if (medium?.type === "image") return medium.url;
  if (medium?.type === "video" && medium.playbackId) {
    return `https://image.mux.com/${medium.playbackId}/thumbnail.jpg?width=1200`;
  }

  return undefined;
};

export default function Studio({ appearances = [], projects = [] }) {
  console.log(projects, "projects");
  const [colors, setColors] = useState(DEFAULT_COLOR_PAIR);
  const projectsRef = useRef(null);

  usePageEntryMediaScroll(projectsRef, "studio");

  useEffect(() => {
    setColors(getRandomColorPair(appearances));
  }, [appearances]);

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
          <ScaleText text="Es" className={styles.scaleText} />
          <div ref={projectsRef} className={styles.projects} data-project-count={projects.length}>
            {projects.map((project, index) => {
              const cover = project.homePageCover || [];
              const medium = cover[0]?.medium;
              const href = project.slug ? `/projects/${project.slug}` : undefined;
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
            <div className={styles.endCap}>Test</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const projects = (await getProjects()).slice(0, PROJECT_COUNT);
  const appearances = await getAppearances();

  return {
    props: {
      appearances,
      projects,
    },
    // Refresh static preview and production pages from Sanity at most once per minute.
    revalidate: 5,
  };
}
