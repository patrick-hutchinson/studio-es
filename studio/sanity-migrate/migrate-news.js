
// 🔧 Konfiguration direkt im Code
const projectId = 'kzivqb7t'; // <--- ersetzen
const dataset = 'production';
const token = 'sktsslJsQnlVzS2tv9Ky2gYfTy7VQIxJLF57UfLm7hZ1k21xuK0qmJwKhdycPpzRhFXEQDmZITlCtyO6sCGiQuxY2RaEqva7fCMAF6JRrkz5bdBlckNHe4IWcR3wsp7keISOBgy4Sl0LcD0oao7sjRhfGeeZBrPyU4Wsg9sa5OnBWapl2KCJ';   // <--- Token mit Schreibzugriff
const apiBase = `https://${projectId}.api.sanity.io/v2021-06-07`;
const documentId = 'b7605842-c2ca-4d2e-aac8-96bd835dd082';

const categoryRef = {
  _type: 'reference',
  _ref: '6cdcc60d-e006-4005-9822-1d05caf410a7'
};

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const today = new Date().toISOString().split('T')[0];

// 📥 1. Original-Dokument laden
async function fetchOriginalDocument() {
  const query = `*[_id == "${documentId}"][0]`;
  const url = `${apiBase}/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Fehler beim Abrufen des Dokuments: ${res.status}`);
  }

  const json = await res.json();
  return json.result;
}

// 📝 2. Einzelnen Post erstellen
async function createPostFromEntry(entry, index, total) {
  const post = {
    _type: 'post',
    date: today,
    category: categoryRef
  };

  if (entry.title) post.title = entry.title;
  if (entry.appearance) post.appearance = entry.appearance;

  const payload = { mutations: [{ create: post }] };

  try {
    const res = await fetch(`${apiBase}/data/mutate/${dataset}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(`❌ Fehler bei Eintrag ${index}:`, JSON.stringify(json, null, 2));
    } else {
      console.log(`✅ Post ${index + 1}/${total} erstellt`);
    }
  } catch (err) {
    console.error(`❌ Netzwerkfehler bei Eintrag ${index}:`, err.message);
  }
}

// 🔁 3. Hauptfunktion
async function run() {
  try {
    const doc = await fetchOriginalDocument();
    const newsArray = (doc?.news || []).filter(entry => entry._type === 'postNews');

    console.log(`🔍 Gefundene 'postNews'-Einträge: ${newsArray.length}`);

    for (let i = 0; i < newsArray.length; i++) {
      await createPostFromEntry(newsArray[i], i, newsArray.length);
      await new Promise(resolve => setTimeout(resolve, 150)); // optionales Delay
    }

    console.log('🎉 Alle `postNews`-Einträge wurden als neue Posts erstellt!');
  } catch (err) {
    console.error('❌ Hauptfehler:', err.message);
  }
}

run();
