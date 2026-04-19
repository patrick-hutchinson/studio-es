
import { defineType, defineField } from 'sanity'
export const services = defineType({	name: 'services',
	title: 'Services',
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
			type: 'text',
			rows: 3
		})
	]
})
