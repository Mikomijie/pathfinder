import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const subjectConfig = {
  'Mathematics': { color: '#5B9BD5', bg: '#EFF6FF', light: '#F0F7FF' },
  'English Language': { color: '#70AD47', bg: '#F0FDF4', light: '#F0FFF4' },
  'Basic Science': { color: '#F59E0B', bg: '#FFFBEB', light: '#FFFDF0' },
};

const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="5" x2="8" y2="8"/>
      <line x1="16" y1="16" x2="19" y2="19"/>
    </svg>
  ),
  english: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  science: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5m5-5h6m0 0l5 5M15 14V3"/>
    </svg>
  ),
};

const subjectIcon = (subject) => {
  if (subject === 'Mathematics') return Icons.math;
  if (subject === 'English Language') return Icons.english;
  return Icons.science;
};

export default function TopicsList() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const decodedSubject = decodeURIComponent(subject);
  const config = subjectConfig[decodedSubject] || { color: '#5B9BD5', bg: '#EFF6FF', light: '#F0F7FF' };

  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [decodedSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTopics = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: topicsData } = await supabase
      .from('topics')
      .select('*')
      .eq('subject', decodedSubject)
      .order('order_index', { ascending: true });

    const { data: progressData } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', user.id);

    const progressMap = {};
    progressData?.forEach(p => {
      progressMap[p.topic_id] = p;
    });

    setTopics(topicsData || []);
    setProgress(progressMap);
    setLoading(false);
  };

  const getTopicStatus = (topic, index) => {
    const p = progress[topic.id];
    if (p?.completed) return 'completed';
    if (p?.level_reached > 0) return 'inprogress';
    if (index === 0) return 'available';
    const prevTopic = topics[index - 1];
    if (prevTopic && progress[prevTopic.id]?.completed) return 'available';
    return 'upcoming';
  };

  const completedCount = topics.filter(t => progress[t.id]?.completed).length;
  const currentTopicIndex = topics.findIndex((t, i) => getTopicStatus(t, i) === 'inprogress' || getTopicStatus(t, i) === 'available');
  const currentTopic = topics[currentTopicIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <p className="text-[14px] text-[#475467]">Loading topics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse { animation: pulse 2s ease infinite; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* TOP BAR */}
      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-20">
        <div className="max-w-[720px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/student')}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors"
          >
            {Icons.back} Back to Dashboard
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{ background: config.bg, color: config.color }}>
            {completedCount} of {topics.length} complete
          </div>
        </div>
      </header>

      <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8">

        {/* SUBJECT HEADER */}
        <div className="f1 flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: config.bg, color: config.color }}>
            {subjectIcon(decodedSubject)}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">Subject</p>
            <h1 className="text-[24px] md:text-[28px] font-extrabold text-[#0F172A]">{decodedSubject}</h1>
          </div>
        </div>

        {/* JOURNEY PATH */}
        <div className="f2 bg-white border border-[#E4E7EC] rounded-2xl p-5 mb-6">
          <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Your Journey</p>
          <div className="flex items-center gap-1 mb-3">
            {topics.map((t, i) => {
              const status = getTopicStatus(t, i);
              return (
                <React.Fragment key={t.id}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all ${
                    status === 'completed'
                      ? 'text-white'
                      : status === 'inprogress' || status === 'available'
                      ? 'text-white pulse'
                      : 'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}
                    style={
                      status === 'completed'
                        ? { background: config.color }
                        : status === 'inprogress' || status === 'available'
                        ? { background: config.color, opacity: 0.7 }
                        : {}
                    }
                  >
                    {status === 'completed' ? Icons.check : i + 1}
                  </div>
                  {i < topics.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full"
                      style={{ background: status === 'completed' ? config.color : '#E4E7EC' }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="bg-[#F1F5F9] rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full progress-bar"
              style={{
                width: `${topics.length > 0 ? (completedCount / topics.length) * 100 : 0}%`,
                background: config.color
              }}
            />
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-2">
            {completedCount === 0
              ? "You're just getting started. No pressure — take it one step at a time."
              : completedCount === topics.length
              ? "You've completed all topics in this subject. Amazing work!"
              : `${topics.length - completedCount} topics remaining. You're doing great.`}
          </p>
        </div>

        {/* CURRENT TOPIC — BIG CARD */}
        {currentTopic && (
          <div className="f2 rounded-2xl p-6 md:p-7 mb-6 border-2"
            style={{ background: config.light, borderColor: config.color }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full pulse" style={{ background: config.color }}/>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: config.color }}>
                {progress[currentTopic.id]?.level_reached > 0 ? 'Continue Here' : 'Start Here'}
              </span>
            </div>
            <h2 className="text-[20px] md:text-[22px] font-extrabold text-[#0F172A] mb-2">
              {currentTopic.title}
            </h2>
            <p className="text-[14px] text-[#475467] mb-5 leading-[1.6]">
              {currentTopic.description}
            </p>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5 text-[#475467]">
                <span style={{ color: config.color }}>{Icons.clock}</span>
                <span className="text-[12px] font-medium">About 10 minutes</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#475467]">
                <span style={{ color: config.color }}>{Icons.voice}</span>
                <span className="text-[12px] font-medium">Voice support available</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/lesson/${currentTopic.id}`)}
              className="flex items-center gap-2 px-8 py-3.5 text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm"
              style={{ background: config.color }}
            >
              {progress[currentTopic.id]?.level_reached > 0 ? 'Continue Lesson' : 'Start Lesson'}
              {Icons.arrow}
            </button>
          </div>
        )}

        {/* ALL TOPICS LIST */}
        <div className="f3">
          <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">All Topics</p>
          <div className="flex flex-col gap-3">
            {topics.map((topic, index) => {
              const status = getTopicStatus(topic, index);
              const isCurrent = topic.id === currentTopic?.id;

              return (
                <div
                  key={topic.id}
                  onClick={() => status !== 'upcoming' && navigate(`/lesson/${topic.id}`)}
                  className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition-all ${
                    status === 'upcoming'
                      ? 'opacity-50 cursor-not-allowed border-[#E4E7EC]'
                      : isCurrent
                      ? 'cursor-pointer border-2 shadow-sm'
                      : 'cursor-pointer hover:shadow-sm border-[#E4E7EC] hover:border-opacity-50'
                  }`}
                  style={isCurrent ? { borderColor: config.color } : {}}
                >
                  {/* Status indicator */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-bold ${
                    status === 'completed'
                      ? 'text-white'
                      : status === 'inprogress' || status === 'available'
                      ? 'text-white'
                      : 'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}
                    style={
                      status === 'completed' || status === 'inprogress' || status === 'available'
                        ? { background: status === 'completed' ? config.color : config.bg, color: status === 'completed' ? 'white' : config.color }
                        : {}
                    }
                  >
                    {status === 'completed' ? Icons.check : status === 'upcoming' ? Icons.lock : index + 1}
                  </div>

                  {/* Topic info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-[14px] font-bold ${status === 'upcoming' ? 'text-[#94A3B8]' : 'text-[#0F172A]'}`}>
                        {topic.title}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: config.color }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#94A3B8] mt-0.5">
                      {status === 'completed'
                        ? 'Completed'
                        : status === 'inprogress'
                        ? 'In progress'
                        : status === 'upcoming'
                        ? 'Complete previous topic first'
                        : 'Ready to start'}
                    </p>
                  </div>

                  {/* Action */}
                  {status !== 'upcoming' && (
                    <div style={{ color: config.color }}>
                      {Icons.arrow}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}