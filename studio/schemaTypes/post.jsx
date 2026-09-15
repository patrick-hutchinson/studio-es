import {defineType, defineField} from 'sanity'
import {orderRankOrdering} from '@sanity/orderable-document-list'
import {sharedOrderRankField} from './helpers/sharedOrderRank'
import {getNextPostCode, postCodeSource} from './helpers/postCode'
import ArchivedPostImportInput from '../components/ArchivedPostImportInput'

// Keep the former field set independent so archived documents remain editable
// after the active post schema is rebuilt.
export const post = defineType({
  name: 'post',
  title: 'News Post',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'showOnHomepage',
      title: 'Auf Startseite anzeigen?',
      initialValue: true,
      type: 'boolean',
    }),
    sharedOrderRankField(),
    defineField({
      name: 'archivedSource',
      title: 'Archivierten Post importieren',
      description:
        'Wähle einen Post aus dem Archiv und klicke dann den Import-Button, um eine neue Kopie anzulegen.',
      type: 'reference',
      to: [{type: 'archivedPost'}],
      components: {input: ArchivedPostImportInput},
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'category'}],
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'date',
      type: 'date',
      hidden: true,
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'meta',
      title: 'Ordering',
      type: 'object',
      fields: [
        defineField({
          name: 'year',
          title: 'Date',
          type: 'date',
          options: {
            dateFormat: 'YYYY-MM-DD',
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          title: 'Code',
          type: 'slug',
          options: {
            source: postCodeSource(),
          },
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'title',
      type: 'portableText',
    }),
    defineField({
      name: 'appearance',
      type: 'appearance',
    }),
  ],
  initialValue: async (_, {getClient}) => {
    const date = new Date().toISOString().slice(0, 10)
    const code = await getNextPostCode(date, getClient)

    return {
      date,
      meta: {
        year: date,
        slug: {_type: 'slug', current: code},
      },
      category: [
        {
          _ref: '6cdcc60d-e006-4005-9822-1d05caf410a7',
          _type: 'reference',
        },
      ],
    }
  },
  preview: {
    select: {
      blocks: 'title',
      date: 'meta.year',
      category0: 'category.0.title',
    },
    prepare({blocks, date, category0}) {
      const titleBlock = (blocks || []).find((block) => block._type === 'block')
      const title = titleBlock
        ? titleBlock.children
            .filter((child) => child._type === 'span')
            .map((span) => span.text)
            .join('')
        : 'No title'

      return {
        title,
        subtitle: `Post: ${date} | ${category0 || 'No Category'}`,
      }
    },
  },
})
