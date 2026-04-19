import { createClient } from '@sanity/client';
import { v4 as uuid } from 'uuid'

const client = createClient({
  projectId: 'kzivqb7t', // <--- ersetzen
  dataset: 'production',       // <--- ggf. anpassen
  token: 'sktsslJsQnlVzS2tv9Ky2gYfTy7VQIxJLF57UfLm7hZ1k21xuK0qmJwKhdycPpzRhFXEQDmZITlCtyO6sCGiQuxY2RaEqva7fCMAF6JRrkz5bdBlckNHe4IWcR3wsp7keISOBgy4Sl0LcD0oao7sjRhfGeeZBrPyU4Wsg9sa5OnBWapl2KCJ',   // <--- Token mit Schreibzugriff
  useCdn: false,
  apiVersion: '2025-01-01',
})

async function migrateVideoSizeToVideo() {
  const docs = await client.fetch(`
    *[_type == "project" && defined(header.images)]{
      _id,
      _rev,
      header
    }
  `)

  console.log(`📄 Found ${docs.length} documents.\n`)

  for (const doc of docs) {
    const oldImages = doc.header?.images || []
    let changed = false

    const newImages = oldImages.map((item) => {
      if (
        item._type === 'video-size' &&
        item.video?.asset?._ref
      ) {
        changed = true

        return {
          _type: 'video',
          _key: item._key || uuid(),
          video: {
            _type: 'mux.video',
            asset: {
              _ref: item.video.asset._ref,
              _type: 'reference',
              _weak: item.video.asset._weak || true
            }
          }
        }
      }

      return item
    })

    if (changed) {
      console.log(`🔧 Updating: ${doc._id}`)

      await client
        .patch(doc._id)
        .set({ 'header.images': newImages })
        .ifRevisionId(doc._rev)
        .commit()
        .then(() => console.log(`✅ Updated ${doc._id}`))
        .catch((err) => console.error(`❌ Failed to update ${doc._id}`, err))
    }
  }

  console.log('\n🏁 Migration finished.')
}

migrateVideoSizeToVideo()