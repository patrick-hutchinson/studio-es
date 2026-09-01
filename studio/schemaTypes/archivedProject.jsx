import {defineType} from 'sanity'

import {legacyProject} from './legacyProject'

// This snapshot deliberately uses the legacy project fields. Future changes to
// the active `project` schema will not change archived documents.
export const archivedProject = defineType({
  ...legacyProject,
  name: 'archivedProject',
  title: 'Archived Project',
})
