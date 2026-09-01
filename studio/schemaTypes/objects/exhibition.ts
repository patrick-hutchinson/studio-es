import { defineType, defineField } from 'sanity'

export const exhibition = defineType({
	name: 'exhibition',
	title: 'Exhibition',
	type: 'object',
	fields: [
		defineField({
			name: 'title',
			title: 'Exhibition',
			type: 'text',
			rows: 3,
		}),
		defineField({
			name: 'project',
			title: 'Link to Project',
			type: 'reference',
			to: [
				{ type: 'project' },
				{ type: 'archivedProject' }
			],

		}),
		defineField({
			name: 'url',
			title: 'Link',
			type: 'url',
			hidden: ({ parent, value }) => parent?.project !== undefined
		}),
	],
	preview: {
		select: {
			exhibition: 'title',
		},
		prepare(selection) {
			const { exhibition } = selection
			return {
				title: exhibition
			}
		}
	}
})
