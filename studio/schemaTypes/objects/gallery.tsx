// import { defineType, defineField } from 'sanity'

// import {
// 	FcAddImage,
// 	FcVideoCall
// } from 'react-icons/fc'

// export const gallery = defineType({
// 	name: 'gallery',
// 	type: 'object',
// 	title: 'Gallery',
// 	fields: [
// 		defineField({
// 			name: 'images',
// 			type: 'array',
// 			title: 'Images',
// 			of: [
// 			{
// 				name: 'image',
// 				type: 'image',
// 				title: 'Image',
// 				icon: FcAddImage,

// 				options: {
// 					hotspot: true,
// 				},
// 				fields: [
// 					{
// 						name: 'alt',
// 						type: 'string',
// 						title: 'Alternative text',
// 					},
// 					{
// 						name: 'size',
// 						type: 'string',
// 						options: {
// 							list: [
// 								{ title: 'Fullscreen (no Rapport)', value: 'fullscreen' },
// 								{ title: '100%', value: 'size-100' },
// 								{ title: '50%', value: 'size-50' },
// 								{ title: '33%', value: 'size-33' },
// 								{ title: '25%', value: 'size-25' },
// 								{ title: '20%', value: 'size-20' },
// 								{ title: '10%', value: 'size-10' },
// 							],
// 						},
// 					}],
// 			},
// 			{
// 				name: 'video',
// 				type: 'video-size',
// 				title: 'Video',
// 			},
// 			],
// 			options: {
// 				layout: 'grid',
// 			},
// 			validation: Rule => Rule.required().min(1),
// 	}),
// 		defineField({
// 		name: 'size',
// 		type: 'string',
// 		title: 'Homepage: Display Size',
// 		description: 'Display size after hovering in the projects list',

// 		options: {
// 			list: [
// 				{ title: 'Fullscreen', value: 'fullscreen' },
// 				{ title: 'Small', value: 'small' },
// 			],
// 		},
// 	}),
// 		defineField({
// 		name: 'display',
// 		type: 'string',
// 		title: 'Display as',
// 		hidden: true,
// 		options: {
// 			list: [
// 				{ title: 'Grid', value: 'grid' },
// 				{ title: 'Carousel', value: 'carousel' },
// 				{ title: 'Blur', value: 'blur' },
// 			],
// 		},
// 	}),
// 	],

// });
