import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
	// Helpful runtime hint — missing NEXT_PUBLIC_SUPABASE_URL is a common cause of `Failed to fetch` in the browser
	// Do not log secrets in production. This is a development aid.
	// Restart Next.js after changing .env files so NEXT_PUBLIC_* vars are available.
	// eslint-disable-next-line no-console
	console.error('[supabase] NEXT_PUBLIC_SUPABASE_URL is not set. Set it in frontend/.env and restart the dev server.')
}
if (!supabaseAnonKey) {
	// eslint-disable-next-line no-console
	console.error('[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Set it in frontend/.env and restart the dev server.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
