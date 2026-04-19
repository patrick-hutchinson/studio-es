'use client'

import { useEffect, useMemo, useState } from 'react'
import { urlForRef } from '@/lib/sanity'
import styles from './SectionsSlider.module.scss'

export default function SectionsSlider({ section }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentImage = useMemo(
    () => section.images?.[Math.abs(currentIndex) % (section.images?.length ?? 1)],
    [currentIndex, section.images],
  )

  const hasMultiple = (section.images?.length ?? 0) > 1
  const displayIndex = (Math.abs(currentIndex) % (section.images?.length ?? 1)) + 1

  useEffect(() => {
    if (!hasMultiple) return

    const image = currentImage
    const duration =
      image?._type === 'video' && image?.asset?.data?.duration ? image.asset.data.duration * 1010 : 3000

    const timer = setTimeout(() => setCurrentIndex((value) => value + 1), duration)
    return () => clearTimeout(timer)
  }, [currentImage, hasMultiple])

  const next = () => setCurrentIndex((value) => value + 1)
  const prev = () => setCurrentIndex((value) => value - 1)

  const backgroundColor = section.background_color?.hex || '#000'
  const captionColor = currentImage?.font?.hex || '#fff'

  const bgRef = section.background_image?.asset?._ref
  const imageRef = currentImage?.asset?._ref

  return (
    <section className={styles.sliderWrapper} style={{ background: backgroundColor }}>
      {hasMultiple ? <button className={`${styles.nav} ${styles.prev}`} onClick={prev} /> : null}
      {hasMultiple ? <button className={`${styles.nav} ${styles.next}`} onClick={next} /> : null}

      {section.background_type === 'blur' && bgRef ? (
        <div className={styles.afterBlur}>
          <img className={styles.bgBlur} src={urlForRef(bgRef).width(1600).url()} alt="" />
        </div>
      ) : null}

      <div className={`${styles.slide} ${section.inset ? styles.inset : ''}`}>
        <div className={styles.mediaWrapper}>
          {currentImage?._type === 'image' && imageRef ? (
            <img
              src={urlForRef(imageRef).width(1600).url()}
              alt=""
              className={`${styles.media} ${section.inset ? styles.objectContain : styles.objectCover} ${
                section.inset ? styles.insetShadow : ''
              }`}
            />
          ) : null}
        </div>
      </div>

      <div className={styles.caption} style={{ color: captionColor }}>
        <span>{hasMultiple ? `${displayIndex}/${section.images.length}` : ''}</span>
        <span>{currentImage?.caption}</span>
      </div>
    </section>
  )
}
