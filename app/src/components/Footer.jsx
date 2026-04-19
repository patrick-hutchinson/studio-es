import Link from 'next/link'
import styles from './Footer.module.scss'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className={styles.grid}>
        <div className={styles.colSpan2}>© Studio Es, 2013-{year}</div>
        <div className={styles.colSpan4}>This archive does not use cookies for tracking or data storage purposes.</div>
        <div className={styles.colSpan2}>
          <Link href="/legal">Legal, Data Policy</Link>
        </div>
      </div>
    </footer>
  )
}
