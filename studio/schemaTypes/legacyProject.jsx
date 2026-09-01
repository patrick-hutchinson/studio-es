import {createElement} from 'react'
import {defineField, defineType} from 'sanity'

import {MuxThumbnail} from '../components/MuxThumbnail'

// The legacy definition remains frozen for archived project documents.
export const legacyProject = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'longTitle',
      title: 'Long Title',
      type: 'string',
      hidden: true,
      description: 'Used in the meta section under the header in a project page. Defaults to the normal page title if not provided.',
    }),
    defineField({name: 'case', title: 'This is a Case', type: 'boolean', hidden: true}),
    defineField({
      name: 'isActive',
      title: 'This is an active Project',
      description: 'Set this to false to remove links to project page',
      type: 'boolean',
      hidden: true,
    }),
    defineField({name: 'header', type: 'gallery', validation: (Rule) => Rule.required()}),
    defineField({name: 'description', type: 'intro'}),
    defineField({
      name: 'appearance',
      title: 'Appearance',
      type: 'appearance',
      description: 'Font- & Backgroundcolor for News entries and the Project Page',
    }),
    defineField({name: 'meta', type: 'meta', description: 'Categories, Project-Number, Year, Slug'}),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'array',
      of: [{type: 'slider'}, {type: 'grid'}, {type: 'grid-book'}],
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      images: 'header.images',
      cat: 'meta.category.abbr',
      nr: 'meta.number',
      year: 'meta.year',
      firstItemPlaybackId: 'header.images.0.video.asset.playbackId',
    },
    prepare(selection) {
      const {title, images, cat, nr, year, firstItemPlaybackId} = selection
      const firstItem = images?.[0]
      const y = year ? year.toString().slice(2, 4) : '00'
      let media

      if (firstItem?._type === 'image') media = firstItem
      if (firstItem?._type === 'video' && firstItemPlaybackId) {
        media = createElement(MuxThumbnail, {playbackId: firstItemPlaybackId})
      }

      return {title, subtitle: `Project: ${cat}-${nr}-${y}`, media}
    },
  },
})
