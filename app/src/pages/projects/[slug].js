import { useState } from "react";

import BlurCoverMedia from "@/components/BlurCoverMedia/BlurCoverMedia";
import Description from "@/components/Description/Description";
import Media from "@/components/Media/Media";
import MediaSpotlight from "@/components/MediaSpotlight/MediaSpotlight";
import RepeatMediaGrid from "@/components/RepeatMediaGrid/RepeatMediaGrid";
import ScaleBlock from "@/components/ScaleBlock/ScaleBlock";
import ScaleText from "@/components/ScaleText/ScaleText";
import ShuffleGallery from "@/components/ShuffleGallery/ShuffleGallery";
import { useRandomColorPair } from "@/lib/getRandomColorPair";
import { getAppearances, getProject, getProjects } from "@/lib/sanity";
import styles from "@/styles/pages/Project.module.css";

import ScaleMarquee from "@/components/ScaleMarquee/ScaleMarquee";

const getGalleryImages = (project) =>
  (project.header?.images ?? [])
    .filter((item) => item._type === "image" && item.asset?.url)
    .map((item) => ({
      _id: item.asset._id || item._key,
      alt: item.alt,
      url: item.asset.url,
      width: item.asset.metadata?.dimensions?.width,
      height: item.asset.metadata?.dimensions?.height,
    }));

export default function Project({ appearances = [], project }) {
  const [activeOption, setActiveOption] = useState("option-1");
  const titleColorPair = useRandomColorPair(appearances);
  const coverMedium = project.previewMedia?.medium;
  const galleryImages = getGalleryImages(project);
  const isOptionOne = activeOption === "option-1";

  const OptionOne = () => {
    return (
      <>
        {galleryImages.length > 1 ? (
          <ShuffleGallery className={styles.coverMedia} images={galleryImages} />
        ) : coverMedium ? (
          <Media className={styles.coverMedia} eager medium={coverMedium} objectFit="contain" />
        ) : null}
        <ScaleText className={styles.projectTitle} text={project.title.toUpperCase()} letterSpacing={-60} />
        <Description appearances={appearances} className={styles.description} text={project.description} />
        <MediaSpotlight className={styles.mediaSpotlight} medium={coverMedium} usePlaceholder={true} />
        <ScaleBlock className={styles.block} scaleContent={true}>
          <ScaleMarquee text="https://www.studio-es.at" typo="h1" direction="backward" className={styles.scaleMarquee} />
        </ScaleBlock>
        {galleryImages.length > 1 ? <RepeatMediaGrid className={styles.repeatMediaGrid} gallery={galleryImages} /> : null}
        <div className={styles.placeholder} />
      </>
    );
  };

  const OptionTwo = () => {
    return (
      <>
        <BlurCoverMedia medium={coverMedium} />
        <div className={styles.optionTwoSpacer} aria-hidden="true" />
        {galleryImages.length > 1 ? (
          <ShuffleGallery className={styles.coverMedia} images={galleryImages} />
        ) : coverMedium ? (
          <Media className={styles.coverMedia} eager medium={coverMedium} objectFit="contain" />
        ) : null}
        <ScaleText className={styles.projectTitle} text={project.title.toUpperCase()} letterSpacing={-60} />
        <Description
          appearances={appearances}
          className={`${styles.description} ${styles.optionTwoForeground}`}
          text={project.description}
        />
        <MediaSpotlight
          className={`${styles.mediaSpotlight} ${styles.optionTwoForeground}`}
          medium={coverMedium}
          usePlaceholder={false}
        />
        <ScaleBlock className={`${styles.block} ${styles.optionTwoForeground}`} scaleContent={true}>
          <ScaleMarquee text="https://www.studio-es.at" typo="h1" direction="backward" className={styles.scaleMarquee} />
        </ScaleBlock>
        <div className={`${styles.placeholder} ${styles.optionTwoForeground}`} />
      </>
    );
  };

  return (
    <div className="page">
      <main className="main">
        <div className="content grid">{isOptionOne ? <OptionOne /> : <OptionTwo />}</div>
      </main>

      <nav className={styles.optionMenu} aria-label="Project view options">
        <button
          type="button"
          className={activeOption === "option-1" ? styles.optionButtonActive : ""}
          onClick={() => setActiveOption("option-1")}
        >
          Option 1
        </button>
        <button
          type="button"
          className={activeOption === "option-2" ? styles.optionButtonActive : ""}
          onClick={() => setActiveOption("option-2")}
        >
          Option 2
        </button>
      </nav>
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
  };
}
