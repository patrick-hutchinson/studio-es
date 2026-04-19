import { defineType, defineField } from 'sanity'

export const award = defineType({
	name: 'award',
	title: 'Award',
	type: 'object',
	fieldsets: [
		{
			name: 'award',
			options: {
				columns: 2
			}
		}
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Award',
			type: 'string',
			fieldset: 'award'
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			fieldset: 'award'

		}),
		defineField({
			name: 'project',
			title: 'Project',
			type: 'string',
			fieldset: 'award'
		}),
		defineField({
			name: 'client',
			title: 'Client',
			type: 'string',
			fieldset: 'award'
		}),
	],
	preview: {
		select: {
			award: 'title',
			cat: 'category',
			project: 'project',
			client: 'client'
		},
		prepare(selection) {
			const {award, cat, project, client} = selection

			return {
				subtitle: [client, project].join(': '),
				title: [award, cat].join(' | ')
			}
		}
	}
})
