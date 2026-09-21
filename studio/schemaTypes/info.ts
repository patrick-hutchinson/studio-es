import {defineType, defineField} from 'sanity'

export const info = defineType({
  name: 'info',
  title: 'Info',
  type: 'document',
  fields: [
    defineField({
      name: 'about',
      title: 'Text',
      type: 'portableText',
    }),
    defineField({
      name: 'callToAction',
      title: 'Call to Action',
      type: 'portableText',
    }),
    defineField({
      name: 'copyright',
      type: 'string',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Id'}),
  },
})
