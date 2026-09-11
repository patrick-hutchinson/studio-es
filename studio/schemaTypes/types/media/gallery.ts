import {defineField, defineType} from 'sanity'
import GalleryDropzoneInput from '../../../components/GalleryDropzoneInput'
import SingleMediaInput from '../../../components/SingleMediaInput'

export const mediaGallery = defineType({
  name: 'mediaGallery',
  title: 'Bilder Gallerie',
  type: 'array',
  of: [{type: 'imageAsset'}, {type: 'videoAsset'}],
  components: {
    input: GalleryDropzoneInput,
  },
})

export const rasterGalleryItem = defineType({
  name: 'rasterGalleryItem',
  title: 'Raster Galerie Element',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      title: 'Medium',
      type: 'mediaAsset',
      validation: (Rule) => Rule.required().min(1).max(1),
      components: {
        input: SingleMediaInput,
      },
    }),
    defineField({
      name: 'expandable',
      title: 'Vergrößerbar',
      description: 'Wähle aus, ob dieses Bild/Video zum vergrößern anclickbar sein soll.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      media: 'media',
      previewImage: 'media.0.file',
      expandable: 'expandable',
    },
    prepare({media, previewImage, expandable}) {
      return {
        title: media?.[0]?._type === 'videoAsset' ? 'Video' : 'Image',
        subtitle: expandable === false ? 'Nicht vergrößerbar' : 'Vergrößerbar',
        media: previewImage,
      }
    },
  },
})

export const rasterGallery = defineType({
  name: 'rasterGallery',
  title: 'Raster Galerie',
  type: 'array',
  of: [{type: 'rasterGalleryItem'}],
  components: {
    input: GalleryDropzoneInput,
  },
})

export const galleryRow = defineType({
  name: 'galleryRow',
  title: 'Gallery Row',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      title: 'Media',
      type: 'mediaGallery',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      media: 'media',
      previewImage: 'media.0.file',
    },
    prepare({media, previewImage}) {
      const count = media?.length || 0

      return {
        title: `Gallery row`,
        subtitle: `${count} media item${count === 1 ? '' : 's'}`,
        media: previewImage,
      }
    },
  },
})
