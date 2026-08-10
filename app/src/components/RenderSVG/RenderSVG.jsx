import { useEffect, useMemo, useState } from "react";
import opentype from "opentype.js";

import styles from "./RenderSVG.module.css";

const DEFAULT_FONT_URLS = [
  "https://d32riwu7ppww35.cloudfront.net/RP-W-9ffc0e38-b7df-4bd3-a7cd-f27cf872fa2b/691e87ca-b939-42c6-9a04-3b5e573f7c48.woff2?signature=4f2dcef9bd55fe523124438da3cb0f83ab5431aa",
  "https://d32riwu7ppww35.cloudfront.net/RP-W-9ffc0e38-b7df-4bd3-a7cd-f27cf872fa2b/691e87ca-b939-42c6-9a04-3b5e573f7c48.woff?signature=4f2dcef9bd55fe523124438da3cb0f83ab5431aa",
  "https://d32riwu7ppww35.cloudfront.net/RP-W-9ffc0e38-b7df-4bd3-a7cd-f27cf872fa2b/691e87ca-b939-42c6-9a04-3b5e573f7c48.eot?signature=4f2dcef9bd55fe523124438da3cb0f83ab5431aa",
];
const FONT_FAMILY = "Union Regular";
const SVG_FONT_SIZE = 1000;
const fontCache = new Map();
const fallbackBox = {
  x: 0,
  y: -SVG_FONT_SIZE,
  width: SVG_FONT_SIZE * 2,
  height: SVG_FONT_SIZE,
};

const getPaddedBox = (box, padding = 0) => ({
  x: box.x1 - padding,
  y: box.y1 - padding,
  width: box.x2 - box.x1 + padding * 2,
  height: box.y2 - box.y1 + padding * 2,
});

const loadFontFromUrl = (fontUrl) => {
  if (!fontCache.has(fontUrl)) {
    fontCache.set(
      fontUrl,
      fetch(fontUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load font: ${fontUrl}`);
          }

          return response.arrayBuffer();
        })
        .then((buffer) => opentype.parse(buffer)),
    );
  }

  return fontCache.get(fontUrl);
};

const loadFont = async (fontUrls) => {
  const urls = Array.isArray(fontUrls) ? fontUrls : [fontUrls];
  const errors = [];

  for (const url of urls.filter(Boolean)) {
    try {
      return await loadFontFromUrl(url);
    } catch (error) {
      errors.push(error);
    }
  }

  throw new AggregateError(errors, "RenderSVG could not load a parseable font.");
};

const getPathWithLetterSpacing = (font, text, letterSpacing) => {
  if (!letterSpacing) {
    return font.getPath(text, 0, 0, SVG_FONT_SIZE);
  }

  const path = new opentype.Path();
  let x = 0;

  for (const character of text) {
    const glyphPath = font.getPath(character, x, 0, SVG_FONT_SIZE);
    const advanceWidth = font.getAdvanceWidth(character, SVG_FONT_SIZE);

    path.extend(glyphPath);
    x += advanceWidth + letterSpacing;
  }

  return path;
};

const RenderSVG = ({ text, className = "", fontUrl, fontUrls = DEFAULT_FONT_URLS, letterSpacing = 0, padding = 0 }) => {
  const [outline, setOutline] = useState(null);
  const resolvedFontUrls = useMemo(() => (fontUrl ? [fontUrl] : fontUrls), [fontUrl, fontUrls]);

  useEffect(() => {
    let isMounted = true;

    loadFont(resolvedFontUrls)
      .then((font) => {
        if (!isMounted || !text) return;

        const path = getPathWithLetterSpacing(font, text, letterSpacing);
        const box = path.getBoundingBox();
        const nextBox = getPaddedBox(box, padding);

        setOutline({
          pathData: path.toPathData(2),
          viewBox: `${nextBox.x} ${nextBox.y} ${nextBox.width} ${nextBox.height}`,
        });
      })
      .catch((error) => {
        if (!isMounted) return;

        if (process.env.NODE_ENV !== "production") {
          console.warn("RenderSVG could not generate an outline path:", error);
        }

        setOutline(null);
      });

    return () => {
      isMounted = false;
    };
  }, [letterSpacing, padding, resolvedFontUrls, text]);

  const viewBox = outline?.viewBox || `${fallbackBox.x} ${fallbackBox.y} ${fallbackBox.width} ${fallbackBox.height}`;
  const pathData = outline?.pathData;
  const label = useMemo(() => (typeof text === "string" ? text : ""), [text]);

  return (
    <svg
      aria-label={label}
      className={[styles.svg, className].filter(Boolean).join(" ")}
      focusable="false"
      preserveAspectRatio="xMinYMax meet"
      role="img"
      viewBox={viewBox}
    >
      {pathData ? (
        <path className={styles.path} d={pathData} />
      ) : (
        <text className={styles.path} x="0" y="0" fontFamily={FONT_FAMILY} fontSize={SVG_FONT_SIZE}>
          {label}
        </text>
      )}
    </svg>
  );
};

export default RenderSVG;
