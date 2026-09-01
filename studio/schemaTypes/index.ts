import {about} from './about'
import {archivedProject} from './archivedProject'
import {archivedNews} from './archivedNews'
import {archivedPost} from './archivedPost'
import {appearance, appearanceCombination} from './objects/appearance'
import {award} from './objects/award'
import {awardcat} from './objects/award-cat'
import {button} from './objects/button'
import {category} from './category'
import {exhibition} from './objects/exhibition'
// import {gallery} from './objects/gallery'
import {grid} from './objects/grid'
import {gridBook} from './objects/grid-book'
import {gridItem} from './objects/grid-item'
import {home} from './home'
import {intro} from './objects/intro'
import {meta} from './objects/meta'
import {news} from './news'
import {post} from './post'

import {legal} from './legal'
import {person} from './objects/person'
import {project} from './project'
import {services} from './services'
import {slider} from './objects/slider'
import {studio} from './studio'
import {video} from './objects/video'
import {videoSize} from './objects/video-size'
import {videoCaption} from './objects/video-caption'
import {portableText} from './types/portableText'
import {link} from './types/link'
import {site} from './site'
import {imageAsset} from './types/media/imageAsset'
import {mediaAsset} from './types/media/mediaAsset'
import {videoAsset} from './types/media/videoAsset'
import {gallery} from './types/media/gallery'

export const schemaTypes = [
  site,
  about,
  archivedNews,
  archivedPost,
  archivedProject,
  appearance,
  appearanceCombination,
  award,
  awardcat,
  button,
  category,
  exhibition,
  // gallery,
  grid,
  gridBook,
  gridItem,
  home,
  intro,
  legal,
  meta,
  news,
  person,
  post,
  project,
  services,
  slider,
  studio,
  video,
  videoSize,
  videoCaption,
  portableText,
  link,

  imageAsset,
  mediaAsset,
  videoAsset,
  gallery,
]
