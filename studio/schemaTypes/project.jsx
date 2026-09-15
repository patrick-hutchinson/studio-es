// import { createHeading } from "./helpers";

import {defineType, defineField} from 'sanity'
import {orderRankOrdering} from '@sanity/orderable-document-list'
import {Divider} from '../components/Divider'
import ArchivedProjectImportInput from '../components/ArchivedProjectImportInput'
import {sharedOrderRankField} from './helpers/sharedOrderRank'

const hideWhenNotOpenable = ({document}) => document?.openable === false
const requiredWhenOpenable = (value, {document}) =>
  document?.openable === false || value ? true : 'Required when “Öffenbar?” is enabled.'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  orderings: [orderRankOrdering],
  fieldsets: [
    {
      name: 'homepageOptions',
      options: {columns: 2},
    },
  ],
  // icon: FcGallery,

  fields: [
    sharedOrderRankField(),
    defineField({
      name: 'showOnHomepage',
      title: 'Auf Startseite anzeigen?',
      initialValue: true,
      type: 'boolean',
      fieldset: 'homepageOptions',
    }),
    defineField({
      name: 'openable',
      title: 'Öffenbar?',
      description: 'Wenn deaktiviert, wird das Projekt auf der Startseite nur als Cover angezeigt.',
      initialValue: true,
      type: 'boolean',
      fieldset: 'homepageOptions',
    }),
    defineField({
      name: 'archivedSource',
      title: 'Archiviertes Projekt importieren',
      description:
        'Wähle ein Projekt aus dem Archiv, klicke dann den import Button um eine neue Kopie anzulegen.',
      type: 'reference',
      to: [{type: 'archivedProject'}],
      components: {input: ArchivedProjectImportInput},
      hidden: hideWhenNotOpenable,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: hideWhenNotOpenable,
      validation: (Rule) => Rule.custom(requiredWhenOpenable),
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
      hidden: hideWhenNotOpenable,
    }),
    defineField({
      name: 'slideshow',
      title: 'Slideshow (Unterseite)',
      type: 'mediaGallery',
      hidden: hideWhenNotOpenable,
    }),
    defineField({
      name: 'description',
      type: 'portableText',
      hidden: hideWhenNotOpenable,
    }),
    defineField({
      name: 'supportingMedia',
      title: 'Beistellbild/er',
      type: 'mediaGallery',
      hidden: hideWhenNotOpenable,
    }),
    defineField({
      name: 'gallery',
      title: 'Raster Galerie',
      type: 'rasterGallery',
      hidden: hideWhenNotOpenable,
    }),
    defineField({
      name: 'galleryLayout',
      title: 'Raster Galerie Layout',
      type: 'string',
      initialValue: '4x3',
      hidden: hideWhenNotOpenable,
      options: {
        list: [
          {title: '4 x 3', value: '4x3'},
          {title: '8 x 6', value: '8x6'},
        ],
        layout: 'radio',
      },
    }),

    defineField({
      name: 'appearance',
      title: 'Appearance',
      type: 'appearance',
      description: 'Font- & Backgroundcolor for News entries and the Project Page',
      hidden: hideWhenNotOpenable,
    }),
    defineField({
      name: 'meta',
      type: 'meta',
      description: 'Categories, Project-Number, Year, Slug',
      hidden: hideWhenNotOpenable,
    }),

    defineField({
      name: 'categories',
      title: 'Alle Kategorien (zum Filtern)',
      type: 'array',
      hidden: hideWhenNotOpenable,
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
