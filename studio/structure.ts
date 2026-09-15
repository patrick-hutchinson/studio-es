import type {ConfigContext} from 'sanity'
import {StructureBuilder} from 'sanity/structure'
import MixedContentOrderList from './components/MixedContentOrderList'

const mixedContentFilter = '_type in ["project", "post"]'

const mixedContentList = (S: StructureBuilder) =>
  Object.assign(
    S.documentList()
      .id('projects-and-posts-all')
      .title('Alle')
      .filter(mixedContentFilter)
      .defaultOrdering([{field: 'orderRank', direction: 'asc'}])
      .serialize(),
    {
      __preserveInstance: true,
      component: MixedContentOrderList,
      key: 'projects-and-posts-all',
      type: 'component',
    },
  )

export const structure = (S: StructureBuilder, context: ConfigContext) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Website Einstellungen')
        .child(S.editor().schemaType('site').documentId('site')),
      S.listItem()
        .title('Design Einstellungen')
        .child(
          S.list()
            .title('Design Einstellungen')
            .items([
              S.listItem()
                .title('Appearance')
                .child(
                  S.documentTypeList('appearanceCombination')
                    .title('Appearance')
                    .defaultOrdering([{field: 'title', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Categories')
                .child(
                  S.documentList()
                    .title('Categories')
                    .filter('_type == "category"')
                    .menuItems([
                      S.orderingMenuItem({
                        title: 'Title',
                        name: 'titleAsc',
                        by: [{field: 'title', direction: 'asc'}],
                      }),
                      S.orderingMenuItem({
                        title: 'Parent',
                        name: 'parentAbbr',
                        by: [
                          {field: 'abbr', direction: 'asc'},
                          {field: 'parent.abbr', direction: 'asc'},
                        ],
                      }),
                    ])
                    .defaultOrdering([{field: 'abbr', direction: 'asc'}]),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Landing Page')
        .child(S.editor().schemaType('home').documentId('b7605842-c2ca-4d2e-aac8-96bd835dd082')),
      S.listItem()
        .title('Projects & Posts')
        .child(
          S.list()
            .title('Projects & Posts')
            .items([
              S.listItem()
                .title('Alle')
                .child(mixedContentList(S)),
              S.listItem()
                .title('Auf der Homepage')
                .child(
                  S.documentList()
                    .id('projects-and-posts-homepage')
                    .title('Auf der Homepage')
                    .filter(`${mixedContentFilter} && showOnHomepage == true`)
                    .defaultOrdering([{field: 'orderRank', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Nicht angezeigt')
                .child(
                  S.documentList()
                    .id('projects-and-posts-hidden')
                    .title('Nicht angezeigt')
                    .filter(`${mixedContentFilter} && showOnHomepage == false`)
                    .defaultOrdering([{field: 'orderRank', direction: 'asc'}]),
                ),
            ]),
        ),

      S.divider(),
      S.listItem().title('Kontakt').child(S.editor().schemaType('contact').documentId('contact')),

      S.divider(),
      S.listItem()
        .title('Archive')
        .child(
          S.list()
            .title('Archive')
            .items([
              S.listItem()
                .title('Archived Posts')
                .child(
                  S.documentTypeList('archivedPost')
                    .title('Archived Posts')
                    .defaultOrdering([{field: 'meta.year', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Archived Projects')
                .child(
                  S.documentTypeList('archivedProject')
                    .title('Archived Projects')
                    .defaultOrdering([{field: 'meta.year', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Archived News')
                .child(S.documentTypeList('archivedNews').title('Archived News')),
              S.divider(),
              S.listItem()
                .title('Studio')
                .child(
                  S.list()
                    .title('Studio')
                    .items([
                      S.listItem()
                        .title('About')
                        .child(
                          S.editor()
                            .schemaType('about')
                            .documentId('6e0df564-a4d8-4f51-84f7-081b4b858942'),
                        ),
                      S.listItem()
                        .title('Misc')
                        .child(
                          S.editor()
                            .schemaType('studio')
                            .documentId('fa7797e1-921f-4713-8fb9-9838fab83b8e'),
                        ),
                      S.listItem()
                        .title('Legal')
                        .child(
                          S.editor()
                            .schemaType('legal')
                            .documentId('34d7887a-c6de-417f-9968-7dc4b5ae4e8f'),
                        ),
                    ]),
                ),
            ]),
        ),
    ])
