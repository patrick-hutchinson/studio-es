import {defineType} from 'sanity'

import {legacyNews} from './news'

// This snapshot deliberately uses the legacy news fields. Future changes to
// the active `news` schema will not change archived documents.
export const archivedNews = defineType({
  ...legacyNews,
  name: 'archivedNews',
  title: 'Archived News',
})
