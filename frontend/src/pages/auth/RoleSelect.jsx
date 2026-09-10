import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <circle cx="16" cy="16" r="14" stroke="#136299" strokeWidth="2"/>
      <path d="M8 24 Q12 10 16 16 Q20 22 24 8" stroke="#5B9BD5" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="8" r="2.5" fill="#70AD47"/>
    </svg>
    <span className="text-[18px] font-bold text-[#136299]">PATHFINDER</span>
  </div>
);

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCFAF9] flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>

      {/* Nav */}
      <header className="w-full border-b border-[#E4E7EC] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center">
          <Logo />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold text-[#7F5600] uppercase tracking-widest">Get Started</span>
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#0F172A] mt-2">
            Who are you joining as?
          </h1>
          <p className="text-[15px] text-[#475467] mt-3 max-w-[400px] mx-auto leading-[1.7]">
            Choose your role to get the right experience for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[640px]">
          {/* Student Card */}
          <button
            onClick={() => navigate('/signup/student')}
            className="group bg-white border-2 border-[#E4E7EC] hover:border-[#5B9BD5] rounded-2xl p-8 text-left transition-all hover:shadow-lg hover:shadow-[#5B9BD5]/10"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-5 group-hover:bg-[#5B9BD5]/10 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#136299]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-2">I'm a Student</h2>
            <p className="text-[14px] text-[#475467] leading-[1.6]">
              Learn at your own pace with adaptive lessons designed for your unique mind.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[#136299]">
              <span className="text-[13px] font-semibold">Get started</span>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </div>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => navigate('/signup/teacher')}
            className="group bg-white border-2 border-[#E4E7EC] hover:border-[#70AD47] rounded-2xl p-8 text-left transition-all hover:shadow-lg hover:shadow-[#70AD47]/10"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mb-5 group-hover:bg-[#70AD47]/10 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#336b07]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-2">I'm a Teacher</h2>
            <p className="text-[14px] text-[#475467] leading-[1.6]">
              Get real insight into how each student learns and support every mind in your class.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[#336b07]">
              <span className="text-[13px] font-semibold">Get started</span>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </div>
          </button>
        </div>

        <p className="mt-8 text-[14px] text-[#475467]">
          Already have an account?{' '}
          <a href="/login" className="text-[#136299] font-semibold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}