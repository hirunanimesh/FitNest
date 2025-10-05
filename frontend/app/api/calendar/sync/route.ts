import { NextResponse } from 'next/server'

// Proxy POST to backend UserService sync endpoint
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)
    const userId = segments[segments.length - 1] || url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'missing userId' }, { status: 400 })

    const backend = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim() ? process.env.NEXT_PUBLIC_USERSERVICE_URL : 'http://localhost:3004'
    const res = await fetch(`${backend}/calendar/sync/${userId}`, { method: 'POST' })
    const body = await res.text()
    return new NextResponse(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
  } catch (err) {
    return NextResponse.json({ error: 'proxy failed', message: String(err) }, { status: 500 })
  }
}
