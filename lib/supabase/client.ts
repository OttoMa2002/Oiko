import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Use inside `"use client"` components only.
 * Cookies are managed by @supabase/ssr so the server can read the same session.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
