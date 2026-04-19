import { defineType, defineField } from 'sanity'
import { createElement } from 'react';
import { MuxThumbnail } from '../../components/MuxThumbnail';
import {
	FcVideoCall
} from 'react-icons/fc'


export const videoSize = defineType({
	name: 'video-size',
	title: 'Video',
	type: 'object',
	icon: FcVideoCall,
	fields: [
		defineField({
			name: 'video',
			type: 'mux.video',
			title: 'Video',
		}),
		{
			name: 'size',
			type: 'string',
			options: {
				list: [
					{ title: 'Fullscreen (no Rapport)', value: 'fullscreen' },
					{ title: '100%', value: 'size-100' },
					{ title: '50%', value: 'size-50' },
					{ title: '33%', value: 'size-33' },
					{ title: '25%', value: 'size-25' },
					{ title: '20%', value: 'size-20' },
					{ title: '10%', value: 'size-10' },
				],
			},
		}
	],
	preview: {
  select: {
    t: 'title',
    image: 'video.asset.playbackId'
  },
  prepare(selection) {
    const { t, image } = selection;
    if (image) {
      return {
        title: 'Video',
        media: createElement(MuxThumbnail, { playbackId: image })
      };
    }

    return {
      title: 'Video',
      media: undefined,
    };
  }
  }

})