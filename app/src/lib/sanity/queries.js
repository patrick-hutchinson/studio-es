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
  title,
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
  "previewMedia": header.images[(_type=="image" && defined(asset)) || (_type=="video" && defined(video.asset))][0]{
    _key,
    alt,
    "medium": select(
      _type=="image" => {
      "type": "image",
      "_id": asset->_id,
      "url": asset->url,
      "extension": asset->extension,
      "mimeType": asset->mimeType,
      "lqip": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
      },
      _type=="video" => {
        "type": "video",
        "_id": video.asset->_id,
        "assetId": video.asset->assetId,
        "playbackId": video.asset->playbackId,
        "status": video.asset->status,
        "aspect_ratio": video.asset->data.aspect_ratio
      }
    )
  }
}`;

const projectFields = `{
  _id,
  _type,
  title,
  longTitle,
  isActive,
  description,
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
  "previewMedia": header.images[(_type=="image" && defined(asset)) || (_type=="video" && defined(video.asset))][0]{
    _key,
    alt,
    "medium": select(
      _type=="image" => {
      "type": "image",
      "_id": asset->_id,
      "url": asset->url,
      "extension": asset->extension,
      "mimeType": asset->mimeType,
      "lqip": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
      },
      _type=="video" => {
        "type": "video",
        "_id": video.asset->_id,
        "assetId": video.asset->assetId,
        "playbackId": video.asset->playbackId,
        "status": video.asset->status,
        "aspect_ratio": video.asset->data.aspect_ratio
      }
    )
  },
  header{
    images[]{
      _key,
      _type,
      alt,
      size,
      asset->{
        _id,
        url,
        extension,
        mimeType,
        metadata{
          lqip,
          dimensions{
            width,
            height,
            aspectRatio
          }
        }
      },
      video{
        asset->{
          assetId,
          playbackId,
          status,
          data{
            aspect_ratio
          }
        }
      }
    }
  }
}`;

export const projectsQuery = `*[_type=="project" && defined(meta.slug.current)] | order(meta.year desc, meta.number desc) ${projectListFields}`;

export const projectBySlugQuery = `*[_type=="project" && meta.slug.current==$slug][0] ${projectFields}`;

export const appearancesQuery = `*[_type=="appearanceCombination"] | order(title asc) {
  _id,
  title,
  appearance
}`;
