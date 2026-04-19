import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'No query' }, { status: 400 })
  }

  const params: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== 'q') params[key] = value
  })

  const result = await sanityClient.fetch(query, params)
  return NextResponse.json(result)
}
