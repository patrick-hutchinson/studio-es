import { useEffect, useState } from "react";

import styles from "@/styles/pages/Studio.module.css";

import ScaleText from "@/components/ScaleText/ScaleText";
import GalleryPreview from "@/components/GalleryPreview/GalleryPreview";
import ShrinkProjectPreview from "@/components/ShrinkProjectPreview/ShrinkProjectPreview";
import { DEFAULT_COLOR_PAIR, getRandomColorPair } from "@/lib/getRandomColorPair";
import { getAppearances, getProjects } from "@/lib/sanity";

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
  const visibleProjects = projects;

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
          <div className={styles.projects} data-project-count={projects.length}>
            {visibleProjects.map((project, index) => {
              const cover = project.homePageCover;
              const image = cover?.image?.medium;
              const video = cover?.video?.medium;
              const href = project.slug ? `/projects/${project.slug}` : undefined;

              if (cover?.type === "gallery") {
                return <GalleryPreview gallery={cover.gallery} href={href} key={project._id} />;
              }

              const medium = cover?.type === "video" ? video : image;
              const backgroundImage = getPreviewBackgroundImage(medium);

              return (
                <ShrinkProjectPreview
                  backgroundImage={backgroundImage}
                  key={project._id}
                  foregroundMedium={cover?.type === "video" ? video : undefined}
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
  };
}
