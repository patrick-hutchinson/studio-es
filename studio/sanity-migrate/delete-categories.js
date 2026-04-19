// migrate-colors.js
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'kzivqb7t', // <--- ersetzen
  dataset: 'production',       // <--- ggf. anpassen
  token: 'sktsslJsQnlVzS2tv9Ky2gYfTy7VQIxJLF57UfLm7hZ1k21xuK0qmJwKhdycPpzRhFXEQDmZITlCtyO6sCGiQuxY2RaEqva7fCMAF6JRrkz5bdBlckNHe4IWcR3wsp7keISOBgy4Sl0LcD0oao7sjRhfGeeZBrPyU4Wsg9sa5OnBWapl2KCJ',   // <--- Token mit Schreibzugriff
  useCdn: false,
  apiVersion: '2025-01-01',
})


async function cleanAndPrepareCategories() {
  try {
    // 1. Kategorien mit definiertem Parent finden
    const categories = await client.fetch(
      `*[_type == "category" && defined(parent)]{ _id, title }`
    );

    if (categories.length === 0) {
      console.log('Keine Kategorien mit Parent gefunden.');
      return;
    }

    console.log(`Gefundene Kategorien mit Parent (${categories.length}):\n`);

    // 2. Für jede Kategorie:
    for (const category of categories) {
      console.log(`- Kategorie: ${category.title} (${category._id})`);

      // 2a. Alle Dokumente finden, die diese Kategorie referenzieren
      const referencingDocs = await client.fetch(
        `*[references($categoryId)]{ _id, _type, meta }`,
        { categoryId: category._id }
      );

      if (referencingDocs.length === 0) {
        console.log(`  ➔ Keine referenzierenden Dokumente gefunden.`);
        continue;
      }

      console.log(`  ➔ ${referencingDocs.length} referenzierende Dokument(e) gefunden.`);

      // 2b. Jeden Treffer aktualisieren: Referenzen aus meta.category und meta.searchtag entfernen
      for (const doc of referencingDocs) {
        console.log(`    - Bearbeite Dokument: ${doc._type} (${doc._id})`);

        const patches = {};

        // --- meta.category prüfen ---
        if (doc.meta?.category?._ref === category._id) {
          console.log(`      ➔ Referenz in 'meta.category' gefunden. Setze auf null.`);
          patches['meta.category'] = null;
        }

        // --- meta.searchtag prüfen ---
        if (Array.isArray(doc.meta?.searchtag)) {
          const updatedSearchtags = doc.meta.searchtag.filter(
            (ref) => ref?._ref !== category._id
          );

          if (updatedSearchtags.length !== doc.meta.searchtag.length) {
            console.log(`      ➔ Referenz in 'meta.searchtag' entfernt.`);
            patches['meta.searchtag'] = updatedSearchtags;
          }
        }

        if (Object.keys(patches).length > 0) {
          await client
            .patch(doc._id)
            .set(patches)
            .commit();
          console.log(`    ➔ Dokument erfolgreich aktualisiert.`);
        } else {
          console.log(`    ➔ Keine relevanten Referenzen gefunden.`);
        }
      }
    }

    console.log('\nFertig! Kategorien können jetzt gelöscht werden (keine Referenzen mehr).');

  } catch (error) {
    console.error('Fehler bei der Verarbeitung:', error);
  }
}

cleanAndPrepareCategories();
