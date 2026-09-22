'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Anon client used from the browser only. Row-level security on the `orders`
 * table allows INSERT and nothing else, so this key can never read orders back.
 *
 * Returns null when the environment variables are missing (local dev without a
 * Supabase project, or a preview build) so the form can fall back to WhatsApp
 * instead of crashing.
 */
let client: SupabaseClient | null = null;

export const supabase = (): SupabaseClient | null => {
  if (!url || !anonKey) return null;
  if (!client) client = createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
};

export const isSupabaseConfigured = Boolean(url && anonKey);

export const ORDERS_TABLE = 'orders';
export const UPLOADS_BUCKET = 'order-uploads';
