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
  callToAction,
  copyright
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

export const archiveEntriesQuery = `*[_type in ["archiveProject", "archivePost"]] | order(coalesce(meta.year, date) desc){
  _id,
  _type,
  title,
  appearance,
  "date": coalesce(meta.year, date),
  "headerMedia": select(
    _type == "archiveProject" => header.images[]{
      _key,
      "medium": select(
        _type == "image" => {
          "type": "image",
          "_id": asset->_id,
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height,
          "altText": alt
        },
        _type == "video" => {
          "type": "video",
          "_id": video.asset->_id,
          "assetId": video.asset->assetId,
          "playbackId": video.asset->playbackId,
          "duration": video.asset->data.duration,
          "aspect_ratio": video.asset->data.aspect_ratio
        }
      )
    }
  )
}`;
