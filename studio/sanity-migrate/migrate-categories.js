// migrate-categories.js
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'kzivqb7t', // <--- ersetzen
  dataset: 'production',       // <--- ggf. anpassen
  token: 'sktsslJsQnlVzS2tv9Ky2gYfTy7VQIxJLF57UfLm7hZ1k21xuK0qmJwKhdycPpzRhFXEQDmZITlCtyO6sCGiQuxY2RaEqva7fCMAF6JRrkz5bdBlckNHe4IWcR3wsp7keISOBgy4Sl0LcD0oao7sjRhfGeeZBrPyU4Wsg9sa5OnBWapl2KCJ',   // <--- Token mit Schreibzugriff
  useCdn: false,
  apiVersion: '2025-01-01',
})

async function migrate() {
  const documents = await client.fetch(`*[_type == "post" && category._type == "reference"]{
    _id,
    _rev,
    category
  }`)

  console.log(`Gefundene Dokumente zur Migration: ${documents.length}`)

  for (const doc of documents) {
    const { _id, category } = doc

    if (category?._type === 'reference') {
      const patch = client.patch(_id)
        .set({ category: [category] }) // in Array umwandeln
        .commit()

      await patch
      console.log(`✔️ ${_id} migriert`)
    } else {
      console.log(`⚠️ ${_id} hat kein gültiges Referenzfeld`)
    }
  }

  console.log('✅ Migration abgeschlossen')
}

migrate().catch(err => {
  console.error('❌ Fehler bei der Migration:', err)
})
