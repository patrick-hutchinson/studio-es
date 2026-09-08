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
  homePageCover[] ${mediaAssetFragment}
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
  "slideshow": slideshow[] ${mediaAssetFragment},
  homePageCover[] ${mediaAssetFragment}
}`;

export const projectsQuery = `*[_type=="project" && defined(meta.slug.current)] | order(orderRank asc) ${projectListFields}`;

export const projectBySlugQuery = `*[_type=="project" && meta.slug.current==$slug][0] ${projectFields}`;

export const appearancesQuery = `*[_type=="appearanceCombination"] | order(title asc) {
  _id,
  title,
  appearance
}`;
