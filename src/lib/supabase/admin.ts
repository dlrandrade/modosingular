import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/env";

/**
 * Cliente com service_role. NUNCA importar em componente cliente.
 * Usado só em route handlers e server actions de admin/webhook.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");
  const url = supabaseUrl();
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL ausente");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
