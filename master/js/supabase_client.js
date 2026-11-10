const SUPABASE_URL = "https://your-supabase-url.supabase.co";
const 填PABASE_ANON_KEY = "your-anon-key";

let supabaseInstance = null;

function getSupabaseClient() {
  if (!supabaseInstance && typeof supabase !== 'undefined') {
    supabaseInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
}
