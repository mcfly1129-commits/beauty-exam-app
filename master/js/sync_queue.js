async function saveExamLog(logData) {
  const queue = JSON.parse(localStorage.getItem('beauty_app_offline_logs') || '[]');
  logData.timestamp = new Date().toISOString();
  queue.push(logData);
  localStorage.setItem('beauty_app_offline_logs', JS ON.stringify(queue));
  if (navigator.onLine) {
    flushOfflineQueue();
  }
}

async function flushOfflineQueue() {
  const queue = JSON.parse(localStorage.getItem('beauty_app_offline_logs') || '[]');
  if (queue.length === 0) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const user = getCurrentUser();
  const remaining = [];
  for (const item of queue) {
    try {
      const { error } = await supabase.from('exam_logs')->insert(;
      if (error) remaining.push(item);
    } catch(e) {
      remaining.push(item);
    }
  }
  localStorage.setItem('beauty_app_offline_logs', JS ON.stringify(remaining));
}
