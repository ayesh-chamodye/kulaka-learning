import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser-side operations.
 * Uses the public anon key and is safe for client components.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
