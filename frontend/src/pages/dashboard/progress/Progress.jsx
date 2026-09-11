import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const subjectConfig = [
  { key: 'Mathematics', color: '#5B9BD5', bg: '#EFF6FF' },
  { key: 'English Language', color: '#70AD47', bg: '#F0FDF4' },
  { key: 'Basic Science', color: '#F59E0B', bg: '#FFFBEB' },
];

export default function Progress({ profile }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ completed: 0, streak: 0, avgScore: 0 });
  const [subjectProgress, setSubjectProgress] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*, topics(id, title, subject)')
        .eq('student_id', user.id)
        .order('last_studied_at', { ascending: false });

      if (!progressData || progressData.length === 0) {
        setLoading(false);
        return;
      }

      // Stats
      const completed = progressData.filter(p => p.completed).length;
      const scores = progressData.filter(p => p.score > 0).map(p => p.score);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      // Streak
      const completedDates = progressData
        .filter(p => p.completed && p.last_studied_at)
        .map(p => new Date(p.last_studied_at).toDateString());
      const uniqueDates = [...new Set(completedDates)];
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (uniqueDates.includes(d.toDateString())) streak++;
        else if (i > 0) break;
      }

      setStats({ completed, streak, avgScore });

      // Subject progress
      const subMap = {};
      for (const s of subjectConfig) {
        const { data: topics } = await supabase
          .from('topics').select('id').eq('subject', s.key);
        const total = topics?.length || 0;
        const done = progressData.filter(p =>
          p.completed && topics?.some(t => t.id === p.topic_id)
        ).length;
        subMap[s.key] = {
          total,
          done,
          progress: total > 0 ? Math.round((done / total) * 100) : 0
        };
      }
      setSubjectProgress(subMap);

      // Recent activity
      setRecentActivity(progressData.slice(0, 5));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isUniversity = profile?.student_level === 'university';

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">My Progress</h1>
        <p className="text-[14px] text-[#475467] mt-1">A calm view of how far you have come.</p>
      </div>

      {/* STATS */}
      <div className="f2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Topics Completed', value: loading ? '...' : stats.completed.toString(), sub: 'across all subjects', color: '#136299', bg: '#EFF6FF' },
          { label: 'Learning Streak', value: loading ? '...' : `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`, sub: stats.streak > 0 ? 'keep it going' : 'start today', color: '#70AD47', bg: '#F0FDF4' },
          { label: 'Average Score', value: loading ? '...' : stats.avgScore > 0 ? `${stats.avgScore}%` : '—', sub: stats.avgScore > 0 ? 'across all quizzes' : 'complete a quiz to see', color: '#F59E0B', bg: '#FFFBEB' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl mb-3" style={{ background: s.bg }}/>
            <p className="text-[30px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[14px] font-semibold text-[#0F172A] mt-1">{s.label}</p>
            <p className="text-[12px] text-[#94A3B8]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && stats.completed === 0 && (
        <div className="f3 bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-8 text-center">
          <p className="text-[16px] font-bold text-[#0F172A] mb-2">No progress yet</p>
          <p className="text-[13px] text-[#475467] mb-4">Complete your first lesson to start tracking your progress.</p>
          <button
            onClick={() => navigate('/topics/Mathematics')}
            className="px-6 py-2.5 bg-[#136299] text-white text-[13px] font-bold rounded-xl hover:bg-[#0F4F7A] transition-colors"
          >
            Start First Lesson
          </button>
        </div>
      )}

      {/* SUBJECT PROGRESS — secondary only */}
      {!isUniversity && !loading && stats.completed > 0 && (
        <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-[#0F172A] mb-5">Progress by Subject</h2>
          <div className="flex flex-col gap-5">
            {subjectConfig.map((s) => {
              const sp = subjectProgress[s.key] || { done: 0, total: 3, progress: 0 };
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-[#1E293B]">{s.key}</span>
                    <span className="text-[13px] font-bold" style={{ color: s.color }}>
                      {sp.done}/{sp.total} topics
                    </span>
                  </div>
                  <div className="bg-[#F1F5F9] rounded-full h-2">
                    <div className="h-2 rounded-full progress-bar"
                      style={{ width: `${sp.progress}%`, background: s.color }}/>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1">{sp.progress}% complete</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY */}
      {!loading && recentActivity.length > 0 && (
        <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-6">
          <h2 className="text-[16px] font-bold text-[#0F172A] mb-4">Recent Activity</h2>
          <div className="flex flex-col gap-3">
            {recentActivity.map((p, i) => {
              const subColor = subjectConfig.find(s => s.key === p.topics?.subject)?.color || '#5B9BD5';
              const subBg = subjectConfig.find(s => s.key === p.topics?.subject)?.bg || '#EFF6FF';
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: subBg, color: subColor }}>
                    {p.topics?.subject?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#0F172A]">{p.topics?.title || 'Unknown topic'}</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      {p.completed ? 'Completed' : `Level ${p.level_reached} of 4`}
                      {p.score > 0 && ` · Score: ${p.score}%`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.completed ? 'bg-[#F0FDF4] text-[#336b07]' : 'bg-[#EFF6FF] text-[#136299]'
                  }`}>
                    {p.completed ? 'Done' : 'In Progress'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}