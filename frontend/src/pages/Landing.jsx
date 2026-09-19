import React, { useState, useEffect } from 'react';
import studentImg from '../assets/images/student-learning.png';
import teacherImg from '../assets/images/teacher-insight.png';
import collaborationImg from '../assets/images/collaboration.png';

const cyclingWords = ["Every Mind", "Every Learner", "Every Classroom", "Every Child"];

// SVG ICONS
const Icons = {
  pace: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  retry: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" x2="18" y1="20" y2="10"/>
      <line x1="12" x2="12" y1="20" y2="4"/>
      <line x1="6" x2="6" y1="20" y2="14"/>
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-3 3"/>
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
    </svg>
  ),
  assignment: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="12" y2="17"/>
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6"/><polyline points="5 8 7 10 11 6"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  logo: (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <circle cx="16" cy="16" r="14" stroke="#136299" strokeWidth="2"/>
      <path d="M8 24 Q12 10 16 16 Q20 22 24 8" stroke="#5B9BD5" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="8" r="2.5" fill="#70AD47"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="#5B9BD5" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <rect x="28" y="4" width="16" height="16" rx="2" opacity="0.4"/>
      <rect x="4" y="28" width="16" height="16" rx="2" opacity="0.4"/>
      <rect x="28" y="28" width="16" height="16" rx="2" opacity="0.2"/>
      <line x1="24" y1="0" x2="24" y2="48" strokeDasharray="4 3" strokeWidth="1.5"/>
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="#5B9BD5" strokeWidth="2">
      <ellipse cx="24" cy="24" rx="20" ry="13"/>
      <circle cx="24" cy="24" r="5"/>
      <line x1="6" y1="6" x2="42" y2="42" stroke="#BA1A1A" strokeWidth="2.5"/>
    </svg>
  ),
  person: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="#5B9BD5" strokeWidth="2">
      <circle cx="24" cy="12" r="7"/>
      <path d="M24 22 L24 36"/>
      <path d="M16 48 Q24 36 32 48" fill="none"/>
      <line x1="24" y1="36" x2="14" y2="44" strokeDasharray="3 2"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  bars: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" x2="18" y1="20" y2="10"/>
      <line x1="12" x2="12" y1="20" y2="4"/>
      <line x1="6" x2="6" y1="20" y2="14"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

export default function Landing() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [flipped, setFlipped] = useState([false, false, false]);

  // Typewriter effect
  useEffect(() => {
    const current = cyclingWords[wordIndex];
    let timeout;
    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setWordIndex(prev => (prev + 1) % cyclingWords.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  const handleFlip = (i) => setFlipped(prev => prev.map((f, idx) => idx === i ? !f : f));

  const problems = [
    { icon: Icons.grid, front: "One size fits no one", back: "Traditional classrooms rely on one-size-fits-all curricula that leave neurodivergent learners struggling despite exceptional individual strengths." },
    { icon: Icons.eyeOff, front: "Teachers are flying blind", back: "Educators face crowded classrooms with no specialized diagnostic tools or real-time insights into cognitive fatigue or comprehension bottlenecks." },
    { icon: Icons.person, front: "Talent gets left behind", back: "Without adaptive scaffolding, talented students experience unnecessary frustration while teachers spend hours without visibility into how each child learns." }
  ];

  const studentFeatures = [
    { icon: Icons.pace, label: "Self-paced micro-lessons" },
    { icon: Icons.voice, label: "Voice-guided explanations" },
    { icon: Icons.retry, label: "Unlimited retries, no shame" },
    { icon: Icons.progress, label: "Progress without pressure" },
  ];

  const teacherFeatures = [
    { icon: Icons.analytics, label: "Real-time learning analytics" },
    { icon: Icons.brain, label: "Cognitive load diagnostics" },
    { icon: Icons.assignment, label: "Differentiated assignments" },
    { icon: Icons.alert, label: "Sensory alert indicators" },
  ];

  return (
    <div className="bg-[#FCFAF9] text-[#1E293B] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }

        .flip-card { perspective: 1000px; height: 240px; }
        .flip-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
          transform-style: preserve-3d;
        }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-front, .flip-back {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; border-radius: 16px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 28px; text-align: center;
        }
        .flip-back { transform: rotateY(180deg); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp 0.5s ease forwards; }
        .a2 { animation: fadeUp 0.5s 0.15s ease both; }
        .a3 { animation: fadeUp 0.5s 0.3s ease both; }
        .a4 { animation: fadeUp 0.5s 0.45s ease both; }

        .bg-dots {
          background-image: radial-gradient(circle, rgba(91,155,213,0.10) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .cursor::after {
          content: '|';
          animation: blink 1s step-end infinite;
          color: #5B9BD5;
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E4E7EC]">
        <div className="h-[60px] max-w-[1200px] mx-auto px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icons.logo}
            <span className="text-[18px] font-bold text-[#136299]">PATHFINDER</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Problem","Solution","Features"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-[14px] font-medium text-[#475467] hover:text-[#136299] transition-colors">{l}</a>
            ))}
            <a href="/signup" className="px-5 py-2 bg-[#136299] text-white text-[14px] font-semibold rounded-lg hover:bg-[#0F4F7A] transition-colors">
              Get Started
            </a>
          </nav>
          {/* Mobile nav */}
          <a href="/signup" className="md:hidden px-4 py-2 bg-[#136299] text-white text-[13px] font-semibold rounded-lg">
            Get Started
          </a>
        </div>
      </header>

      <main className="w-full pt-[60px]">

        {/* HERO */}
        <section className="w-full min-h-[92vh] bg-[#0F172A] bg-dots flex items-center">
          <div className="max-w-[860px] mx-auto px-6 md:px-8 py-20 flex flex-col items-center text-center">
            <div className="a1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E293B] text-[#94A3B8] text-[12px] font-medium mb-8 border border-[#334155]">
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3"><circle cx="8" cy="8" r="6" stroke="#5B9BD5" strokeWidth="1.5"/><polyline points="8 5 8 8 10 9" stroke="#5B9BD5" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Neurodiversity-First Education
            </div>
            <h1 className="a2 text-[44px] md:text-[64px] font-extrabold text-white leading-[1.1] tracking-tight">
              Adaptive Learning<br />
              for <span className="text-[#5B9BD5] cursor">{displayed}</span>
            </h1>
            <p className="a3 text-[16px] md:text-[17px] text-[#94A3B8] mt-6 max-w-[520px] leading-[1.8]">
              Help neurodivergent students learn at their pace. Give teachers real insight into how each child learns across West Africa.
            </p>
            <div className="a4 mt-8">
              <a href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-[#5B9BD5] hover:bg-[#4A7DAF] text-white text-[15px] font-bold rounded-xl transition-colors shadow-lg shadow-[#5B9BD5]/20">
                Get Started {Icons.arrow}
              </a>
            </div>
            <div className="a4 mt-14 grid grid-cols-3 gap-4 md:gap-8 w-full max-w-[560px]">
              {[
                { value: "1 in 6", label: "learners are neurodivergent" },
                { value: ">50:1", label: "pupil-to-teacher ratio" },
                { value: "84%", label: "teachers need adaptive tools" }
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-[24px] md:text-[30px] font-extrabold text-white">{s.value}</div>
                  <div className="text-[11px] md:text-[12px] text-[#64748B] mt-1 leading-[1.4]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section id="problem" className="w-full py-16 md:py-20 bg-white">
          <div className="max-w-[1080px] mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold text-[#7F5600] uppercase tracking-widest">The Problem</span>
              <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] mt-2">
                Why classrooms are failing<br />neurodivergent learners
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {problems.map((p, i) => (
                <div key={i} className="flip-card cursor-pointer" onClick={() => handleFlip(i)}>
                  <div className={`flip-inner ${flipped[i] ? 'flipped' : ''}`}>
                    <div className="flip-front bg-[#F8FAFC] border-2 border-[#5B9BD5]/40 hover:border-[#5B9BD5] transition-colors">
                      {p.icon}
                      <h3 className="text-[17px] font-bold text-[#0F172A] mt-4">{p.front}</h3>
                      <span className="text-[11px] text-[#94A3B8] mt-3 font-medium">tap to learn more</span>
                    </div>
                    <div className="flip-back bg-[#0F172A] border-2 border-[#5B9BD5]/30">
                      <p className="text-[14px] text-[#CBD5E1] leading-[1.8]">{p.back}</p>
                      <span className="text-[11px] text-[#475467] mt-4 font-medium">tap to go back</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        <section className="w-full py-10 bg-[#F8FAFC]">
          <div className="max-w-[1080px] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { img: studentImg, caption: "Student using Pathfinder's adaptive learning pace mode." },
                { img: teacherImg, caption: "Educator reviewing diagnostic markers during a literacy session." }
              ].map((item, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-[#E4E7EC]">
                  <img src={item.img} alt={item.caption} className="w-full h-[240px] md:h-[280px] object-cover"/>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A]/90 to-transparent p-4">
                    <p className="text-[13px] text-white font-medium">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section id="solution" className="w-full py-16 md:py-20 bg-white">
          <div className="max-w-[800px] mx-auto px-6 md:px-8">
            <div className="text-center mb-10">
              <span className="text-[11px] font-bold text-[#7F5600] uppercase tracking-widest">How It Works</span>
              <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] mt-2">
                Built for two sides<br />of the classroom
              </h2>
            </div>
            <div className="flex items-center justify-center gap-3 mb-8">
              {[
                { key: 'students', label: 'For Students' },
                { key: 'teachers', label: 'For Teachers' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2.5 rounded-lg text-[14px] font-semibold transition-all border ${
                    activeTab === tab.key
                      ? 'bg-[#136299] text-white border-[#136299]'
                      : 'bg-white text-[#475467] border-[#E4E7EC] hover:border-[#136299] hover:text-[#136299]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-2xl p-6 md:p-8">
              {activeTab === 'students' ? (
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F172A] mb-1">Calm, self-regulated micro learning</h3>
                  <p className="text-[14px] text-[#475467] mb-6">Learning that meets every student where they are — no pressure, no shame.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studentFeatures.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white border border-[#E4E7EC] rounded-xl p-4">
                        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#136299] flex-shrink-0">
                          {f.icon}
                        </div>
                        <span className="text-[14px] font-semibold text-[#1E293B]">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-[20px] font-bold text-[#0F172A] mb-1">Cognitive visibility and class scaffolding</h3>
                  <p className="text-[14px] text-[#475467] mb-6">Real data. Real insight. Real classroom impact — without extra work.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teacherFeatures.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white border border-[#E4E7EC] rounded-xl p-4">
                        <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#336b07] flex-shrink-0">
                          {f.icon}
                        </div>
                        <span className="text-[14px] font-semibold text-[#1E293B]">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES BENTO */}
        <section id="features" className="w-full py-16 md:py-20 bg-[#0F172A]">
          <div className="max-w-[1080px] mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold text-[#5B9BD5] uppercase tracking-widest">Key Features</span>
              <h2 className="text-[28px] md:text-[36px] font-extrabold text-white mt-2">Everything a classroom needs</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Large card */}
              <div className="col-span-2 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 md:p-8">
                <div className="w-12 h-12 rounded-xl bg-[#5B9BD5]/10 flex items-center justify-center text-[#5B9BD5] mb-5">
                  {Icons.clock}
                </div>
                <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest">Pacing Engine</span>
                <h3 className="text-[18px] md:text-[20px] font-bold text-white mt-1 mb-2">Adaptive Pacing</h3>
                <p className="text-[13px] md:text-[14px] text-[#64748B] leading-[1.7]">
                  Dynamically modulates lesson complexity and rhythm based on student interaction speeds and attention signals in real time.
                </p>
              </div>
              {/* Calm UI */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 md:p-6">
                <div className="w-10 h-10 rounded-xl bg-[#70AD47]/10 flex items-center justify-center text-[#70AD47] mb-4">
                  {Icons.shield}
                </div>
                <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest">Sensory</span>
                <h3 className="text-[15px] md:text-[16px] font-bold text-white mt-1 mb-2">Calm UI</h3>
                <p className="text-[12px] md:text-[13px] text-[#64748B] leading-[1.6]">Zero cognitive overload. High contrast, muted tones, distraction-free layout.</p>
              </div>
              {/* Telemetry */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 md:p-6">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] mb-4">
                  {Icons.bars}
                </div>
                <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest">Visibility</span>
                <h3 className="text-[15px] md:text-[16px] font-bold text-white mt-1 mb-2">Teacher Telemetry</h3>
                <p className="text-[12px] md:text-[13px] text-[#64748B] leading-[1.6]">Live diagnostic insight into comprehension without interrupting class flow.</p>
              </div>
              {/* Image card */}
              <div className="col-span-2 relative overflow-hidden rounded-2xl border border-[#334155] min-h-[200px]">
                <img src={collaborationImg} alt="Collaboration" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent p-5 md:p-6 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-[#5B9BD5] uppercase tracking-widest">Curriculum</span>
                  <h3 className="text-[16px] md:text-[18px] font-bold text-white mt-1">Aligned to Nigerian Standards</h3>
                  <p className="text-[12px] md:text-[13px] text-[#94A3B8] mt-1">Built for WAEC and Nigerian curriculum benchmarks.</p>
                </div>
              </div>
              {/* Nigeria */}
              <div className="col-span-2 bg-[#5B9BD5]/10 border border-[#5B9BD5]/20 rounded-2xl p-5 md:p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#5B9BD5]/10 flex items-center justify-center text-[#5B9BD5] mb-4">
                    {Icons.book}
                  </div>
                  <span className="text-[10px] font-bold text-[#5B9BD5] uppercase tracking-widest">Accessibility</span>
                  <h3 className="text-[18px] md:text-[20px] font-bold text-white mt-1 mb-2">Built for Nigeria</h3>
                  <p className="text-[13px] md:text-[14px] text-[#64748B] leading-[1.7]">
                    Low-bandwidth architecture. Works across 2G/3G networks. No expensive hardware required.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[#70AD47]">
                  {Icons.check}
                  <span className="text-[13px] font-semibold">WCAG 2.1 AAA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="w-full py-20 md:py-24 bg-white">
          <div className="max-w-[640px] mx-auto px-6 md:px-8 text-center">
            <span className="text-[11px] font-bold text-[#7F5600] uppercase tracking-widest">Get Started</span>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#0F172A] mt-2 leading-[1.2]">
              Every child deserves a<br />
              <span className="text-[#5B9BD5]">path to learning.</span>
            </h2>
            <p className="text-[15px] md:text-[16px] text-[#475467] mt-4 mb-10 leading-[1.8]">
              Join students and teachers building inclusive classrooms across West Africa.
            </p>
            <a href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[15px] font-bold rounded-xl transition-colors shadow-lg shadow-[#136299]/20">
              Get Started Now {Icons.arrow}
            </a>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {["No hardware required", "Built for Nigerian schools", "Free to start"].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[#70AD47]">
                  {Icons.check}
                  <span className="text-[13px] text-[#475467] font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#0B0F1A] border-t border-[#1E293B]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {Icons.logo}
                <span className="text-[16px] font-bold text-white">PATHFINDER</span>
              </div>
              <p className="text-[13px] text-[#475467] leading-[1.7]">
                Adaptive learning platform built for neurodivergent students in Nigeria and West Africa.
              </p>
            </div>
            <div>
              <h4 className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Platform</h4>
              <ul className="flex flex-col gap-3">
                {["Problem", "Solution", "Features", "Get Started"].map(l => (
                  <li key={l}>
                    <a href={`#${l.toLowerCase().replace(' ', '')}`} className="text-[14px] text-[#475467] hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[12px] text-[#334155]">© 2026 PATHFINDER. All rights reserved.</p>
            <p className="text-[12px] text-[#334155]">WCAG 2.1 AAA Compliant</p>
          </div>
        </div>
      </footer>

    </div>
  );
}