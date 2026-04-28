import {defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  options: {columns: 2},
  fields: [
    {
      name: 'type',
      type: 'string',
      options: {
        list: [{title: 'External', value: 'external', icon: LinkIcon}],
      },
    },
    {
      name: 'url',
      type: 'url',
    },
  ],
})
