import { NextResponse } from 'next/server';

// Placeholder sync endpoint. Should trigger server-side sync with Google Calendar
// and return the merged list of events for the user.
export async function POST() {
  return NextResponse.json({ error: 'Not implemented', message: 'Implement calendar sync on the server' }, { status: 501 });
}
