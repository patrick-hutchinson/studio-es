import {DragDropContext, Draggable, Droppable, type DropResult} from '@hello-pangea/dnd'
import {AddIcon, DragHandleIcon, GenerateIcon} from '@sanity/icons'
import {
  Box,
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Text,
  Tooltip,
  useToast,
} from '@sanity/ui'
import {DocumentStatus, DocumentStatusIndicator, useClient, useDocumentVersionInfo} from 'sanity'
import {useIntentLink} from 'sanity/router'
import {usePaneRouter} from 'sanity/structure'
import {useEffect, useMemo, useState} from 'react'
import {LexoRank} from 'lexorank'

const API_VERSION = '2025-06-27'
const CONTENT_TYPES = ['project', 'post']
const CONTENT_QUERY =
  '*[_type in $types] | order(orderRank asc){_id, _type, orderRank, title, showOnHomepage, meta{number, year, "categoryAbbr": category->abbr}, "postCategory": category[0]->title, appearance{font{hex}, background{hex}}, "homepageCoverImage": homePageCover[0].file.asset->url, "homepageCoverPlaybackId": homePageCover[0].file.asset->playbackId}'

type ContentDocument = {
  _id: string
  _type: 'project' | 'post'
  orderRank?: string
  showOnHomepage?: boolean
  title?: unknown
  meta?: {
    categoryAbbr?: string
    number?: number
    year?: string
  }
  postCategory?: string
  appearance?: {
    background?: {hex?: string}
    font?: {hex?: string}
  }
  homepageCoverImage?: string
  homepageCoverPlaybackId?: string
}

const parseRank = (value: string | undefined, fallback: LexoRank) => {
  try {
    return value ? LexoRank.parse(value) : fallback
  } catch {
    return fallback
  }
}

const getHomepageCoverPreview = (document: ContentDocument) => {
  if (document.homepageCoverImage) return document.homepageCoverImage
  if (document.homepageCoverPlaybackId) {
    return `https://image.mux.com/${document.homepageCoverPlaybackId}/thumbnail.jpg?time=0`
  }

  return undefined
}

const getDocumentTitle = (document: ContentDocument) => {
  const truncateAnnouncement = (title: string) =>
    document._type === 'post' && title.length > 25 ? `${title.slice(0, 25)}...` : title

  if (typeof document.title === 'string' && document.title.trim()) return truncateAnnouncement(document.title)

  if (Array.isArray(document.title)) {
    const title = document.title
      .flatMap((block) => (Array.isArray(block?.children) ? block.children : []))
      .map((child) => (typeof child?.text === 'string' ? child.text : ''))
      .join('')
      .trim()

    if (title) return truncateAnnouncement(title)
  }

  return 'Untitled'
}

const getDocumentSubtitle = (document: ContentDocument) => {
  const homepageStatus = document.showOnHomepage ? '🟢 ' : '🔴 '

  if (document._type === 'post') {
    return `${homepageStatus}Post: ${document.meta?.year || ''} | ${document.postCategory || 'No Category'}`
  }

  const year = document.meta?.year ? document.meta.year.slice(2, 4) : '00'
  return `${homepageStatus}Project: ${document.meta?.categoryAbbr || ''}-${document.meta?.number ?? ''}-${year}`
}

const CreateMenu = () => {
  const projectIntent = useIntentLink({intent: 'create', params: {type: 'project'}})
  const postIntent = useIntentLink({intent: 'create', params: {type: 'post'}})

  return (
    <MenuButton
      button={<Button aria-label="Create content" icon={AddIcon} mode="ghost" padding={2} />}
      id="create-project-or-post"
      menu={
        <Menu>
          <MenuItem as="a" {...projectIntent} text="New Project" />
          <MenuItem as="a" {...postIntent} text="New Post" />
        </Menu>
      }
      popover={{portal: true}}
    />
  )
}

const ContentListItem = ({
  document,
  index,
  isUpdating,
}: {
  document: ContentDocument
  index: number
  isUpdating: boolean
}) => {
  const {ChildLink} = usePaneRouter()
  const versionsInfo = useDocumentVersionInfo(document._id)
  const DocumentLink = useMemo(
    () => (props: React.ComponentProps<'a'>) => (
      <ChildLink
        {...props}
        childId={document._id}
        style={{...props.style, color: 'inherit', textDecoration: 'none'}}
      />
    ),
    [ChildLink, document._id],
  )
  const homepageCoverPreview = getHomepageCoverPreview(document)
  const isPost = document._type === 'post'
  const postTileStyle = {
    alignItems: 'center',
    backgroundColor: document.appearance?.background?.hex || '#ffffff',
    color: document.appearance?.font?.hex || '#000000',
    display: 'flex',
    flexShrink: 0,
    height: 32,
    justifyContent: 'center',
    width: 32,
  }

  return (
    <Draggable
      draggableId={document._id}
      index={index}
      isDragDisabled={!document.orderRank || isUpdating}
    >
      {(dragProvided, snapshot) => (
        <Box
          ref={dragProvided.innerRef}
          style={dragProvided.draggableProps.style}
          {...dragProvided.draggableProps}
        >
          <Card as={DocumentLink} radius={2} shadow={snapshot.isDragging ? 2 : 0} tone="inherit">
            <Flex align="center">
              <Box padding={2} {...dragProvided.dragHandleProps}>
                <DragHandleIcon />
              </Box>
              {isPost ? (
                <Box marginRight={2} style={postTileStyle}>
                  <Text size={2} style={{fontWeight: 900}}>
                    A
                  </Text>
                </Box>
              ) : homepageCoverPreview ? (
                <Box marginRight={2} style={{flexShrink: 0}}>
                  <img
                    alt=""
                    src={homepageCoverPreview}
                    style={{display: 'block', height: 32, objectFit: 'cover', width: 32}}
                  />
                </Box>
              ) : null}
              <Box flex={1} paddingY={2}>
                <Stack space={2}>
                  <Text size={1}>{getDocumentTitle(document)}</Text>
                  <Text muted size={1}>
                    {getDocumentSubtitle(document)}
                  </Text>
                </Stack>
              </Box>
              <Box paddingX={3} style={{flexShrink: 0}}>
                <Tooltip
                  content={
                    <DocumentStatus
                      draft={versionsInfo.draft}
                      published={versionsInfo.published}
                      versions={versionsInfo.versions}
                    />
                  }
                  portal
                  placement="right"
                >
                  <Flex>
                    <DocumentStatusIndicator
                      draft={versionsInfo.draft}
                      published={versionsInfo.published}
                      versions={versionsInfo.versions}
                    />
                  </Flex>
                </Tooltip>
              </Box>
            </Flex>
          </Card>
        </Box>
      )}
    </Draggable>
  )
}

const MixedContentOrderList = () => {
  const client = useClient({apiVersion: API_VERSION})
  const readClient = useMemo(() => client.withConfig({perspective: 'drafts'}), [client])
  const rawClient = useMemo(() => client.withConfig({perspective: 'raw'}), [client])
  const toast = useToast()
  const [documents, setDocuments] = useState<ContentDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadDocuments = async () => {
    const nextDocuments = await readClient.fetch<ContentDocument[]>(CONTENT_QUERY, {
      types: CONTENT_TYPES,
    })
    setDocuments(nextDocuments)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadDocuments()
  }, [readClient])

  const resetOrder = async () => {
    setIsUpdating(true)

    try {
      let rank = LexoRank.min()
      const transaction = client.transaction()

      documents.forEach((document) => {
        rank = rank.genNext().genNext()
        transaction.patch(document._id, {set: {orderRank: rank.toString()}})
      })

      await transaction.commit({visibility: 'sync'})
      await loadDocuments()
      toast.push({status: 'success', title: 'Content order reset'})
    } catch {
      toast.push({status: 'error', title: 'Could not reset content order'})
    } finally {
      setIsUpdating(false)
    }
  }

  const reorder = async (result: DropResult) => {
    const {source, destination} = result
    if (!destination || source.index === destination.index || isUpdating) return

    const nextDocuments = [...documents]
    const [movedDocument] = nextDocuments.splice(source.index, 1)
    nextDocuments.splice(destination.index, 0, movedDocument)

    const previousRank = parseRank(nextDocuments[destination.index - 1]?.orderRank, LexoRank.min())
    const followingRank = parseRank(nextDocuments[destination.index + 1]?.orderRank, LexoRank.max())
    const orderRank = previousRank.between(followingRank).toString()

    setDocuments(
      nextDocuments.map((document) =>
        document._id === movedDocument._id ? {...document, orderRank} : document,
      ),
    )
    setIsUpdating(true)

    try {
      const draftId = `drafts.${movedDocument._id}`
      const existingIds = await rawClient.fetch<string[]>('*[_id in $ids]._id', {
        ids: [movedDocument._id, draftId],
      })

      if (!existingIds.length) throw new Error('The document no longer exists.')

      const transaction = client.transaction()
      // A drafts-perspective query exposes the logical ID, even for draft-only documents.
      // Update every real version so sorting survives the next publish action as well.
      existingIds.forEach((id) => transaction.patch(id, {set: {orderRank}}))

      await transaction.commit({visibility: 'sync', tag: 'mixed-content-order-list.reorder'})
    } catch (error) {
      console.error('Could not reorder mixed content', error)
      await loadDocuments()
      toast.push({
        status: 'error',
        title: 'Could not reorder content',
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const hasUnrankedDocuments = documents.some((document) => !document.orderRank)

  if (isLoading) return <Box padding={4}>Loading content...</Box>

  return (
    <Flex direction="column" height="fill">
      <Flex align="center" justify="space-between" padding={3}>
        <Text size={1} muted>
          {documents.length} items
        </Text>
        <Flex gap={2}>
          <Button
            icon={GenerateIcon}
            mode="ghost"
            onClick={resetOrder}
            text="Reset order"
            disabled={isUpdating}
          />
          <CreateMenu />
        </Flex>
      </Flex>
      {hasUnrankedDocuments ? (
        <Card margin={2} padding={3} radius={2} tone="caution">
          <Text size={1}>
            Some existing items have no shared order yet. Choose “Reset order” once to include them.
          </Text>
        </Card>
      ) : null}
      <Box flex={1} overflow="auto" padding={2}>
        <DragDropContext onDragEnd={reorder}>
          <Droppable droppableId="projects-and-posts">
            {(provided) => (
              <Stack ref={provided.innerRef} space={1} {...provided.droppableProps}>
                {documents.map((document, index) => (
                  <ContentListItem
                    document={document}
                    index={index}
                    isUpdating={isUpdating}
                    key={document._id}
                  />
                ))}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Flex>
  )
}

export default MixedContentOrderList
