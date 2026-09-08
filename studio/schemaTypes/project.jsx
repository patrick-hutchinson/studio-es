// import { createHeading } from "./helpers";

import {defineType, defineField} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {Divider} from '../components/Divider'
import ArchivedProjectImportInput from '../components/ArchivedProjectImportInput'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  orderings: [orderRankOrdering],
  // icon: FcGallery,

  fields: [
    orderRankField({type: 'project'}),

    defineField({
      name: 'archivedSource',
      title: 'Archiviertes Projekt importieren',
      description:
        'Wähle ein Projekt aus dem Archiv, klicke dann den import Button um eine neue Kopie anzulegen.',
      type: 'reference',
      to: [{type: 'archivedProject'}],
      components: {input: ArchivedProjectImportInput},
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'homePageCover',
      title: 'Homepage Cover',
      type: 'mediaGallery',
    }),
    defineField({
      name: 'divider',
      type: 'string',
      components: {field: Divider},
    }),
    defineField({
      name: 'slideshow',
      title: 'Slideshow (Unterseite)',
      type: 'mediaGallery',
    }),
    defineField({
      name: 'description',
      type: 'portableText',
    }),
    defineField({
      name: 'gallery',
      title: 'Raster Gallerie',
      type: 'mediaGallery',
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
      title: 'Alle Kategorien (zum Filtern)',
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
