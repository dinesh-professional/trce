import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for client-side React components (CSR).
 * Interacts with cookies automatically for active session persistence.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

