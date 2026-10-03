import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { publicEnv, serverEnv } from "@/lib/env";

export function createAdminClient() {
  return createClient<Database>(
    publicEnv.supabaseUrl(),
    serverEnv.supabaseSecretKey(),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
