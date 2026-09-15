const API_VERSION = '2025-06-27'

const getYearBounds = (date?: string) => {
  const year = Number(String(date || '').slice(0, 4))

  if (!Number.isInteger(year)) return null

  return {
    end: `${year + 1}-01-01`,
    start: `${year}-01-01`,
    suffix: String(year).slice(-2),
  }
}

export const getNextPostCode = async (
  date: string | undefined,
  getClient: (options: {apiVersion: string}) => {fetch: Function},
  documentId?: string,
) => {
  const year = getYearBounds(date)

  if (!year) return ''

  const normalizedId = documentId?.replace(/^drafts\./, '')
  const ignoredIds = normalizedId ? [normalizedId, `drafts.${normalizedId}`] : []
  const count = await getClient({apiVersion: API_VERSION}).fetch(
    'count(*[_type in $types && meta.year >= $start && meta.year < $end && !(_id in $ignoredIds)])',
    {...year, ignoredIds, types: ['post', 'archivedPost']},
  )

  return `C-${String(Number(count) + 1).padStart(3, '0')}-${year.suffix}`
}

export const postCodeSource = () =>
  async (document: {_id?: string; meta?: {year?: string}}, context: {getClient: Function}) =>
    getNextPostCode(document.meta?.year, context.getClient, document._id)
