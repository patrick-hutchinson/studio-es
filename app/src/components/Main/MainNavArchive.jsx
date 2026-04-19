'use client'

import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { useEffect, useState } from 'react'
import { groq } from '@/lib/sanity'
import styles from './MainNavArchive.module.scss'

const query = groq`
  {
    "studio": *[_type == "studio"][0]{
      gmaps,
      copy
    },
    "categories": *[_type == "category" && !defined(parent)] | order(_createdAt asc){
      _id,
      title,
      _type,
      abbr,
      description
    }
  }
`

export default function MainNavArchive({ onSetCategory }) {
  const [navActive] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    const url = `/api/sanity?q=${encodeURIComponent(query)}`
    fetch(url)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData({ categories: [] }))
  }, [])

  return (
    <nav className={styles.nav}>
      <header>
        <h1>Studio Es, a visual communication practice.</h1>
      </header>
      {navActive ? (
        <aside>
          {data?.studio?.copy ? <PortableText value={data.studio.copy} /> : null}
          <dl>
            {(data?.categories ?? []).map((item, i) => (
              <div
                role="button"
                key={item._id}
                tabIndex={i}
                onClick={() => onSetCategory(item._id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onSetCategory(item._id)
                }}
              >
                <dd>{item.title}</dd>
                <dt>{item.abbr}</dt>
              </div>
            ))}
          </dl>
          <dl>
            <Link href={data?.studio?.gmaps?.href ?? '#'} target={data?.studio?.gmaps?.blank ? '_blank' : undefined}>
              <dd>Based in Vienna</dd>
              <dt className="line-through">lg</dt>
            </Link>
          </dl>
        </aside>
      ) : null}
    </nav>
  )
}
