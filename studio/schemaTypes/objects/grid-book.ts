import { defineType, defineField } from 'sanity'
import {
  FcKindle,
  FcGallery,
  FcVideoCall
} from 'react-icons/fc'

export const gridBook = defineType({
  name: 'grid-book',
  title: 'Book',
  type: 'object',
  icon: FcKindle,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    defineField({
      name: 'images',
      title: 'Grid Items',
      type: 'array',
      of: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          icon: FcGallery,
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alternative text' },
            { name: 'caption', title: 'Caption', type: 'string' },
            { name: 'font', title: 'Font-Color (Caption)', type: 'color', initialValue: '#ffffff' },
            {
              name: 'inset',
              type: 'boolean',
              title: 'Inset Images',
              initialValue: false,
              description: 'Fullscreen by default, flip this to inset images, and pick Backgroundcolor or Backdrop',
            },
            {
              name: 'background',
              title: 'Background',
              type: 'color',
              initialValue: '#e6e6e6',
              hidden: ({ parent }) => !parent?.inset
            },
          ],
        },
        {
          name: 'video',
          title: 'Video',
          type: 'video',
          icon: FcVideoCall,
        }
      ],
      options: { layout: 'grid' },
      validation: Rule => Rule.min(2)
    }),
    defineField({
      name: 'copy',
      type: 'intro'
    })
  ],
  preview: {
    select: {
      title: 'title',
      images: 'images'
    },
    prepare({ title, images }) {
      const firstImage = images?.find(img => img._type === 'image' && img.asset)
      return {
        title: title || 'Book Grid Section',
        media: firstImage ? firstImage : FcKindle
      }
    }
  }
})
