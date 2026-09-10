import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

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
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
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
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuiz = async () => {
    const { data: topicData } = await supabase
      .from('topics').select('*').eq('id', topicId).single();

    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic_id', topicId)
      .limit(3);

    setTopic(topicData);
    setQuestions(questionsData || []);
    setLoading(false);
  };

  const handleAnswer = async (index) => {
    if (showAnswer) return;
    setSelectedAnswer(index);
    setShowAnswer(true);

    const q = questions[currentQ];
    const correctIndex = ['A','B','C','D'].indexOf(q.answer);
    if (index === correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      // Quiz complete — mark topic as done
      setFinished(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('student_progress').upsert({
            student_id: user.id,
            topic_id: topicId,
            level_reached: 4,
            completed: true,
            last_studied_at: new Date().toISOString(),
            score: Math.round(((score + (selectedAnswer === ['A','B','C','D'].indexOf(questions[currentQ].answer) ? 1 : 0)) / questions.length) * 100),
          }, { onConflict: 'student_id,topic_id' });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const color = topic ? (subjectColor[topic.subject] || '#5B9BD5') : '#5B9BD5';
  const q = questions[currentQ];
  const correctIndex = q ? ['A','B','C','D'].indexOf(q.answer) : -1;
  const finalScore = finished ? score : 0;
  const percentage = questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <p className="text-[14px] text-[#475467]">Loading quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div className="text-center max-w-[400px]">
          <h2 className="text-[22px] font-extrabold text-[#0F172A] mb-3">No questions yet</h2>
          <p className="text-[14px] text-[#475467] mb-6">This topic doesn't have quiz questions yet.</p>
          <button
            onClick={() => navigate('/dashboard/student')}
            className="px-8 py-3 bg-[#136299] text-white font-bold rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // FINISHED SCREEN
  if (finished) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .fade { animation: fadeUp 0.5s ease forwards; }
          .fade2 { animation: fadeUp 0.5s 0.15s ease both; }
          .fade3 { animation: fadeUp 0.5s 0.3s ease both; }
        `}</style>
        <div className="text-center max-w-[480px] w-full">

          {/* Score circle */}
          <div className="fade w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 border-4"
            style={{ borderColor: color, background: `${color}15` }}>
            <div>
              <p className="text-[32px] font-extrabold" style={{ color }}>{score}/{questions.length}</p>
            </div>
          </div>

          {/* Stars */}
          <div className="fade flex items-center justify-center gap-2 mb-4">
            {[1,2,3].map(i => (
              <span key={i} className={`${i <= Math.ceil(score / questions.length * 3) ? '' : 'opacity-20'}`}
                style={{ color: '#F59E0B' }}>
                {Icons.star}
              </span>
            ))}
          </div>

          <h1 className="fade text-[28px] font-extrabold text-[#0F172A] mb-2">
            {score === questions.length ? 'Perfect score!' : score >= questions.length / 2 ? 'Well done!' : 'Good effort!'}
          </h1>
          <p className="fade2 text-[15px] text-[#475467] leading-[1.7] mb-2">
            You got <span className="font-bold" style={{ color }}>{score} out of {questions.length}</span> correct.
          </p>
          <p className="fade2 text-[13px] text-[#94A3B8] mb-8">
            {score === questions.length
              ? 'You understood this topic completely. Amazing work.'
              : score >= questions.length / 2
              ? 'You are getting there. Review the lesson and try again anytime.'
              : 'No worries — go back to the lesson and try again. There is no rush.'}
          </p>

          {/* Badge */}
          <div className="fade2 bg-white border border-[#E4E7EC] rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: color }}>
              {Icons.check}
            </div>
            <div className="text-left">
              <p className="text-[14px] font-bold text-[#0F172A]">Topic Complete</p>
              <p className="text-[12px] text-[#94A3B8]">{topic?.title} — {topic?.subject}</p>
            </div>
          </div>

          <div className="fade3 flex flex-col sm:flex-row gap-3 justify-center">
            <button
  onClick={() => navigate(`/lesson/${topicId}`)}
  className="px-6 py-3 bg-white border border-[#E4E7EC] hover:border-[#5B9BD5] text-[#475467] text-[14px] font-semibold rounded-xl transition-colors"
>
  Review Lesson
</button>
<button
  onClick={() => navigate(`/flashcards/${topicId}`)}
  className="px-6 py-3 bg-white border border-[#E4E7EC] hover:border-[#5B9BD5] text-[#475467] text-[14px] font-semibold rounded-xl transition-colors"
>
  Study Flashcards
</button>
            <button
              onClick={() => navigate('/dashboard/student')}
              className="px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-colors"
              style={{ background: color }}
            >
              Back to Dashboard {Icons.arrow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* TOP BAR */}
      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-20">
        <div className="max-w-[680px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate(`/lesson/${topicId}`)}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B]"
          >
            {Icons.back} Back to Lesson
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#475467]">
              Question {currentQ + 1} of {questions.length}
            </span>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i < currentQ ? '#70AD47' : i === currentQ ? color : '#E4E7EC' }}/>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 max-w-[680px] mx-auto w-full px-5 md:px-8 py-8 flex flex-col gap-6">

        <div className="fade">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color }}>
            {topic?.subject} · Quick Quiz
          </p>
          <h1 className="text-[20px] md:text-[22px] font-extrabold text-[#0F172A] leading-[1.4]">
            {q?.question}
          </h1>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {q && [q.option_a, q.option_b, q.option_c, q.option_d].map((option, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === correctIndex;
            let borderColor = '#E4E7EC';
            let bgColor = 'white';
            let textColor = '#1E293B';

            if (showAnswer && isCorrect) {
              borderColor = '#70AD47'; bgColor = '#F0FDF4'; textColor = '#336b07';
            } else if (showAnswer && isSelected && !isCorrect) {
              borderColor = '#BA1A1A'; bgColor = '#FFF1F1'; textColor = '#BA1A1A';
            } else if (isSelected && !showAnswer) {
              borderColor = color; bgColor = '#EFF6FF';
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showAnswer}
                className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                style={{ borderColor, backgroundColor: bgColor }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 border-2"
                  style={{ borderColor, color: textColor }}>
                  {['A','B','C','D'][i]}
                </div>
                <span className="text-[15px] font-medium leading-[1.5]" style={{ color: textColor }}>
                  {option}
                </span>
                {showAnswer && isCorrect && (
                  <span className="ml-auto text-[#70AD47]">{Icons.check}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showAnswer && (
          <div className={`p-4 rounded-xl border ${
            selectedAnswer === correctIndex
              ? 'bg-[#F0FDF4] border-[#BBF7D0]'
              : 'bg-[#FFF1F1] border-[#FFCDD2]'
          }`}>
            <p className="text-[14px] font-bold mb-1" style={{
              color: selectedAnswer === correctIndex ? '#336b07' : '#BA1A1A'
            }}>
              {selectedAnswer === correctIndex ? 'That is correct!' : 'Not quite — but that is okay.'}
            </p>
            <p className="text-[13px] text-[#1E293B] leading-[1.6]">
              The correct answer is <span className="font-bold">{['A','B','C','D'][correctIndex]}: {[q.option_a, q.option_b, q.option_c, q.option_d][correctIndex]}</span>
            </p>
          </div>
        )}

        {/* Encouragement */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0"/>
          <p className="text-[13px] text-[#1E293B]">
            Take your time. There is no rush and no penalty for wrong answers.
          </p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      {showAnswer && (
        <div className="bg-white border-t border-[#E4E7EC] sticky bottom-0">
          <div className="max-w-[680px] mx-auto px-5 md:px-8 py-4 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 text-white text-[14px] font-bold rounded-xl transition-colors"
              style={{ background: color }}
            >
              {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
              {Icons.arrow}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}