import HomeClient from './HomeClient'
import { fetchSanity, groq } from '@/lib/sanity'

const query = groq`
  {
    "home": *[_type=="home" && _id=="b7605842-c2ca-4d2e-aac8-96bd835dd082"][0]{
      images,intro
    },
    "projects": *[_type in ['project', 'post']]{
      _id,
      _type,
      "date": meta.year,
      "title": select(
        _type == "post" => pt::text(title),
        _type == "project" => coalesce(longTitle, title)
      ),
      "category": coalesce(category[0]->, meta.category->),
      "categories": coalesce(category->, categories[]->),
      "slug": meta.slug.current,
      "img": header.images[0],
      "font": appearance.font,
      "background": appearance.background,
      "size": header.size
    } | order(date desc)
  }
`

export default async function HomePage() {
  const data = await fetchSanity(query)
  return <HomeClient data={data} />
}
