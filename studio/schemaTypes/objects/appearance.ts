import { defineType, defineField } from 'sanity'

export const appearance = defineType ({
	name: 'appearance',
	type: 'object',
	fields: [
		defineField({
			name: 'font',
			title: 'Fontcolor',
			type: 'color',
			// initialValue: {hex: '#000000'}
		}),
		defineField({
			name: 'background',
			title: 'Backgroundcolor',
			type: 'color',
			// initialValue: {
			// 	hex: '#ffffff'
			// }
		}),
	],
	options: {
		collapsible: true, // Makes the whole fieldset collapsible
		collapsed: true, // Defines if the fieldset should be collapsed by default or not
		columns: 2 // Defines a grid for the fields and how many columns it should have
	}
})

export const appearanceCombination = defineType({
	name: 'appearanceCombination',
	title: 'Appearance',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'appearance',
			title: 'Appearance',
			type: 'appearance',
		}),
	],
	preview: {
		select: {
			title: 'title',
			background: 'appearance.background.hex',
			font: 'appearance.font.hex',
		},
		prepare(selection) {
			const {title, background, font} = selection

			return {
				title,
				subtitle: [font, background].filter(Boolean).join(' / '),
			}
		},
	},
})
