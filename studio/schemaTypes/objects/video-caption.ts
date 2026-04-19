import { defineType, defineField } from 'sanity'
import React from 'react'
import {
	FcVideoCall
} from 'react-icons/fc'


export const videoCaption = defineType({
	name: 'video-caption',
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
					title: t
				}
			}
		}
	}
})