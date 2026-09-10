import Description from "@/components/Description/Description";
import Media from "@/components/Media/Media";
import MediaSpotlight from "@/components/MediaSpotlight/MediaSpotlight";
import RepeatMediaGrid from "@/components/RepeatMediaGrid/RepeatMediaGrid";
import ScaleText from "@/components/ScaleText/ScaleText";
import usePageEntryMediaScroll from "@/hooks/usePageEntryMediaScroll";
import { getAppearances, getProject, getProjects } from "@/lib/sanity";
import styles from "@/styles/pages/Project.module.scss";
import { useRef } from "react";

import Text from "@/components/Text/Text";

import Carousel from "@/components/Carousel/Carousel";

const getGalleryImages = (project) =>
  (project.gallery ?? []).map((item) => item?.medium).filter((medium) => medium?.type === "image" && medium.url);

export default function Project({ appearances = [], project }) {
  const galleryImages = getGalleryImages(project);
  const slideshow = project.slideshow ?? [];
  const firstMediaRef = useRef(null);

  usePageEntryMediaScroll(firstMediaRef, project.slug);

  console.log(project.slideshow, "slideshow");
  return (
    <div className="page">
      <main className="main">
        <div className="content grid">
          <ScaleText className={styles.projectTitle} text={project.title.toUpperCase()} letterSpacing={-60} />
          {slideshow.length ? (
            <div ref={firstMediaRef} className={styles.entryMedia}>
              <Carousel array={slideshow} />
            </div>
          ) : null}

          <div className={styles.projectInfo}>
            <Text className={styles.description} text={project.description} typo="h3" />
          </div>

          {galleryImages.length > 1 ? (
            <div ref={slideshow.length ? undefined : firstMediaRef} className={styles.entryMedia}>
              <RepeatMediaGrid className={styles.repeatMediaGrid} gallery={galleryImages} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const projects = await getProjects();

  return {
    paths: projects.filter((project) => project.slug).map((project) => ({ params: { slug: project.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const project = await getProject(params?.slug);
  const appearances = await getAppearances();

  if (!project) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      appearances,
      project,
    },
    // Keep project pages current without requiring a new Vercel deployment.
    revalidate: 5,
  };
}
