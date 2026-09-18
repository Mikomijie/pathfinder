import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const secondarySubjects = [
  "Mathematics", "English Language", "Basic Science", "Biology",
  "Chemistry", "Physics", "Geography", "History", "Economics",
  "Government", "Literature", "Agricultural Science", "Computer Science"
];

const secondaryGrades = [
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"
];

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PATH-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function TeacherSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    school_name: '',
    class_level: '',
    grade_level: '',
    subject: '',
    class_name: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        role: 'teacher',
        school_name: form.school_name,
      });

      if (profileError) throw profileError;

      const classCode = generateCode();
      const { error: classError } = await supabase.from('classes').insert({
        teacher_id: data.user.id,
        name: form.class_name || `${form.subject} — ${form.grade_level || form.class_level}`,
        code: classCode,
        subject: form.subject,
        level: form.grade_level || form.class_level,
      });

      if (classError) throw classError;

      // Check if session exists — if not, email confirmation is required
      if (data.session) {
        navigate('/dashboard/teacher');
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // EMAIL CONFIRMATION SCREEN
  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#FCFAF9] flex flex-col items-center justify-center px-6">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div className="w-full max-w-[400px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#70AD47]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="text-[24px] font-extrabold text-[#0F172A] mb-2">Check your email</h1>
          <p className="text-[14px] text-[#475467] leading-[1.7] mb-6">
            We sent a confirmation link to <span className="font-semibold text-[#0F172A]">{form.email}</span>. Click the link to activate your account then come back and log in.
          </p>
          <Link to="/login"
            className="block w-full py-3.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[15px] font-bold rounded-xl transition-colors text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF9] flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>

      <header className="w-full border-b border-[#E4E7EC] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <Logo />
          <button
            onClick={() => step === 2 ? setStep(1) : navigate('/signup')}
            className="flex items-center gap-1.5 text-[14px] text-[#475467] hover:text-[#136299] transition-colors font-medium"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M13 8H3M7 4l-4 4 4 4"/>
            </svg>
            Back
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">

          <div className="flex items-center gap-2 mb-8 justify-center">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                  step >= s ? 'bg-[#136299] text-white' : 'bg-[#E4E7EC] text-[#94A3B8]'
                }`}>
                  {s}
                </div>
                {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#136299]' : 'bg-[#E4E7EC]'}`}/>}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#336b07]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="text-[11px] font-bold text-[#7F5600] uppercase tracking-widest">Teacher Signup</span>
            <h1 className="text-[28px] font-extrabold text-[#0F172A] mt-1">
              {step === 1 ? 'Create your account' : 'Set up your first class'}
            </h1>
            <p className="text-[14px] text-[#475467] mt-2">
              {step === 1
                ? 'Get real insight into how each student learns.'
                : 'Your students will use a class code to join.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-[#FFF1F1] border border-[#FFCDD2] rounded-xl text-[13px] text-[#BA1A1A] font-medium">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Full Name</label>
                <input name="full_name" type="text" required
                  placeholder="Your full name"
                  value={form.full_name} onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Email Address</label>
                <input name="email" type="email" required
                  placeholder="your@email.com"
                  value={form.email} onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Password</label>
                <div className="relative">
                  <input name="password"
                    type={showPassword ? 'text' : 'password'}
                    required placeholder="At least 6 characters"
                    value={form.password} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475467] transition-colors">
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
                {form.password.length > 0 && form.password.length < 6 && (
                  <p className="text-[12px] text-[#BA1A1A] mt-1.5">Password must be at least 6 characters.</p>
                )}
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">
                  School Name <span className="text-[#94A3B8] font-normal">(optional)</span>
                </label>
                <input name="school_name" type="text"
                  placeholder="Your school or institution"
                  value={form.school_name} onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all"
                />
              </div>

              <button type="submit"
                className="w-full py-3.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[15px] font-bold rounded-xl transition-colors mt-2">
                Continue
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#1E293B] block mb-2">What level do you teach?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: 'secondary',
                      label: 'Primary / Secondary',
                      desc: 'Primary — SSS 3',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                      )
                    },
                    {
                      key: 'university',
                      label: 'University',
                      desc: '100L — Postgraduate',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      )
                    }
                  ].map(level => (
                    <button key={level.key} type="button"
                      onClick={() => setForm({ ...form, class_level: level.key, grade_level: '', subject: '' })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.class_level === level.key
                          ? 'border-[#5B9BD5] bg-[#EFF6FF]'
                          : 'border-[#E4E7EC] bg-white hover:border-[#5B9BD5]/50'
                      }`}>
                      <div className={`mb-2 ${form.class_level === level.key ? 'text-[#136299]' : 'text-[#475467]'}`}>
                        {level.icon}
                      </div>
                      <p className="text-[13px] font-bold text-[#0F172A]">{level.label}</p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {form.class_level === 'secondary' && (
                <div>
                  <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Specific Class</label>
                  <select name="grade_level" required value={form.grade_level} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all appearance-none">
                    <option value="">Select class</option>
                    {secondaryGrades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}

              {form.class_level === 'university' && (
                <div>
                  <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Course / Department</label>
                  <input name="grade_level" type="text" required
                    placeholder="e.g. Computer Science 300L"
                    value={form.grade_level} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all"
                  />
                </div>
              )}

              {form.class_level && (
                <div>
                  <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Subject You Teach</label>
                  {form.class_level === 'university' ? (
                    <input name="subject" type="text" required
                      placeholder="e.g. Organic Chemistry, Data Structures"
                      value={form.subject} onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all"
                    />
                  ) : (
                    <select name="subject" required value={form.subject} onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all appearance-none">
                      <option value="">Select subject</option>
                      {secondarySubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
              )}

              {form.class_level && (
                <div>
                  <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">
                    Class Name <span className="text-[#94A3B8] font-normal">(optional)</span>
                  </label>
                  <input name="class_name" type="text"
                    placeholder={form.class_level === 'university' ? 'e.g. CSC 301 Morning Class' : 'e.g. JSS 2A Mathematics'}
                    value={form.class_name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] focus:ring-2 focus:ring-[#5B9BD5]/10 transition-all"
                  />
                </div>
              )}

              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                <p className="text-[12px] font-bold text-[#336b07] uppercase tracking-widest mb-1">What happens next</p>
                <p className="text-[13px] text-[#1E293B] leading-[1.6]">
                  After signup you will get a unique class code to share with your students. They use it to join your class and access your materials.
                </p>
              </div>

              <button type="submit"
                disabled={loading || !form.class_level || !form.subject}
                className="w-full py-3.5 bg-[#136299] hover:bg-[#0F4F7A] disabled:bg-[#94A3B8] text-white text-[15px] font-bold rounded-xl transition-colors mt-2">
                {loading ? 'Creating account...' : 'Create Account & Class'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-[14px] text-[#475467]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#136299] font-semibold hover:underline">Log in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}