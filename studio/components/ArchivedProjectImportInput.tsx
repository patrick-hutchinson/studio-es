import {useState} from 'react'
import {Button, Card, Flex, Stack, Text, useToast} from '@sanity/ui'
import {type ReferenceInputProps, useClient, useDocumentOperation, useFormValue} from 'sanity'

type LegacyHeaderItem = {
  _key?: string
  _type?: string
  alt?: string
  asset?: Record<string, unknown>
  crop?: Record<string, unknown>
  hotspot?: Record<string, unknown>
  video?: Record<string, unknown>
}

type ArchivedProject = {
  title?: string
  headerImages?: LegacyHeaderItem[]
  descriptionBlocks?: Array<Record<string, unknown>>
  appearance?: Record<string, unknown>
  meta?: Record<string, unknown>
  categories?: Array<Record<string, unknown>>
}

const archivedProjectQuery = `*[_id == $id][0]{
  title,
  "headerImages": header.images[]{_key, _type, alt, asset, crop, hotspot, video},
  "descriptionBlocks": description.copy,
  appearance,
  meta,
  categories
}`

const createKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const convertHeaderImages = (items: LegacyHeaderItem[] = []) =>
  items.flatMap((item) => {
    if (item._type === 'image' && item.asset) {
      return [
        {
          _key: item._key || createKey(),
          _type: 'imageAsset',
          file: {
            _type: 'image',
            asset: item.asset,
            ...(item.crop ? {crop: item.crop} : {}),
            ...(item.hotspot ? {hotspot: item.hotspot} : {}),
          },
          ...(item.alt ? {caption: item.alt} : {}),
        },
      ]
    }

    if (item._type === 'video' && item.video) {
      return [
        {
          _key: item._key || createKey(),
          _type: 'videoAsset',
          file: item.video,
        },
      ]
    }

    return []
  })

const convertDescription = (blocks: Array<Record<string, unknown>> = []) =>
  blocks.map((block) => ({
    ...block,
    // The legacy intro only used `h2`, which is not a valid style in the new rich-text schema.
    ...(block.style === 'h2' ? {style: 'normal'} : {}),
  }))

const convertAppearance = (appearance?: Record<string, unknown>) => {
  if (!appearance) return undefined

  const {inverted: _inverted, ...projectAppearance} = appearance
  return projectAppearance
}

export default function ArchivedProjectImportInput(props: ReferenceInputProps) {
  const client = useClient({apiVersion: '2025-01-01'})
  const toast = useToast()
  const documentId = useFormValue(['_id'])
  const {patch} = useDocumentOperation(
    typeof documentId === 'string' ? documentId.replace(/^drafts\./, '') : '',
    'project',
  )
  const [isImporting, setIsImporting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const archiveId = props.value?._ref

  const importArchivedProject = async () => {
    if (!archiveId || typeof documentId !== 'string') return

    setIsImporting(true)
    setStatusMessage('Importing archived project...')

    try {
      const archivedProject = await client.fetch<ArchivedProject>(archivedProjectQuery, {
        id: archiveId,
      })

      if (!archivedProject) {
        throw new Error('Das ausgewählte (archivierte) Projekt konnte nicht gefunden werden.')
      }

      const coverMedia = convertHeaderImages(archivedProject.headerImages)
      const appearance = convertAppearance(archivedProject.appearance)
      const importedFields = {
        ...(archivedProject.title ? {title: archivedProject.title} : {}),
        ...(coverMedia.length ? {coverMedia} : {}),
        ...(archivedProject.descriptionBlocks?.length
          ? {description: convertDescription(archivedProject.descriptionBlocks)}
          : {}),
        ...(appearance ? {appearance} : {}),
        ...(archivedProject.meta ? {meta: archivedProject.meta} : {}),
        ...(archivedProject.categories ? {categories: archivedProject.categories} : {}),
      }

      patch.execute([{set: importedFields}])

      const importedMediaLabel = `${coverMedia.length} media item${
        coverMedia.length === 1 ? '' : 's'
      }`
      setStatusMessage(
        `Imported ${importedMediaLabel}. Das archivierte Projekt wurde nicht verändert.`,
      )
      toast.push({
        status: 'success',
        title: 'Das archivierte Projekt wurde importiert!',
        description: `Es wurden ${importedMediaLabel} in dieses Projekt kopiert.`,
      })
    } catch (error) {
      console.error(error)
      setStatusMessage('Import fehlgeschlagen. Bitte probiere es nochmal.')
      toast.push({
        status: 'error',
        title: 'Das archivierte Projekt konnte nicht importiert werden.',
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Card padding={3} radius={2} border>
        <Stack space={3}>
          <Text size={1}>
            Hiermit kopierst du Titel, Beschreibung, Farbkombination, Metadaten und Kategorien in
            ein neues Projekt. Die Header Gallerie des archivierten Projekts wird als Cover Media
            übertragen. Die archivierte Version bleibt wie sie ist! 🌈
          </Text>
          <Flex align="center" gap={3} wrap="wrap">
            <Button
              text={isImporting ? 'Importing...' : 'Ausgewähltes Projekt importieren'}
              tone="primary"
              disabled={!archiveId || isImporting || typeof documentId !== 'string'}
              onClick={importArchivedProject}
            />
            {statusMessage ? <Text size={1}>{statusMessage}</Text> : null}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  )
}
