import {defineType} from 'sanity'

import {legacyPost} from './post'

// Editable website archive. The original archivedPost documents remain the protected source archive.
export const archivePost = defineType({
  ...legacyPost,
  name: 'archivePost',
  title: 'Archive Post',
})
