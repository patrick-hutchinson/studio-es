"use client";

import { createContext, useContext } from "react";

const MediaPlaceholderContext = createContext(null);

export const MediaPlaceholderProvider = ({ children, color }) => (
  <MediaPlaceholderContext.Provider value={color ?? null}>{children}</MediaPlaceholderContext.Provider>
);

export const useMediaPlaceholderColor = () => useContext(MediaPlaceholderContext);
