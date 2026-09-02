import { mediaAssetFragment } from "../fragments";

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
  homePageCover{
    type,
    image[0] ${mediaAssetFragment},
    video[0] ${mediaAssetFragment},
    gallery[] ${mediaAssetFragment}
  }
}`;

const projectFields = `{
  _id,
  _type,
  title,
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
  gallery[] ${mediaAssetFragment},
  "coverMedia": coverImage[0] ${mediaAssetFragment},
  homePageCover{
    type,
    image[0] ${mediaAssetFragment},
    video[0] ${mediaAssetFragment},
    gallery[] ${mediaAssetFragment}
  }
}`;

export const projectsQuery = `*[_type=="project" && defined(meta.slug.current)] | order(meta.year desc, meta.number desc) ${projectListFields}`;

export const projectBySlugQuery = `*[_type=="project" && meta.slug.current==$slug][0] ${projectFields}`;

export const appearancesQuery = `*[_type=="appearanceCombination"] | order(title asc) {
  _id,
  title,
  appearance
}`;
