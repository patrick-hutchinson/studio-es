import Placeholder from "../Media/components/Placeholder";
import Media from "../Media/Media";
import styles from "./MediaSpotlight.module.css";

const MediaSpotlight = ({ className, medium, usePlaceholder }) => {
  const aspectRatio = medium?.width && medium?.height ? medium.width / medium.height : undefined;

  return (
    <div
      className={`${styles.mediaContainer} ${className}`}
      style={aspectRatio ? { "--media-ratio": aspectRatio } : undefined}
    >
      <div className={styles.mediaFrame}>
        {usePlaceholder && <Placeholder medium={medium} className={styles.placeholder} />}
        <Media medium={medium} objectFit="contain" />
      </div>
    </div>
  );
};

export default MediaSpotlight;
