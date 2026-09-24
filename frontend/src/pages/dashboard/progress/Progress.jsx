import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const subjectConfig = [
  { key: 'Mathematics', color: '#5B9BD5', bg: '#EFF6FF' },
  { key: 'English Language', color: '#70AD47', bg: '#F0FDF4' },
  { key: 'Basic Science', color: '#F59E0B', bg: '#FFFBEB' },
];

const Icons = {
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
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
    </svg>
  ),
  science: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5m5-5h6m0 0l5 5M15 14V3"/>
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
};

const subjectIcons = {
  'Mathematics': Icons.math,
  'English Language': Icons.english,
  'Basic Science': Icons.science,
};

export default function Progress({ profile }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ completed: 0, streak: 0, avgScore: 0 });
  const [subjectProgress, setSubjectProgress] = useState({});
  const [topicProgress, setTopicProgress] = useState({});
  const [allTopics, setAllTopics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [aiTopicsProgress, setAiTopicsProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const isUniversity = profile?.student_level === 'university';

  useEffect(() => {
    fetchProgress();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*, topics(id, title, subject, order_index)')
        .eq('student_id', user.id)
        .order('last_studied_at', { ascending: false });

      if (!progressData || progressData.length === 0) {
        setLoading(false);
        return;
      }

      const completed = progressData.filter(p => p.completed).length;
      const scores = progressData.filter(p => p.score > 0).map(p => p.score);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

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
      setRecentActivity(progressData.slice(0, 8));

      const pMap = {};
      progressData.forEach(p => { pMap[p.topic_id] = p; });
      setTopicProgress(pMap);

      // AI-generated and uploaded topics — not in the 3 pre-built subjects
      const prebuiltSubjects = subjectConfig.map(s => s.key);
      const aiTopics = progressData.filter(p =>
        p.topics && !prebuiltSubjects.includes(p.topics.subject)
      );
      setAiTopicsProgress(aiTopics);

      if (!isUniversity) {
        const topicsPerSubject = {};
        const subMap = {};
        for (const s of subjectConfig) {
          const { data: topics } = await supabase
            .from('topics').select('*').eq('subject', s.key)
            .is('deleted_at', null).order('order_index');
          topicsPerSubject[s.key] = topics || [];
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
        setAllTopics(topicsPerSubject);
        setSubjectProgress(subMap);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicStatus = (topic) => {
    const p = topicProgress[topic.id];
    if (p?.completed) return 'completed';
    if (p?.level_reached > 0) return 'inprogress';
    return 'available'; // No locking — all topics accessible
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div>
          <div className="w-40 h-7 bg-[#F1F5F9] rounded animate-pulse mb-2"/>
          <div className="w-64 h-4 bg-[#F1F5F9] rounded animate-pulse"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-6 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] mb-3"/>
              <div className="w-16 h-8 bg-[#F1F5F9] rounded mb-2"/>
              <div className="w-24 h-3 bg-[#F1F5F9] rounded"/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        .f4 { animation: fadeUp 0.4s 0.24s ease both; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse { animation: pulse 2s ease infinite; }
      `}</style>

      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">My Progress</h1>
        <p className="text-[14px] text-[#475467] mt-1">A calm view of how far you have come.</p>
      </div>

      {/* STATS */}
      <div className="f2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: isUniversity ? 'Lessons Done' : 'Topics Completed',
            value: stats.completed.toString(),
            sub: stats.completed === 0 ? 'Start your first lesson' : 'Keep going',
            color: '#136299', bg: '#EFF6FF', icon: Icons.check
          },
          {
            label: 'Learning Streak',
            value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`,
            sub: stats.streak > 0 ? 'You are on a roll' : 'Start today',
            color: '#70AD47', bg: '#F0FDF4', icon: Icons.flame
          },
          {
            label: 'Average Score',
            value: stats.avgScore > 0 ? `${stats.avgScore}%` : '—',
            sub: stats.avgScore > 0 ? 'Across all quizzes' : 'Complete a quiz to see',
            color: '#F59E0B', bg: '#FFFBEB', icon: Icons.star
          },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <p className="text-[30px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[14px] font-semibold text-[#0F172A] mt-1">{s.label}</p>
            <p className="text-[12px] text-[#94A3B8] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {stats.completed === 0 && (
        <div className="f3 bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-8 text-center">
          <p className="text-[16px] font-bold text-[#0F172A] mb-2">No progress yet</p>
          <p className="text-[13px] text-[#475467] mb-4 leading-[1.6]">
            Complete your first lesson to start tracking your progress here.
          </p>
          <button
            onClick={() => navigate(isUniversity ? '/dashboard/student' : '/topics/Mathematics')}
            className="px-6 py-2.5 bg-[#136299] text-white text-[13px] font-bold rounded-xl hover:bg-[#0F4F7A] transition-colors">
            {isUniversity ? 'Go to Dashboard' : 'Start First Lesson'}
          </button>
        </div>
      )}

      {/* VISUAL JOURNEY MAP — secondary only, pre-built subjects */}
      {!isUniversity && stats.completed > 0 && Object.keys(allTopics).length > 0 && (
        <div className="f3 flex flex-col gap-5">
          <h2 className="text-[15px] font-bold text-[#0F172A]">Your Learning Journey</h2>
          {subjectConfig.map((s) => {
            const topics = allTopics[s.key] || [];
            const sp = subjectProgress[s.key] || { done: 0, total: 0, progress: 0 };
            if (topics.length === 0) return null;

            return (
              <div key={s.key} className="bg-white border border-[#E4E7EC] rounded-2xl p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: s.bg, color: s.color }}>
                      {subjectIcons[s.key]}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#0F172A]">{s.key}</p>
                      <p className="text-[12px] text-[#94A3B8]">{sp.done} of {sp.total} complete</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: s.color }}>{sp.progress}%</span>
                </div>

                <div className="bg-[#F1F5F9] rounded-full h-2 mb-4">
                  <div className="h-2 rounded-full progress-bar"
                    style={{ width: `${sp.progress}%`, background: s.color }}/>
                </div>

                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                  {topics.map((topic, i) => {
                    const status = getTopicStatus(topic);
                    return (
                      <React.Fragment key={topic.id}>
                        <button
                          onClick={() => navigate(`/lesson/${topic.id}`)}
                          title={topic.title}
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all cursor-pointer hover:scale-110"
                          style={
                            status === 'completed'
                              ? { background: s.color, color: 'white' }
                              : status === 'inprogress'
                              ? { background: s.bg, color: s.color, border: `2px solid ${s.color}` }
                              : { background: '#F1F5F9', color: '#94A3B8', border: '2px solid #E4E7EC' }
                          }>
                          {status === 'completed' ? Icons.check : i + 1}
                        </button>
                        {i < topics.length - 1 && (
                          <div className="flex-1 h-0.5 rounded-full flex-shrink-0 min-w-[8px]"
                            style={{ background: status === 'completed' ? s.color : '#E4E7EC' }}/>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2">
                  {topics.map((topic, i) => {
                    const status = getTopicStatus(topic);
                    const p = topicProgress[topic.id];
                    const isCurrent = status === 'inprogress';

                    return (
                      <div key={topic.id}
                        onClick={() => navigate(`/lesson/${topic.id}`)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-[#F8FAFC] ${isCurrent ? 'bg-[#F8FAFC]' : ''}`}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={
                            status === 'completed'
                              ? { background: s.color, color: 'white' }
                              : isCurrent
                              ? { background: s.bg, color: s.color }
                              : { background: '#F1F5F9', color: '#94A3B8' }
                          }>
                          {status === 'completed' ? Icons.check : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-[#0F172A]">{topic.title}</p>
                          <p className="text-[11px] text-[#94A3B8]">
                            {status === 'completed'
                              ? `Completed${p?.score ? ` · ${p.score}%` : ''}`
                              : status === 'inprogress'
                              ? `Level ${p?.level_reached} of 4 · In progress`
                              : 'Ready to start'}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white pulse"
                            style={{ background: s.color }}>
                            Current
                          </span>
                        )}
                        <span style={{ color: s.color }}>{Icons.arrow}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI-GENERATED TOPICS PROGRESS */}
      {!isUniversity && aiTopicsProgress.length > 0 && (
        <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#136299]">
              {Icons.star}
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#0F172A]">AI-Generated Lessons</p>
              <p className="text-[12px] text-[#94A3B8]">{aiTopicsProgress.filter(p => p.completed).length} of {aiTopicsProgress.length} complete</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {aiTopicsProgress.map((p, i) => (
              <div key={i}
                onClick={() => navigate(`/lesson/${p.topic_id}`)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[#F8FAFC] transition-all">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={p.completed
                    ? { background: '#5B9BD5', color: 'white' }
                    : { background: '#EFF6FF', color: '#5B9BD5' }}>
                  {p.completed ? Icons.check : i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#0F172A]">{p.topics?.title}</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    {p.completed
                      ? `Completed${p.score ? ` · ${p.score}%` : ''}`
                      : `Level ${p.level_reached} of 4 · In progress`}
                  </p>
                </div>
                <span className="text-[#5B9BD5]">{Icons.arrow}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UNIVERSITY: ALL LESSONS */}
      {isUniversity && recentActivity.length > 0 && (
        <div className="f3 bg-white border border-[#E4E7EC] rounded-2xl p-5 md:p-6">
          <h2 className="text-[15px] font-bold text-[#0F172A] mb-4">All Lessons</h2>
          <div className="flex flex-col gap-2">
            {recentActivity.map((p, i) => {
              const isUploaded = p.topics?.subject === 'Uploaded Notes';
              const color = isUploaded ? '#136299' : '#5B9BD5';
              const bg = isUploaded ? '#EFF6FF' : '#EFF6FF';
              return (
                <div key={i}
                  onClick={() => navigate(`/lesson/${p.topic_id}`)}
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: bg, color }}>
                    {isUploaded ? Icons.file : Icons.star}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#0F172A]">{p.topics?.title || 'Unknown topic'}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: bg, color }}>
                        {isUploaded ? 'My Notes' : 'AI Lesson'}
                      </span>
                      <p className="text-[11px] text-[#94A3B8]">
                        {p.completed ? 'Completed' : `Level ${p.level_reached} of 4`}
                        {p.score > 0 && ` · ${p.score}%`}
                      </p>
                    </div>
                  </div>
                  <span className={p.completed ? 'text-[#70AD47]' : 'text-[#94A3B8]'}>
                    {p.completed ? Icons.check : Icons.arrow}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY */}
      {!isUniversity && recentActivity.length > 0 && (
        <div className="f4 bg-white border border-[#E4E7EC] rounded-2xl p-6">
          <h2 className="text-[15px] font-bold text-[#0F172A] mb-4">Recent Activity</h2>
          <div className="flex flex-col gap-3">
            {recentActivity.map((p, i) => {
              const subColor = subjectConfig.find(s => s.key === p.topics?.subject)?.color || '#5B9BD5';
              const subBg = subjectConfig.find(s => s.key === p.topics?.subject)?.bg || '#EFF6FF';
              const date = p.last_studied_at
                ? new Date(p.last_studied_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
                : '';
              return (
                <div key={i}
                  onClick={() => navigate(`/lesson/${p.topic_id}`)}
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl cursor-pointer hover:bg-[#F1F5F9] transition-colors">
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
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.completed ? 'bg-[#F0FDF4] text-[#336b07]' : 'bg-[#EFF6FF] text-[#136299]'
                    }`}>
                      {p.completed ? 'Done' : 'In Progress'}
                    </span>
                    {date && <p className="text-[11px] text-[#94A3B8] mt-1">{date}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}