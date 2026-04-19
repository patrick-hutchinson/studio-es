import { defineType, defineField } from 'sanity'
import { FcNews } from 'react-icons/fc'

export const post = defineType({
	name: 'post',
	title: 'News Post',
	type: 'document',
	icon: FcNews,
	fields: [
		defineField({
			name: 'category',
			title: 'Category',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [
						{type: 'category'}
					],
				}
			],
			validation: rule => rule.required()
		}),
		defineField({
			name: 'date',
			title: 'date',
			type: 'date',
			hidden: true,
			options: {
				dateFormat: 'YYYY-MM-DD'
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
						dateFormat: 'YYYY-MM-DD'
					},
					validation: (Rule) => Rule.required(),
				}),
			]
		}),
		defineField({
			name: 'title',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [],
					marks: {
						decorators: []
					}
				}
			],
			validation: rule => rule.required()
		}),
		defineField({
			name: 'appearance',
			type: 'appearance'
		}),

	],
	initialValue: async () => ({
		date: new Date().toISOString().slice(0, 10),
		category: {
			"_ref":"6cdcc60d-e006-4005-9822-1d05caf410a7",
			"_type":"reference"
		}
  }),
	preview: {
  select: {
    blocks: 'title',
    date: 'meta.year',
    category0: 'category.0.title'
  },
  prepare({ blocks, date, category0 }) {
    const titleBlock = (blocks || []).find(block => block._type === 'block')
    const title = titleBlock
      ? titleBlock.children.filter(child => child._type === 'span').map(span => span.text).join('')
      : 'No title'

    return {
      title,
      subtitle: `${date} | ${category0 || 'No Category'}`
    }
  }
}
})