import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const missing = [...(!url ? ["SUPABASE_URL"] : []), ...(!key ? ["SUPABASE_SERVICE_ROLE_KEY"] : [])];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}`);
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _admin: ReturnType<typeof createAdminClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createAdminClient>, {
  get(_, prop, receiver) {
    if (!_admin) _admin = createAdminClient();
    return Reflect.get(_admin, prop, receiver);
  },
});
