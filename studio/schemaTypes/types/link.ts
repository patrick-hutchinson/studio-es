import {defineField, defineType} from 'sanity'
import {DocumentIcon, EnvelopeIcon, LinkIcon} from '@sanity/icons'

export const linkFields = [
    defineField({
      name: 'type',
      title: 'Link type',
      type: 'string',
      initialValue: 'link',
      validation: (Rule) => Rule.required(),
      options: {
        layout: 'radio',
        list: [
          {title: 'Link', value: 'link', icon: LinkIcon},
          {title: 'Email', value: 'email', icon: EnvelopeIcon},
          {title: 'File', value: 'file', icon: DocumentIcon},
        ],
      },
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.type === 'email' || parent?.type === 'file',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.type === 'link' && !value) return 'A URL is required'
          return true
        }),
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      hidden: ({parent}) => parent?.type !== 'email',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.type !== 'email') return true
          if (!value) return 'An email address is required'
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address'
        }),
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      hidden: ({parent}) => parent?.type !== 'file',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.type === 'file' && !value) return 'A file is required'
          return true
        }),
    }),
]

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  options: {columns: 2},
  fields: linkFields,
})
