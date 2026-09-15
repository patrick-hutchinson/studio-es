import MediaStrip from "@/components/MediaStrip/MediaStrip";
import Gallery from "@/components/Gallery/Gallery";
import ScaleText from "@/components/ScaleText/ScaleText";
import usePageEntryMediaScroll from "@/hooks/usePageEntryMediaScroll";
import useScaleTextRemoval from "@/hooks/useScaleTextRemoval";
import { getAppearances, getProject, getProjects } from "@/lib/sanity";
import styles from "@/styles/pages/Project.module.scss";
import { useCallback, useRef } from "react";

import SnapContainer from "@/components/Snap/SnapContainer";
import SnapElement from "@/components/Snap/SnapElement";

import Text from "@/components/Text/Text";

import Carousel from "@/components/Carousel/Carousel";
import CarouselMiniature from "@/components/Carousel/CarouselMiniature";

const getGalleryImages = (project) =>
  (project.gallery ?? [])
    .map((item) => ({ ...item?.medium, expandable: item?.expandable !== false }))
    .filter((medium) => medium?.type === "image" && medium.url);

export default function Project({ appearances = [], nextProject, project }) {
  const galleryImages = getGalleryImages(project);
  const slideshow = project.slideshow ?? [];
  const supportingMedia = project.supportingMedia ?? [];
  const singleSlideshowMedium = slideshow.length === 1 ? slideshow[0]?.medium : null;
  const hasSingleSlideshowPreview = singleSlideshowMedium?.type === "image" || singleSlideshowMedium?.type === "video";
  const firstMediaRef = useRef(null);
  const compensateTitleRemoval = useCallback((top) => window.scrollTo({ top, behavior: "auto" }), []);
  const { isVisible: showTitle, remove: removeTitle, titleRef } = useScaleTextRemoval(compensateTitleRemoval);

  usePageEntryMediaScroll(firstMediaRef, project.slug, { native: true, onComplete: removeTitle });

  return (
    <div className="page">
      {project.slug ? (
        <div className={styles.projectCode} typo="h3">
          {project.slug.toUpperCase()}
        </div>
      ) : null}
      <main className="main">
        <div className="content grid">
          {showTitle ? (
            <ScaleText ref={titleRef} className={styles.projectTitle} text={project.slug.toUpperCase()} letterSpacing={-60} />
          ) : null}

          <SnapContainer>
            <SnapElement>
              {hasSingleSlideshowPreview ? (
                <MediaStrip ref={firstMediaRef} className={styles.entryMedia} medium={singleSlideshowMedium} />
              ) : slideshow.length ? (
                <div ref={firstMediaRef} className={styles.entryMedia}>
                  <Carousel array={slideshow} />
                </div>
              ) : null}
            </SnapElement>

            <SnapElement>
              <div className={styles.projectInfo}>
                <div className={styles.projectInfoTitle} typo="h3">
                  {project.title}
                </div>
                {supportingMedia ? (
                  <div className={styles.carouselMiniature}>
                    <CarouselMiniature array={supportingMedia} />
                  </div>
                ) : null}
                <Text className={styles.description} text={project.description} typo="h3" />
              </div>
            </SnapElement>

            <SnapElement>
              {galleryImages.length > 1 ? (
                <div ref={slideshow.length ? undefined : firstMediaRef} className={styles.entryMedia}>
                  <Gallery className={styles.Gallery} gallery={galleryImages} layout={project.galleryLayout} />
                </div>
              ) : null}
            </SnapElement>
          </SnapContainer>
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
  const [project, appearances, projects] = await Promise.all([getProject(params?.slug), getAppearances(), getProjects()]);

  if (!project) {
    return {
      notFound: true,
    };
  }

  const projectIndex = projects.findIndex((entry) => entry.slug === project.slug);
  const nextProject = projectIndex >= 0 && projects.length > 1 ? projects[(projectIndex + 1) % projects.length] : null;

  return {
    props: {
      appearances,
      nextProject,
      project,
    },
    // Keep project pages current without requiring a new Vercel deployment.
    revalidate: 5,
  };
}
