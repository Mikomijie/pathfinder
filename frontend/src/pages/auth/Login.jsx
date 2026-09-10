import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

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

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw signInError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role === 'teacher') {
        navigate('/dashboard/teacher');
      } else {
        navigate('/dashboard/student');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF9] flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>

      <header className="w-full border-b border-[#E4E7EC] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center">
          <Logo />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#136299]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#7F5600] uppercase tracking-widest">Welcome Back</span>
            <h1 className="text-[28px] font-extrabold text-[#0F172A] mt-1">Log in to Pathfinder</h1>
            <p className="text-[14px] text-[#475467] mt-2">Continue your learning journey.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-[#FFF1F1] border border-[#FFCDD2] rounded-xl text-[13px] text-[#BA1A1A] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#1E293B]">Password</label>
               <button type="button" className="text-[12px] text-[#136299] hover:underline font-medium">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475467] transition-colors"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#136299] hover:bg-[#0F4F7A] disabled:bg-[#94A3B8] text-white text-[15px] font-bold rounded-xl transition-colors mt-2"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-[#475467]">
            Don't have an account?{' '}
            <a href="/signup" className="text-[#136299] font-semibold hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}