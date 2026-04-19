// import { createHeading } from "./helpers";

import { defineType, defineField } from 'sanity'
import { createElement } from 'react';
import { MuxThumbnail } from '../components/MuxThumbnail';

export const project =  defineType({
	name: "project",
	title: "Project",
	type: "document",
	// icon: FcGallery,

	fields: [
    defineField(
		{
			name: "title",
			title: "Title",
				type: "text",
			rows: 3,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "longTitle",
			title: "Long Title",
			type: "string",
			hidden: true, 
			description:
				"Used in the meta section under the header in a project page. Defaults to the normal page title if not provided.",
		}),
		defineField({
			name: "case",
			title: "This is a Case",
			type: "boolean",
			hidden: true,
		}),
		defineField({
			name: "isActive",
			title: "This is an active Project",
			description: "Set this to false to remove links to project page",
			type: "boolean",
			hidden: true,
		}),
		defineField({
			name: "header",
			type: "gallery",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			type: "intro",
		}),
		defineField({
			name: "appearance",
			title: "Appearance",
			type: "appearance",
			description:
				"Font- & Backgroundcolor for News entries and the Project Page",
		}),
		defineField({
			name: "meta",
			type: "meta",
			description:
				"Categories, Project-Number, Year, Slug",
		}),

		defineField({
			name: 'categories',
			title: 'Categories',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [
						{type: 'category'}
					],
				}
			],
		}),
		
		defineField({
			name: "section",
			title: "Section",
			type: "array",
			of: [
				{ type: "slider" },
				{ type: "grid" },
				{ type: "grid-book" }],
			hidden: true
		}),
	],
	preview: {
		select: {
			title: "title",
			images: "header.images", // <- select full array, not images.0
			cat: "meta.category.abbr",
			nr: "meta.number",
			year: "meta.year",
			firstItemPlaybackId: "header.images.0.video.asset.playbackId",
		},
		prepare(selection) {
			const { title, images, cat, nr, year, firstItemPlaybackId } = selection;
	
			const firstItem = images?.[0];
			const y = year ? year.toString().slice(2, 4) : '00';
			const type = "Project";
	
			let mediaPreview = undefined;
	
			if (firstItem?._type === 'image') {
				mediaPreview = firstItem;
			} else if (firstItem?._type === 'video' && firstItemPlaybackId) {
				mediaPreview = createElement(MuxThumbnail, { playbackId: firstItemPlaybackId });
			}
	
			return {
				title: title,
				subtitle: `${type}: ${cat}-${nr}-${y}`,
				media: mediaPreview
			};
		}
	}
});
