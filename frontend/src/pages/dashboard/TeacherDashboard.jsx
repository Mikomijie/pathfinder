import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

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
  classes: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  students: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
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
  copy: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
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
  file: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
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
  pdf: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  paste: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PATH-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewingClass, setViewingClass] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClassForm, setNewClassForm] = useState({ name: '', subject: '', level: '' });
  const [creatingClass, setCreatingClass] = useState(false);
  const [classError, setClassError] = useState('');

  const [uploadMode, setUploadMode] = useState('pdf');
  const [uploadClassId, setUploadClassId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadStep, setUploadStep] = useState('');
  const [uploadedLessons, setUploadedLessons] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: profileData, error: profileErr } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      if (profileErr) throw profileErr;
      setProfile(profileData);

      const { data: classesData, error: classesErr } = await supabase
        .from('classes').select('*').eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      if (classesErr) throw classesErr;
      setClasses(classesData || []);

      if (classesData && classesData.length > 0) {
        setSelectedClass(prev => prev || classesData[0]);
        const classIds = classesData.map(c => c.id);

        const { data: membersData } = await supabase
          .from('class_members')
          .select('*, profiles(full_name, email, grade_level, student_level)')
          .in('class_id', classIds);
        setStudents(membersData || []);

        // Fetch student progress for all students
        const studentIds = (membersData || []).map(m => m.student_id);
        if (studentIds.length > 0) {
          const { data: progressData } = await supabase
            .from('student_progress')
            .select('student_id, completed, score, is_stuck, last_studied_at, topic_id, topics(title, subject)')
            .in('student_id', studentIds);
          setStudentProgress(progressData || []);
        }

        const { data: materialsData } = await supabase
          .from('class_materials').select('*').in('class_id', classIds)
          .order('created_at', { ascending: false });
        setMaterials(materialsData || []);
      }
    } catch (err) {
      console.error(err);
      setFetchError('Could not load your dashboard. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAll();

    // Realtime — refresh when a student joins any class
    const channel = supabase
      .channel('class-members-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'class_members'
      }, () => { fetchAll(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setUploadError('Please select a PDF file.'); return; }
    if (file.size > 15 * 1024 * 1024) { setUploadError('File too large. Maximum 15MB.'); return; }
    setUploadFile(file);
    setUploadError('');
    if (!uploadTitle) setUploadTitle(file.name.replace('.pdf', ''));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadClassId) { setUploadError('Please select a class.'); return; }
    if (!uploadTitle.trim()) { setUploadError('Please enter a title.'); return; }
    if (uploadMode === 'pdf' && !uploadFile) { setUploadError('Please select a PDF file.'); return; }
    if (uploadMode === 'paste' && !pasteText.trim()) { setUploadError('Please paste your notes.'); return; }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadedLessons([]);

    try {
      const selectedClassData = classes.find(c => c.id === uploadClassId);
      const gradeLevel = selectedClassData?.level || 'Secondary';

      let payload = { topicTitle: uploadTitle.trim(), classId: uploadClassId, gradeLevel };

      if (uploadMode === 'pdf') {
        setUploadStep('Reading PDF...');
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => { resolve(reader.result.split(',')[1]); };
          reader.onerror = () => reject(new Error('Could not read file'));
          reader.readAsDataURL(uploadFile);
        });
        payload.pdfBase64 = base64;
      } else {
        payload.pasteText = pasteText.trim();
      }

      setUploadStep('AI is creating lessons from your content...');

      let data, error;
      const result1 = await supabase.functions.invoke('process-pdf', { body: payload });
      if (result1.error) {
        console.log('First attempt failed, retrying...');
        setUploadStep('Retrying...');
        await new Promise(r => setTimeout(r, 3000));
        const result2 = await supabase.functions.invoke('process-pdf', { body: payload });
        data = result2.data;
        error = result2.error;
      } else {
        data = result1.data;
        error = result1.error;
      }

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Upload failed');

      await supabase.from('class_materials').insert({
        class_id: uploadClassId,
        title: uploadTitle.trim(),
        description: `${data.totalParts} lesson${data.totalParts !== 1 ? 's' : ''} created from uploaded content`,
      });

      setUploadSuccess(`${data.message}. Students in this class can now study them.`);
      setUploadedLessons(data.lessons || []);
      setUploadTitle('');
      setUploadFile(null);
      setPasteText('');
      setUploadClassId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchAll();
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadStep('');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Delete this material? This cannot be undone.')) return;
    try {
      await supabase.from('class_materials').delete().eq('id', materialId);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this class? All students will be removed. This cannot be undone.')) return;
    try {
      await supabase.from('class_members').delete().eq('class_id', classId);
      await supabase.from('classes').delete().eq('id', classId);
      setViewingClass(null);
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setCreatingClass(true);
    setClassError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const code = generateCode();
      const { error } = await supabase.from('classes').insert({
        teacher_id: user.id,
        name: newClassForm.name,
        subject: newClassForm.subject,
        level: newClassForm.level,
        code,
      });
      if (error) throw error;
      setShowNewClass(false);
      setNewClassForm({ name: '', subject: '', level: '' });
      fetchAll();
    } catch (err) {
      console.error(err);
      setClassError('Could not create class. Please try again.');
    } finally {
      setCreatingClass(false);
    }
  };

  // Get progress summary for a student
  const getStudentStats = (studentId) => {
    const progress = studentProgress.filter(p => p.student_id === studentId);
    const completed = progress.filter(p => p.completed).length;
    const scores = progress.filter(p => p.score > 0).map(p => p.score);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const isStuck = progress.some(p => p.is_stuck);
    const lastStudied = progress
      .filter(p => p.last_studied_at)
      .sort((a, b) => new Date(b.last_studied_at).getTime() - new Date(a.last_studied_at).getTime())[0];
    const lastTopic = lastStudied?.topics?.title || null;
    return { completed, avgScore, isStuck, lastTopic };
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const navItems = [
    { key: 'home', label: 'Home', icon: Icons.home },
    { key: 'classes', label: 'My Classes', icon: Icons.classes },
    { key: 'upload', label: 'Upload Materials', icon: Icons.upload },
    { key: 'students', label: 'Students', icon: Icons.students },
    { key: 'settings', label: 'Settings', icon: Icons.settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF9] flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div className="flex flex-col items-center gap-3">
          {Icons.logo}
          <p className="text-[14px] text-[#475467]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#FCFAF9] flex items-center justify-center px-6">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div className="text-center max-w-[360px]">
          <p className="text-[16px] font-bold text-[#0F172A] mb-2">Something went wrong</p>
          <p className="text-[14px] text-[#475467] mb-5">{fetchError}</p>
          <button onClick={() => { setFetchError(''); setLoading(true); fetchAll(); }}
            className="px-6 py-2.5 bg-[#136299] text-white text-[13px] font-bold rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        .f4 { animation: fadeUp 0.4s 0.24s ease both; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-[240px] bg-white border-r border-[#E4E7EC]
        flex flex-col z-40 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-[60px] flex items-center gap-2 px-5 border-b border-[#E4E7EC] flex-shrink-0">
          {Icons.logo}
          <span className="text-[16px] font-bold text-[#136299]">PATHFINDER</span>
        </div>
        <div className="px-4 py-3 border-b border-[#E4E7EC] flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F0FDF4] rounded-xl">
            <div className="w-6 h-6 rounded-full bg-[#336b07] flex items-center justify-center text-white text-[11px] font-bold">T</div>
            <span className="text-[12px] font-semibold text-[#336b07]">Teacher Account</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.key}
              onClick={() => { setActiveNav(item.key); setViewingClass(null); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all w-full text-left ${
                activeNav === item.key
                  ? 'bg-[#F0FDF4] text-[#336b07] font-semibold'
                  : 'text-[#475467] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
              }`}>
              <span className={activeNav === item.key ? 'text-[#336b07]' : 'text-[#94A3B8]'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-[#E4E7EC] flex-shrink-0">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#BA1A1A] hover:bg-[#FFF1F1] transition-all w-full text-left">
            {Icons.logout} Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-[60px] bg-white border-b border-[#E4E7EC] flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#475467] p-1" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {Icons.menu}
            </button>
            <p className="text-[13px] text-[#94A3B8] truncate max-w-[160px] md:max-w-none">
              {profile?.school_name || 'Pathfinder'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#336b07] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
            {firstName[0]?.toUpperCase()}
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 w-full max-w-[1100px] mx-auto">

          {/* HOME */}
          {activeNav === 'home' && (
            <div className="flex flex-col gap-5">
              <div className="f1">
                <h1 className="text-[24px] md:text-[30px] font-extrabold text-[#0F172A]">Welcome, {firstName}.</h1>
                <p className="text-[14px] text-[#475467] mt-1">Here is what is happening across your classes today.</p>
              </div>

              {classes.length > 0 ? (
                <div className="f2 flex flex-col gap-3">
                  <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Your Class Codes</p>
                  {classes.map((c, i) => (
                    <div key={i} className="bg-[#1A3A2A] rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-[#70AD47] uppercase tracking-widest mb-1">{c.name}</p>
                          <h2 className="text-[28px] font-extrabold text-white tracking-widest">{c.code}</h2>
                          <p className="text-[12px] text-white/50 mt-1">
                            {students.filter(s => s.class_id === c.id).length} students joined
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => copyCode(c.code)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#70AD47] hover:bg-[#336b07] text-white text-[13px] font-bold rounded-xl transition-colors">
                            {copiedCode === c.code ? Icons.check : Icons.copy}
                            {copiedCode === c.code ? 'Copied!' : 'Copy'}
                          </button>
                          <button onClick={() => { setActiveNav('classes'); setViewingClass(c); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold rounded-xl transition-colors">
                            View {Icons.arrow}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="f2 bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-8 text-center">
                  <p className="text-[15px] font-bold text-[#0F172A] mb-2">No classes yet</p>
                  <p className="text-[13px] text-[#475467] mb-4">Create your first class to get a code to share with students.</p>
                  <button onClick={() => setActiveNav('classes')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#336b07] text-white text-[13px] font-bold rounded-xl mx-auto">
                    {Icons.plus} Create First Class
                  </button>
                </div>
              )}

              <div className="f3 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Students', value: students.length.toString(), color: '#136299', bg: '#EFF6FF' },
                  { label: 'Materials', value: materials.length.toString(), color: '#70AD47', bg: '#F0FDF4' },
                  { label: 'Classes', value: classes.length.toString(), color: '#F59E0B', bg: '#FFFBEB' },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-4">
                    <p className="text-[24px] md:text-[28px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] md:text-[13px] font-semibold text-[#0F172A] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="f4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-bold text-[#0F172A]">Recent Materials</h2>
                  <button onClick={() => setActiveNav('upload')}
                    className="flex items-center gap-1.5 text-[13px] text-[#336b07] font-semibold hover:underline">
                    {Icons.plus} Add new
                  </button>
                </div>
                {materials.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-3 text-[#336b07]">{Icons.upload}</div>
                    <p className="text-[14px] font-semibold text-[#0F172A]">No materials uploaded yet</p>
                    <button onClick={() => setActiveNav('upload')}
                      className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#336b07] text-white text-[13px] font-bold rounded-xl mx-auto">
                      Upload Material {Icons.arrow}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {materials.slice(0, 5).map((m, i) => (
                      <div key={i} className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#336b07] flex-shrink-0">{Icons.file}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#0F172A] truncate">{m.title}</p>
                          <p className="text-[12px] text-[#94A3B8]">{m.description || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-[#94A3B8]">{new Date(m.created_at).toLocaleDateString()}</span>
                          <button onClick={() => handleDeleteMaterial(m.id)} className="text-[#94A3B8] hover:text-[#BA1A1A] p-1">{Icons.trash}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY CLASSES */}
          {activeNav === 'classes' && !viewingClass && (
            <div className="flex flex-col gap-5">
              <div className="f1 flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-[22px] md:text-[24px] font-extrabold text-[#0F172A]">My Classes</h1>
                  <p className="text-[14px] text-[#475467] mt-1">Click any class to view its details.</p>
                </div>
                <button onClick={() => setShowNewClass(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#336b07] hover:bg-[#245005] text-white text-[13px] font-bold rounded-xl flex-shrink-0">
                  {Icons.plus} New
                </button>
              </div>

              {classError && <div className="p-4 bg-[#FFF1F1] border border-[#FFCDD2] rounded-xl text-[13px] text-[#BA1A1A]">{classError}</div>}

              {showNewClass && (
                <div className="f1 bg-white border border-[#E4E7EC] rounded-2xl p-5">
                  <h3 className="text-[16px] font-bold text-[#0F172A] mb-4">Create New Class</h3>
                  <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
                    <div>
                      <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Class Name</label>
                      <input type="text" required placeholder="e.g. JSS 2B Mathematics"
                        value={newClassForm.name}
                        onChange={e => setNewClassForm({ ...newClassForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] focus:outline-none focus:border-[#70AD47]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Subject</label>
                        <input type="text" required placeholder="e.g. Mathematics"
                          value={newClassForm.subject}
                          onChange={e => setNewClassForm({ ...newClassForm, subject: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] focus:outline-none focus:border-[#70AD47]"/>
                      </div>
                      <div>
                        <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Level</label>
                        <input type="text" required placeholder="e.g. JSS 2"
                          value={newClassForm.level}
                          onChange={e => setNewClassForm({ ...newClassForm, level: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] focus:outline-none focus:border-[#70AD47]"/>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={creatingClass}
                        className="px-6 py-2.5 bg-[#336b07] disabled:bg-[#94A3B8] text-white text-[13px] font-bold rounded-xl">
                        {creatingClass ? 'Creating...' : 'Create Class'}
                      </button>
                      <button type="button" onClick={() => { setShowNewClass(false); setClassError(''); }}
                        className="px-6 py-2.5 bg-[#F1F5F9] text-[#475467] text-[13px] font-bold rounded-xl">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="f2 flex flex-col gap-3">
                {classes.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-8 text-center">
                    <p className="text-[14px] font-semibold text-[#0F172A]">No classes yet</p>
                  </div>
                ) : (
                  classes.map((c, i) => {
                    const classStudents = students.filter(s => s.class_id === c.id);
                    const classMaterials = materials.filter(m => m.class_id === c.id);
                    return (
                      <button key={i} onClick={() => setViewingClass(c)}
                        className="bg-white border border-[#E4E7EC] rounded-2xl p-5 flex items-center justify-between gap-3 hover:border-[#336b07] hover:shadow-sm transition-all text-left w-full active:scale-[0.99]">
                        <div>
                          <h3 className="text-[15px] font-bold text-[#0F172A]">{c.name}</h3>
                          <p className="text-[13px] text-[#94A3B8] mt-0.5">
                            {c.subject} · {c.level} · {classStudents.length} students · {classMaterials.length} materials
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="px-3 py-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                            <span className="text-[14px] font-extrabold text-[#336b07] tracking-widest">{c.code}</span>
                          </div>
                          <span className="text-[#94A3B8]">{Icons.arrow}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* CLASS DETAIL VIEW */}
          {activeNav === 'classes' && viewingClass && (
            <div className="flex flex-col gap-5">
              <div className="f1 flex items-center gap-3">
                <button onClick={() => setViewingClass(null)}
                  className="flex items-center gap-2 text-[14px] text-[#475467] hover:text-[#0F172A]">
                  {Icons.back} My Classes
                </button>
              </div>

              <div className="f2 bg-[#1A3A2A] rounded-2xl p-6">
                <p className="text-[10px] font-bold text-[#70AD47] uppercase tracking-widest mb-1">{viewingClass.subject} · {viewingClass.level}</p>
                <h2 className="text-[22px] font-extrabold text-white mb-3">{viewingClass.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="bg-white/10 rounded-xl px-5 py-3">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Class Code</p>
                    <p className="text-[24px] font-extrabold text-white tracking-widest">{viewingClass.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyCode(viewingClass.code)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#70AD47] hover:bg-[#336b07] text-white text-[13px] font-bold rounded-xl">
                      {copiedCode === viewingClass.code ? Icons.check : Icons.copy}
                      {copiedCode === viewingClass.code ? 'Copied!' : 'Copy Code'}
                    </button>
                    <button onClick={() => { setUploadClassId(viewingClass.id); setActiveNav('upload'); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold rounded-xl">
                      {Icons.upload} Upload
                    </button>
                    <button onClick={() => handleDeleteClass(viewingClass.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#BA1A1A]/20 hover:bg-[#BA1A1A]/40 text-[#ff9999] text-[13px] font-semibold rounded-xl">
                      {Icons.trash} Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="f3">
                <h3 className="text-[15px] font-bold text-[#0F172A] mb-3">
                  Students ({students.filter(s => s.class_id === viewingClass.id).length})
                </h3>
                {students.filter(s => s.class_id === viewingClass.id).length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-6 text-center">
                    <p className="text-[14px] font-semibold text-[#0F172A]">No students yet</p>
                    <p className="text-[13px] text-[#94A3B8] mt-1">Share the class code so students can join.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {students.filter(s => s.class_id === viewingClass.id).map((s, i) => {
                      const stats = getStudentStats(s.student_id);
                      return (
                        <div key={i} className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#136299] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                            {s.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[14px] font-semibold text-[#0F172A] truncate">{s.profiles?.full_name || 'Unknown'}</p>
                              {stats.isStuck && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#BA1A1A] bg-[#FFF1F1] px-2 py-0.5 rounded-full">
                                  {Icons.alert} Needs help
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-[#94A3B8] mt-0.5 truncate">{s.profiles?.email}</p>
                            {stats.lastTopic && (
                              <p className="text-[11px] text-[#475467] mt-0.5">
                                Last studied: {stats.lastTopic}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[12px] font-bold text-[#136299]">{stats.completed} topics done</span>
                            {stats.avgScore > 0 && (
                              <span className="text-[11px] text-[#94A3B8]">Avg: {stats.avgScore}%</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="f4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-[#0F172A]">
                    Materials ({materials.filter(m => m.class_id === viewingClass.id).length})
                  </h3>
                  <button onClick={() => { setUploadClassId(viewingClass.id); setActiveNav('upload'); }}
                    className="flex items-center gap-1.5 text-[13px] text-[#336b07] font-semibold hover:underline">
                    {Icons.plus} Upload more
                  </button>
                </div>
                {materials.filter(m => m.class_id === viewingClass.id).length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-6 text-center">
                    <p className="text-[14px] font-semibold text-[#0F172A]">No materials yet</p>
                    <button onClick={() => { setUploadClassId(viewingClass.id); setActiveNav('upload'); }}
                      className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-[#336b07] text-white text-[13px] font-bold rounded-xl mx-auto">
                      Upload First Material {Icons.arrow}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {materials.filter(m => m.class_id === viewingClass.id).map((m, i) => (
                      <div key={i} className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#336b07] flex-shrink-0">{Icons.file}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#0F172A] truncate">{m.title}</p>
                          <p className="text-[12px] text-[#94A3B8]">{m.description}</p>
                        </div>
                        <button onClick={() => handleDeleteMaterial(m.id)}
                          className="text-[#94A3B8] hover:text-[#BA1A1A] p-1 flex-shrink-0">{Icons.trash}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD MATERIALS */}
          {activeNav === 'upload' && (
            <div className="flex flex-col gap-5">
              <div className="f1">
                <h1 className="text-[22px] md:text-[24px] font-extrabold text-[#0F172A]">Upload Materials</h1>
                <p className="text-[14px] text-[#475467] mt-1">Upload a PDF or paste notes. Pathfinder turns them into adaptive lessons for your students.</p>
              </div>

              {uploadError && <div className="p-4 bg-[#FFF1F1] border border-[#FFCDD2] rounded-xl text-[13px] text-[#BA1A1A]">{uploadError}</div>}

              {uploadSuccess && (
                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[13px] text-[#336b07] font-medium flex items-center gap-2">
                    {Icons.check} {uploadSuccess}
                  </div>
                  {uploadedLessons.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">Lessons created for students</p>
                      {uploadedLessons.map((lesson, i) => (
                        <div key={i} className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#136299] text-[12px] font-bold flex-shrink-0">{i + 1}</div>
                          <p className="text-[14px] font-semibold text-[#0F172A]">{lesson.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="f2 bg-white border border-[#E4E7EC] rounded-2xl p-5 md:p-8">
                <form onSubmit={handleUpload} className="flex flex-col gap-5">
                  <div>
                    <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Select Class</label>
                    <select required value={uploadClassId} onChange={e => setUploadClassId(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] focus:outline-none focus:border-[#70AD47] appearance-none">
                      <option value="">Choose a class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Material Title</label>
                    <input type="text" required placeholder="e.g. Chapter 3: Fractions, Week 5 Notes"
                      value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] placeholder-[#94A3B8] focus:outline-none focus:border-[#70AD47]"/>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#1E293B] block mb-2">Upload Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'pdf', label: 'Upload PDF', sub: 'Upload a PDF file', icon: Icons.pdf },
                        { key: 'paste', label: 'Paste Notes', sub: 'Type or paste text', icon: Icons.paste },
                      ].map(m => (
                        <button key={m.key} type="button"
                          onClick={() => { setUploadMode(m.key); setUploadError(''); }}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                            uploadMode === m.key ? 'border-[#336b07] bg-[#F0FDF4]' : 'border-[#E4E7EC] bg-white hover:border-[#70AD47]/50'
                          }`}>
                          <div className={uploadMode === m.key ? 'text-[#336b07]' : 'text-[#94A3B8]'}>{m.icon}</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#0F172A]">{m.label}</p>
                            <p className="text-[11px] text-[#94A3B8]">{m.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {uploadMode === 'pdf' && (
                    <div>
                      <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">
                        PDF File <span className="text-[#94A3B8] font-normal">(max 15MB)</span>
                      </label>
                      <div className="relative border-2 border-dashed border-[#E4E7EC] rounded-xl overflow-hidden hover:border-[#70AD47] transition-colors">
                        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}/>
                        <div className="p-6 flex flex-col items-center gap-3 pointer-events-none">
                          <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#336b07]">{Icons.pdf}</div>
                          {uploadFile ? (
                            <div className="text-center">
                              <p className="text-[14px] font-semibold text-[#0F172A]">{uploadFile.name}</p>
                              <p className="text-[12px] text-[#94A3B8]">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB — tap to change</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-[14px] font-semibold text-[#0F172A]">Tap to select PDF</p>
                              <p className="text-[12px] text-[#94A3B8]">Lecture notes, textbook chapters, handouts</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadMode === 'paste' && (
                    <div>
                      <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">Your Notes</label>
                      <textarea rows={8} placeholder="Paste your lesson notes, textbook content, or any teaching material here..."
                        value={pasteText} onChange={e => setPasteText(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] placeholder-[#94A3B8] focus:outline-none focus:border-[#70AD47] resize-none"/>
                    </div>
                  )}

                  <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                    <p className="text-[12px] font-bold text-[#336b07] uppercase tracking-widest mb-1">What happens after upload</p>
                    <p className="text-[13px] text-[#1E293B] leading-[1.6]">
                      Pathfinder AI reads your content, detects natural topic breaks, and creates adaptive lessons — one per section. Students in this class can study them immediately with voice support, visual diagrams, and quizzes.
                    </p>
                  </div>

                  {uploading ? (
                    <div className="w-full py-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#BBF7D0]"
                        style={{ borderTopColor: '#336b07', animation: 'spin 1s linear infinite' }}/>
                      <p className="text-[14px] font-semibold text-[#336b07]">{uploadStep || 'Processing...'}</p>
                    </div>
                  ) : (
                    <button type="submit"
                      disabled={!uploadClassId || !uploadTitle.trim() || (uploadMode === 'pdf' && !uploadFile) || (uploadMode === 'paste' && !pasteText.trim())}
                      className="w-full py-3.5 bg-[#336b07] hover:bg-[#245005] disabled:bg-[#94A3B8] text-white text-[15px] font-bold rounded-xl transition-colors">
                      Create Lessons for Students
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* STUDENTS */}
          {activeNav === 'students' && (
            <div className="flex flex-col gap-5">
              <div className="f1">
                <h1 className="text-[22px] md:text-[24px] font-extrabold text-[#0F172A]">Students</h1>
                <p className="text-[14px] text-[#475467] mt-1">All students across your classes with their progress.</p>
              </div>

              {studentProgress.some(p => p.is_stuck) && (
                <div className="f2 p-4 bg-[#FFF1F1] border border-[#FFCDD2] rounded-xl flex items-center gap-3">
                  <span className="text-[#BA1A1A]">{Icons.alert}</span>
                  <p className="text-[13px] font-semibold text-[#BA1A1A]">
                    {studentProgress.filter(p => p.is_stuck).length} student{studentProgress.filter(p => p.is_stuck).length !== 1 ? 's' : ''} flagged as needing help.
                  </p>
                </div>
              )}

              {classes.length > 1 && (
                <div className="f2 flex items-center gap-2 flex-wrap">
                  {classes.map(c => (
                    <button key={c.id} onClick={() => setSelectedClass(c)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
                        selectedClass?.id === c.id
                          ? 'bg-[#336b07] text-white border-[#336b07]'
                          : 'bg-white text-[#475467] border-[#E4E7EC] hover:border-[#336b07]'
                      }`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="f3">
                {students.filter(s => s.class_id === selectedClass?.id).length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-3 text-[#336b07]">{Icons.students}</div>
                    <p className="text-[14px] font-semibold text-[#0F172A]">No students yet</p>
                    <p className="text-[13px] text-[#94A3B8] mt-1">Share your class code so students can join.</p>
                    {selectedClass && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                        <span className="text-[16px] font-extrabold text-[#336b07] tracking-widest">{selectedClass.code}</span>
                        <button onClick={() => copyCode(selectedClass.code)} className="text-[#336b07]">{Icons.copy}</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {students.filter(s => s.class_id === selectedClass?.id).map((s, i) => {
                      const stats = getStudentStats(s.student_id);
                      return (
                        <div key={i} className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#136299] flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
                            {s.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[14px] font-semibold text-[#0F172A] truncate">{s.profiles?.full_name || 'Unknown'}</p>
                              {stats.isStuck && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#BA1A1A] bg-[#FFF1F1] px-2 py-0.5 rounded-full">
                                  {Icons.alert} Needs help
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-[#94A3B8] truncate">{s.profiles?.grade_level} · {s.profiles?.email}</p>
                            {stats.lastTopic && (
                              <p className="text-[11px] text-[#475467] mt-0.5">Currently studying: {stats.lastTopic}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[13px] font-bold text-[#136299]">{stats.completed} done</span>
                            {stats.avgScore > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-[#F59E0B] font-semibold">
                                {Icons.star} {stats.avgScore}%
                              </span>
                            )}
                            <span className="text-[11px] text-[#94A3B8]">
                              Joined {new Date(s.joined_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeNav === 'settings' && (
            <div className="flex flex-col gap-5">
              <div className="f1">
                <h1 className="text-[22px] md:text-[24px] font-extrabold text-[#0F172A]">Settings</h1>
                <p className="text-[14px] text-[#475467] mt-1">Manage your account.</p>
              </div>
              <div className="f2 bg-white border border-[#E4E7EC] rounded-2xl p-5">
                <h2 className="text-[15px] font-bold text-[#0F172A] mb-4">Profile</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#336b07] flex items-center justify-center text-white text-[20px] font-bold flex-shrink-0">
                    {firstName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold text-[#0F172A] truncate">{profile?.full_name}</p>
                    <p className="text-[13px] text-[#94A3B8] truncate">{profile?.email}</p>
                    <p className="text-[13px] text-[#94A3B8]">{profile?.school_name || 'No school set'}</p>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF1F1] text-[#BA1A1A] text-[14px] font-semibold rounded-xl hover:bg-[#FFE4E4]">
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