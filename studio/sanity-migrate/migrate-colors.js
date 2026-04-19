// migrate-colors.js
const { createClient } = require('@sanity/client')
const chroma = require('chroma-js')

const client = createClient({
  projectId: 'kzivqb7t', // <--- ersetzen
  dataset: 'production',       // <--- ggf. anpassen
  token: 'sktsslJsQnlVzS2tv9Ky2gYfTy7VQIxJLF57UfLm7hZ1k21xuK0qmJwKhdycPpzRhFXEQDmZITlCtyO6sCGiQuxY2RaEqva7fCMAF6JRrkz5bdBlckNHe4IWcR3wsp7keISOBgy4Sl0LcD0oao7sjRhfGeeZBrPyU4Wsg9sa5OnBWapl2KCJ',   // <--- Token mit Schreibzugriff
  useCdn: false,
  apiVersion: '2025-01-01',
})

// Alle Feldnamen aus den Schemas, die den Typ "color" verwenden
const colorFields = [
  'font', 'background', 'button', 'fill', 'accent', 'overlay', 'slider', 'highlight'
]

function isHexColor(str) {
  return typeof str === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(str)
}

function expandColorFromHex(hex, alpha = 1) {
  const color = chroma(hex).alpha(alpha)
  const [r, g, b, a] = color.rgba()
  const [hH, sH, l] = color.hsl()
  const [hV, sV, v] = color.hsv()

  return {
    _type: 'color',
    hex: `${hex}`,
    alpha: a,
    hsl: {
      _type: 'hslaColor',
      h: hH,
      s: sH,
      l,
      a
    },
    hsv: {
      _type: 'hsvaColor',
      h: hV,
      s: sV,
      v,
      a
    },
    rgb: {
      _type: 'rgbaColor',
      r,
      g,
      b,
      a
    }
  }
}

function deepTransformColors(obj, changed = { value: false }) {
  if (Array.isArray(obj)) {
    return obj.map(item => deepTransformColors(item, changed))
  }

  if (obj && typeof obj === 'object') {
    const newObj = {}
    for (const key of Object.keys(obj)) {
      const value = obj[key]

      // 1. alte Struktur (string direkt): "#ff00ff" => vollständiges Objekt
      if (colorFields.includes(key) && isHexColor(value)) {
        changed.value = true
        newObj[key] = expandColorFromHex(value)

      // 2. bestehendes Objekt mit nur hex → erweitern
      } else if (
        colorFields.includes(key) &&
        value && typeof value === 'object' &&
        value._type === 'color' &&
        value.hex && typeof value.hex === 'string' &&
        (!value.hsl || !value.rgb || !value.hsv)
      ) {
        changed.value = true
        newObj[key] = expandColorFromHex(value.hex, value.alpha || 1)

      // 3. hex nicht als string (sichern)
      } else if (
        colorFields.includes(key) &&
        value && typeof value === 'object' &&
        value._type === 'color' &&
        value.hex && typeof value.hex !== 'string'
      ) {
        changed.value = true
        newObj[key] = expandColorFromHex(`${value.hex}`, value.alpha || 1)

      } else {
        newObj[key] = deepTransformColors(value, changed)
      }
    }
    return newObj
  }

  return obj
}

async function migrateColors() {
  // Medien-Dokumente ausschließen (Asset-Referenzen etc.)
  const docs = await client.fetch(`*[_type match '*' && _type != 'sanity.imageAsset' && _type != 'sanity.fileAsset'] {_id, _type, ...}`)
  console.log(`Gefundene Dokumente: ${docs.length}`)

  for (const doc of docs) {
    const changeFlag = { value: false }
    const transformed = deepTransformColors(doc, changeFlag)

    if (changeFlag.value) {
      console.log(`✅ Migriere: ${doc._id}`)
      await client
        .patch(doc._id)
        .set(transformed)
        .commit()
    } else {
      console.log(`⏩ Überspringe (unverändert): ${doc._id}`)
    }
  }

  console.log('Fertig.')
}

migrateColors().catch(err => console.error('Fehler bei Migration:', err))