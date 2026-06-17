"use client";

import Link from "next/link";
import { PortableText } from "@portabletext/react";
import styles from "./MainNav.module.scss";

export default function MainNav({ data }) {
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
          <div role="button" key={item._id} tabIndex={i}>
            <button className={styles.reveal}>{item.abbr}</button>
            <aside>
              <h2>{item.title}</h2>
            </aside>
          </div>
        ))}
      </menu>
    </nav>
  );
}
