import Description from "@/components/Description/Description";
import Media from "@/components/Media/Media";
import ScaleText from "@/components/ScaleText/ScaleText";
import ShuffleGallery from "@/components/ShuffleGallery/ShuffleGallery";
import { useRandomColorPair } from "@/lib/getRandomColorPair";
import { getAppearances, getProject, getProjects } from "@/lib/sanity";
import styles from "@/styles/pages/Project.module.css";

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
  const titleColorPair = useRandomColorPair(appearances);
  const coverMedium = project.previewMedia?.medium;
  const galleryImages = getGalleryImages(project);

  return (
    <div className="page">
      <main className="main">
        <div className="content grid">
          {galleryImages.length > 1 ? (
            <ShuffleGallery className={styles.coverMedia} images={galleryImages} />
          ) : coverMedium ? (
            <Media className={styles.coverMedia} eager medium={coverMedium} objectFit="contain" />
          ) : null}
          <ScaleText className={styles.projectTitle} text={project.title.toUpperCase()} letterSpacing={-60} />
          <Description appearances={appearances} className={styles.description} text={project.description} />
          <div className={styles.placeholder} />
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
  };
}
