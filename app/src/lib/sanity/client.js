import { createClient } from "@sanity/client";

const hasReadToken = Boolean(process.env.SANITY_READ_TOKEN);

export const preview = createClient({
  projectId: "kzivqb7t",
  dataset: "production",
  apiVersion: "2025-09-23", // today’s date or the version you want
  useCdn: false,
  fetch: {
    cache: "no-store",
  },
  token: process.env.SANITY_READ_TOKEN,
  perspective: hasReadToken ? "drafts" : "published",
});

export const production = createClient({
  projectId: "kzivqb7t",
  dataset: "production",
  apiVersion: "2025-09-23", // today’s date or the version you want
  useCdn: false, // set to false if you want fresh data
});
