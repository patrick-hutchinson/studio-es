import { useEffect, useState } from "react";

import MiniatureMediaStrip from "@/components/MiniatureMediaStrip/MiniatureMediaStrip";
import MiniaturePost from "@/components/MiniaturePost/MiniaturePost";
import { getArchiveEntries, getProjects } from "@/lib/sanity";

import styles from "@/styles/pages/archive.module.scss";

const getEditableArchiveId = (archivedSourceId) => {
  const archivedPrefix = "archivedProject.";

  return archivedSourceId?.startsWith(archivedPrefix)
    ? `archiveProject.${archivedSourceId.slice(archivedPrefix.length)}`
    : null;
};

const mergeStudioProjects = (entries, projects) => {
  const archiveEntryIds = new Set(entries.filter((entry) => entry._type === "archiveProject").map((entry) => entry._id));
  const projectsByArchiveId = new Map(
    projects
      .map((project) => [getEditableArchiveId(project.archivedSourceId), project])
      .filter(([archiveId]) => archiveId),
  );

  const mergedEntries = entries.map((entry) => {
    if (entry._type !== "archiveProject") return entry;

    const project = projectsByArchiveId.get(entry._id);

    if (!project) return entry;

    return {
      ...entry,
      _id: project._id,
      appearance: project.appearance ?? entry.appearance,
      code: project.slug ?? entry.code,
      headerMedia: project.homePageCover?.length ? project.homePageCover : entry.headerMedia,
      href: project.slug ? `/projects/${project.slug}` : undefined,
      title: project.title ?? entry.title,
    };
  });

  const standaloneProjects = projects
    .filter((project) => {
      const archiveId = getEditableArchiveId(project.archivedSourceId);

      return !archiveId || !archiveEntryIds.has(archiveId);
    })
    .map((project) => ({
      _id: project._id,
      _type: "project",
      appearance: project.appearance,
      code: project.slug,
      date: project.meta?.year,
      headerMedia: project.homePageCover,
      href: project.slug ? `/projects/${project.slug}` : undefined,
      title: project.title,
    }));

  return [...mergedEntries, ...standaloneProjects].sort((first, second) => {
    const firstDate = new Date(first.date || 0).getTime();
    const secondDate = new Date(second.date || 0).getTime();

    return secondDate - firstDate;
  });
};

export default function Archive({ entries = [], projects = [] }) {
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const mergedEntries = mergeStudioProjects(entries, projects);

  useEffect(() => {
    const closeExpandedEntry = (event) => {
      if (event.key === "Escape") setExpandedEntryId(null);
    };

    window.addEventListener("keydown", closeExpandedEntry);

    return () => window.removeEventListener("keydown", closeExpandedEntry);
  }, []);

  return (
    <div className="page">
      <main className="main">
        <div className="grid">
          <div className={styles.first}></div>
          {mergedEntries.map((entry) => {
            const isPost = entry._type === "archivePost";

            if (isPost) {
              return <MiniaturePost key={entry._id} post={entry} className={styles.miniaturePost} />;
            }

            return (
              <MiniatureMediaStrip
                key={entry._id}
                appearance={entry.appearance}
                className={styles.miniatureMediaStrip}
                code={entry.code?.toUpperCase()}
                href={entry.href}
                isExpanded={expandedEntryId === entry._id}
                media={entry.headerMedia}
                medium={entry.headerMedia?.[0]?.medium}
                onExpand={() => setExpandedEntryId((currentId) => (currentId === entry._id ? null : entry._id))}
                title={entry.title}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const [entries, projects] = await Promise.all([getArchiveEntries(), getProjects()]);

  return {
    props: {
      entries,
      projects,
    },
    // Refresh static preview and production pages from Sanity at most once per minute.
    revalidate: 5,
  };
}
