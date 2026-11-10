// シリアルコード認証・ユーザー状態管理モジュール
const STORAGE_KEY_USER = 'beauty_exam_user';

// シリアルコードでログイン/アカウント作成
async function loginWithSerialCode(serialCode, studentName) {
  const supabase = getSupabaseClient();
  const cleanCode = serialCode.trim().toUpperCase();
  const trimmedName = studentName.trim();

  // 1. シリアルコードの有効性を検証
  const { data: codeData, error: codeErr } = await supabase
    .from('serial_codes')
    .select('*')
    .eq('code', cleanCode)
    .single();

  if (codeErr || !codeData) {
    return { success: false, message: '無効なシリアルコードです。確認してください。' };
  }
  if (!codeData.is_active) {
    return { success: false, message: 'このシリアルコードは無効化されています。' };
  }
  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    return { success: false, message: 'シリアルコードの有効期限が切れています。' };
  }

  // 2. 既に同じコードと氏名のユーザーが登録済みかチェック（重複カウント防止）
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('serial_code', cleanCode)
    .eq('student_name', trimmedName)
    .maybeSingle();

  let userData = existingUser;

  if (!userData) {
    // 新規ユーザーの場合のみ、上限チェックを行う
    if (codeData.used_count >= codeData.max_uses) {
      return { success: false, message: 'このシリアルコードは利用人数上限に達しています。' };
    }

    // ユーザー登録（新規）
    const { data: newUser, error: userErr } = await supabase
      .from('users')
      .insert([
        {
          serial_code: cleanCode,
          student_name: trimmedName,
          school_name: codeData.school_name,
          role: 'student'
        }
      ])
      .select()
      .single();

    if (userErr) {
      return { success: false, message: 'ユーザー登録に失敗しました: ' + userErr.message };
    }

    userData = newUser;

    // 3. 初回登録時のみ、シリアルコードの利用人数を+1カウントアップ
    await supabase
      .from('serial_codes')
      .update({ used_count: codeData.used_count + 1 })
      .eq('id', codeData.id);
  }

  // 4. ブラウザにログインセッションを保持
  const sessionUser = {
    id: userData.id,
    serial_code: cleanCode,
    student_name: userData.student_name,
    school_name: userData.school_name,
    role: userData.role
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));

  return { success: true, user: sessionUser };
}

// 現在のログインユーザーを取得
function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  return data ? JSON.parse(data) : null;
}

// ログアウト処理 (遷移先を絶対パス /master/index.html に統一)
function logout() {
  localStorage.removeItem(STORAGE_KEY_USER);
  window.location.href = '/master/index.html';
}
