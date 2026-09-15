import {createClient} from '@sanity/client'

const sourceType = 'archivedPost'
const postTypes = ['post', 'archivedPost']
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

const getYear = (date) => {
  const year = Number(String(date || '').slice(0, 4))
  return Number.isInteger(year) ? year : null
}

const posts = await client.fetch(
  `*[_type in $postTypes] | order(meta.year asc, _createdAt asc){
    _id,
    _type,
    _createdAt,
    meta{year, slug}
  }`,
  {postTypes},
)

const postsByYear = new Map()

posts.forEach((post) => {
  const year = getYear(post.meta?.year)
  if (!year) return

  const yearPosts = postsByYear.get(year) || []
  yearPosts.push(post)
  postsByYear.set(year, yearPosts)
})

const updates = []

postsByYear.forEach((yearPosts, year) => {
  yearPosts.forEach((post, index) => {
    if (post._type !== sourceType || post.meta?.slug?.current) return

    updates.push({
      code: `C-${String(index + 1).padStart(3, '0')}-${String(year).slice(-2)}`,
      id: post._id,
    })
  })
})

console.log(`Found ${posts.length} archived posts.`)
console.log(`${updates.length} archived posts are missing a code.`)

if (!shouldExecute) {
  updates.slice(0, 10).forEach(({code, id}) => console.log(`${id} -> ${code}`))
  console.log('Preview only: no documents were changed.')
  console.log('Run the same command with -- --execute to add the listed codes.')
  process.exit(0)
}

for (let index = 0; index < updates.length; index += batchSize) {
  const batch = updates.slice(index, index + batchSize)
  const transaction = client.transaction()

  batch.forEach(({code, id}) => transaction.patch(id, {set: {'meta.slug': {_type: 'slug', current: code}}}))

  await transaction.commit()
  console.log(`Updated ${Math.min(index + batch.length, updates.length)} of ${updates.length} archived posts.`)
}

console.log('Finished adding archived post codes.')
