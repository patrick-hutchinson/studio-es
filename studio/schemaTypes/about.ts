import {defineType, defineField} from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: [{type: 'block'}],
    }),
    // createHeading("Team & Jobs"),
    defineField({
      name: 'companion',
      title: 'Looking for a creative Companion?',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'jobs',
      title: 'Open Positions',
      type: 'array',
      options: {layout: 'tags'},
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'interns',
      title: 'Notice for Interns',
      type: 'text',
      rows: 3,
    }),
    // createHeading("Publication & Achievements"),
    defineField({
      name: 'clients',
      title: 'Clients and Cooperations',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'exhibition',
      title: 'Exhibition',
      type: 'array',
      of: [{type: 'exhibition'}],
    }),
    defineField({
      name: 'talks',
      title: 'Talks, Lectures',
      type: 'array',
      of: [{type: 'text', rows: 3}],
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'selfpublished',
      title: 'Self-Publishing',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'structuredAwards',
      title: 'Awards',
      type: 'array',
      of: [{type: 'awardcat'}],
    }),

    // createHeading("Contact"),
    defineField({
      name: 'contact',
      title: 'Imprint, Contact',
      type: 'array',
      of: [{type: 'block'}],
    }),
  ],
})
