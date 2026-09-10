import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

const levelLabels = {
  1: { label: 'Simple', desc: 'Clear, plain explanation' },
  2: { label: 'Analogy', desc: 'Explained using a comparison' },
  3: { label: 'Visual', desc: 'Shown as a diagram or steps' },
  4: { label: 'Interactive', desc: 'Try it yourself' },
};

export default function Lesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    fetchLesson();
    return () => window.speechSynthesis?.cancel();
  }, [topicId]);

  const fetchLesson = async () => {
    const { data: topicData } = await supabase
      .from('topics').select('*').eq('id', topicId).single();

    const { data: lessonData } = await supabase
      .from('lessons').select('*').eq('topic_id', topicId).single();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: progressData } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', user.id)
      .eq('topic_id', topicId)
      .single();

    if (progressData) {
      setCurrentLevel(progressData.level_reached || 1);
    }

    setTopic(topicData);
    setLesson(lessonData);
    setLoading(false);
  };

  const getCurrentText = () => {
    if (!lesson) return '';
    const map = { 1: lesson.level_1, 2: lesson.level_2, 3: lesson.level_3, 4: lesson.level_4 };
    return map[currentLevel] || '';
  };

  const handleVoice = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(getCurrentText());
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleExplainDifferently = async () => {
    if (currentLevel < 4) {
      const newLevel = currentLevel + 1;
      setCurrentLevel(newLevel);
      setSpeaking(false);
      window.speechSynthesis?.cancel();

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('student_progress').upsert({
        student_id: user.id,
        topic_id: topicId,
        level_reached: newLevel,
        completed: false,
      }, { onConflict: 'student_id,topic_id' });
    }
  };

  const handleUnderstood = async () => {
    setUnderstood(true);
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('student_progress').upsert({
      student_id: user.id,
      topic_id: topicId,
      level_reached: currentLevel,
      completed: false,
    }, { onConflict: 'student_id,topic_id' });

    setTimeout(() => {
      navigate(`/lesson/${topicId}/quiz`);
    }, 800);
  };

  const subjectColor = {
    'Mathematics': '#5B9BD5',
    'English Language': '#70AD47',
    'Basic Science': '#F59E0B',
  };

  const color = topic ? (subjectColor[topic.subject] || '#5B9BD5') : '#5B9BD5';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <p className="text-[14px] text-[#475467]">Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade { animation: fadeUp 0.4s ease forwards; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pulse { animation: pulse 1.5s ease infinite; }
      `}</style>

      {/* TOP BAR */}
      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-20">
        <div className="max-w-[760px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <button
            onClick={() => { window.speechSynthesis?.cancel(); navigate(-1); }}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors"
          >
            {Icons.back} Back
          </button>

          {/* Level indicators */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(l => (
              <div
                key={l}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: l <= currentLevel ? color : '#E4E7EC',
                  transform: l === currentLevel ? 'scale(1.4)' : 'scale(1)'
                }}
              />
            ))}
          </div>

          {/* Voice button */}
          <button
            onClick={handleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
              speaking
                ? 'text-white pulse'
                : 'bg-[#F8FAFC] border border-[#E4E7EC] text-[#475467] hover:border-[#5B9BD5]'
            }`}
            style={speaking ? { background: color } : {}}
          >
            {speaking ? Icons.stop : Icons.voice}
            {speaking ? 'Stop' : 'Listen'}
          </button>
        </div>
      </header>

      {/* LESSON CONTENT */}
      <div className="flex-1 max-w-[760px] mx-auto w-full px-5 md:px-8 py-8 flex flex-col gap-6">

        {/* Topic + level info */}
        <div className="fade">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
            {topic?.subject} · {levelLabels[currentLevel].label}
          </p>
          <h1 className="text-[22px] md:text-[26px] font-extrabold text-[#0F172A]">
            {topic?.title}
          </h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">{levelLabels[currentLevel].desc}</p>
        </div>

        {/* Level tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4].map(l => (
            <button
              key={l}
              onClick={() => l <= currentLevel && setCurrentLevel(l)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                l === currentLevel
                  ? 'text-white border-transparent'
                  : l < currentLevel
                  ? 'bg-white text-[#475467] border-[#E4E7EC] hover:border-opacity-50 cursor-pointer'
                  : 'bg-[#F8FAFC] text-[#94A3B8] border-[#F1F5F9] cursor-not-allowed opacity-50'
              }`}
              style={l === currentLevel ? { background: color } : {}}
            >
              {levelLabels[l].label}
            </button>
          ))}
        </div>

        {/* Explanation text */}
        <div key={currentLevel} className="fade bg-white border border-[#E4E7EC] rounded-2xl p-6 md:p-8">
          <p className="text-[16px] md:text-[17px] text-[#1E293B] leading-[1.9] whitespace-pre-line">
            {getCurrentText()}
          </p>
        </div>

        {/* Encouragement */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0"/>
          <p className="text-[13px] text-[#1E293B] leading-[1.6]">
            {currentLevel === 1 && "Take your time reading this. There is no rush."}
            {currentLevel === 2 && "This explanation uses a comparison to help it make sense."}
            {currentLevel === 3 && "Sometimes seeing it written out as steps makes it clearer."}
            {currentLevel === 4 && "Have a go at the question. There is no wrong answer for trying."}
          </p>
        </div>

      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white border-t border-[#E4E7EC] sticky bottom-0">
        <div className="max-w-[760px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-3">

          {/* Explain differently */}
          <button
            onClick={handleExplainDifferently}
            disabled={currentLevel >= 4}
            className="flex items-center gap-2 px-5 py-3 bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#5B9BD5] disabled:opacity-40 disabled:cursor-not-allowed text-[#475467] text-[14px] font-semibold rounded-xl transition-all"
          >
            {Icons.refresh}
            Explain differently
          </button>

          {/* I understand */}
          <button
            onClick={handleUnderstood}
            disabled={understood}
            className="flex items-center gap-2 px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-all"
            style={{ background: understood ? '#70AD47' : color }}
          >
            {understood ? Icons.check : Icons.arrow}
            {understood ? 'Moving to quiz...' : 'I understand — next'}
          </button>

        </div>
      </div>
    </div>
  );
}