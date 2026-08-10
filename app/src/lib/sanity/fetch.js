import { getPreviewClient, getProductionClient } from "./client";
import { appearancesQuery, projectBySlugQuery, projectsQuery, siteQuery } from "./queries";

export function getSanityClient() {
  const isProduction = process.env.VERCEL_ENV === "production";
  const isPreview = process.env.VERCEL_ENV === "preview";
  const isLocal = !process.env.VERCEL_ENV;
  const hasReadToken = Boolean(process.env.SANITY_READ_TOKEN);

  if ((isPreview || isLocal) && hasReadToken) {
    return getPreviewClient();
  }

  if (isProduction || !hasReadToken) {
    return getProductionClient();
  }

  return getProductionClient();
}

function normalizeSite(site) {
  return {
    ...site,
    faviconUrl: site?.favicon?.asset?.url,
  };
}

function normalizeProject(project) {
  if (!project) return null;

  return {
    ...project,
    slug: project?.meta?.slug ?? null,
  };
}

function normalizeProjects(projects) {
  return Array.isArray(projects) ? projects.map(normalizeProject).filter(Boolean) : [];
}

export async function getSite() {
  const site = await getSanityClient().fetch(siteQuery);

  return normalizeSite(site);
}

export async function getProjects() {
  const projects = await getSanityClient().fetch(projectsQuery);

  return normalizeProjects(projects);
}

export async function getAppearances() {
  const appearances = await getSanityClient().fetch(appearancesQuery);

  return Array.isArray(appearances) ? appearances : [];
}

export async function getProject(slug) {
  if (!slug) return null;

  const project = await getSanityClient().fetch(projectBySlugQuery, { slug });

  return normalizeProject(project);
}
