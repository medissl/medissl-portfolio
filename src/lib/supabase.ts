import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const fallbackUrl = "https://cegtlpoofkogscvopcug.supabase.co";
const fallbackPublishableKey = "sb_publishable_zkTB1zEwB6y5omIVVk6IIQ_HL9CwR9w";

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl;

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fallbackPublishableKey;

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase() {
  if (typeof window === "undefined") {
    return createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false },
    });
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
}

export function getServerSupabase() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicMediaUrl(path?: string | null) {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/portfolio-media/${path}`;
}
