// migrate-header-media.js
import { createClient } from '@sanity/client'
import { v4 as uuidv4 } from 'uuid'

// === Sanity Client konfigurieren ===
const client = createClient({
  projectId: 'kzivqb7t', // <--- ersetzen
  dataset: 'production',       // <--- ggf. anpassen
  token: 'sktsslJsQnlVzS2tv9Ky2gYfTy7VQIxJLF57UfLm7hZ1k21xuK0qmJwKhdycPpzRhFXEQDmZITlCtyO6sCGiQuxY2RaEqva7fCMAF6JRrkz5bdBlckNHe4IWcR3wsp7keISOBgy4Sl0LcD0oao7sjRhfGeeZBrPyU4Wsg9sa5OnBWapl2KCJ',   // <--- Token mit Schreibzugriff
  useCdn: false,
  apiVersion: '2025-01-01',
})

function extractMediaFromSections(sections = []) {
  const media = []
  for (const section of sections) {
    if (Array.isArray(section.images)) {
      for (const e of section.images) {
        if (e._type === 'image') media.push({ ...e, _key: uuidv4() })
        if (e._type === 'video') media.push({ _type: 'video', _key: uuidv4(), video: e.video })
      }
    }
    if (Array.isArray(section.items)) {
      for (const item of section.items) {
        if (Array.isArray(item.images)) {
          for (const e of item.images) {
            if (e._type === 'image') media.push({ ...e, _key: uuidv4() })
            if (e._type === 'video') media.push({ _type: 'video', _key: uuidv4(), video: e.video })
          }
        }
      }
    }
  }
  return media
}

async function migrate() {
  // 1) alle Projekte abfragen, die sections enthalten
  const projects = await client.fetch(
    `*[_type == "project" && count(section) > 0]{ _id, header, section }`
  )
  console.log(`🔍 Gefundene Projekte mit Sections: ${projects.length}`)

  // 2) pro Projekt Extraktion und Patch
  for (const doc of projects) {
    const existingHeader = doc.header || {}
    const existingMedia  = Array.isArray(existingHeader.images) ? existingHeader.images : []

    // bereits vorhandene refs sammeln
    const existingRefs = new Set(
      existingMedia
        .map((m) => m.asset?._ref || m.video?.asset?._ref)
        .filter(Boolean)
    )

    // Medien aus sections extrahieren
    const extracted = extractMediaFromSections(doc.section)
    const toAdd = extracted.filter((m) => {
      const ref = m.asset?._ref || m.video?.asset?._ref
      return ref && !existingRefs.has(ref)
    })

    if (toAdd.length === 0) continue

    // neuen Header-Wert bauen
    const updatedHeader = {
      _type: 'gallery',
      display: existingHeader.display || 'carousel',
      size:    existingHeader.size    || 'small',
      images:  [...existingMedia, ...toAdd],
    }

    // 3) Patch ausführen
    console.log(`✏️  Patch project ${doc._id}: +${toAdd.length} media entries`)
    await client
      .patch(doc._id)
      .set({ header: updatedHeader })
      .commit({ autoGenerateArrayKeys: false }) // keys haben wir selbst generiert
  }

  console.log('✅ Migration abgeschlossen.')
}

migrate().catch((err) => {
  console.error('❌ Migration fehlgeschlagen:', err.message)
  process.exit(1)
})
