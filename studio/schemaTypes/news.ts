import {defineType, defineField} from 'sanity'

import {FcAddImage, FcVideoCall} from 'react-icons/fc'

// Keep the former field set independent so archived documents remain editable
// after the active news schema is rebuilt.
export const legacyNews = defineType({
  name: 'news',
  title: 'News',
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
})

// This continues to power active news until the replacement schema is ready.
export const news = legacyNews
