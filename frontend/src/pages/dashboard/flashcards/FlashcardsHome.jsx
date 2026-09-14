import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const Icons = {
  cards: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="5" x2="8" y2="8"/><line x1="16" y1="16" x2="19" y2="19"/>
    </svg>
  ),
  english: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  science: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5m5-5h6m0 0l5 5M15 14V3"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
};

const subjectConfig = {
  'Mathematics': { icon: Icons.math, color: '#5B9BD5', bg: '#EFF6FF' },
  'English Language': { icon: Icons.english, color: '#70AD47', bg: '#F0FDF4' },
  'Basic Science': { icon: Icons.science, color: '#F59E0B', bg: '#FFFBEB' },
  'Uploaded Notes': { icon: Icons.upload, color: '#136299', bg: '#EFF6FF' },
  'General Studies': { icon: Icons.cards, color: '#9B8DBE', bg: '#F5F3FF' },
};

export default function FlashcardsHome({ profile }) {
  const navigate = useNavigate();
  const [studiedTopics, setStudiedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudiedTopics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudiedTopics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('student_progress')
        .select('*, topics(id, title, subject, order_index)')
        .eq('student_id', user.id)
        .gt('level_reached', 0) // only show topics they've actually started
        .order('last_studied_at', { ascending: false });

      setStudiedTopics(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupedBySubject = studiedTopics.reduce((acc, p) => {
    const subject = p.topics?.subject || 'Other';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(p);
    return acc;
  }, {});

  const completedCount = studiedTopics.filter(p => p.completed).length;

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
      `}</style>

      {/* HEADER */}
      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">Flashcards</h1>
        <p className="text-[14px] text-[#475467] mt-1">
          Review key concepts from topics you have studied.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="f2 flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex-shrink-0"/>
              <div className="flex-1">
                <div className="w-40 h-4 bg-[#F1F5F9] rounded mb-2"/>
                <div className="w-24 h-3 bg-[#F1F5F9] rounded"/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && studiedTopics.length === 0 && (
        <div className="f2 bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-10 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#5B9BD5]">
            {Icons.cards}
          </div>
          <h3 className="text-[16px] font-bold text-[#0F172A]">No flashcards yet</h3>
          <p className="text-[13px] text-[#475467] max-w-[300px] leading-[1.6]">
            Start a lesson first. Once you have studied a topic, its flashcards will appear here for review.
          </p>
          <button
            onClick={() => navigate('/topics/Mathematics')}
            className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[13px] font-bold rounded-xl transition-colors">
            Start your first lesson {Icons.arrow}
          </button>
        </div>
      )}

      {/* STATS STRIP */}
      {!loading && studiedTopics.length > 0 && (
        <>
          <div className="f2 grid grid-cols-3 gap-3">
            {[
              { label: 'Topics Studied', value: studiedTopics.length, color: '#136299', bg: '#EFF6FF' },
              { label: 'Topics Completed', value: completedCount, color: '#70AD47', bg: '#F0FDF4' },
              { label: 'Card Sets', value: studiedTopics.length, color: '#F59E0B', bg: '#FFFBEB' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-4 text-center">
                <p className="text-[24px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] text-[#94A3B8] mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* GROUPED BY SUBJECT */}
          <div className="f3 flex flex-col gap-6">
            {Object.entries(groupedBySubject).map(([subject, topics]) => {
              const config = subjectConfig[subject] || { color: '#5B9BD5', bg: '#EFF6FF', icon: Icons.cards };
              return (
                <div key={subject}>
                  {/* Subject header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: config.bg, color: config.color }}>
                      {config.icon}
                    </div>
                    <h2 className="text-[15px] font-bold text-[#0F172A]">{subject}</h2>
                    <span className="text-[12px] text-[#94A3B8]">
                      {topics.length} topic{topics.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Topic cards */}
                  <div className="flex flex-col gap-2">
                    {topics.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/flashcards/${p.topics?.id}`)}
                        className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-4 hover:border-[#5B9BD5] hover:shadow-sm transition-all text-left w-full active:scale-[0.99]"
                      >
                        {/* Status */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: p.completed ? config.bg : '#F8FAFC',
                            color: p.completed ? config.color : '#94A3B8'
                          }}>
                          {p.completed ? Icons.check : Icons.cards}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <p className="text-[14px] font-semibold text-[#0F172A]">
                            {p.topics?.title}
                          </p>
                          <p className="text-[12px] text-[#94A3B8] mt-0.5">
                            {p.completed
                              ? `Completed · 5 cards`
                              : `Level ${p.level_reached} of 4 · 5 cards`}
                            {p.score > 0 && ` · Quiz: ${p.score}%`}
                          </p>
                        </div>

                        {/* Badge + arrow */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {p.completed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white hidden sm:block"
                              style={{ background: config.color }}>
                              Done
                            </span>
                          )}
                          {!p.completed && p.level_reached >= 1 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#136299] hidden sm:block">
                              In Progress
                            </span>
                          )}
                          <span style={{ color: config.color }}>{Icons.arrow}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TIP */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0 mt-1.5"/>
            <p className="text-[13px] text-[#1E293B] leading-[1.7]">
              Regular review helps your brain retain information. Even 5 minutes of flashcard review each day makes a big difference over time.
            </p>
          </div>
        </>
      )}
    </div>
  );
}