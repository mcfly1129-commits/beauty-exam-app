// 共通クイズエンジン (2択 / 4択 対応)
class QuizEngine {
  constructor(mode, subjectId, questions) {
    this.mode = mode;                 // '2choice' または '4choice'
    this.subjectId = subjectId;       // 科目ID (例: 'public_hygiene')
    this.questions = questions;       // 出題問題リスト
    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = [];
  }

  // 現在の問題を取得
  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  // 解答の判定
  submitAnswer(selectedOption) {
    const q = this.getCurrentQuestion();
    const isCorrect = (selectedOption === q.answer);

    if (isCorrect) {
      this.score++;
    }

    this.userAnswers.push({
      question_id: q.id || (this.currentIndex + 1),
      selected: selectedOption,
      correct: q.answer,
      is_correct: isCorrect
    });

    return {
      isCorrect: isCorrect,
      correctAnswer: q.answer,
      explanation: q.explanation || '解説はありません。'
    };
  }

  // 次の問題へ進む
  nextQuestion() {
    this.currentIndex++;
    return this.currentIndex < this.questions.length;
  }

  // テスト終了処理と成績保存
  async finishQuiz() {
    const total = this.questions.length;
    const logData = {
      mode: this.mode,
      subject_id: this.subjectId,
      score: Math.round((this.score / total) * 100),
      total_questions: total,
      correct_count: this.score,
      details: this.userAnswers
    };

    // オフライン対応送信モジュール呼び出し
    if (typeof saveExamLog === 'function') {
      await saveExamLog(logData);
    }

    return logData;
  }
}
