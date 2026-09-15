import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {colorInput} from '@sanity/color-input'

import {muxInput} from 'sanity-plugin-mux-input'
import {structure} from './structure'
import {media, mediaAssetSource} from 'sanity-plugin-media'

export default defineConfig({
  name: 'default',
  title: 'StudioEs2025',

  projectId: 'kzivqb7t',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: structure,
    }),
    visionTool(),
    colorInput(),
    muxInput({
      // Request a downloadable MP4 rendition for every newly uploaded video.
      static_renditions: ['highest'],
    }),
    media(),
  ],
  form: {
    image: {
      assetSources: () => [mediaAssetSource],
    },
  },
  schema: {
    types: schemaTypes,
  },
})
