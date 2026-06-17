export const siteQuery = `*[_type=="site"][0]{
  title,
  owner,
  linkColors{
    linkColorLight,
    linkColorDark
  },
  themeColorsLight{
    fontColorLight,
    backgroundColorLight
  },
  themeColorsDark{
    fontColorDark,
    backgroundColorDark
  },
  placeholderType,
  defaultTheme,
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

export const landingPageQuery = `
  {
    "home": *[_type == "home"] | order(_updatedAt desc)[0]{
      _id,
      intro,
      images[]{
        _key,
        "_id": _key,
        _type,
        asset,
        alt
      }
    },
    "projects": *[_type in ["project", "post"]]{
      _id,
      _type,
      "date": meta.year,
      "title": select(
        _type == "post" => pt::text(title),
        _type == "project" => coalesce(longTitle, title)
      ),
      "category": select(
        _type == "post" => category[0]->{
          _id,
          _type,
          title,
          abbr,
          description
        },
        _type == "project" => meta.category->{
          _id,
          _type,
          title,
          abbr,
          description
        }
      ),
      "studio": *[_type == "studio"][0]{
        gmaps,
        copy
      },
      "categories": coalesce(category[]->{
        _id,
        _type,
        title,
        abbr,
        description
      }, []) + coalesce(categories[]->{
        _id,
        _type,
        title,
        abbr,
        description
      }, []) + select(
        defined(meta.category._ref) => [meta.category->{
          _id,
          _type,
          title,
          abbr,
          description
        }],
        []
      ),
      "slug": meta.slug.current,
      "img": header.images[0],
      "font": appearance.font,
      "background": appearance.background,
      "size": header.size
    } | order(date desc),
    "studio": *[_type == "studio"][0]{
      gmaps,
      copy
    },
    "categories": *[_type == "category"] | order(_createdAt asc){
      _id,
      title,
      _type,
      abbr,
      description
    }
  }
`;
