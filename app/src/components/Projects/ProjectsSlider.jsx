'use client'

import { useEffect, useState } from 'react'
import { urlForRef } from '@/lib/sanity'
import styles from './ProjectsSlider.module.scss'

export default function ProjectsSlider({ items, activeIndex, isActive, onToggle }) {
  const [viewportWidth, setViewportWidth] = useState(1920)
  const [viewportHeight, setViewportHeight] = useState(1080)

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth)
      setViewportHeight(window.innerHeight)
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return (
    <section className={`${styles.imgs} ${isActive ? styles.active : ''}`} onClick={onToggle}>
      <div className={styles.imageWrapper}>
        {items.map((item, i) => {
          const ref = item.asset?._ref
          const imageUrl = ref
            ? urlForRef(ref).width(viewportWidth).height(viewportHeight).fit('fill').url()
            : undefined

          return (
            <div
              key={item._id}
              className={`${styles.slide} ${i === activeIndex ? styles.slideActive : ''}`}
              style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
            />
          )
        })}
      </div>
    </section>
  )
}
