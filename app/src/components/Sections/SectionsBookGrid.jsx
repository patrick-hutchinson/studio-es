import { urlForRef } from '@/lib/sanity'
import styles from './SectionsBookGrid.module.scss'

export default function SectionsBookGrid({ section }) {
  return (
    <section className={styles.bookGridSection}>
      <div className={styles.grid}>
        {section.images?.map((item, i) => {
          if (item?._type !== 'image' || !item?.asset?._ref) return null

          return (
            <div key={i} className={styles.gridItem}>
              <img src={urlForRef(item.asset._ref).width(1200).url()} alt="" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
