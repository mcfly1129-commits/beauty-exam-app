/**
 * 美容師国家試験 4択過去問（第41回〜第54回）模範解答・科目マッピング・採点エンジン
 * 旧GAS（exam_master シート / processScoring）完全互換モジュール
 */

const PAST_EXAM_SUBJECTS = [
  { id: 1, key: 'regulations',    name: '関係法規・制度',     shortName: '関係法規', startQ: 1,  endQ: 7  },
  { id: 2, key: 'management',     name: '運営管理',           shortName: '運営管理', startQ: 8,  endQ: 10 },
  { id: 3, key: 'public_hygiene', name: '公衆衛生・環境衛生', shortName: '公衆衛生', startQ: 11, endQ: 15 },
  { id: 4, key: 'infection',      name: '感染症',             shortName: '感染症',   startQ: 16, endQ: 20 },
  { id: 5, key: 'hygiene_tech',   name: '衛生管理技術',       shortName: '管理技術', startQ: 21, endQ: 25 },
  { id: 6, key: 'anatomy',        name: '人体の構造及び機能', shortName: '人体',     startQ: 26, endQ: 30 },
  { id: 7, key: 'dermatology',    name: '皮膚科学',           shortName: '皮膚科学', startQ: 31, endQ: 35 },
  { id: 8, key: 'cosmetic_chem',  name: '香粧品化学',         shortName: '香粧品',   startQ: 36, endQ: 40 },
  { id: 9, key: 'culture',        name: '文化論',             shortName: '文化論',   startQ: 41, endQ: 43 },
  { id: 10, key: 'tech_theory',   name: '美容技術理論',       shortName: '美容技術', startQ: 44, endQ: 55 }
];

// 全回共通の55問所属科目IDマッピング（問1〜問55）
const PAST_EXAM_SUBJECT_MAPPING = [
  1,1,1,1,1,1,1,                      // 1〜7: 関係法規・制度
  2,2,2,                              // 8〜10: 運営管理
  3,3,3,3,3,                          // 11〜15: 公衆衛生・環境衛生
  4,4,4,4,4,                          // 16〜20: 感染症
  5,5,5,5,5,                          // 21〜25: 衛生管理技術
  6,6,6,6,6,                          // 26〜30: 人体の構造及び機能
  7,7,7,7,7,                          // 31〜35: 皮膚科学
  8,8,8,8,8,                          // 36〜40: 香粧品化学
  9,9,9,                              // 41〜43: 文化論
  10,10,10,10,10,10,10,10,10,10,10,10 // 44〜55: 美容技術理論
];

// 第41回〜第54回 模範解答マスター（'0' または 'ALL' は全員正解、'2/4' 等は複数正解）
const PAST_EXAM_ANSWERS = {
  41: ['2','1','3','4','4','3','1','3','1','1','4','1','3','2','1','2','1','2','2','3','2','1','4','2','3','4','3','3','2','4','4','3','4','2','1','4','2','3','3','2','3','4','3','1','1','3','3','3','2','2','2','4','4','3','2'],
  42: ['3','4','1','4','2','2','2','3','4','2','3','1','2','1','3','1','3','4','1','3','1','3','3','2','4','4','3','1','4','3','1','2','2','3','4','4','1','4','3','2/4','2','4','4','1','1','1','3','4','2','1','2','3','3','1','1'],
  43: ['3','2','3','1','4','2','3','3','2','4','3','1','3','4','2','1','2','2','3','4','4','4','1','2','1','1','4','3','3','2','3','2','2','4','1','3','2','1','4','4','4','1','3','1','1','2','3','1','4','1/2','2','3','2','1','3'],
  44: ['3','4','3','1','4','4','4','2','3','1','2','4','4','3','1','3','2','1','3','3','4','3','2','1','2','2','2','1','2','3','3','4','2','1','1','1','2','2','1','3','2','1','2','4','2','4','3','4','1','4','3','2','4','1','2'],
  45: ['4','3','1','2','4','4','3','1','2','3','4','3','2','4','1','1','4','2','3','2','4','2','2','1','3','2','3','1','4','3','3','2','1','1','4','3','4','1','2','4','4','2','1','3','1','2','4','2','1','1','4','2','4','3','3'],
  46: ['3','2','3','1','4','1','2','4','4','2','1','2','3','2','2','3','3','4','1','2','3','4','2','1','2','4','3','2','2','1','1','1','3','4','1','4','4','3','1','2','4','3','2','2','1','4','2','4','4','3','4','3','1','3','1'],
  47: ['1','4','3','3','2','4','1','3','2','3','4','2','3','1','4','2','1/2','1','3','4','1','3','1','2','2','4','4','2','2','1','3','3','2','1','4','4','4','3','1','3','4','1','1','3','4','4','3','2','3','2','3','1','1','2','4'],
  48: ['4','2','4','1','1','3','2','3','4','2','4','3','1','3','2','4','2','3','4','1','1','1','4','3','2','2','2','3','2','1','4','1','4','2','3','2','3','3','2','4','3','2','1','3','4','4','2','3','3','2','1','1','4','2','1'],
  49: ['2','3','1','4','3','4','2','2','3','4','3','2','1','2','1','4','1','4','2','2/4','3','4','3','1','4','1','4','2','3','3','2','3','0','1','4','4','2/3','2','1','3','1','2','4','2','3','3','3','1','2','4','4','2','1','1','4'],
  50: ['4','1','4','1','3','4','2','2','1','4','1','3','2','3','4','2','4','4','1','1','1','2','4','3','1','2','2','3','3','1','3','3','2','4','1','2','4','3','3','1','1','2','3','2','4','2','1','2','4','1','4','2','3','4','3'],
  51: ['4','3','3','4','3','1','2','3','1','3','1','2','4','3','4','3','4','4','1','1','4','1','2','2','4','2','1','3','2','3','1','1','4','4','3','3','1','3','2','2','2','4','1','4','3','1','3','4','1','3','2','1','2','2','4'],
  52: ['3','3','1','4','2','4','4','2','1','3','1','2','2','1','4','2','4','4','1','1','2','3','3','1','2','3','4','3','4','2','1','2','3','3','4','1','3','4','3','4','2','3','4','3','2','2','3','1','4','3','1','4','2','4','1'],
  53: ['2','4','4','1','3','3','2','2','2','1','3','2','2','3','4','1','4','4','1','3','2','1','3','2','4','2','4','1','3','4','2','3','1','4','2','4','2','1','2','3','1','3','3','3','2','1','2','1','2','1','4','3','4','4','3'],
  54: ['3','4','3','2','1','1','4','3','3','1','1','2','3','4','2','3','4','2','2','1','2','3','2','1','4','1','1','3','4','4','4','3','1','3','2','4','1','2','2','4','3','1','4','4','2','4','2','3','3','4','2','2','4','2','1']
};

/**
 * 55問の解答配列を採点し、結果とSupabase保存用詳細配列を返す
 * @param {number|string} examRound - 実施回数（41〜54）
 * @param {Array<string|number>} studentAnswers - 55問分の解答配列
 * @returns {Object} 採点結果オブジェクト
 */
function scorePastExam(examRound, studentAnswers) {
  const roundNum = Number(examRound);
  const correctList = PAST_EXAM_ANSWERS[roundNum];
  if (!correctList) {
    throw new Error(`第${examRound}回の模範解答データが見つかりません。`);
  }

  const totalQuestions = 55;
  let totalScore = 0;
  const wrongQuestions = [];
  const questionDetails = [];

  const subjectStats = {};
  for (let s = 1; s <= 10; s++) {
    subjectStats[s] = { total: 0, correct: 0 };
  }

  for (let q = 0; q < totalQuestions; q++) {
    const qNum = q + 1;
    const stdAns = String(studentAnswers[q] || '').trim();
    const crtAns = String(correctList[q] || '').trim();
    const subjId = PAST_EXAM_SUBJECT_MAPPING[q] || 1;

    subjectStats[subjId].total++;

    let isCorrect = false;
    if (crtAns === '0' || crtAns === 'ALL') {
      isCorrect = true;
    } else if (crtAns.includes('/')) {
      const validOpts = crtAns.split('/').map(v => v.trim());
      if (validOpts.includes(stdAns)) {
        isCorrect = true;
      }
    } else if (stdAns !== '' && stdAns === crtAns) {
      isCorrect = true;
    }

    if (isCorrect) {
      totalScore++;
      subjectStats[subjId].correct++;
    } else {
      wrongQuestions.push(qNum);
    }

    questionDetails.push({
      question_num: qNum,
      subject_id: subjId,
      student_answer: stdAns,
      correct_answer: crtAns,
      is_correct: isCorrect
    });
  }

  const subjectAccuracies = {};
  for (let sub = 1; sub <= 10; sub++) {
    const subKey = 'sub_' + String(sub).padStart(2, '0');
    const st = subjectStats[sub];
    subjectAccuracies[subKey] = st.total > 0 ? Math.round((st.correct / st.total) * 1000) / 10 : 0;
  }

  const totalAccuracy = Math.round((totalScore / totalQuestions) * 1000) / 10;
  const isPassed = totalScore >= 33 && Object.values(subjectStats).every(st => st.correct > 0);

  return {
    exam_round: roundNum,
    total_score: totalScore,
    total_questions: totalQuestions,
    total_accuracy: totalAccuracy,
    is_passed: isPassed,
    subject_accuracies: subjectAccuracies,
    answers_list: studentAnswers.map(a => String(a || '')),
    correct_list: correctList,
    wrong_questions: wrongQuestions,
    question_details: questionDetails
  };
}

if (typeof window !== 'undefined') {
  window.PAST_EXAM_SUBJECTS = PAST_EXAM_SUBJECTS;
  window.PAST_EXAM_SUBJECT_MAPPING = PAST_EXAM_SUBJECT_MAPPING;
  window.PAST_EXAM_ANSWERS = PAST_EXAM_ANSWERS;
  window.scorePastExam = scorePastExam;
}
