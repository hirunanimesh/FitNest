import { NextResponse } from 'next/server'

// Proxy to backend UserService to fetch persisted events for a user.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)
    const userId = segments[segments.length - 1] || url.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'missing userId' }, { status: 400 })

    const backend = process.env.NEXT_PUBLIC_USERSERVICE_URL?.trim()
      ? process.env.NEXT_PUBLIC_USERSERVICE_URL
      : 'https://cvmxfwmcaxmqnhmsxicu.supabase.co'

    const res = await fetch(`${backend}/calendar/events/${userId}`)
    const body = await res.text()
    return new NextResponse(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
  } catch (err) {
    return NextResponse.json({ error: 'proxy failed', message: String(err) }, { status: 500 })
  }
}
