import {defineType} from 'sanity'

import {legacyProject} from './legacyProject'

// Editable website archive. The original archivedProject documents remain the protected source archive.
export const archiveProject = defineType({
  ...legacyProject,
  name: 'archiveProject',
  title: 'Archive Project',
})
