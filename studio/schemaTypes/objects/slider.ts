import { defineType, defineField } from 'sanity'
import {
	FcGallery
} from 'react-icons/fc'


export const slider =  defineType({	name: 'slider',
	title: 'Slider',
	type: 'object',
	icon: FcGallery,
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
			name: 'images',
			title: 'Slider',
			type: 'array',
			of: [
				{
					name: 'image',
					type: 'image',
					title: 'Image',
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
							initialValue: {hex: '#ffffff'}
						},
					],
				},
				{
					name: 'video',
					type: 'video-caption',
					title: 'Video',
				},
			],
			options: {
				layout: 'grid',
			},
		}),
		defineField({
			name: 'inset',
			type: 'boolean',
			title: 'Inset Images',
			initialValue: false,
			description: 'Fullscreen by default, flip this to inset images, and pick a Backgroundcolor or ~image',
		}),
		defineField({
			name: 'background_type',
			type: 'string',
			title: 'Background Type',
			fieldset: 'options',
			options: {
				list: [
					{ title: 'Color', value: 'color' },
					{ title: 'Blur', value: 'blur' },
				],
			},
			initialValue: 'color',
			hidden: ({ parent }) => !parent?.inset
		}),
		defineField({
			name: 'background_color',
			title: 'Background',
			type: 'color',
			fieldset: 'options',
			initialValue: {hex: '#e6e6e6'},
			hidden: ({ parent, value }) => parent?.background_type !== 'color' || !parent?.inset
		}),
		defineField({
			name: 'background_image',
			type: 'image',
			title: 'Background Image',
			fieldset: 'options',
			options: {
				hotspot: true,
			},
			hidden: ({ parent, value }) => parent?.background_type !== 'blur' || !parent?.inset
		}),
		defineField({
			name: 'copy',
			type: 'intro'
		})
	],
	preview: {
		select: {
			t: 'title',
			image: 'slider.0.asset.url'
		},
		prepare(selection) {
			const {t, image} = selection
			if (image){
				return {
					media: image,
					title: t ? t : 'No Title',
				}
			}
			else {
				return {title: t ? t : 'No Title'}
			}
		}
	}
})