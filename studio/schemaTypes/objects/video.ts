import { defineType, defineField } from 'sanity'
import {
	FcVideoCall
} from 'react-icons/fc'


export const video = defineType({
	name: 'video',
	title: 'Video',
	type: 'object',
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
			name: 'video',
			type: 'mux.video',
			title: 'Video',
		}),
		defineField({
			name: 'caption',
			title: 'Caption',
			type: 'string',
		}),
		defineField({
			name: 'font',
			title: 'Font-Color (Caption)',
			type: 'color',
			initialValue: '#ffffff'
		}),
		defineField({
			name: 'inset',
			type: 'boolean',
			title: 'Inset Images',
			initialValue: false,
			description: 'Fullscreen by default, flip this to inset images, and pick Backgroundcolor or Backdrop',
		}),
		defineField({
			name: 'social',
			type: 'boolean',
			title: 'Show Instagram Backdrop',
			initialValue: false,
			hidden: ({ parent, value }) => !parent?.inset
		}),
		defineField({
			name: 'background',
			title: 'Background',
			type: 'color',
			initialValue: '#e6e6e6',
			hidden: ({ parent, value }) => !parent?.inset
		}),
	],
	preview: {
		select: {
			t: 'title',
			image: 'video.asset.playbackId'
		},
		prepare(selection) {
			const {t, image} = selection
			const block = (selection.blocks || []).find(block => block._type === 'block')
			const src = "https://image.mux.com/"+image+"/thumbnail.jpg"
			if (image){
				return {
					media: src, 
					title: 'Video'
				}
			}
		}
	}
})