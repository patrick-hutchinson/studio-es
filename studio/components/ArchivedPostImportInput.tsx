import {useState} from 'react'
import {Button, Card, Flex, Stack, Text, useToast} from '@sanity/ui'
import {type ReferenceInputProps, useClient, useDocumentOperation, useFormValue} from 'sanity'

type ArchivedPost = {
  title?: Array<Record<string, unknown>>
  category?: Array<Record<string, unknown>>
  date?: string
  meta?: Record<string, unknown>
  appearance?: Record<string, unknown>
}

const archivedPostQuery = `*[_id == $id][0]{
  title,
  category,
  date,
  meta,
  appearance
}`

export default function ArchivedPostImportInput(props: ReferenceInputProps) {
  const client = useClient({apiVersion: '2025-01-01'})
  const toast = useToast()
  const documentId = useFormValue(['_id'])
  const {patch} = useDocumentOperation(
    typeof documentId === 'string' ? documentId.replace(/^drafts\./, '') : '',
    'post',
  )
  const [isImporting, setIsImporting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const archiveId = props.value?._ref

  const importArchivedPost = async () => {
    if (!archiveId || typeof documentId !== 'string') return

    setIsImporting(true)
    setStatusMessage('Importing archived post...')

    try {
      const archivedPost = await client.fetch<ArchivedPost>(archivedPostQuery, {id: archiveId})

      if (!archivedPost) {
        throw new Error('Der ausgewählte archivierte Post konnte nicht gefunden werden.')
      }

      const importedFields = {
        ...(archivedPost.title?.length ? {title: archivedPost.title} : {}),
        ...(archivedPost.category?.length ? {category: archivedPost.category} : {}),
        ...(archivedPost.date ? {date: archivedPost.date} : {}),
        ...(archivedPost.meta ? {meta: archivedPost.meta} : {}),
        ...(archivedPost.appearance ? {appearance: archivedPost.appearance} : {}),
      }

      patch.execute([{set: importedFields}])
      setStatusMessage('Imported. Der archivierte Post wurde nicht verändert.')
      toast.push({
        status: 'success',
        title: 'Archivierter Post importiert',
        description: 'Titel, Kategorie, Datum, Metadaten und Appearance wurden kopiert.',
      })
    } catch (error) {
      console.error(error)
      setStatusMessage('Import fehlgeschlagen. Bitte probiere es nochmal.')
      toast.push({status: 'error', title: 'Der archivierte Post konnte nicht importiert werden.'})
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
            Kopiert Titel, Kategorie, Datum, Metadaten und Appearance in diesen neuen Post. Der
            archivierte Post bleibt unverändert.
          </Text>
          <Flex align="center" gap={3} wrap="wrap">
            <Button
              text={isImporting ? 'Importing...' : 'Ausgewählten Post importieren'}
              tone="primary"
              disabled={!archiveId || isImporting || typeof documentId !== 'string'}
              onClick={importArchivedPost}
            />
            {statusMessage ? <Text size={1}>{statusMessage}</Text> : null}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  )
}
