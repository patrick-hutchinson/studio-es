import { useEffect, useState } from "react";

export const DEFAULT_COLOR_PAIR = {
  background: "#ffffff",
  foreground: "#000000",
  "random-background": "#ffffff",
  "random-foreground": "#000000",
};

const getAppearance = (item) => item?.appearance ?? item;

export function getRandomColorPair(appearances = []) {
  const items = appearances
    .map(getAppearance)
    .filter((appearance) => appearance?.font?.hex || appearance?.background?.hex);

  if (!items.length) return DEFAULT_COLOR_PAIR;

  const appearance = items[Math.floor(Math.random() * items.length)];
  const foreground = appearance.font?.hex || DEFAULT_COLOR_PAIR.foreground;
  const background = appearance.background?.hex || DEFAULT_COLOR_PAIR.background;

  return {
    background,
    foreground,
    "random-background": background,
    "random-foreground": foreground,
  };
}

export function useRandomColorPair(appearances = []) {
  const [colorPair, setColorPair] = useState(DEFAULT_COLOR_PAIR);

  useEffect(() => {
    setColorPair(getRandomColorPair(appearances));
  }, [appearances]);

  return colorPair;
}
