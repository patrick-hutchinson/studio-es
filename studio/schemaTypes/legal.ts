
import { defineType, defineField } from 'sanity'
export const legal =  defineType({
	name: 'legal',
	title: 'Legal',
	type: 'document',
	// __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
	fields: [
    defineField(
		{
			name: 'title',
			title: 'Title',
			type: 'string',
			hidden: true
		}),
		defineField({
			name: 'intro',
			title: 'Intro',
			type: 'array',
			of: [
				{type: 'block'}
			]
		}),
	]
})
