import {defineType} from 'sanity'

import {legacyPost} from './post'

// This snapshot deliberately uses the legacy post fields. Future changes to
// the active `post` schema will not change archived documents.
export const archivedPost = defineType({
  ...legacyPost,
  name: 'archivedPost',
  title: 'Archived Post',
})
