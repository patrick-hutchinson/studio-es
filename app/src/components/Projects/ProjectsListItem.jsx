import Link from 'next/link'
import styles from './ProjectsListItem.module.scss'

export default function ProjectsListItem({ title, slug, category, font, background, className }) {
  const itemStyle = {
    '--background-color': background ?? '#ffffff',
    '--font-color': font ?? '#000000',
  }

  return (
    <li className={`${styles.item} ${className ?? ''}`}>
      {slug ? (
        <Link href={`/${slug}`} style={itemStyle}>
          <span className={styles.slug}>{slug}</span>
          <span className={styles.label}>{category?.title}</span>
          <span className={styles.project}>{title}</span>
        </Link>
      ) : (
        <span style={itemStyle}>
          <span className={styles.label}>{category?.title}</span>
          <span className={styles.project}>{title}</span>
        </span>
      )}
    </li>
  )
}
