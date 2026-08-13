import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

import { AppError } from "../../utils/errors";
import { secureStoreAdapter } from "../../utils/secureStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.",
  );
}

export function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new AppError(
      "CONFIG",
      "This app is not configured yet. Add your Supabase URL and anon key to .env.",
    );
  }
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
