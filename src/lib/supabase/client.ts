import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseClient() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined" && process.env.SUPABASE_URL);
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== "undefined" && process.env.SUPABASE_PUBLISHABLE_KEY);

  if (!url || !key) {
    const missing = [...(!url ? ["SUPABASE_URL"] : []), ...(!key ? ["SUPABASE_PUBLISHABLE_KEY"] : [])];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}`);
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _client: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_client) _client = createSupabaseClient();
    return Reflect.get(_client, prop, receiver);
  },
});
