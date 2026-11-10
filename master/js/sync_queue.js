// オフラインキュー＆成績ログ自動同期モジュール
const QUEUE_KEY = 'beauty_exam_offline_queue';

// 回答ログの保存（オンラインなら即送信、オフラインならローカル保存）
async function saveExamLog(logData) {
  const user = getCurrentUser();
  if (!user) return false;

  const payload = {
    user_id: user.id,
    serial_code: user.serial_code,
    mode: logData.mode,             // '2choice' または '4choice'
    subject_id: logData.subject_id, // 例: 'public_hygiene'
    score: logData.score,
    total_questions: logData.total_questions,
    correct_count: logData.correct_count,
    details: logData.details || {},
    created_at: new Date().toISOString()
  };

  // オンライン時は即時送信
  if (navigator.onLine) {
    const success = await sendLogToSupabase(payload);
    if (success) {
      flushOfflineQueue(); // 過去の蓄積データがあればあわせて同期
      return true;
    }
  }

  // オフラインまたは送信失敗時はキューへ退避
  enqueueLog(payload);
  console.log('[SyncQueue] オフラインのため、ログをローカル保存しました。');
  return true;
}

// Supabaseへの単一ログ送信
async function sendLogToSupabase(payload) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('exam_logs').insert([payload]);
  if (error) {
    console.error('[SyncQueue] 送信エラー:', error.message);
    return false;
  }
  return true;
}

function enqueueLog(payload) {
  const queue = getQueue();
  queue.push(payload);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function getQueue() {
  const data = localStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

// オンライン復帰時の自動一括送信
async function flushOfflineQueue() {
  if (!navigator.onLine) return;
  const queue = getQueue();
  if (queue.length === 0) return;

  console.log(`[SyncQueue] 未送信ログ ${queue.length} 件を自動同期中...`);
  const remaining = [];

  for (const item of queue) {
    const success = await sendLogToSupabase(item);
    if (!success) remaining.push(item);
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  if (remaining.length === 0) {
    console.log('[SyncQueue] 全てのオフラインログの同期が完了しました。');
  }
}

// オンライン復帰イベントを検知
window.addEventListener('online', () => {
  console.log('[Network] オンラインに復帰しました。同期を開始します。');
  flushOfflineQueue();
});
