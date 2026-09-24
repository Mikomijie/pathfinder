import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Home from './home/Home';
import Subjects from './subjects/Subjects';
import Progress from './progress/Progress';
import FlashcardsHome from './flashcards/FlashcardsHome';
import PDFUpload from './upload/PDFUpload';
import SkillsHub from './skills/SkillsHub';

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
  flashcards: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
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
  skills: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
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
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('home');
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error || !data) {
        setProfileError(true);
      } else {
        setProfile(data);
        // Sync voice speed from profile to localStorage
        if (data?.voice_speed) {
          localStorage.setItem('pathfinder_voice_speed', data.voice_speed.toString());
        }
      }
    } catch (err) {
      console.error(err);
      setProfileError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isUniversity = profile?.student_level === 'university';

  const navItems = [
    { key: 'home', label: 'Home', icon: Icons.home },
    { key: 'subjects', label: 'My Subjects', icon: Icons.subjects },
    { key: 'flashcards', label: 'Flashcards', icon: Icons.flashcards },
    ...(isUniversity ? [
      { key: 'upload', label: 'Upload Notes', icon: Icons.upload },
      { key: 'skills', label: 'Skills Hub', icon: Icons.skills },
    ] : []),
    { key: 'progress', label: 'Progress', icon: Icons.progress },
    { key: 'settings', label: 'Settings', icon: Icons.settings },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case 'home': return <Home profile={profile} onNavigate={setActiveNav} />;
      case 'subjects': return <Subjects profile={profile} onNavigate={setActiveNav} />;
      case 'flashcards': return <FlashcardsHome profile={profile} />;
      case 'upload': return <PDFUpload profile={profile} />;
      case 'skills': return <SkillsHub />;
      case 'progress': return <Progress profile={profile} />;
      case 'settings': return (
        <Settings
          profile={profile}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          onLogout={handleLogout}
        />
      );
      default: return <Home profile={profile} onNavigate={setActiveNav} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF9] flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div className="flex flex-col items-center gap-3">
          {Icons.logo}
          <p className="text-[14px] text-[#475467]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-[#FCFAF9] flex items-center justify-center px-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}</style>
        <div className="text-center max-w-[380px]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF1F1] flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#BA1A1A]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-[20px] font-extrabold text-[#0F172A] mb-2">Could not load your profile</h2>
          <p className="text-[14px] text-[#475467] leading-[1.7] mb-6">
            There was a problem loading your account. This can happen if your profile is still being set up. Please try again.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setProfileError(false); setLoading(true); fetchProfile(); }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[14px] font-bold rounded-xl transition-colors">
              {Icons.refresh} Try Again
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white border border-[#E4E7EC] hover:border-[#136299] text-[#475467] text-[14px] font-semibold rounded-xl transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}/>
      )}

      {!focusMode && (
        <aside className={`
          fixed md:sticky top-0 left-0 h-screen w-[240px] bg-white border-r border-[#E4E7EC]
          flex flex-col z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="h-[60px] flex items-center gap-2 px-5 border-b border-[#E4E7EC]">
            {Icons.logo}
            <span className="text-[16px] font-bold text-[#136299]">PATHFINDER</span>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
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

          <div className="px-3 py-4 border-t border-[#E4E7EC] flex flex-col gap-1">
            <button
              onClick={() => setFocusMode(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#475467] hover:bg-[#F8FAFC] transition-all w-full text-left">
              <span className="text-[#94A3B8]">{Icons.focus}</span>
              Focus Mode
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#BA1A1A] hover:bg-[#FFF1F1] transition-all w-full text-left">
              {Icons.logout} Log Out
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-[60px] bg-white border-b border-[#E4E7EC] flex items-center justify-between px-5 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {!focusMode && (
              <button className="md:hidden text-[#475467]" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {Icons.menu}
              </button>
            )}
            <p className="text-[13px] text-[#94A3B8] truncate max-w-[160px] md:max-w-none">
              {profile?.grade_level && `${profile.grade_level} · `}{profile?.school_name || 'Pathfinder'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {focusMode && (
              <button
                onClick={() => setFocusMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg text-[13px] font-medium text-[#475467] hover:border-[#5B9BD5] transition-colors">
                {Icons.close} Exit Focus
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-[#136299] flex items-center justify-center text-white text-[13px] font-bold">
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 md:px-8 py-6 md:py-8 w-full max-w-[1100px] mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function Settings({ profile, focusMode, setFocusMode, onLogout }) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Read from profile first, fall back to localStorage
  const savedSpeed = profile?.voice_speed
    || parseFloat(localStorage.getItem('pathfinder_voice_speed') || '0.75');
  const [voiceSpeed, setVoiceSpeedState] = useState(savedSpeed);

  const handleVoiceSpeed = async (speed) => {
    setVoiceSpeedState(speed);
    localStorage.setItem('pathfinder_voice_speed', speed.toString());
    // Save to Supabase so it syncs across devices
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles')
          .update({ voice_speed: speed })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">Settings</h1>
        <p className="text-[14px] text-[#475467] mt-1">Manage your account and preferences.</p>
      </div>

      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-6 flex flex-col gap-5">
        <h2 className="text-[15px] font-bold text-[#0F172A]">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#136299] flex items-center justify-center text-white text-[20px] font-bold flex-shrink-0">
            {firstName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-[#0F172A] truncate">{profile?.full_name}</p>
            <p className="text-[13px] text-[#94A3B8] truncate">{profile?.email}</p>
            <p className="text-[13px] text-[#94A3B8]">
              {profile?.grade_level} · {profile?.school_name || 'No school set'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F1F5F9]">
          <h3 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Accessibility</h3>

          <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9]">
            <div>
              <p className="text-[14px] font-semibold text-[#1E293B]">Focus Mode</p>
              <p className="text-[12px] text-[#94A3B8]">Hide sidebar for distraction-free learning</p>
            </div>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${focusMode ? 'bg-[#136299]' : 'bg-[#E4E7EC]'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${focusMode ? 'left-6' : 'left-1'}`}/>
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-[14px] font-semibold text-[#1E293B]">Voice Speed</p>
              <p className="text-[12px] text-[#94A3B8]">Syncs across all your devices</p>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: 'Slow', value: 0.5 },
                { label: 'Normal', value: 0.75 },
                { label: 'Fast', value: 1 },
              ].map(s => (
                <button key={s.value}
                  onClick={() => handleVoiceSpeed(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                    voiceSpeed === s.value
                      ? 'bg-[#136299] text-white border-[#136299]'
                      : 'bg-white text-[#475467] border-[#E4E7EC] hover:border-[#136299]'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF1F1] text-[#BA1A1A] text-[14px] font-semibold rounded-xl hover:bg-[#FFE4E4] transition-colors w-fit mt-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
}