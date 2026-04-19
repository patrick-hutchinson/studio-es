import { defineType, defineField } from 'sanity'
import React from 'react'
import { FcFlowChart } from 'react-icons/fc'

export const postLinks = defineType({
	name: 'postLinks',
	title: 'Link Section',
	type: 'object',
	icon: FcFlowChart,
	fields: [
		defineField({
			name: 'title',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [],
					marks: {
						decorators: [
						  {title: 'Emphasis', value: 'em'},
						],
						annotations: []
					},
					lists:[],
				}
			],
			validation: Rule => Rule.required()
		}),
		defineField({
			name: 'buttons',
			type: 'array',
			options: {
				layout: 'grid'
			},
			of: [
				{ type: 'button'}
			],
			validation: Rule => Rule.required().min(1)
		}),

	],
	preview: {
		select: {
			blocks: 'title',
		},
		prepare(selection) {
			const block = (selection.blocks || []).find(block => block._type === 'block')
			return {
				subtitle: 'Link Section',
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
