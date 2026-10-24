import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'faucetflow_supabase_url';
const STORAGE_KEY_ANON = 'faucetflow_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSavedCredentials(): { url: string; anonKey: string } {
  if (typeof window === 'undefined') {
    return { url: '', anonKey: '' };
  }
  const url =
    localStorage.getItem(STORAGE_KEY_URL) ||
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    '';
  const anonKey =
    localStorage.getItem(STORAGE_KEY_ANON) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    '';
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function saveCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    cachedClient = null;
  }
}

export function clearCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    cachedClient = null;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedCredentials();
  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = url;
    cachedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; details?: unknown }> {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https://' };
    }
    const testClient = createClient(url, anonKey);
    // Ping profiles or check auth session
    const { data, error } = await testClient.auth.getSession();
    if (error && error.message && !error.message.includes('session')) {
      return { success: false, message: error.message };
    }
    return {
      success: true,
      message: 'Connected successfully to Supabase endpoint!',
      details: data,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Connection test failed: ${message}` };
  }
}
