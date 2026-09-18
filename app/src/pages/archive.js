import { useState } from "react";

import MiniatureMediaStrip from "@/components/MiniatureMediaStrip/MiniatureMediaStrip";
import MiniaturePost from "@/components/MiniaturePost/MiniaturePost";
import { getArchivedEntries } from "@/lib/sanity";

import styles from "@/styles/pages/archive.module.scss";

export default function Archive({ entries = [] }) {
  const [expandedEntryId, setExpandedEntryId] = useState(null);

  return (
    <div className="page">
      <main className="main">
        <div className="grid">
          <div className={styles.first}></div>
          {entries.map((entry) => {
            const isPost = entry._type === "archivedPost";

            if (isPost) {
              return <MiniaturePost key={entry._id} post={entry} className={styles.miniaturePost} />;
            }

            return (
              <MiniatureMediaStrip
                key={entry._id}
                appearance={entry.appearance}
                className={styles.miniatureMediaStrip}
                isExpanded={expandedEntryId === entry._id}
                media={entry.headerMedia}
                medium={entry.headerMedia?.[0]?.medium}
                onExpand={() => setExpandedEntryId(entry._id)}
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
  const entries = await getArchivedEntries();

  return {
    props: {
      entries,
    },
    // Refresh static preview and production pages from Sanity at most once per minute.
    revalidate: 5,
  };
}
