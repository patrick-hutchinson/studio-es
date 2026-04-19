import { defineType, defineField } from 'sanity'
import React from 'react'
import { FcStackOfPhotos } from 'react-icons/fc'

export const postProject = defineType({	name: 'postProject',
	title: 'Project/Case',
	type: 'object',
	icon: FcStackOfPhotos,
	fieldsets: [
		{
			name: 'colors',
			title: 'Colors for Listview',
			options: {
				columns: 2
			}
		}
	],
	fields: [
		defineField({
			name: 'title',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{title: 'H1', value: 'h1'},
						{title: 'H3', value: 'h3'},
					],
					marks: {
						decorators: [
						  {title: 'Emphasis', value: 'em'},
						]
					  }
				}
			],
			validation: Rule => Rule.required()
		}),
		defineField({
			name: 'project',
			title: 'Project',
			type: 'reference',
			to: [
				{type: 'project'}
			],

			validation: Rule => Rule.required()
		}),
		defineField({
			  name: 'position',
			  title: 'Hero Image Position',
			  type: 'string',
			  options: {
					list: ['left', 'center', 'right', 'full']
				},

		})
	],
	preview: {
		select: {
			blocks: 'title',
		    image: 'project.header.images.0.asset.url',
			background: 'project.appearance.background',
			font: 'project.appearance.font',
			cat: 'project.meta.category.abbr',
			nr: 'project.meta.number',
			year: 'project.meta.year',
			position: 'position'
		},
		prepare: (selection) => {
			  const block = (selection.blocks || []).find(block => block._type === 'block')

			  const y = selection.year.toString().slice(2,4)
			  return {
				title: block
				? block.children
					.filter(child => child._type === 'span')
					.map(span => span.text)
					.join('')
				: 'No title',
				subtitle: `Project: ${selection.cat}-${selection.nr}-${y}`,
				
			  }
		}
	  }
})
