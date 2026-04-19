import { urlForRef } from '@/lib/sanity'
import styles from './SectionsGrid.module.scss'

export default function SectionsGrid({ section }) {
  if (!section?._type) return null

  return (
    <section className={styles.gridSection}>
      <div className={styles.grid}>
        {section.items?.map((item, i) => (
          <div key={i} className={styles.gridItem}>
            {item.images?.map((img, j) => {
              const ref = img?.asset?._ref
              if (!ref) return null

              return <img key={j} src={urlForRef(ref).width(1200).url()} alt="" />
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
