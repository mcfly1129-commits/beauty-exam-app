// Service Worker: オフラインキャッシュ & ネットワーク制御
const CACHE_NAME = 'beauty-exam-pro-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/questions_database.js',
  './js/supabase_client.js',
  './js/auth.js',
  './js/sync_queue.js'
];

// インストール処理：静的ファイルのキャッシュ保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll skipped some files:', err);
      });
    })
  );
  self.skipWaiting();
});

// アクティベート処理：古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// フェッチ処理：ネットワーク優先（オフライン時はキャッシュから応答）
self.addEventListener('fetch', (event) => {
  // Supabase API通信はキャッシュせずスルー
  if (event.request.url.includes('[suspicious link removed]')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功した場合は最新レスポンスをキャッシュに保存して返す
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから読み込む
        return caches.match(event.request);
      })
  );
});
