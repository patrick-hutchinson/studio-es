import { defineType, defineField } from 'sanity'

export const intro = defineType({
	name: 'intro',
	type: 'object',
	fields: [
		defineField({
			name: 'copy',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{title: 'Intro', value: 'h2'},
					],
					marks: {
						decorators: [
						  {title: 'Emphasis', value: 'em'},
						]
					}
				}
			]
		})
	]
})