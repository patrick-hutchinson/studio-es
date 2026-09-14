import Text from "@/components/Text/Text";
import RenderSVG from "@/components/RenderSVG/RenderSVG";
import ScaleElement from "@/components/ScaleElement/ScaleElement";

import Spacing from "@/components/Spacing/Spacing";

import styles from "./Description.module.css";

const getDescriptionText = (text) => {
  if (text?.copy) return text.copy;

  return text;
};

const getColorPair = ({ appearance, colorPair }) => ({
  background: colorPair?.background || colorPair?.["random-background"] || appearance?.background?.hex,
  foreground: colorPair?.foreground || colorPair?.["random-foreground"] || appearance?.font?.hex,
});

const Description = ({ appearance, className = "", colorPair, text }) => {
  const descriptionText = getDescriptionText(text);
  const colors = getColorPair({ appearance, colorPair });
  const colorStyle = {
    "--random-background": colors.background,
    "--random-foreground": colors.foreground,
    background: colors.background,
    color: colors.foreground,
  };

  if (!descriptionText) return null;

  return (
    <section className={[styles.description, className].filter(Boolean).join(" ")} style={colorStyle}>
      <Spacing spacing={6} />
      <ScaleElement className={`${styles.first}`} scaleContent>
        <p typo="h3">Client: Fotografie im Diskurs</p>
      </ScaleElement>

      <ScaleElement scaleContent>
        <p typo="h3">Id-001-2026</p>
      </ScaleElement>

      <ScaleElement className={`${styles.last}`} scaleContent>
        <p typo="h3">Year: 2026</p>
      </ScaleElement>

      <Spacing spacing={2} />

      <ScaleElement className={styles.textScale} scaleContent>
        <Text className={styles.text} text={descriptionText} typo="h2" />
      </ScaleElement>

      {/* <Spacing spacing={2} /> */}
    </section>
  );
};

export default Description;
