import React, { useState, useEffect } from 'react';

const Icons = {
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="5" x2="8" y2="8"/><line x1="16" y1="16" x2="19" y2="19"/>
    </svg>
  ),
  english: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  science: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5m5-5h6m0 0l5 5M15 14V3"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z"/>
      <path d="M12 12c0 3-2 4-2 6a2 2 0 0 0 4 0c0-2-2-3-2-6z"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
};

const secondarySubjects = [
  { key: 'math', label: 'Mathematics', icon: Icons.math, color: '#5B9BD5', bg: '#EFF6FF', progress: 40, topics: 12, done: 5 },
  { key: 'english', label: 'English', icon: Icons.english, color: '#70AD47', bg: '#F0FDF4', progress: 65, topics: 10, done: 7 },
  { key: 'science', label: 'Basic Science', icon: Icons.science, color: '#F59E0B', bg: '#FFFBEB', progress: 20, topics: 8, done: 2 },
];

const tips = [
  "Break big tasks into tiny steps. Finishing one small thing is still winning.",
  "It's okay to re-read something multiple times. That's not weakness — that's learning.",
  "Your brain works differently, not less. Different is a strength.",
  "Take a short break if you feel stuck. Coming back fresh helps more than pushing through.",
  "Voice can help. Try listening to your lesson instead of just reading it.",
];

export default function Home({ profile, onNavigate }) {
  const [greeting, setGreeting] = useState('');
  const [tip, setTip] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const dayIndex = new Date().getDay();
    setTip(tips[dayIndex % tips.length]);
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const isUniversity = profile?.student_level === 'university';

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        .f4 { animation: fadeUp 0.4s 0.24s ease both; }
        .f5 { animation: fadeUp 0.4s 0.32s ease both; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* TWO COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-5">

          {/* WELCOME */}
          <div className="f1">
            <h1 className="text-[26px] md:text-[30px] font-extrabold text-[#0F172A]">
              {greeting}, {firstName}.
            </h1>
            <p className="text-[14px] text-[#475467] mt-1">
              {isUniversity
                ? 'Upload your notes and start learning at your pace today.'
                : "You're doing great. Let's keep building on your progress."}
            </p>
          </div>

          {/* CONTINUE LEARNING / UNIVERSITY UPLOAD */}
          {!isUniversity ? (
            <div className="f2 bg-[#0F172A] rounded-2xl p-6 md:p-7">
              <span className="text-[10px] font-bold text-[#5B9BD5] uppercase tracking-widest">Continue where you left off</span>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                <div>
                  <h2 className="text-[20px] font-bold text-white">Mathematics — Fractions</h2>
                  <p className="text-[13px] text-[#64748B] mt-1">Topic 5 of 12 · Adding Fractions with Different Denominators</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-[140px] bg-[#1E293B] rounded-full h-1.5">
                      <div className="bg-[#5B9BD5] h-1.5 rounded-full progress-bar" style={{width:'40%'}}/>
                    </div>
                    <span className="text-[12px] text-[#475467]">40% complete</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('subjects')}
                  className="flex items-center gap-2 px-6 py-3 bg-[#5B9BD5] hover:bg-[#4A7DAF] text-white text-[14px] font-bold rounded-xl transition-colors flex-shrink-0"
                >
                  Continue {Icons.arrow}
                </button>
              </div>
            </div>
          ) : (
            <div className="f2 bg-[#0F172A] rounded-2xl p-6 md:p-7">
              <span className="text-[10px] font-bold text-[#5B9BD5] uppercase tracking-widest">Get started</span>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                <div>
                  <h2 className="text-[20px] font-bold text-white">Upload your lecture notes</h2>
                  <p className="text-[13px] text-[#64748B] mt-1">We'll break them into micro-lessons and read them aloud for you.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#5B9BD5] hover:bg-[#4A7DAF] text-white text-[14px] font-bold rounded-xl transition-colors flex-shrink-0">
                  {Icons.upload} Upload PDF
                </button>
              </div>
            </div>
          )}

          {/* TODAY'S FOCUS */}
          {!isUniversity && (
            <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B]">
                  {Icons.target}
                </div>
                <span className="text-[11px] font-bold text-[#7F5600] uppercase tracking-widest">Today's Focus</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#0F172A]">Basic Science — The Human Digestive System</h3>
              <p className="text-[13px] text-[#475467] mt-1">Recommended based on your recent progress. Takes about 10 minutes.</p>
              <button
                onClick={() => onNavigate('subjects')}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#7F5600] text-[13px] font-bold rounded-xl transition-colors border border-[#FDE68A]"
              >
                Start Topic {Icons.arrow}
              </button>
            </div>
          )}

          {/* MY SUBJECTS */}
          {!isUniversity && (
            <div className="f4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-[#0F172A]">My Subjects</h2>
                <button
                  onClick={() => onNavigate('subjects')}
                  className="text-[13px] text-[#136299] font-semibold hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {secondarySubjects.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onNavigate('subjects')}
                    className="bg-white border border-[#E4E7EC] rounded-2xl p-4 text-left hover:border-[#5B9BD5] hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: s.bg, color: s.color }}>
                      {s.icon}
                    </div>
                    <p className="text-[14px] font-bold text-[#0F172A]">{s.label}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{s.done} of {s.topics} topics</p>
                    <div className="mt-2 bg-[#F1F5F9] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full progress-bar"
                        style={{ width: `${s.progress}%`, background: s.color }}/>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:w-[280px] flex flex-col gap-4">

          {/* QUICK STATS */}
          <div className="f2 bg-white border border-[#E4E7EC] rounded-2xl p-5">
            <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Your Stats</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Topics Done', value: '14', color: '#136299', bg: '#EFF6FF', icon: Icons.check },
                { label: 'Day Streak', value: '3', color: '#70AD47', bg: '#F0FDF4', icon: Icons.flame },
                { label: 'Avg Score', value: '78%', color: '#F59E0B', bg: '#FFFBEB', icon: Icons.star },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[20px] font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[12px] text-[#94A3B8] mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT BADGES */}
          <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 text-[#F59E0B]">{Icons.trophy}</div>
              <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">Recent Badges</h3>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'First Lesson', desc: 'Completed your first lesson', color: '#5B9BD5', bg: '#EFF6FF' },
                { label: 'Consistent', desc: '3 day learning streak', color: '#70AD47', bg: '#F0FDF4' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                    style={{ background: b.bg, color: b.color }}>
                    {Icons.star}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1E293B]">{b.label}</p>
                    <p className="text-[11px] text-[#94A3B8]">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DAILY TIP */}
          <div className="f4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 text-[#336b07]">{Icons.lightbulb}</div>
              <h3 className="text-[13px] font-bold text-[#336b07] uppercase tracking-widest">Daily Tip</h3>
            </div>
            <p className="text-[13px] text-[#1E293B] leading-[1.7]">{tip}</p>
          </div>

        </div>
      </div>
    </div>
  );
}