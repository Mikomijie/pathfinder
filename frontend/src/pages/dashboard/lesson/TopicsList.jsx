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
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="5" x2="8" y2="8"/><line x1="16" y1="16" x2="19" y2="19"/>
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
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .eq('subject', decodedSubject)
        .is('deleted_at', null)
        .order('order_index', { ascending: true });

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id);

      const progressMap = {};
      progressData?.forEach(p => { progressMap[p.topic_id] = p; });

      setTopics(topicsData || []);
      setProgress(progressMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicStatus = (topic) => {
    const p = progress[topic.id];
    if (p?.completed) return 'completed';
    if (p?.level_reached > 0) return 'inprogress';
    // ALL topics are available — no locking for neurodivergent students
    return 'available';
  };

  const completedCount = topics.filter(t => progress[t.id]?.completed).length;

  // Current topic — first in progress, then first available
  const currentTopic = topics.find(t => progress[t.id]?.level_reached > 0 && !progress[t.id]?.completed)
    || topics.find(t => !progress[t.id]?.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}</style>
        <header className="bg-white border-b border-[#E4E7EC] h-[60px]"/>
        <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8 flex flex-col gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9]"/>
                <div className="flex-1">
                  <div className="w-48 h-4 bg-[#F1F5F9] rounded mb-2"/>
                  <div className="w-32 h-3 bg-[#F1F5F9] rounded"/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse { animation: pulse 2s ease infinite; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-20">
        <div className="max-w-[720px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <button onClick={() => navigate('/dashboard/student')}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors">
            {Icons.back} Back to Dashboard
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{ background: config.bg, color: config.color }}>
            {completedCount} of {topics.length} complete
          </div>
        </div>
      </header>

      <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8">

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

        <div className="f2 bg-white border border-[#E4E7EC] rounded-2xl p-5 mb-6">
          <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Your Journey</p>
          <div className="flex items-center gap-1 mb-3">
            {topics.map((t, i) => {
              const status = getTopicStatus(t);
              return (
                <React.Fragment key={t.id}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all ${
                    status === 'completed' ? 'text-white'
                    : status === 'inprogress' ? 'text-white pulse'
                    : 'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}
                    style={
                      status === 'completed' ? { background: config.color }
                      : status === 'inprogress' ? { background: config.color, opacity: 0.7 }
                      : {}
                    }
                  >
                    {status === 'completed' ? Icons.check : i + 1}
                  </div>
                  {i < topics.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full"
                      style={{ background: status === 'completed' ? config.color : '#E4E7EC' }}/>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="bg-[#F1F5F9] rounded-full h-2 mt-2">
            <div className="h-2 rounded-full progress-bar"
              style={{
                width: `${topics.length > 0 ? (completedCount / topics.length) * 100 : 0}%`,
                background: config.color
              }}/>
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-2">
            {completedCount === 0
              ? "You are just getting started. No pressure — take it one step at a time."
              : completedCount === topics.length
              ? "You have completed all topics in this subject. Amazing work!"
              : `${topics.length - completedCount} topics remaining. You are doing great.`}
          </p>
        </div>

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
                <span className="text-[12px] font-medium">Voice support</span>
              </div>
            </div>

            {progress[currentTopic.id]?.level_reached > 0 && !progress[currentTopic.id]?.completed && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-1.5">
                  {[1,2,3,4].map(l => (
                    <div key={l} className="w-6 h-1.5 rounded-full"
                      style={{ background: l <= progress[currentTopic.id].level_reached ? config.color : '#E4E7EC' }}/>
                  ))}
                </div>
                <span className="text-[12px] text-[#475467]">
                  Level {progress[currentTopic.id].level_reached} of 4
                </span>
              </div>
            )}

            <button
              onClick={() => navigate(`/lesson/${currentTopic.id}`)}
              className="flex items-center gap-2 px-8 py-3.5 text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
              style={{ background: config.color }}>
              {progress[currentTopic.id]?.level_reached > 0 ? 'Continue Lesson' : 'Start Lesson'}
              {Icons.arrow}
            </button>
          </div>
        )}

        <div className="f3">
          <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">All Topics</p>
          <div className="flex flex-col gap-3">
            {topics.map((topic) => {
              const status = getTopicStatus(topic);
              const isCurrent = topic.id === currentTopic?.id;
              const p = progress[topic.id];

              return (
                <div
                  key={topic.id}
                  onClick={() => navigate(`/lesson/${topic.id}`)}
                  className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-2 shadow-sm'
                      : 'border-[#E4E7EC] hover:border-opacity-50 hover:shadow-sm'
                  }`}
                  style={isCurrent ? { borderColor: config.color } : {}}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                    style={
                      status === 'completed'
                        ? { background: config.color, color: 'white' }
                        : status === 'inprogress'
                        ? { background: config.bg, color: config.color }
                        : { background: '#F1F5F9', color: '#94A3B8' }
                    }
                  >
                    {status === 'completed' ? Icons.check : topics.indexOf(topic) + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-bold text-[#0F172A]">{topic.title}</p>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: config.color }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#94A3B8] mt-0.5">
                      {status === 'completed'
                        ? `Completed${p?.score ? ` · Score: ${p.score}%` : ''}`
                        : status === 'inprogress'
                        ? `Level ${p?.level_reached || 1} of 4 · In progress`
                        : 'Ready to start'}
                    </p>
                  </div>

                  <div style={{ color: config.color }}>{Icons.arrow}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}