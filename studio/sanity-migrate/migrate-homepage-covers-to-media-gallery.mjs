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

const getLegacyMedia = (homePageCover) => {
  if (!homePageCover || Array.isArray(homePageCover)) return null

  const media = homePageCover[homePageCover.type] || homePageCover.gallery || homePageCover.image || homePageCover.video

  if (!Array.isArray(media)) {
    throw new Error('Legacy homePageCover does not contain a media array.')
  }

  const invalidMedia = media.find(
    (item) => item?._type !== 'imageAsset' && item?._type !== 'videoAsset',
  )

  if (invalidMedia) {
    throw new Error(`Unsupported media item type: ${invalidMedia._type || 'missing _type'}.`)
  }

  return media
}

const projects = await client.fetch(
  `*[_type == 'project' && defined(homePageCover)]{_id, title, homePageCover}`,
)

const migrations = projects.flatMap((project) => {
  try {
    const media = getLegacyMedia(project.homePageCover)
    return media === null ? [] : [{...project, media}]
  } catch (error) {
    throw new Error(`${project._id} (${project.title || 'Untitled'}): ${error.message}`)
  }
})

console.log(`Found ${projects.length} projects with a homepage cover.`)
console.log(`Found ${migrations.length} legacy covers to convert to mediaGallery arrays.`)

migrations.forEach(({_id, title, media}) => {
  console.log(`${_id} (${title || 'Untitled'}): ${media.length} media item(s).`)
})

if (!shouldExecute) {
  console.log('Preview only: no documents were changed.')
  console.log('Run the same command with -- --execute to convert the listed covers.')
  process.exit(0)
}

for (let index = 0; index < migrations.length; index += batchSize) {
  const batch = migrations.slice(index, index + batchSize)
  const transaction = client.transaction()

  batch.forEach(({_id, media}) => transaction.patch(_id, (patch) => patch.set({homePageCover: media})))

  await transaction.commit()
  console.log(`Converted ${Math.min(index + batch.length, migrations.length)} of ${migrations.length} covers.`)
}

console.log('Finished. Reload Sanity Studio to see the normalized mediaGallery values.')
