import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      const missing = [...(!url ? ["SUPABASE_URL"] : []), ...(!key ? ["SUPABASE_PUBLISHABLE_KEY"] : [])];
      throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}`);
    }

    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");

    const client = createClient<Database>(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client.auth.getClaims(token);
    if (error || !data?.claims?.sub) {
      throw new Error("Unauthorized: invalid token");
    }

    return next({
      context: {
        supabase: client,
        userId: data.claims.sub,
        claims: data.claims,
      },
    });
  },
);
