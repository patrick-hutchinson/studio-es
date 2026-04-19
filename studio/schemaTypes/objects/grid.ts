import { defineType, defineField } from 'sanity'
import GridLayout from '../../components/GridLayout'
import React from 'react'
import {
	FcGrid,
	FcGallery
} from 'react-icons/fc'


export const grid = defineType({
	name: 'grid',
	title: 'Grid',
	type: 'object',
	icon: FcGrid,

	fieldsets: [
		{
			name: 'options',
			options: {
				columns: 2
			}
		},

	],
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string'
		}),
		defineField({
			name: 'items',
			title: 'Grid Items',
			type: 'array',
			of: [
				{type: 'gridItem'}
			],
			options: {
				layout: 'grid',
		 	},
			validation: Rule => Rule.max(4)
		}),
		defineField({
			name: 'layout',
			title: 'Grid Layout',
			type: 'string',
			description: 'Create only one grid item above (two items for option 3 and 4) to get a grid with only one row.',
			components: {
				input: GridLayout
			}
		}),
		defineField({
			name: 'copy',
			type: 'intro'
		})

	],
	preview: {
    select: {
      title: 'title',
      images: 'items.0.images'
    },
    prepare({ title, images }) {
			const firstImage = images?.find(img => img._type === 'image' && img.asset)
			return {
				title: title || 'Book Grid Section',
				media: firstImage
			}
		}
  }
})