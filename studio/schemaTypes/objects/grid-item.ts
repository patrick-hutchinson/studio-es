import { defineType, defineField } from 'sanity'

import {
	FcGrid,
	FcGallery,
	FcVideoCall
} from 'react-icons/fc'


export const gridItem = defineType({
	name: 'gridItem',
	title: 'Grid Item',
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
			name: 'images',
			title: 'Images',
			type: 'array',
			of: [
				{
					name: 'image',
					type: 'image',
					title: 'Image',
					icon: FcGallery,
					options: {
						hotspot: true,
					},
					fields: [
						{
							name: 'alt',
							type: 'string',
							title: 'Alternative text',
						},
						{
							name: 'caption',
							title: 'Caption',
							type: 'string',
						},
						{
							name: 'font',
							title: 'Font-Color (Caption)',
							type: 'color',
							initialValue: '#ffffff'
						},
						{
							name: 'inset',
							type: 'boolean',
							title: 'Inset Images',
							initialValue: false,
							description: 'Fullscreen by default, flip this to inset images, and pick Backgroundcolor or Backdrop',
						},
						{
							name: 'social',
							type: 'boolean',
							title: 'Show Instagram Backdrop',
							initialValue: false,
							hidden: ({ parent, value }) => !parent?.inset
						},
						{
							name: 'background',
							title: 'Background',
							type: 'color',
							initialValue: '#e6e6e6',
							hidden: ({ parent, value }) => !parent?.inset
						},
						{
							name: 'gutter',
							type: 'boolean',
							title: 'Page Shadow Overlay',
							initialValue: false,
							description: 'Add gutter shadow to simulate pages',
							hidden: ({ parent, value }) => parent?.inset
						},
					],
				},
				{
					name: 'video',
					type: 'video',
					title: 'Video',
					icon: FcVideoCall,
				},
			],
			options: {
				layout: 'grid',
		 	}
		})
	],
	preview: {
			select: {
				title: 'title',
				images: 'images'
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