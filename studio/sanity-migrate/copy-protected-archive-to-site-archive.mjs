import {createClient} from '@sanity/client'

const sourceToTargetType = {
  archivedProject: 'archiveProject',
  archivedPost: 'archivePost',
}
const batchSize = 50
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

const stripSystemFields = (document) => {
  const {_rev, _createdAt, _updatedAt, ...fields} = document

  return fields
}

const getEditableArchiveId = (id, sourceType, targetType) => {
  const sourcePrefix = `${sourceType}.`
  const suffix = id.startsWith(sourcePrefix) ? id.slice(sourcePrefix.length) : id

  return `${targetType}.${suffix}`
}

// Drafts are alternate editing versions, not additional archive entries.
const documents = await client.fetch('*[_type in $types && !(_id in path("drafts.**"))]', {
  types: Object.keys(sourceToTargetType),
})

const copies = documents.map((document) => {
  const targetType = sourceToTargetType[document._type]

  return {
    ...stripSystemFields(document),
    _id: getEditableArchiveId(document._id, document._type, targetType),
    _type: targetType,
  }
})

console.log(`Found ${documents.length} protected archive documents.`)
console.log(
  `Prepared ${copies.filter((document) => document._type === 'archiveProject').length} projects and ${
    copies.filter((document) => document._type === 'archivePost').length
  } posts for the editable archive.`,
)

if (!shouldExecute) {
  console.log('Preview only: no documents were created.')
  console.log('Run the same command with -- --execute to create the editable archive copies.')
  process.exit(0)
}

for (let index = 0; index < copies.length; index += batchSize) {
  const batch = copies.slice(index, index + batchSize)
  const transaction = client.transaction()

  batch.forEach((document) => transaction.createIfNotExists(document))
  await transaction.commit()
  console.log(`Created: ${Math.min(index + batch.length, copies.length)} of ${copies.length}.`)
}

console.log('Finished. Protected archive documents were not changed.')
