import ShuffleGallery from "@/components/ShuffleGallery/ShuffleGallery";
import styles from "./GalleryPreview.module.css";

const GalleryPreview = ({ className = "", code, gallery = [], href, title, usePortraitPreviewSizing = false }) => {
  const images = gallery.map((item) => item?.medium).filter((medium) => medium?.type === "image" && medium.url);

  return (
    <ShuffleGallery
      className={[styles.preview, className].filter(Boolean).join(" ")}
      code={code}
      eager
      href={href}
      images={images}
      interactive={false}
      shuffle={false}
      title={title}
      usePortraitPreviewSizing={usePortraitPreviewSizing}
    />
  );
};

export default GalleryPreview;
