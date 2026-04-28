import {defineType, defineField} from 'sanity'
import {FcAddImage} from 'react-icons/fc'

export const home = defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  fields: [
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'portableText',
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Images',
      of: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          icon: FcAddImage,
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
          ],
        },
      ],
      options: {
        layout: 'grid',
      },
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Homepage'}),
  },
})
