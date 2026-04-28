"use client";

import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { useEffect, useState } from "react";
import { groq } from "@/lib/sanity";
import styles from "./MainNav.module.scss";

const query = groq`
  {
    "studio": *[_type == "studio"][0]{
      gmaps,
      copy
    },
    "categories": *[_type == "category"] | order(_createdAt asc){
      _id,
      title,
      _type,
      abbr,
      description
    }
  }
`;

export default function MainNav({ activeCategory, onSetCategory }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const url = `/api/sanity?q=${encodeURIComponent(query)}`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData({ categories: [] }));
  }, []);

  return (
    <nav className={styles.nav}>
      <header>
        <h1 className={styles.reveal}>This page is currently in progress.</h1>
        <aside>{data?.studio?.copy ? <PortableText value={data.studio.copy} /> : null}</aside>
        <Link href="mailto:info@studio-es.at" className={styles.reveal}>
          Contact
        </Link>
        <aside>
          <h2>info@studio-es.at</h2>
        </aside>
      </header>
      <menu>
        <h3>Filter</h3>
        {(data?.categories ?? []).map((item, i) => (
          <div
            role="button"
            key={item._id}
            tabIndex={i}
            onClick={() => onSetCategory(item._id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onSetCategory(item._id);
            }}
          >
            <button className={`${styles.reveal} ${activeCategory === item._id ? styles.active : ""}`}>{item.abbr}</button>
            <aside>
              <h2>{item.title}</h2>
            </aside>
          </div>
        ))}
        {/* <button onClick={() => onSetCategory(null)}>(Reset)</button> */}
      </menu>
    </nav>
  );
}
