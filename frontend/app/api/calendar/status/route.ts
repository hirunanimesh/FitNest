import { NextResponse } from 'next/server';

// Placeholder endpoint: should respond with { connected: boolean }
export async function GET() {
  return NextResponse.json({ connected: false });
}
