'use client'

import { useMemo, useState } from 'react'
import ProjectsGallery from './ProjectsGallery'
import ProjectsHeader from './ProjectsHeader'
import styles from './ProjectDetailClient.module.scss'

export default function ProjectDetailClient({ project }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const imageCount = project.header?.images?.length ?? 0

  const counter = useMemo(() => {
    if (!imageCount) return '0/0'
    return `${currentIndex + 1}/${imageCount}`
  }, [currentIndex, imageCount])

  const cssVars = {
    '--bg': project.appearance?.background?.hex ?? '#fff',
    '--color': project.appearance?.font?.hex ?? '#000',
  }

  return (
    <main className={styles.project} style={cssVars}>
      <ProjectsHeader slug={project.slug} title={project.title} counter={counter} />
      <ProjectsGallery items={project.header?.images ?? []} onIndexChange={setCurrentIndex} />
    </main>
  )
}
