import {createClient} from '@sanity/client'

const batchSize = 25
const shouldExecute = process.argv.includes('--execute')
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  throw new Error('Set SANITY_WRITE_TOKEN in studio/.env before running this migration.')
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'kzivqb7t',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
})

const projects = await client.fetch(`*[_type == 'project' && count(gallery) > 0]{_id, title, gallery}`)

const migrations = projects.flatMap((project) => {
  const legacyItemCount = project.gallery.filter(
    (item) => item?._type === 'imageAsset' || item?._type === 'videoAsset',
  ).length

  if (!legacyItemCount) return []

  const gallery = project.gallery.map((item) => {
    if (item?._type !== 'imageAsset' && item?._type !== 'videoAsset') return item

    return {
      _type: 'rasterGalleryItem',
      _key: item._key,
      media: [item],
      expandable: true,
    }
  })

  return [{...project, gallery, legacyItemCount}]
})

console.log(`Found ${projects.length} projects with Raster Galerie media.`)
console.log(`Found ${migrations.length} projects with legacy Raster Galerie items to convert.`)

migrations.forEach(({_id, title, legacyItemCount}) => {
  console.log(`${_id} (${title || 'Untitled'}): ${legacyItemCount} item(s).`)
})

if (!shouldExecute) {
  console.log('Preview only: no documents were changed.')
  console.log('Run the same command with -- --execute to convert the listed gallery items.')
  process.exit(0)
}

for (let index = 0; index < migrations.length; index += batchSize) {
  const batch = migrations.slice(index, index + batchSize)
  const transaction = client.transaction()

  batch.forEach(({_id, gallery}) => transaction.patch(_id, (patch) => patch.set({gallery})))

  await transaction.commit()
  console.log(`Converted ${Math.min(index + batch.length, migrations.length)} of ${migrations.length} projects.`)
}

console.log('Finished. Reload Sanity Studio to use the new Raster Galerie items.')
