import {defineType, defineField} from 'sanity'

export const contact = defineType({
  name: 'contact',
  title: 'Kontakt',
  type: 'document',
  fields: [
    defineField({
      name: 'text',
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
    prepare: () => ({title: 'Kontakt'}),
  },
})
