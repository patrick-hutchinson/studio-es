import Link from 'next/link'
import styles from './ProjectsHeader.module.scss'

export default function ProjectsHeader({ slug, title, counter }) {
  return (
    <header className={styles.header}>
      <section>
        <h1>
          <span className={styles.slug}>{slug}</span>
          <span>{title}</span>
        </h1>
      </section>
      <aside>
        <h3>{counter}</h3>
        <Link href="/">Back</Link>
      </aside>
    </header>
  )
}
