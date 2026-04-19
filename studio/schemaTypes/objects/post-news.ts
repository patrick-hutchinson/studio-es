import { defineType, defineField } from 'sanity'

import { FcNews } from 'react-icons/fc'

export const postNews = defineType({
	name: 'postNews',
	title: 'News',
	type: 'object',
	icon: FcNews,
	fields: [
		defineField({
			name: 'title',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{title: 'H1', value: 'h1'},
						{title: 'H2', value: 'h2'},
					],
					marks: {
						decorators: [
						  {title: 'Emphasis', value: 'em'},
						]
					  }
				}
			],
			validation: Rule => Rule.required()
		}),
		defineField({
			name: 'appearance',
			type: 'appearance'
		})
	],
	preview: {
		select: {
			blocks: 'title',
			appearance: 'appearance',
		},
		prepare(selection) {
			const block = (selection.blocks || []).find(block => block._type === 'block')
			const bg = selection.appearance.background
			const font = selection.appearance.font
			return {
				subtitle: 'News',
				title: block
					? block.children
						.filter(child => child._type === 'span')
						.map(span => span.text)
						.join('')
					: 'No title'
			}
		}
	}

})
