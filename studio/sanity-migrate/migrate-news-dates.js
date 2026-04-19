
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'kzivqb7t',   // <-- your project ID
  dataset: 'production',       // <-- usually 'production'
  apiVersion: '2023-01-01',     // <-- any current API version
  token: 'sktsslJsQnlVzS2tv9Ky2gYfTy7VQIxJLF57UfLm7hZ1k21xuK0qmJwKhdycPpzRhFXEQDmZITlCtyO6sCGiQuxY2RaEqva7fCMAF6JRrkz5bdBlckNHe4IWcR3wsp7keISOBgy4Sl0LcD0oao7sjRhfGeeZBrPyU4Wsg9sa5OnBWapl2KCJ',      // <-- Token with write permissions
  useCdn: false
});

async function migratePostDates() {
  try {
    // 1. Find all posts that have a "date" field set but no "meta.year"
    const posts = await client.fetch(
      `*[_type == "post"]{ _id }`
    );

    console.log(`Gefundene Posts zum Migrieren: ${posts.length}`);

    if (posts.length === 0) {
      console.log('Keine Posts gefunden, die migriert werden müssen.');
      return;
    }

    // 2. For each post: copy "date" -> "meta.year"
    for (const post of posts) {
      console.log(`Migriere Post: ${post._id}`);

      await client
        .patch(post._id)
        .set({ 
          // 'meta.year': post.date,   // <- copy date to meta.year
          // Optional: uncomment the next line to remove "date" after migration
          date: undefined
        })
        .commit();

      console.log(`Post ${post._id} erfolgreich migriert.`);
    }

    console.log('Migration abgeschlossen!');
  } catch (error) {
    console.error('Fehler bei der Migration:', error);
  }
}

migratePostDates();