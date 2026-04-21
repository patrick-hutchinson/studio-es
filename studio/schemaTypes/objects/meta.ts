import {defineType, defineField} from 'sanity'

export const meta = defineType({
  name: 'meta',
  type: 'object',
  fieldsets: [
    {
      name: 'meta',
      options: {
        columns: 3,
      },
    },
    {
      name: 'meta-2',
      options: {
        columns: 2,
      },
    },
  ],
  fields: [
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      options: {
        filter: '!defined(parent)',
      },
      fieldset: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'number',
      title: 'Project Number',
      type: 'number',
      fieldset: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Date',
      type: 'date',
      fieldset: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: async (doc, context) => {
          const client = context.getClient({apiVersion: '2023-03-01'})

          if (!doc.meta?.category?._ref || !doc.meta?.number || !doc.meta?.year) {
            return ''
          }

          try {
            const category = await client.getDocument(doc.meta.category._ref)
            if (!category?.abbr) {
              return ''
            }

            return `${category.abbr}-${doc.meta.number
              .toString()
              .padStart(3, '0')}-${doc.meta.year.toString().slice(2, 4)}`
          } catch (error) {
            console.error('Error fetching category:', error)
            return ''
          }
        },
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Badge',
      type: 'array',
      of: [{type: 'string'}],
      hidden: true,
    }),
    defineField({
      name: 'searchtag',
      title: 'Search Tags',
      description: 'Only used for searching projects',
      type: 'array',
      hidden: true,
      of: [
        {
          type: 'reference',
          to: [{type: 'category'}],
          options: {
            filter: ({document}) => {
              // Always make sure to check for document properties
              // before attempting to use them
              if (!document.meta.category) {
                return {
                  filter: 'defined(parent)',
                }
              }
              return {
                filter: 'defined(parent._ref)',
                // filter: 'parent._ref == $category',
                // params: {category: document.meta.category._ref}
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      fieldset: 'meta-2',
      hidden: true,
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      fieldset: 'meta-2',
      hidden: true,
    }),
    defineField({
      name: 'team',
      title: 'Team',
      type: 'array',
      of: [{type: 'person'}],
      fieldset: 'meta-2',
      hidden: true,
    }),
    defineField({
      name: 'awards',
      title: 'Awards',
      type: 'array',
      fieldset: 'meta-2',
      of: [{type: 'text', rows: 3}],
      hidden: true,
    }),
  ],
  options: {
    collapsible: true, // Makes the whole fieldset collapsible
    collapsed: false, // Defines if the fieldset should be collapsed by default or not
  },
})
