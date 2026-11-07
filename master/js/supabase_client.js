// Supabase接続クライアント設定
const SUPABASE_URL = 'https://hiyjvzjhezcfqscwqthi.supabase.co
';     // 例: '[suspicious link removed]'
const SUPABASE_ANON_KEY = 'sb_publishable_1bCaiTJGjhEy1boQX1OCAQ_vpn7msUg'; // 例: 'eyJhbGciOi...'

let supabaseClient = null;

// Supabaseクライアントの取得
function getSupabaseClient() {
  if (!supabaseClient) {
    if (window.supabase) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.error('Supabase SDKが読み込まれていません。CDNスクリプトを確認してください。');
    }
  }
  return supabaseClient;
}
