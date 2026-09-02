import ShuffleGallery from "@/components/ShuffleGallery/ShuffleGallery";
import styles from "./GalleryPreview.module.css";

const GalleryPreview = ({ className = "", gallery = [], href }) => {
  const images = gallery.map((item) => item?.medium).filter((medium) => medium?.type === "image" && medium.url);

  return (
    <ShuffleGallery
      className={[styles.preview, className].filter(Boolean).join(" ")}
      eager
      href={href}
      images={images}
      interactive={false}
      allowPortraitOverflow
      shuffle={false}
    />
  );
};

export default GalleryPreview;
