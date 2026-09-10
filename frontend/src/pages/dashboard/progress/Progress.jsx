import React from 'react';

const secondarySubjects = [
  { key: 'math', label: 'Mathematics', color: '#5B9BD5', progress: 40, topics: 12, done: 5 },
  { key: 'english', label: 'English Language', color: '#70AD47', progress: 65, topics: 10, done: 7 },
  { key: 'science', label: 'Basic Science', color: '#F59E0B', progress: 20, topics: 8, done: 2 },
];

export default function Progress({ profile }) {
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
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">My Progress</h1>
        <p className="text-[14px] text-[#475467] mt-1">A calm view of how far you've come.</p>
      </div>

      <div className="f2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Topics Done', value: '14', sub: 'across all subjects', color: '#136299', bg: '#EFF6FF' },
          { label: 'Learning Streak', value: '3 days', sub: 'keep it going', color: '#70AD47', bg: '#F0FDF4' },
          { label: 'Average Score', value: '78%', sub: 'across all quizzes', color: '#F59E0B', bg: '#FFFBEB' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: s.bg }}>
              <div className="w-3 h-3 rounded-full" style={{ background: s.color }}/>
            </div>
            <p className="text-[30px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[14px] font-semibold text-[#0F172A] mt-1">{s.label}</p>
            <p className="text-[12px] text-[#94A3B8]">{s.sub}</p>
          </div>
        ))}
      </div>

      {!isUniversity && (
        <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-[#0F172A] mb-6">Progress by Subject</h2>
          <div className="flex flex-col gap-6">
            {secondarySubjects.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-semibold text-[#1E293B]">{s.label}</span>
                  <span className="text-[13px] font-bold" style={{ color: s.color }}>{s.progress}%</span>
                </div>
                <div className="bg-[#F1F5F9] rounded-full h-2">
                  <div className="h-2 rounded-full progress-bar"
                    style={{ width: `${s.progress}%`, background: s.color }}/>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">{s.done} of {s.topics} topics done</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}