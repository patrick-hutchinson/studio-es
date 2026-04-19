import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import fs from 'node:fs'
import path from 'node:path'

const PROJECT_ID = 'kzivqb7t'
const DATASET = 'production'
const API_VERSION = '2025-01-01'
const HOMEPAGE_ID = 'b7605842-c2ca-4d2e-aac8-96bd835dd082'

function readEnvFileToken() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return undefined

  const envRaw = fs.readFileSync(envPath, 'utf8')
  const lines = envRaw.split(/\r?\n/)
  const envMap = {}

  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue
    const index = line.indexOf('=')
    if (index < 0) continue
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
    envMap[key] = value
  }

  return envMap.SANITY_AUTH_TOKEN || envMap.FullAccessToken
}

const token = process.env.SANITY_AUTH_TOKEN || process.env.FullAccessToken || readEnvFileToken()
const client = token
  ? createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      apiVersion: API_VERSION,
      token,
      useCdn: false,
    })
  : getCliClient({
      apiVersion: API_VERSION,
      dataset: DATASET,
      useCdn: false,
    })

const toBackupId = (id) => `backup.news.${id}.${Date.now()}`
const toCreateable = (doc) => {
  const { _rev, _createdAt, _updatedAt, ...rest } = doc
  return rest
}

async function migrateDocument(id) {
  const doc = await client.fetch(`*[_id == $id][0]`, { id })

  if (!doc) {
    console.log(`No document found for ${id}`)
    return
  }

  if (doc._type === 'home') {
    const backupId = toBackupId(id)
    const backupDoc = {
      ...toCreateable(doc),
      _id: backupId,
      _type: 'news',
    }
    await client.createIfNotExists(backupDoc)
    console.log(`${id} is already type "home"`)
    console.log(`Created backup snapshot ${backupId} as type "news"`)
    return
  }

  if (doc._type !== 'news') {
    console.log(`${id} is type "${doc._type}", expected "news". Skipping for safety.`)
    return
  }

  const backupId = toBackupId(id)
  const backupDoc = {
    ...toCreateable(doc),
    _id: backupId,
    _type: 'news',
  }

  const recreatedHomeDoc = {
    ...toCreateable(doc),
    _id: id,
    _type: 'home',
  }

  await client.createIfNotExists(backupDoc)
  await client.delete(id)
  await client.create(recreatedHomeDoc)

  console.log(`Backed up ${id} -> ${backupId}`)
  console.log(`Recreated ${id} as type "home"`)
}

async function run() {
  await migrateDocument(HOMEPAGE_ID)
  await migrateDocument(`drafts.${HOMEPAGE_ID}`)
  console.log('Done.')
}

run().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
