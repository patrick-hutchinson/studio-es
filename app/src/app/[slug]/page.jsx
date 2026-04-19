import { notFound } from 'next/navigation'
import ProjectDetailClient from '@/components/Projects/ProjectDetailClient'
import { fetchSanity } from '@/lib/sanity'

const query = `*[_type == 'project' && meta.slug.current == $slug][0]{
  title,
  description,
  header {
    images[] {
      ...,
      video {
        ...,
        asset->
      }
    }
  },
  "slug": meta.slug.current,
  appearance
}`

export default async function SlugPage({ params }) {
  const { slug } = await params
  const project = await fetchSanity(query, { slug })

  if (!project) notFound()

  return <ProjectDetailClient project={project} />
}
