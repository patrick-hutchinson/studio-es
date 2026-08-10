import Text from "@/components/Text/Text";
import RenderSVG from "@/components/RenderSVG/RenderSVG";
import ScaleBlock from "@/components/ScaleBlock/ScaleBlock";
import { useRandomColorPair } from "@/lib/getRandomColorPair";

import styles from "./Description.module.css";

const getDescriptionText = (text) => {
  if (text?.copy) return text.copy;

  return text;
};

const getColorPair = ({ appearance, colorPair }) => ({
  background: colorPair?.background || colorPair?.["random-background"] || appearance?.background?.hex,
  foreground: colorPair?.foreground || colorPair?.["random-foreground"] || appearance?.font?.hex,
});

const Description = ({ appearance, appearances = [], className = "", colorPair, text }) => {
  const descriptionText = getDescriptionText(text);
  const randomColorPair = useRandomColorPair(appearances);
  const colors = getColorPair({ appearance, colorPair: colorPair ?? randomColorPair });
  const colorStyle = {
    "--random-background": colors.background,
    "--random-foreground": colors.foreground,
  };

  if (!descriptionText) return null;

  return (
    <section className={[styles.description, className].filter(Boolean).join(" ")} style={colorStyle}>
      <ScaleBlock className={`${styles.first}`} scaleContent>
        <p typo="h3">Client: Fotografie im Diskurs</p>
      </ScaleBlock>

      <ScaleBlock scaleContent>
        <p typo="h3">Id-001-2026</p>
      </ScaleBlock>

      <ScaleBlock className={`${styles.last}`} scaleContent>
        <p typo="h3">Year: 2026</p>
      </ScaleBlock>

      <ScaleBlock className={styles.textScale} scaleContent>
        <Text className={styles.text} text={descriptionText} typo="h2" />
      </ScaleBlock>
    </section>
  );
};

export default Description;
