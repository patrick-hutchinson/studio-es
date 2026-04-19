
import { defineType, defineField } from 'sanity'

export const studio =  defineType({
	name: 'studio',
	title: 'Studio',
	type: 'document',
	// __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			hidden: true,
		}),
		defineField({
			name: 'copy',
			title: '',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [],
				}
			]
		}),
		defineField({
			name: 'gmaps',
			type: 'object',
			title: 'GMaps Link',
			fields: [
				defineField({
					name: 'title',
					title: 'Title',
					type: 'string',
				}),
				defineField({
					name: 'href',
					type: 'url',
					title: 'URL'
				}),
				defineField({
					title: 'Open in new tab',
					name: 'blank',
					description: 'Read https://css-tricks.com/use-target_blank/',
					type: 'boolean'
						
				}),
			],
		}),
		
		defineField({
			name: 'backdrop',
			type: 'image',
		}),
	]
})
