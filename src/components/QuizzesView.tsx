import React, { useState, useEffect } from 'react';
import { QuizItem, QuizQuestion } from '../types';
import { 
  CheckSquare, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  HelpCircle,
  ChevronLeft
} from 'lucide-react';

interface QuizzesViewProps {
  quizzes: QuizItem[];
  onNavigateToPart?: (partId: string) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({ quizzes: propQuizzes, onNavigateToPart }) => {
  const [quizzesList, setQuizzesList] = useState<QuizItem[]>(propQuizzes);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Per-question state in active quiz
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [showEasierFollowUp, setShowEasierFollowUp] = useState(false);
  const [selectedFollowUpIdx, setSelectedFollowUpIdx] = useState<number | null>(null);
  const [hasSubmittedFollowUp, setHasSubmittedFollowUp] = useState(false);

  // Overall test record
  const [quizScore, setQuizScore] = useState<{ correctCount: number; answeredCount: number }>({
    correctCount: 0,
    answeredCount: 0,
  });
  const [isTestFinished, setIsTestFinished] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/data/quizzes.json')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.quizzes?.length) {
          // Merge with any prop quizzes that might not be in JSON
          setQuizzesList(data.quizzes);
        }
      })
      .catch(err => console.warn('Using prop quizzes fallback:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: 'همه آزمون‌ها' },
    { id: 'assembly', label: 'مراحل مونتاژ' },
    { id: 'troubleshooting', label: 'عیب‌یابی' },
    { id: 'safety', label: 'ایمنی کارگاه' },
    { id: 'parts', label: 'قطعات و ساختار' },
  ];

  const filteredQuizzes = quizzesList.filter(q => 
    selectedCategory === 'all' || q.category === selectedCategory
  );

  const handleStartQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIdx(null);
    setHasSubmittedAnswer(false);
    setShowEasierFollowUp(false);
    setSelectedFollowUpIdx(null);
    setHasSubmittedFollowUp(false);
    setQuizScore({ correctCount: 0, answeredCount: 0 });
    setIsTestFinished(false);
  };

  const currentQ: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];

  const handleChooseOption = (optIdx: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedAnswerIdx(optIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIdx === null || !currentQ) return;
    setHasSubmittedAnswer(true);

    const isCorrect = currentQ.answers[selectedAnswerIdx]?.correct;
    if (isCorrect) {
      setQuizScore(prev => ({
        correctCount: prev.correctCount + 1,
        answeredCount: prev.answeredCount + 1,
      }));
    } else {
      setQuizScore(prev => ({
        ...prev,
        answeredCount: prev.answeredCount + 1,
      }));
    }
  };

  const handleChooseFollowUpOption = (optIdx: number) => {
    if (hasSubmittedFollowUp) return;
    setSelectedFollowUpIdx(optIdx);
    setHasSubmittedFollowUp(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIdx(null);
      setHasSubmittedAnswer(false);
      setShowEasierFollowUp(false);
      setSelectedFollowUpIdx(null);
      setHasSubmittedFollowUp(false);
    } else {
      setIsTestFinished(true);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>سنجش تطبیقی مهارت‌های فنی (Adaptive Assessment)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          آزمون‌های استاندارد کارگاه سخت‌افزار
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          سامانه آزمون هوشمند با بازخورد آنی، طرح پرسش‌های جبرانی ساده‌تر و ارجاع مستقیم به صفحه قطعات
        </p>
      </div>

      {!activeQuiz ? (
        <>
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-full px-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[40px] ${
                  selectedCategory === cat.id
                    ? 'bg-[#1d314b] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quizzes List Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => handleStartQuiz(quiz)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                      {quiz.questions?.length || quiz.questionCount} پرسش
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      quiz.difficulty === 'آسان' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      quiz.difficulty === 'متوسط' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      سطح: {quiz.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-blue-700 transition mb-2">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {quiz.description || 'پرسش‌های مفهومی و فنی به همراه تحلیل تطبیقی و ارزیابی گام‌به‌گام.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-5 flex items-center justify-between">
                  <span className="text-xs text-blue-700 font-semibold">شروع آزمون تطبیقی</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-[#1d314b] group-hover:text-white transition">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Active Adaptive Quiz Taking Interface */
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
          {!isTestFinished && currentQ ? (
            <>
              {/* Quiz Top Navigation Bar */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600">
                    {activeQuiz.title}
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mt-0.5">
                    پرسش {currentQuestionIndex + 1} از {activeQuiz.questions.length}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition"
                >
                  انصراف
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-gray-400 font-bold">
                  QUESTION #{currentQuestionIndex + 1}
                </span>
                <p className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-2.5">
                {currentQ.answers.map((ans, optIdx) => {
                  const isSelected = selectedAnswerIdx === optIdx;
                  let borderClass = 'border-gray-200 hover:border-gray-300 bg-white text-gray-700';

                  if (hasSubmittedAnswer) {
                    if (ans.correct) {
                      borderClass = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-400';
                    } else if (isSelected && !ans.correct) {
                      borderClass = 'border-rose-500 bg-rose-50/70 text-rose-950 font-bold';
                    } else {
                      borderClass = 'border-gray-200 opacity-60 bg-white text-gray-500';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-sm';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasSubmittedAnswer}
                      onClick={() => handleChooseOption(optIdx)}
                      className={`w-full text-right p-3.5 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 transition min-h-[44px] ${borderClass}`}
                    >
                      <span className="leading-relaxed">{ans.text}</span>
                      <span className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Immediate Adaptive Feedback Section */}
              {hasSubmittedAnswer && selectedAnswerIdx !== null && (
                <div className="space-y-4 pt-2">
                  {currentQ.answers[selectedAnswerIdx]?.correct ? (
                    /* Correct Answer Feedback */
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>پاسخ صحیح است! احسنت.</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed pr-5">
                        {currentQ.answers[selectedAnswerIdx]?.explanation}
                      </p>
                    </div>
                  ) : (
                    /* Wrong Answer: Adaptive Support */
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>پاسخ نادرست است.</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed pr-5">
                          {currentQ.answers[selectedAnswerIdx]?.explanation}
                        </p>
                      </div>

                      {/* Adaptive Actions: Easier follow-up question OR link to 3D Part page */}
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>راهنمای آموزشی تطبیقی:</span>
                          </span>

                          {currentQ.partId && onNavigateToPart && (
                            <button
                              onClick={() => onNavigateToPart(currentQ.partId!)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 text-[11px] font-bold hover:bg-blue-100/50 transition shadow-2xs"
                            >
                              <span>بررسی قطعه در مدل سه‌بعدی</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {currentQ.easierFollowUp && !showEasierFollowUp && (
                          <button
                            onClick={() => setShowEasierFollowUp(true)}
                            className="w-full py-2 px-3 rounded-lg bg-white border border-blue-300 text-xs font-bold text-blue-800 hover:bg-blue-100/40 transition flex items-center justify-center gap-1.5"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                            <span>پاسخ به پرسش ساده‌تر برای تثبیت مفهوم (آزمون تطبیقی)</span>
                          </button>
                        )}

                        {/* Render Easier Follow-Up Question */}
                        {showEasierFollowUp && currentQ.easierFollowUp && (
                          <div className="space-y-2.5 pt-2 border-t border-blue-200/80">
                            <div className="text-xs font-bold text-gray-900 leading-relaxed">
                              🎯 {currentQ.easierFollowUp.question}
                            </div>
                            <div className="space-y-1.5">
                              {currentQ.easierFollowUp.answers.map((fAns, fIdx) => {
                                const isFSelected = selectedFollowUpIdx === fIdx;
                                let fClass = 'bg-white border-gray-200 text-gray-700 hover:border-gray-300';
                                if (hasSubmittedFollowUp) {
                                  fClass = fAns.correct 
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' 
                                    : isFSelected ? 'bg-rose-50 border-rose-300 text-rose-950' : 'opacity-60 bg-white border-gray-200 text-gray-400';
                                }
                                return (
                                  <button
                                    key={fIdx}
                                    disabled={hasSubmittedFollowUp}
                                    onClick={() => handleChooseFollowUpOption(fIdx)}
                                    className={`w-full text-right p-2.5 rounded-lg border text-xs transition ${fClass}`}
                                  >
                                    {fAns.text}
                                  </button>
                                );
                              })}
                            </div>
                            {hasSubmittedFollowUp && selectedFollowUpIdx !== null && (
                              <p className="text-[11px] text-gray-600 pt-1">
                                💡 {currentQ.easierFollowUp.answers[selectedFollowUpIdx]?.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Submit / Next Question */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  پاسخ‌های صحیح: {quizScore.correctCount} از {quizScore.answeredCount}
                </span>

                {!hasSubmittedAnswer ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswerIdx === null}
                    className="px-6 py-2.5 rounded-xl bg-[#1d314b] text-white text-xs font-bold hover:bg-[#263f60] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition shadow-sm min-h-[44px]"
                  >
                    ثبت و ارزیابی پاسخ
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 min-h-[44px]"
                  >
                    <span>{currentQuestionIndex < activeQuiz.questions.length - 1 ? 'پرسش بعدی' : 'مشاهده کارنامه آزمون'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Results & Score Card */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900">
                  کارنامه آزمون: {activeQuiz?.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  امتیاز کسب شده: {Math.round((quizScore.correctCount / (activeQuiz?.questions.length || 1)) * 100)}٪ 
                  ({quizScore.correctCount} پاسخ درست از {activeQuiz?.questions.length} پرسش)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                {quizScore.correctCount === activeQuiz?.questions.length ? (
                  <span className="text-emerald-700 font-bold">
                    تبریک! شما به تمامی پرسش‌های این بخش پاسخ صحیح داده‌اید و تسلط کامل بر مفاهیم کارگاهی دارید.
                  </span>
                ) : (
                  <span>
                    برای تقویت نقاط ضعف خود می‌توانید مراحل مونتاژ و راهنمای عیب‌یابی را مجدداً در شبیه‌ساز سه‌بعدی مرور کنید.
                  </span>
                )}
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleStartQuiz(activeQuiz!)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1d314b] text-white text-xs font-bold hover:bg-[#263f60] transition shadow-sm min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>آزمون دوباره</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition min-h-[44px]"
                >
                  بازگشت به فهرست آزمون‌ها
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
