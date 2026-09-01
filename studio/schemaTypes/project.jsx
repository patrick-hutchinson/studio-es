// import { createHeading } from "./helpers";

import {defineType, defineField} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  // icon: FcGallery,

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      type: 'portableText',
    }),
    defineField({
      name: 'homePageCover',
      title: 'Homepage Cover',
      type: 'object',
      fields: [
        defineField({
          name: 'type',
          title: 'Cover Type',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Video', value: 'video'},
              {title: 'Bilder Gallerie', value: 'gallery'},
            ],
            layout: 'radio',
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'array',
          of: [{type: 'imageAsset'}],
          hidden: ({parent}) => parent?.type !== 'image',
          validation: (Rule) => Rule.max(1),
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'array',
          of: [{type: 'videoAsset'}],
          hidden: ({parent}) => parent?.type !== 'video',
          validation: (Rule) => Rule.max(1),
        }),
        defineField({
          name: 'gallery',
          title: 'Bilder Gallerie',
          type: 'gallery',
          hidden: ({parent}) => parent?.type !== 'gallery',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Raster Gallerie',
      type: 'gallery',
    }),

    defineField({
      name: 'appearance',
      title: 'Appearance',
      type: 'appearance',
      description: 'Font- & Backgroundcolor for News entries and the Project Page',
    }),
    defineField({
      name: 'meta',
      type: 'meta',
      description: 'Categories, Project-Number, Year, Slug',
    }),

    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'category'}],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      cat: 'meta.category.abbr',
      nr: 'meta.number',
      year: 'meta.year',
    },
    prepare(selection) {
      const {title, cat, nr, year} = selection
      const y = year ? year.toString().slice(2, 4) : '00'

      return {
        title: title,
        subtitle: `Project: ${cat}-${nr}-${y}`,
      }
    },
  },
})
