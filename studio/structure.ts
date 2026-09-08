import type {ConfigContext} from 'sanity'
import {StructureBuilder} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export const structure = (S: StructureBuilder, context: ConfigContext) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Website Settings').child(S.editor().schemaType('site').documentId('site')),
      S.listItem()
        .title('Design Settings')
        .child(
          S.list()
            .title('Design Settings')
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
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        S,
        context,
      }),
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
