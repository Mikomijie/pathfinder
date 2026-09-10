import React from 'react';
import { useNavigate } from 'react-router-dom';

const Icons = {
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="5" x2="8" y2="8"/><line x1="16" y1="16" x2="19" y2="19"/>
    </svg>
  ),
  english: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  science: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5m5-5h6m0 0l5 5M15 14V3"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
};

const secondarySubjects = [
  { key: 'math', label: 'Mathematics', icon: Icons.math, color: '#5B9BD5', bg: '#EFF6FF', progress: 40, topics: 3, done: 0 },
  { key: 'english', label: 'English Language', icon: Icons.english, color: '#70AD47', bg: '#F0FDF4', progress: 0, topics: 3, done: 0 },
  { key: 'science', label: 'Basic Science', icon: Icons.science, color: '#F59E0B', bg: '#FFFBEB', progress: 0, topics: 3, done: 0 },
];

export default function Subjects({ profile }) {
  const navigate = useNavigate();
  const isUniversity = profile?.student_level === 'university';
  const subjects = isUniversity ? [] : secondarySubjects;

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">
          {isUniversity ? 'My Notes' : 'My Subjects'}
        </h1>
        <p className="text-[14px] text-[#475467] mt-1">
          {isUniversity ? 'Upload and manage your lecture notes.' : 'Pick a subject to continue learning.'}
        </p>
      </div>

      {isUniversity && (
        <div className="f2 bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center hover:border-[#5B9BD5] transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#136299]">
            {Icons.upload}
          </div>
          <h3 className="text-[16px] font-bold text-[#0F172A]">Upload Lecture Notes</h3>
          <p className="text-[13px] text-[#475467] max-w-[320px]">
            Upload a PDF and Pathfinder will break it into micro-lessons with voice support.
          </p>
          <button className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[13px] font-bold rounded-xl transition-colors">
            Upload PDF {Icons.arrow}
          </button>
        </div>
      )}

      {!isUniversity && (
        <div className="f2 flex flex-col gap-4">
          {subjects.map((s) => (
            <div
              key={s.key}
              className="bg-white border border-[#E4E7EC] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#5B9BD5] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F172A]">{s.label}</h3>
                  <p className="text-[13px] text-[#94A3B8] mt-0.5">{s.done} of {s.topics} topics complete</p>
                  <div className="mt-2 bg-[#F1F5F9] rounded-full h-1.5 w-[180px]">
                    <div
                      className="h-1.5 rounded-full progress-bar"
                      style={{ width: `${s.progress}%`, background: s.color }}
                    />
                  </div>
                  <p className="text-[11px] mt-1 font-semibold" style={{ color: s.color }}>
                    {s.progress}% complete
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/topics/${encodeURIComponent(s.label)}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[13px] font-bold rounded-xl transition-colors flex-shrink-0"
              >
                View Topics {Icons.arrow}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}