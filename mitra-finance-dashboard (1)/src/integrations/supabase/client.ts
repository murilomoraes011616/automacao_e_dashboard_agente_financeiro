/**
 * Supabase Client
 * ---------------
 * Instância única do cliente Supabase usada por toda a aplicação.
 *
 * - URL e chave pública (anon) ficam hard-coded aqui de propósito: este
 *   arquivo é gerado/gerenciado pela integração com Lovable Cloud. Não
 *   edite manualmente as constantes.
 * - `storage: localStorage` faz a sessão persistir entre reloads.
 * - `autoRefreshToken: true` renova o JWT automaticamente antes de expirar.
 *
 * Importe sempre desta forma:
 *   import { supabase } from "@/integrations/supabase/client";
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://leialgtsvtymuftepcrn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaWFsZ3RzdnR5bXVmdGVwY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTE1NzQsImV4cCI6MjA3NTg2NzU3NH0.DBFGwpfxW-HBfTTQ3FU3K7rBfnvv8mmM9G9-QQvNaiw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
