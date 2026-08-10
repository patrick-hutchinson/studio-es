import Text from "@/components/Text/Text";
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

  if (!descriptionText) return null;

  return (
    <section
      className={[styles.description, className].filter(Boolean).join(" ")}
      // style={{
      //   ...(colors.background ? { "--random-background": colors.background } : {}),
      //   ...(colors.foreground ? { "--random-foreground": colors.foreground } : {}),
      // }}
    >
      <Text className={styles.text} text={descriptionText} typo="h2" />
      <div typo="h3">Id-001-2026</div>
      <div typo="h3">Photografie im Diskurs</div>
    </section>
  );
};

export default Description;
