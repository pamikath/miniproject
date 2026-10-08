import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase URL & Anon Public API Key (Hardcoded default credentials for direct deployment)
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://trlqxlupipfalwasxbsm.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybHF4bHVwaXBmYWx3YXN4YnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0Mzc1MjksImV4cCI6MjEwNzAxMzUyOX0.VBoDGwRjz29NlrAgFypOlgvLxR92MbiGKHs--l2bTn0";

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Checks whether valid Supabase URL and Anon Key are configured
 */
export function isSupabaseConfigured(): boolean {
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (!url.startsWith("https://")) return false;
  if (
    url.includes("placeholder-") ||
    url.includes("mock-leafbook") ||
    url.includes("your-project")
  ) {
    return false;
  }
  if (
    key === "mock-anon-key" ||
    key === "your-supabase-anon-key" ||
    key.length < 25
  ) {
    return false;
  }
  return true;
}
