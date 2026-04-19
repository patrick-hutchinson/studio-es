import {
	FcRating
	
} from 'react-icons/fc'

import { defineType, defineField } from 'sanity'

export const awardcat = defineType({	name: 'awardcat',
	title: 'Award Category',
	type: 'object',
	icon: FcRating,
	fields: [
		defineField({
			name: 'title',
			title: 'Award',
			type: 'string',
		}),
		defineField({
			name: 'awards',
			title: 'Awards',
			type: 'array',
			of: [
				{ type: 'text', rows: 3 },
				// { type: 'awardcat'}
			]
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'awards'
		},
		prepare: ({title, subtitle}) => {
			
			return {
			  title: title,
			  subtitle: subtitle.join(', ')
			}
		}
	}
	
})
