import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { generateQuiz } from '../../../services/openrouter';

const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  emptyStar: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  flashcard: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
};

const subjectColor = {
  'Mathematics': '#5B9BD5',
  'English Language': '#70AD47',
  'Basic Science': '#F59E0B',
};

export default function Quiz() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [nextTopic, setNextTopic] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuiz = async () => {
    try {
      const { data: topicData } = await supabase
        .from('topics').select('*').eq('id', topicId).single();
      setTopic(topicData);

      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', topicId)
        .limit(3);

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData);
      } else {
        setGenerating(true);
        try {
          const { data: lessonData } = await supabase
            .from('lessons').select('level_1').eq('topic_id', topicId).single();

          const aiQuestions = await generateQuiz(
            topicData?.title,
            lessonData?.level_1
          );

          if (aiQuestions && aiQuestions.length > 0) {
            const formatted = aiQuestions.map(q => ({
              question: q.question,
              option_a: q.options[0],
              option_b: q.options[1],
              option_c: q.options[2],
              option_d: q.options[3],
              answer: ['A','B','C','D'][q.answer] || 'A',
              explanation: q.explanation,
            }));
            setQuestions(formatted);
          }
        } catch (err) {
          console.error('AI quiz generation failed:', err);
        } finally {
          setGenerating(false);
        }
      }

      if (topicData) {
        const { data: nextTopics } = await supabase
          .from('topics')
          .select('*')
          .eq('subject', topicData.subject)
          .gt('order_index', topicData.order_index)
          .order('order_index', { ascending: true })
          .limit(1);
        if (nextTopics && nextTopics.length > 0) {
          setNextTopic(nextTopics[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (scorePercent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('student_progress').upsert({
          student_id: user.id,
          topic_id: topicId,
          level_reached: 4,
          completed: true,
          last_studied_at: new Date().toISOString(),
          score: scorePercent,
        }, { onConflict: 'student_id,topic_id' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = (index) => {
    if (showAnswer) return;
    setSelectedAnswer(index);
    setShowAnswer(true);
  };

  const handleNext = async () => {
    const q = questions[currentQ];
    const correctIndex = ['A','B','C','D'].indexOf(q.answer);
    const isCorrect = selectedAnswer === correctIndex;
    const newAnswers = [...answers, { correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setSaving(true);
      const totalCorrect = newAnswers.filter(a => a.correct).length;
      const scorePercent = Math.round((totalCorrect / questions.length) * 100);
      await saveProgress(scorePercent);
      setSaving(false);
      setFinished(true);
    }
  };

  const color = topic ? (subjectColor[topic.subject] || '#5B9BD5') : '#5B9BD5';
  const q = questions[currentQ];
  const correctIndex = q ? ['A','B','C','D'].indexOf(q.answer) : -1;
  const finalScore = answers.filter(a => a.correct).length;
  const stars = finalScore === questions.length ? 3
    : finalScore >= Math.ceil(questions.length / 2) ? 2 : 1;

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E4E7EC]"
            style={{ borderTopColor: color, animation: 'spin 1s linear infinite' }}/>
          <p className="text-[14px] text-[#475467]">
            {generating ? 'Preparing your quiz...' : 'Loading quiz...'}
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    saveProgress(100);
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div className="text-center max-w-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4 text-[#70AD47]">
            {Icons.check}
          </div>
          <h2 className="text-[22px] font-extrabold text-[#0F172A] mb-2">Lesson Complete!</h2>
          <p className="text-[14px] text-[#475467] mb-6 leading-[1.7]">
            You finished this lesson. Your progress has been saved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate(`/flashcards/${topicId}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#E4E7EC] hover:border-[#5B9BD5] text-[#475467] text-[14px] font-semibold rounded-xl transition-colors">
              {Icons.flashcard} Study Flashcards
            </button>
            {nextTopic ? (
              <button onClick={() => navigate(`/lesson/${nextTopic.id}`)}
                className="flex items-center justify-center gap-2 px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-colors"
                style={{ background: color }}>
                Next Topic {Icons.arrow}
              </button>
            ) : (
              <button onClick={() => navigate('/dashboard/student')}
                className="flex items-center justify-center gap-2 px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-colors"
                style={{ background: color }}>
                Dashboard {Icons.arrow}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
          .f1 { animation: fadeUp 0.5s ease forwards; }
          .f2 { animation: fadeUp 0.5s 0.1s ease both; }
          .f3 { animation: fadeUp 0.5s 0.2s ease both; }
          .f4 { animation: fadeUp 0.5s 0.3s ease both; }
          .pop { animation: pop 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        `}</style>
        <div className="text-center max-w-[480px] w-full">

          <div className="pop w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5 border-4"
            style={{ borderColor: color, background: `${color}15` }}>
            <div>
              <p className="text-[32px] font-extrabold leading-none" style={{ color }}>{finalScore}/{questions.length}</p>
              <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">correct</p>
            </div>
          </div>

          <div className="f1 flex items-center justify-center gap-2 mb-4">
            {[1,2,3].map(i => (
              <span key={i} style={{ color: i <= stars ? '#F59E0B' : '#E4E7EC' }}>
                {i <= stars ? Icons.star : Icons.emptyStar}
              </span>
            ))}
          </div>

          <h1 className="f1 text-[28px] font-extrabold text-[#0F172A] mb-2">
            {finalScore === questions.length ? 'Perfect score!'
              : finalScore >= Math.ceil(questions.length / 2) ? 'Well done!'
              : 'Good effort!'}
          </h1>
          <p className="f2 text-[14px] text-[#475467] leading-[1.7] mb-2">
            You got <span className="font-bold" style={{ color }}>{finalScore} out of {questions.length}</span> correct.
          </p>
          <p className="f2 text-[13px] text-[#94A3B8] mb-6 leading-[1.6]">
            {finalScore === questions.length
              ? 'You understood this topic completely. Keep going — the next one is ready.'
              : finalScore >= Math.ceil(questions.length / 2)
              ? 'You are making great progress. Review the lesson anytime.'
              : 'No worries at all — go back to the lesson and try again. There is no rush.'}
          </p>

          <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-5 mb-5 flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: color }}>
              {Icons.check}
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#0F172A]">Topic Complete</p>
              <p className="text-[12px] text-[#94A3B8]">{topic?.title} — {topic?.subject}</p>
            </div>
          </div>

          {nextTopic && (
            <div className="f3 bg-[#0F172A] rounded-2xl p-5 mb-5 text-left">
              <p className="text-[10px] font-bold text-[#5B9BD5] uppercase tracking-widest mb-2">Up next</p>
              <p className="text-[16px] font-bold text-white mb-1">{nextTopic.title}</p>
              <p className="text-[12px] text-[#64748B] mb-4">{nextTopic.subject}</p>
              <button onClick={() => navigate(`/lesson/${nextTopic.id}`)}
                className="flex items-center gap-2 px-6 py-3 bg-[#5B9BD5] hover:bg-[#4A7DAF] text-white text-[14px] font-bold rounded-xl transition-colors">
                Start Next Topic {Icons.arrow}
              </button>
            </div>
          )}

          <div className="f4 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate(`/lesson/${topicId}`)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#E4E7EC] hover:border-[#5B9BD5] text-[#475467] text-[14px] font-semibold rounded-xl transition-colors">
              {Icons.refresh} Review Lesson
            </button>
            <button onClick={() => navigate(`/flashcards/${topicId}`)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#E4E7EC] hover:border-[#5B9BD5] text-[#475467] text-[14px] font-semibold rounded-xl transition-colors">
              {Icons.flashcard} Flashcards
            </button>
            <button onClick={() => navigate('/dashboard/student')}
              className="flex items-center justify-center gap-2 px-5 py-3 text-white text-[14px] font-bold rounded-xl transition-colors"
              style={{ background: color }}>
              Dashboard {Icons.arrow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-20">
        <div className="max-w-[680px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <button onClick={() => navigate(`/lesson/${topicId}`)}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors">
            {Icons.back} Back to Lesson
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#475467]">
              Question {currentQ + 1} of {questions.length}
            </span>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i < currentQ
                      ? (answers[i]?.correct ? '#70AD47' : '#BA1A1A')
                      : i === currentQ ? color : '#E4E7EC'
                  }}/>
              ))}
            </div>
          </div>
        </div>
        <div className="h-1 bg-[#F1F5F9]">
          <div className="h-1 transition-all duration-500"
            style={{ width: `${(currentQ / questions.length) * 100}%`, background: color }}/>
        </div>
      </header>

      <div className="flex-1 max-w-[680px] mx-auto w-full px-5 md:px-8 py-8 flex flex-col gap-6">
        <div className="fade">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color }}>
            {topic?.subject} · Quick Quiz
          </p>
          <h1 className="text-[20px] md:text-[22px] font-extrabold text-[#0F172A] leading-[1.4]">
            {q?.question}
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          {q && [q.option_a, q.option_b, q.option_c, q.option_d].map((option, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === correctIndex;
            let borderColor = '#E4E7EC';
            let bgColor = 'white';
            let textColor = '#1E293B';
            if (showAnswer && isCorrect) { borderColor = '#70AD47'; bgColor = '#F0FDF4'; textColor = '#336b07'; }
            else if (showAnswer && isSelected && !isCorrect) { borderColor = '#BA1A1A'; bgColor = '#FFF1F1'; textColor = '#BA1A1A'; }
            else if (isSelected && !showAnswer) { borderColor = color; bgColor = '#EFF6FF'; }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={showAnswer}
                className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.99]"
                style={{ borderColor, backgroundColor: bgColor }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 border-2"
                  style={{ borderColor, color: textColor }}>
                  {['A','B','C','D'][i]}
                </div>
                <span className="text-[15px] font-medium leading-[1.5]" style={{ color: textColor }}>
                  {option}
                </span>
                {showAnswer && isCorrect && (
                  <span className="ml-auto text-[#70AD47] flex-shrink-0">{Icons.check}</span>
                )}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className={`fade p-4 rounded-xl border ${
            selectedAnswer === correctIndex ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#FFF1F1] border-[#FFCDD2]'
          }`}>
            <p className="text-[14px] font-bold mb-1" style={{
              color: selectedAnswer === correctIndex ? '#336b07' : '#BA1A1A'
            }}>
              {selectedAnswer === correctIndex ? 'That is correct!' : 'Not quite — but that is okay.'}
            </p>
            <p className="text-[13px] text-[#1E293B] leading-[1.6]">
              The correct answer is <span className="font-bold">
                {['A','B','C','D'][correctIndex]}: {[q.option_a, q.option_b, q.option_c, q.option_d][correctIndex]}
              </span>
            </p>
          </div>
        )}

        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0"/>
          <p className="text-[13px] text-[#1E293B]">
            Take your time. There is no penalty for wrong answers.
          </p>
        </div>
      </div>

      {showAnswer && (
        <div className="bg-white border-t border-[#E4E7EC] sticky bottom-0">
          <div className="max-w-[680px] mx-auto px-5 md:px-8 py-4 flex justify-end">
            <button onClick={handleNext} disabled={saving}
              className="flex items-center gap-2 px-8 py-3 text-white text-[14px] font-bold rounded-xl transition-colors"
              style={{ background: color }}>
              {saving ? 'Saving...' : currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
              {Icons.arrow}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}