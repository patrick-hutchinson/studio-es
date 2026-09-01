import {createClient} from '@sanity/client'

const sourceType = 'project'
const targetType = 'archivedProject'
const batchSize = 50
const shouldExecute = process.argv.includes('--execute')
const token = process.env.SANITY_WRITE_TOKEN || process.env.FullAccessToken

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

const getArchivedId = (id) => {
  const isDraft = id.startsWith('drafts.')
  const documentId = isDraft ? id.slice('drafts.'.length) : id

  return `${isDraft ? 'drafts.' : ''}${targetType}.${documentId}`
}

const stripSystemFields = (document) => {
  const {_rev, _createdAt, _updatedAt, ...fields} = document

  return fields
}

const rewriteReferences = (value, idMap) => {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteReferences(item, idMap))
  }

  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      if (key === '_ref' && typeof child === 'string' && idMap.has(child)) {
        return [key, idMap.get(child)]
      }

      return [key, rewriteReferences(child, idMap)]
    }),
  )
}

const hasProjectReference = (value, idMap) => {
  if (Array.isArray(value)) return value.some((item) => hasProjectReference(item, idMap))
  if (!value || typeof value !== 'object') return false

  return Object.entries(value).some(([key, child]) =>
    (key === '_ref' && typeof child === 'string' && idMap.has(child)) || hasProjectReference(child, idMap),
  )
}

const commitInBatches = async (items, createTransaction, label) => {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize)
    await createTransaction(batch).commit()
    console.log(`${label}: ${Math.min(index + batch.length, items.length)} of ${items.length}.`)
  }
}

const projects = await client.fetch(`*[_type == $sourceType]`, {sourceType})
const idMap = new Map(projects.map((project) => [project._id, getArchivedId(project._id)]))

console.log(`Found ${projects.length} ${sourceType} documents.`)

if (!shouldExecute) {
  console.log('Preview only: no documents were changed.')
  console.log('Run the same command with -- --execute to archive every listed project.')
  process.exit(0)
}

const contentDocuments = await client.fetch(
  `*[_type != $sourceType && !(_type in ['sanity.imageAsset', 'sanity.fileAsset'])]`,
  {sourceType},
)
const documentsWithProjectReferences = contentDocuments.filter((document) => hasProjectReference(document, idMap))

await commitInBatches(
  projects,
  (batch) => {
    const transaction = client.transaction()

    batch.forEach((project) => {
      const archivedProject = {
        ...rewriteReferences(stripSystemFields(project), idMap),
        _id: idMap.get(project._id),
        _type: targetType,
      }

      transaction.createIfNotExists(archivedProject)
    })

    return transaction
  },
  'Created archived copies',
)

await commitInBatches(
  documentsWithProjectReferences,
  (batch) => {
    const transaction = client.transaction()

    batch.forEach((document) => transaction.createOrReplace(rewriteReferences(stripSystemFields(document), idMap)))

    return transaction
  },
  'Updated project references',
)

await commitInBatches(
  projects,
  (batch) => {
    const transaction = client.transaction()

    batch.forEach((project) => transaction.delete(project._id))

    return transaction
  },
  'Removed original projects',
)

const [remainingProjects, archivedProjects] = await Promise.all([
  client.fetch(`count(*[_type == $sourceType])`, {sourceType}),
  client.fetch(`count(*[_type == $targetType])`, {targetType}),
])

console.log(`Finished. Remaining active projects: ${remainingProjects}. Archived projects: ${archivedProjects}.`)
