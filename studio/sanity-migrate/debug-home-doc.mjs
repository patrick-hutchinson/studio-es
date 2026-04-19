import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@sanity/client'

const envPath = path.resolve(process.cwd(), '.env')
const envRaw = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
const env = Object.fromEntries(
  envRaw
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=')
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      return [key, value]
    }),
)

const token = process.env.SANITY_AUTH_TOKEN || process.env.FullAccessToken || env.SANITY_AUTH_TOKEN || env.FullAccessToken
const client = createClient({
  projectId: 'kzivqb7t',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
})

const id = 'b7605842-c2ca-4d2e-aac8-96bd835dd082'
const doc = await client.fetch('*[_id == $id][0]', { id })
console.log(JSON.stringify({
  exists: !!doc,
  id: doc?._id,
  type: doc?._type,
  title: doc?.title,
  introType: typeof doc?.intro,
  introLength: doc?.intro?.length ?? 0,
  imagesCount: Array.isArray(doc?.images) ? doc.images.length : 0,
  sampleImage: doc?.images?.[0] ? {
    _type: doc.images[0]._type,
    hasAsset: !!doc.images[0].asset,
    assetRef: doc.images[0].asset?._ref,
  } : null,
  keys: doc ? Object.keys(doc) : [],
}, null, 2))
