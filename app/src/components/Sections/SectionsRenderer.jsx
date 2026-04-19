import SectionsBookGrid from './SectionsBookGrid'
import SectionsGrid from './SectionsGrid'
import SectionsSlider from './SectionsSlider'

export default function SectionsRenderer({ section }) {
  if (!section?._type) return null

  if (section._type === 'slider') return <SectionsSlider section={section} />
  if (section._type === 'grid') return <SectionsGrid section={section} />
  if (section._type === 'grid-book') return <SectionsBookGrid section={section} />

  return null
}
