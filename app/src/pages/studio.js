import { useEffect, useRef, useState } from "react";

import styles from "@/styles/pages/Studio.module.css";

import ScaleText from "@/components/ScaleText/ScaleText";
import GalleryPreview from "@/components/GalleryPreview/GalleryPreview";
import ShrinkProjectPreview from "@/components/ShrinkProjectPreview/ShrinkProjectPreview";
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
  const visibleProjects = projects;

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
          <ScaleText text="Es" className={styles.scaleText} fullViewport />
          <div ref={projectsRef} className={styles.projects} data-project-count={projects.length}>
            {visibleProjects.map((project, index) => {
              const cover = project.homePageCover || [];
              const medium = cover[0]?.medium;
              const href = project.slug ? `/projects/${project.slug}` : undefined;

              if (cover.length > 1) {
                return <GalleryPreview gallery={cover} href={href} key={project._id} />;
              }

              const backgroundImage = getPreviewBackgroundImage(medium);

              return (
                <ShrinkProjectPreview
                  backgroundImage={backgroundImage}
                  backgroundMedium={medium?.type === "image" ? medium : undefined}
                  key={project._id}
                  foregroundMedium={medium?.type === "video" ? medium : undefined}
                  index={index}
                  href={href}
                />
              );
            })}
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
