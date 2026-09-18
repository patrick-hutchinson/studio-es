import { mediaAssetFragment, rasterGalleryAssetFragment } from "../fragments";

export const siteQuery = `*[_type=="site"][0]{
  title,
  favicon{
    asset->{
      url
    }
  },
  description,
  address,
  email,
  phone,
  socials[]{
    platform,
    link
  },
}`;

const projectListFields = `{
  _id,
  _type,
  orderRank,
  title,
  openable,
  showOnHomepage,
  isActive,
  appearance,
  meta{
    number,
    year,
    "slug": slug.current,
    category->{
      _id,
      title,
      abbr,
      description
    }
  },
  categories[]->{
    _id,
    title,
    abbr,
    description
  },
  homePageCover[] ${mediaAssetFragment}
}`;

const projectFields = `{
  _id,
  _type,
  title,
  "description": description[]{
    ...,
    markDefs[]{
      ...,
      "file": file{
        ...,
        asset->{url, originalFilename}
      }
    }
  },
  appearance,
  meta{
    number,
    year,
    location,
    client,
    "slug": slug.current,
    category->{
      _id,
      title,
      abbr,
      description
    }
  },
  categories[]->{
    _id,
    title,
    abbr,
    description
  },
  galleryLayout,
  gallery[] ${rasterGalleryAssetFragment},
  "slideshow": slideshow[] ${mediaAssetFragment},
  "supportingMedia": supportingMedia[] ${mediaAssetFragment},
  homePageCover[] ${mediaAssetFragment}
}`;

export const projectsQuery = `*[_type=="project" && (openable == false || defined(meta.slug.current))] | order(orderRank asc) ${projectListFields}`;

export const projectBySlugQuery = `*[_type=="project" && meta.slug.current==$slug][0] ${projectFields}`;

export const appearancesQuery = `*[_type=="appearanceCombination"] | order(title asc) {
  _id,
  title,
  appearance
}`;

export const contactQuery = `*[_type=="contact"][0]{
  _id,
  text,
  callToAction
}`;

export const postsQuery = `*[_type=="post"] | order(orderRank asc){
  _id,
  _type,
  orderRank,
  title,
  "date": meta.year,
  appearance,
  showOnHomepage,
  category->{
    _id,
    title,
    abbr,
    description
  },
}`;

export const archivedEntriesQuery = `*[_type in ["archivedProject", "archivedPost"]] | order(coalesce(meta.year, date) desc){
  _id,
  _type,
  title,
  appearance,
  "date": coalesce(meta.year, date),
  "medium": select(
    _type == "archivedProject" && header.images[0]._type == "image" => {
      "type": "image",
      "_id": header.images[0].asset->_id,
      "url": header.images[0].asset->url,
      "width": header.images[0].asset->metadata.dimensions.width,
      "height": header.images[0].asset->metadata.dimensions.height,
      "altText": header.images[0].alt
    },
    _type == "archivedProject" && header.images[0]._type == "video" => {
      "type": "video",
      "_id": header.images[0].video.asset->_id,
      "assetId": header.images[0].video.asset->assetId,
      "playbackId": header.images[0].video.asset->playbackId,
      "duration": header.images[0].video.asset->data.duration,
      "aspect_ratio": header.images[0].video.asset->data.aspect_ratio
    }
  )
}`;
