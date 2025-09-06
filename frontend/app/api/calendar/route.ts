import { NextResponse } from 'next/server'

// Consolidated calendar API endpoint. Dispatches by method and path query.
export async function GET(req: Request) {
  // default GET — return placeholder connected + events if query ?type=events
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    if (type === 'status') {
      return NextResponse.json({ connected: false })
    }
    if (type === 'events') {
      return NextResponse.json([])
    }
    return NextResponse.json({ message: 'Calendar API root' })
  } catch (err) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    if (type === 'sync') {
      return NextResponse.json({ error: 'Not implemented', message: 'Implement calendar sync on the server' }, { status: 501 })
    }
    return NextResponse.json({ error: 'unknown POST' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
