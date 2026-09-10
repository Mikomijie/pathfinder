import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

// ICONS
const Icons = {
  logo: (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <circle cx="16" cy="16" r="14" stroke="#136299" strokeWidth="2"/>
      <path d="M8 24 Q12 10 16 16 Q20 22 24 8" stroke="#5B9BD5" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="8" r="2.5" fill="#70AD47"/>
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  subjects: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" x2="18" y1="20" y2="10"/>
      <line x1="12" x2="12" y1="20" y2="4"/>
      <line x1="6" x2="6" y1="20" y2="14"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  focus: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6"/><polyline points="5 8 7 10 11 6"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="5" x2="9" y2="9"/><line x1="15" y1="15" x2="19" y2="19"/>
    </svg>
  ),
  english: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  science: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5m5-5h6m0 0l5 5M15 14V3"/>
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="12" y2="17"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const secondarySubjects = [
  { key: 'math', label: 'Mathematics', icon: Icons.math, color: '#5B9BD5', bg: '#EFF6FF', progress: 40, topics: 12, done: 5 },
  { key: 'english', label: 'English Language', icon: Icons.english, color: '#70AD47', bg: '#F0FDF4', progress: 65, topics: 10, done: 7 },
  { key: 'science', label: 'Basic Science', icon: Icons.science, color: '#F59E0B', bg: '#FFFBEB', progress: 20, topics: 8, done: 2 },
];

const uniSubjects = [
  { key: 'notes', label: 'My Uploaded Notes', icon: Icons.notes, color: '#5B9BD5', bg: '#EFF6FF', progress: 0, topics: 0, done: 0 },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('home');
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isUniversity = profile?.student_level === 'university';
  const subjects = isUniversity ? uniSubjects : secondarySubjects;
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const navItems = [
    { key: 'home', label: 'Home', icon: Icons.home },
    { key: 'subjects', label: 'My Subjects', icon: Icons.subjects },
    { key: 'progress', label: 'Progress', icon: Icons.progress },
    { key: 'settings', label: 'Settings', icon: Icons.settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF9] flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div className="flex flex-col items-center gap-3">
          {Icons.logo}
          <p className="text-[14px] text-[#475467]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.4s 0.2s ease both; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* SIDEBAR OVERLAY (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0F172A]/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      {!focusMode && (
        <aside className={`
          fixed md:sticky top-0 left-0 h-screen w-[240px] bg-white border-r border-[#E4E7EC]
          flex flex-col z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="h-[60px] flex items-center gap-2 px-5 border-b border-[#E4E7EC]">
            {Icons.logo}
            <span className="text-[16px] font-bold text-[#136299]">PATHFINDER</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setActiveNav(item.key); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all w-full text-left ${
                  activeNav === item.key
                    ? 'bg-[#EFF6FF] text-[#136299] font-semibold'
                    : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                }`}
              >
                <span className={activeNav === item.key ? 'text-[#136299]' : 'text-[#94A3B8]'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 py-4 border-t border-[#E4E7EC] flex flex-col gap-1">
            {/* Focus mode */}
            <button
              onClick={() => setFocusMode(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#475467] hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-all w-full text-left"
            >
              <span className="text-[#94A3B8]">{Icons.focus}</span>
              Focus Mode
            </button>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#BA1A1A] hover:bg-[#FFF1F1] transition-all w-full text-left"
            >
              <span>{Icons.logout}</span>
              Log Out
            </button>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* TOP BAR */}
        <header className="h-[60px] bg-white border-b border-[#E4E7EC] flex items-center justify-between px-5 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            {!focusMode && (
              <button
                className="md:hidden text-[#475467]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {Icons.menu}
              </button>
            )}
            <div>
              <p className="text-[13px] text-[#94A3B8] leading-none">
                {profile?.grade_level && `${profile.grade_level} · `}{profile?.school_name || 'Pathfinder'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {focusMode && (
              <button
                onClick={() => setFocusMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg text-[13px] font-medium text-[#475467] hover:border-[#5B9BD5] transition-colors"
              >
                {Icons.close}
                Exit Focus
              </button>
            )}
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#136299] flex items-center justify-center text-white text-[13px] font-bold">
              {firstName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-5 md:px-8 py-6 md:py-8 max-w-[1000px] w-full mx-auto">

          {activeNav === 'home' && (
            <div className="flex flex-col gap-6">

              {/* Welcome */}
              <div className="fade-up">
                <h1 className="text-[24px] md:text-[28px] font-extrabold text-[#0F172A]">
                  {greeting}, {firstName}.
                </h1>
                <p className="text-[14px] text-[#475467] mt-1">
                  {isUniversity
                    ? 'Upload your notes and start learning at your pace.'
                    : 'Ready to continue where you left off?'}
                </p>
              </div>

              {/* Continue Learning */}
              {!isUniversity && (
                <div className="fade-up-2 bg-[#0F172A] rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#5B9BD5] uppercase tracking-widest">Continue Learning</span>
                    <h2 className="text-[18px] md:text-[20px] font-bold text-white mt-1">
                      Mathematics — Fractions
                    </h2>
                    <p className="text-[13px] text-[#64748B] mt-1">Topic 5 of 12 · Lesson 2: Adding Fractions</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 bg-[#1E293B] rounded-full h-1.5 max-w-[160px]">
                        <div className="bg-[#5B9BD5] h-1.5 rounded-full progress-bar" style={{width: '40%'}}/>
                      </div>
                      <span className="text-[12px] text-[#475467]">40% complete</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#5B9BD5] hover:bg-[#4A7DAF] text-white text-[14px] font-bold rounded-xl transition-colors flex-shrink-0">
                    Continue {Icons.arrow}
                  </button>
                </div>
              )}

              {/* University Upload CTA */}
              {isUniversity && (
                <div className="fade-up-2 bg-[#0F172A] rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#5B9BD5] uppercase tracking-widest">Get Started</span>
                    <h2 className="text-[18px] md:text-[20px] font-bold text-white mt-1">
                      Upload your lecture notes
                    </h2>
                    <p className="text-[13px] text-[#64748B] mt-1">We'll break them into micro-lessons and read them aloud for you.</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#5B9BD5] hover:bg-[#4A7DAF] text-white text-[14px] font-bold rounded-xl transition-colors flex-shrink-0">
                    {Icons.upload} Upload PDF
                  </button>
                </div>
              )}

              {/* Subjects Grid */}
              <div className="fade-up-3">
                <h2 className="text-[16px] font-bold text-[#0F172A] mb-4">
                  {isUniversity ? 'My Notes' : 'My Subjects'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {subjects.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setActiveNav('subjects')}
                      className="bg-white border border-[#E4E7EC] rounded-2xl p-5 text-left hover:border-[#5B9BD5] hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                        style={{ background: s.bg, color: s.color }}>
                        {s.icon}
                      </div>
                      <h3 className="text-[15px] font-bold text-[#0F172A]">{s.label}</h3>
                      {!isUniversity && (
                        <>
                          <p className="text-[12px] text-[#94A3B8] mt-1">{s.done} of {s.topics} topics done</p>
                          <div className="mt-3 bg-[#F1F5F9] rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full progress-bar"
                              style={{ width: `${s.progress}%`, background: s.color }}
                            />
                          </div>
                          <p className="text-[11px] mt-1.5 font-semibold" style={{ color: s.color }}>
                            {s.progress}% complete
                          </p>
                        </>
                      )}
                      {isUniversity && (
                        <p className="text-[12px] text-[#94A3B8] mt-1">No notes yet — upload to start</p>
                      )}
                    </button>
                  ))}

                  {/* Add Subject card (secondary only) */}
                  {!isUniversity && (
                    <button className="bg-[#F8FAFC] border-2 border-dashed border-[#E4E7EC] rounded-2xl p-5 text-left hover:border-[#5B9BD5] transition-all flex flex-col items-center justify-center min-h-[160px] gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#5B9BD5]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </div>
                      <p className="text-[13px] font-semibold text-[#475467]">Add Subject</p>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              {!isUniversity && (
                <div className="fade-up-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Topics Done', value: '14', color: '#136299' },
                    { label: 'Days Streak', value: '3', color: '#70AD47' },
                    { label: 'Avg. Score', value: '78%', color: '#F59E0B' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-4 text-center">
                      <p className="text-[22px] font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-[12px] text-[#94A3B8] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {activeNav === 'subjects' && (
            <div className="flex flex-col gap-6">
              <div className="fade-up">
                <h1 className="text-[24px] font-extrabold text-[#0F172A]">
                  {isUniversity ? 'My Notes' : 'My Subjects'}
                </h1>
                <p className="text-[14px] text-[#475467] mt-1">
                  {isUniversity ? 'Upload and manage your lecture notes.' : 'Pick a subject to continue learning.'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 fade-up-2">
                {subjects.map((s) => (
                  <div key={s.key} className="bg-white border border-[#E4E7EC] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: s.bg, color: s.color }}>
                        {s.icon}
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-[#0F172A]">{s.label}</h3>
                        {!isUniversity && (
                          <>
                            <p className="text-[13px] text-[#94A3B8]">{s.done} of {s.topics} topics complete</p>
                            <div className="mt-2 bg-[#F1F5F9] rounded-full h-1.5 w-[200px]">
                              <div className="h-1.5 rounded-full progress-bar"
                                style={{ width: `${s.progress}%`, background: s.color }}/>
                            </div>
                          </>
                        )}
                        {isUniversity && (
                          <p className="text-[13px] text-[#94A3B8]">No notes uploaded yet</p>
                        )}
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[13px] font-bold rounded-xl transition-colors flex-shrink-0">
                      {isUniversity ? <>{Icons.upload} Upload PDF</> : <>Start Lesson {Icons.arrow}</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'progress' && (
            <div className="flex flex-col gap-6">
              <div className="fade-up">
                <h1 className="text-[24px] font-extrabold text-[#0F172A]">My Progress</h1>
                <p className="text-[14px] text-[#475467] mt-1">A calm view of how far you've come.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-up-2">
                {[
                  { label: 'Total Topics Done', value: '14', sub: 'across all subjects', color: '#136299', bg: '#EFF6FF' },
                  { label: 'Learning Streak', value: '3 days', sub: 'keep it going', color: '#70AD47', bg: '#F0FDF4' },
                  { label: 'Average Score', value: '78%', sub: 'across all quizzes', color: '#F59E0B', bg: '#FFFBEB' },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                      <div className="w-4 h-4 rounded-full" style={{ background: s.color }}/>
                    </div>
                    <p className="text-[28px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[14px] font-semibold text-[#0F172A] mt-1">{s.label}</p>
                    <p className="text-[12px] text-[#94A3B8]">{s.sub}</p>
                  </div>
                ))}
              </div>
              {!isUniversity && (
                <div className="fade-up-3 bg-white border border-[#E4E7EC] rounded-2xl p-6">
                  <h2 className="text-[16px] font-bold text-[#0F172A] mb-5">Progress by Subject</h2>
                  <div className="flex flex-col gap-5">
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
          )}

          {activeNav === 'settings' && (
            <div className="flex flex-col gap-6">
              <div className="fade-up">
                <h1 className="text-[24px] font-extrabold text-[#0F172A]">Settings</h1>
                <p className="text-[14px] text-[#475467] mt-1">Manage your account and preferences.</p>
              </div>
              <div className="fade-up-2 bg-white border border-[#E4E7EC] rounded-2xl p-6 flex flex-col gap-5">
                <h2 className="text-[15px] font-bold text-[#0F172A]">Profile</h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#136299] flex items-center justify-center text-white text-[20px] font-bold">
                    {firstName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-[#0F172A]">{profile?.full_name}</p>
                    <p className="text-[13px] text-[#94A3B8]">{profile?.email}</p>
                    <p className="text-[13px] text-[#94A3B8]">{profile?.grade_level} · {profile?.school_name || 'No school set'}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F1F5F9]">
                  <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Accessibility</h3>
                  <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9]">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1E293B]">Focus Mode</p>
                      <p className="text-[12px] text-[#94A3B8]">Hide sidebar for distraction-free learning</p>
                    </div>
                    <button
                      onClick={() => setFocusMode(!focusMode)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${focusMode ? 'bg-[#136299]' : 'bg-[#E4E7EC]'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${focusMode ? 'left-6' : 'left-1'}`}/>
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF1F1] text-[#BA1A1A] text-[14px] font-semibold rounded-xl hover:bg-[#FFE4E4] transition-colors w-fit mt-2"
                >
                  {Icons.logout} Log Out
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}