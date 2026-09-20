import {createClient} from '@sanity/client'

const batchSize = 50
const shouldExecute = process.argv.includes('--execute')
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  throw new Error('Set SANITY_WRITE_TOKEN in studio/.env before running this cleanup.')
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'kzivqb7t',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
})

const editableArchiveIds = await client.fetch('*[_type in $types]._id', {
  types: ['archiveProject', 'archivePost'],
})

// These IDs can only have been made by copying a source document draft.
const duplicateIds = editableArchiveIds.filter(
  (id) => id.startsWith('archiveProject.drafts.') || id.startsWith('archivePost.drafts.'),
)

console.log(`Found ${duplicateIds.length} generated editable draft copies.`)

if (!shouldExecute) {
  console.log('Preview only: no documents were deleted.')
  console.log('Run the same command with -- --execute to remove only these duplicate copies.')
  process.exit(0)
}

for (let index = 0; index < duplicateIds.length; index += batchSize) {
  const batch = duplicateIds.slice(index, index + batchSize)
  const transaction = client.transaction()

  batch.forEach((id) => transaction.delete(id))
  await transaction.commit()
  console.log(`Deleted: ${Math.min(index + batch.length, duplicateIds.length)} of ${duplicateIds.length}.`)
}

console.log('Finished. Protected archive documents were not changed.')
