import { defineType, defineField } from 'sanity'
import React from 'react'

export const person = defineType({
	name: 'person',
	title: 'Person',
	type: 'object',
	fields: [
		defineField({
			name: 'title',
			title: 'Name',
			type: 'string',
			validation: Rule => Rule.required()
		}),
		defineField({
			name: 'role',
			title: 'Role',
			type: 'string',
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'role'
		},
		prepare({ title, subtitle }) {
			return {
				title: title,
				subtitle: subtitle,
			}
		}
	}

})
