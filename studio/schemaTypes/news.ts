
import { defineType, defineField } from 'sanity'

import {
	FcAddImage,
	FcVideoCall
} from 'react-icons/fc'

export const news =  defineType({	name: 'news',
	title: 'News',
	type: 'document',
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
			title: 'Intro',
			type: 'text',
			rows: 3,
		}),
		defineField({
			name: 'images',
			type: 'array',
			title: 'Images',
			of: [
			{
				name: 'image',
				type: 'image',
				title: 'Image',
				icon: FcAddImage,

				options: {
					hotspot: true,
				},
				fields: [{
					name: 'alt',
					type: 'string',
					title: 'Alternative text',
				}],
			},
			],
			options: {
				layout: 'grid',
			},
			validation: Rule => Rule.required().min(1),
			}),
	]
})
