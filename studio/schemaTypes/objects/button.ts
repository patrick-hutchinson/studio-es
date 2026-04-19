import { defineType, defineField } from 'sanity'

import React from 'react'

export const button = defineType({	name: 'button',
	title: 'Button',
	type: 'object',
	fieldsets: [
		{
			name: 'appearance',
			options: {
				columns: 2
			}
		}
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: Rule => Rule.required()
		}),
		defineField({
			name: 'url',
			title: 'URL',
			type: 'string',
		}),
		defineField({
			name: 'font',
			title: 'Fontcolor',
			type: 'color',
			fieldset: 'appearance'
		}),
		defineField({
			name: 'background',
			title: 'Backgroundcolor',
			type: 'color',
			fieldset: 'appearance'
		}),
		defineField({
			name: 'shadow',
			title: 'Dropshadow',
			type: 'boolean',
			fieldset: 'appearance',
		}),
	],
	initialValue: {
		shadow: true,
		font: '#000000',
		background: '#ffffff',
	},
	preview: {
		select: {
			title: 'title',
			font: 'font',
			background: 'background',
			shadow: 'shadow'
		},
		prepare(selection) {
			const {title} = selection
			return {
				title: title,
			}
		}
	}
})
