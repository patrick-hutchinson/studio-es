import {createClient} from '@sanity/client'

const sourceType = 'post'
const targetType = 'archivedPost'
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
  if (Array.isArray(value)) return value.map((item) => rewriteReferences(item, idMap))
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

const hasPostReference = (value, idMap) => {
  if (Array.isArray(value)) return value.some((item) => hasPostReference(item, idMap))
  if (!value || typeof value !== 'object') return false

  return Object.entries(value).some(([key, child]) =>
    (key === '_ref' && typeof child === 'string' && idMap.has(child)) || hasPostReference(child, idMap),
  )
}

const commitInBatches = async (items, createTransaction, label) => {
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize)
    await createTransaction(batch).commit()
    console.log(`${label}: ${Math.min(index + batch.length, items.length)} of ${items.length}.`)
  }
}

const posts = await client.fetch(`*[_type == $sourceType]`, {sourceType})
const idMap = new Map(posts.map((post) => [post._id, getArchivedId(post._id)]))

console.log(`Found ${posts.length} ${sourceType} documents.`)

if (!shouldExecute) {
  console.log('Preview only: no documents were changed.')
  console.log('Run the same command with -- --execute to archive every listed post.')
  process.exit(0)
}

const contentDocuments = await client.fetch(
  `*[_type != $sourceType && !(_type in ['sanity.imageAsset', 'sanity.fileAsset'])]`,
  {sourceType},
)
const documentsWithPostReferences = contentDocuments.filter((document) => hasPostReference(document, idMap))

await commitInBatches(
  posts,
  (batch) => {
    const transaction = client.transaction()

    batch.forEach((post) => {
      const archivedPost = {
        ...rewriteReferences(stripSystemFields(post), idMap),
        _id: idMap.get(post._id),
        _type: targetType,
      }

      transaction.createIfNotExists(archivedPost)
    })

    return transaction
  },
  'Created archived copies',
)

await commitInBatches(
  documentsWithPostReferences,
  (batch) => {
    const transaction = client.transaction()

    batch.forEach((document) => transaction.createOrReplace(rewriteReferences(stripSystemFields(document), idMap)))

    return transaction
  },
  'Updated post references',
)

await commitInBatches(
  posts,
  (batch) => {
    const transaction = client.transaction()

    batch.forEach((post) => transaction.delete(post._id))

    return transaction
  },
  'Removed original posts',
)

const [remainingPosts, archivedPosts] = await Promise.all([
  client.fetch(`count(*[_type == $sourceType])`, {sourceType}),
  client.fetch(`count(*[_type == $targetType])`, {targetType}),
])

console.log(`Finished. Remaining active posts: ${remainingPosts}. Archived posts: ${archivedPosts}.`)
