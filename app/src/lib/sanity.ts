import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import groq from 'groq'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityClient = createClient({
  projectId: 'kzivqb7t',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-01-01',
})

const imageBuilder = imageUrlBuilder(sanityClient)

export async function fetchSanity<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  return sanityClient.fetch<T>(query, params ?? {})
}

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source).auto('format')
}

export function urlForRef(ref: string) {
  return urlFor({
    _type: 'image',
    asset: { _type: 'reference', _ref: ref },
  } as SanityImageSource)
}

export { groq }
