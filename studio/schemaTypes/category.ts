import {
	FcTimeline
} from 'react-icons/fc'

import { defineType, defineField } from 'sanity'

export const category = defineType({
	name: 'category',
	title: 'Category',
	type: 'document',
	icon: FcTimeline,
	fields: [
    defineField(
		{
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: Rule => Rule.required()
		}),
		defineField({
			name:'parent',
			title: 'Parent',
			type: 'reference',
			hidden: true,
			to: [
				{type: 'category'}
			]
		}),
		defineField({
			name: 'abbr',
			title: 'Abbreviation',
			type: 'string',
			validation: Rule => Rule.required()
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'text',
			rows: 1
		}),
		defineField({
			name: 'synonym',
			hidden: true,
			title: 'Synonyms',
			type: 'array',
			description: 'Not visible in Frontend, only used for Search',
			of: [{type: 'string'}],
			options:{
				layout: 'tags'
			}
		}),

	],
	preview: {
		select: {
			title: 'title',
			parent: 'parent.abbr',
			abbr: 'abbr',
			descr: 'description'
		},
		prepare(selection) {
			const {title, descr } = selection
			

			return {
				title: title,
				subtitle: descr
			}
		}
	}
})
