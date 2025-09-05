import { NextResponse } from 'next/server';

// Return events stored on the server for the current user.
// TODO: Integrate with your backend or Supabase to fetch persisted events.
export async function GET() {
  return NextResponse.json([]);
}
