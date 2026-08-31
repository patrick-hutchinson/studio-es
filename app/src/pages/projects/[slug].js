import { useMemo, useState } from "react";

import BlurCoverMedia from "@/components/BlurCoverMedia/BlurCoverMedia";
import Description from "@/components/Description/Description";
import Media from "@/components/Media/Media";
import MediaSpotlight from "@/components/MediaSpotlight/MediaSpotlight";
import RepeatMediaGrid from "@/components/RepeatMediaGrid/RepeatMediaGrid";
import ScaleText from "@/components/ScaleText/ScaleText";
import ShuffleGallery from "@/components/ShuffleGallery/ShuffleGallery";
import { DEFAULT_COLOR_PAIR } from "@/lib/getRandomColorPair";
import { getAppearances, getProject, getProjects } from "@/lib/sanity";
import styles from "@/styles/pages/Project.module.css";

import ScaleMarquee from "@/components/ScaleMarquee/ScaleMarquee";
import Spacing from "@/components/Spacing/Spacing";

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

const getAppearanceItem = (item) => item?.appearance ?? item;

const getColorPairFromAppearance = (appearance) => {
  const foreground = appearance?.font?.hex || DEFAULT_COLOR_PAIR.foreground;
  const background = appearance?.background?.hex || DEFAULT_COLOR_PAIR.background;

  return {
    background,
    foreground,
    "random-background": background,
    "random-foreground": foreground,
  };
};

const getDistinctColorPairs = (appearances = [], count = 3) => {
  const items = appearances
    .map(getAppearanceItem)
    .filter((appearance) => appearance?.font?.hex || appearance?.background?.hex);

  if (!items.length) {
    return Array.from({ length: count }, () => DEFAULT_COLOR_PAIR);
  }

  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return Array.from({ length: count }, (_, index) => getColorPairFromAppearance(shuffled[index % shuffled.length]));
};

export default function Project({ appearances = [], project }) {
  const [activeOption, setActiveOption] = useState("option-1");
  const coverMedium = project.previewMedia?.medium;
  const galleryImages = getGalleryImages(project);
  const isOptionOne = activeOption === "option-1";
  const isOptionThree = activeOption === "option-3";
  const [optionThreeTitleColors, optionThreeDescriptionColors, optionThreeMarqueeColors] = useMemo(
    () => getDistinctColorPairs(appearances, 3),
    [appearances],
  );

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
        <hr className={styles.divider} />

        <Spacing spacing={1} />

        <MediaSpotlight className={styles.mediaSpotlight} medium={coverMedium} usePlaceholder={true} />
        <Spacing spacing={1} />
        <ScaleMarquee text="https://www.studio-es.at" typo="h1" direction="backward" className={styles.scaleMarquee} />
        <Spacing spacing={2} />
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
        <hr className={styles.divider} />

        <Spacing spacing={1} />

        <MediaSpotlight
          className={`${styles.mediaSpotlight} ${styles.optionTwoForeground}`}
          medium={coverMedium}
          usePlaceholder={false}
        />

        <Spacing spacing={1} />

        <ScaleMarquee
          text="https://www.studio-es.at"
          typo="h1"
          direction="backward"
          className={`${styles.scaleMarquee} ${styles.optionTwoForeground}`}
        />

        {galleryImages.length > 1 ? <RepeatMediaGrid className={styles.repeatMediaGrid} gallery={galleryImages} /> : null}

        <div className={`${styles.placeholder} ${styles.optionTwoForeground}`} />
      </>
    );
  };

  const OptionThree = () => {
    const titleStyle = {
      "--random-background": optionThreeTitleColors.background,
      "--random-foreground": optionThreeTitleColors.foreground,
      background: optionThreeTitleColors.background,
      color: optionThreeTitleColors.foreground,
    };
    const marqueeStyle = {
      background: optionThreeMarqueeColors.background,
      color: optionThreeMarqueeColors.foreground,
    };

    return (
      <>
        {galleryImages.length > 1 ? (
          <ShuffleGallery className={styles.coverMedia} images={galleryImages} />
        ) : coverMedium ? (
          <Media className={styles.coverMedia} eager medium={coverMedium} objectFit="contain" />
        ) : null}
        <ScaleText
          className={styles.projectTitle}
          text={project.title.toUpperCase()}
          letterSpacing={-60}
          style={titleStyle}
        />
        <Description className={styles.description} colorPair={optionThreeDescriptionColors} text={project.description} />
        {/* <hr className={styles.divider} /> */}

        {/* <Spacing spacing={1} /> */}

        <MediaSpotlight className={styles.mediaSpotlight} medium={coverMedium} usePlaceholder={true} />
        {/* <Spacing spacing={1} /> */}
        <ScaleMarquee
          text="https://www.studio-es.at"
          typo="h1"
          direction="backward"
          className={styles.scaleMarquee}
          style={marqueeStyle}
        />
        {galleryImages.length > 1 ? <RepeatMediaGrid className={styles.repeatMediaGrid} gallery={galleryImages} /> : null}
        <div className={styles.placeholder} />
      </>
    );
  };

  return (
    <div className={["page", isOptionThree ? styles.optionThreePage : ""].filter(Boolean).join(" ")}>
      <main className="main">
        <div className="content grid">{isOptionOne ? <OptionOne /> : isOptionThree ? <OptionThree /> : <OptionTwo />}</div>
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
        <button
          type="button"
          className={activeOption === "option-3" ? styles.optionButtonActive : ""}
          onClick={() => setActiveOption("option-3")}
        >
          Option 3
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
