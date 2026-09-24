import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const Icons = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  math: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      <line x1="5" y1="5" x2="8" y2="8"/><line x1="16" y1="16" x2="19" y2="19"/>
    </svg>
  ),
  english: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  science: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5m5-5h6m0 0l5 5M15 14V3"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  teacher: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

const subjectConfig = [
  { key: 'Mathematics', icon: Icons.math, color: '#5B9BD5', bg: '#EFF6FF' },
  { key: 'English Language', icon: Icons.english, color: '#70AD47', bg: '#F0FDF4' },
  { key: 'Basic Science', icon: Icons.science, color: '#F59E0B', bg: '#FFFBEB' },
];

async function generateLesson(topicTitle, subject) {
  const key = process.env.REACT_APP_OPENROUTER_KEY;
  const prompt = `You are a patient, encouraging teacher for neurodivergent students in Nigeria.
Create an adaptive lesson about: "${topicTitle}" for subject: "${subject}"
Return ONLY this exact JSON, no markdown, no backticks:
{"level_1":"Simple clear explanation in 3-4 sentences.","level_2":"Real-world Nigerian analogy. 3-4 sentences.","level_3":"Step 1: ... Step 2: ... Step 3: ...","level_4":"Think about this: one reflective question","level_3_visual":{"type":"steps","title":"How it works","items":[{"label":"Step 1","text":"first key point"},{"label":"Step 2","text":"second key point"},{"label":"Step 3","text":"third key point"}]}}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: 'Output ONLY raw valid JSON. No markdown. No backticks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800
    })
  });

  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');
  const clean = content.replace(/```json|```/g, '').trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No valid JSON in response');
  return JSON.parse(jsonMatch[0]);
}

export default function Subjects({ profile, onNavigate }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [progress, setProgress] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState({});
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState([]); // grouped by class
  const [myUploadedTopics, setMyUploadedTopics] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedClasses, setExpandedClasses] = useState({});

  const isUniversity = profile?.student_level === 'university';

  useEffect(() => {
    fetchProgress();
    const saved = localStorage.getItem('pathfinder_recent_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setShowDropdown(false); return; }
    const timeout = setTimeout(() => searchTopics(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('topic_id, completed, level_reached')
        .eq('student_id', user.id);

      const map = {};
      progressData?.forEach(p => { map[p.topic_id] = p; });
      setProgress(map);

      const subMap = {};
      for (const s of subjectConfig) {
        const { data: topics } = await supabase
          .from('topics').select('id').eq('subject', s.key);
        const total = topics?.length || 0;
        const done = progressData?.filter(p =>
          p.completed && topics?.some(t => t.id === p.topic_id)
        ).length || 0;
        subMap[s.key] = {
          total,
          done,
          progress: total > 0 ? Math.round((done / total) * 100) : 0
        };
      }
      setSubjectProgress(subMap);

      // Fetch teacher classes and their topics — grouped by class
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', user.id);

      if (memberData && memberData.length > 0) {
        const classIds = memberData.map(m => m.class_id);

        const { data: classDetails } = await supabase
          .from('classes')
          .select('id, name, subject, level, code, profiles(full_name)')
          .in('id', classIds);

        const { data: classTopics } = await supabase
          .from('topics')
          .select('*')
          .in('class_id', classIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        const grouped = (classDetails || []).map(c => ({
          classId: c.id,
          className: c.name,
          subject: c.subject,
          level: c.level,
          code: c.code,
          teacherName: c.profiles?.full_name || 'Your Teacher',
          topics: (classTopics || []).filter(t => t.class_id === c.id),
        }));

        setTeacherClasses(grouped);

        // Auto-expand all classes
        const expanded = {};
        grouped.forEach(g => { expanded[g.classId] = true; });
        setExpandedClasses(expanded);
      }

      // Fetch self-uploaded topics for university students
      if (isUniversity) {
        const { data: uploadedTopics } = await supabase
          .from('topics')
          .select('*')
          .eq('student_id', user.id)
          .eq('subject', 'Uploaded Notes')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });
        setMyUploadedTopics(uploadedTopics || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
    setDeletingId(topicId);
    try {
      await supabase.from('topics').update({ deleted_at: new Date().toISOString() }).eq('id', topicId);
      setMyUploadedTopics(prev => prev.filter(t => t.id !== topicId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const searchTopics = async (q) => {
    setSearching(true);
    try {
      const { data } = await supabase
        .from('topics').select('*').ilike('title', `%${q}%`).is('deleted_at', null).limit(8);
      setResults(data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('pathfinder_recent_searches', JSON.stringify(updated));
  };

  const handleSelectTopic = (topic) => {
    saveRecentSearch(topic.title);
    setQuery('');
    setShowDropdown(false);
    navigate(`/lesson/${topic.id}`);
  };

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setGenerating(true);
    setGenerateError('');
    setShowDropdown(false);

    try {
      const q = query.toLowerCase();
      let subject = 'General Studies';
      if (q.includes('math') || q.includes('fraction') || q.includes('algebra') || q.includes('calculus') || q.includes('equation') || q.includes('geometry') || q.includes('number') || q.includes('statistic')) subject = 'Mathematics';
      else if (q.includes('english') || q.includes('grammar') || q.includes('essay') || q.includes('noun') || q.includes('verb') || q.includes('tense') || q.includes('poem') || q.includes('literature')) subject = 'English Language';
      else if (q.includes('biology') || q.includes('chemistry') || q.includes('physics') || q.includes('science') || q.includes('plant') || q.includes('cell') || q.includes('energy') || q.includes('force')) subject = 'Basic Science';

      const lessonContent = await generateLesson(query, subject);

      const { data: newTopic, error: topicError } = await supabase
        .from('topics')
        .insert({
          subject,
          title: query.trim(),
          description: `AI-generated lesson on ${query.trim()}`,
          grade_level: profile?.grade_level || 'JSS 1',
          order_index: 999,
        })
        .select().single();

      if (topicError) throw topicError;

      await supabase.from('lessons').insert({
        topic_id: newTopic.id,
        level_1: lessonContent.level_1,
        level_2: lessonContent.level_2,
        level_3: lessonContent.level_3,
        level_4: lessonContent.level_4,
        level_3_visual: lessonContent.level_3_visual ? JSON.stringify(lessonContent.level_3_visual) : null,
      });

      saveRecentSearch(query);
      setQuery('');
      navigate(`/lesson/${newTopic.id}`);
    } catch (err) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('network')) setGenerateError('Connection lost. Please check your internet and try again.');
      else if (msg.includes('Empty response') || msg.includes('No valid JSON')) setGenerateError('Our AI is busy right now. Please wait a moment and try again.');
      else setGenerateError('Could not generate lesson. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getSubjectColor = (subject) => {
    const map = { 'Mathematics': '#5B9BD5', 'English Language': '#70AD47', 'Basic Science': '#F59E0B' };
    return map[subject] || '#5B9BD5';
  };

  const toggleClass = (classId) => {
    setExpandedClasses(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  const totalTeacherLessons = teacherClasses.reduce((sum, c) => sum + c.topics.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">
          {isUniversity ? 'My Notes' : 'My Subjects'}
        </h1>
        <p className="text-[14px] text-[#475467] mt-1">
          {isUniversity
            ? 'Search any topic, upload notes, or study your saved lessons.'
            : 'Your classes, subjects and lessons — all in one place.'}
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="f2 relative z-10" ref={searchRef}>
        <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3.5 transition-all ${
          query.length > 0 ? 'border-[#5B9BD5] shadow-sm' : 'border-[#E4E7EC]'
        }`}>
          <span className="text-[#94A3B8] flex-shrink-0">{Icons.search}</span>
          <input
            type="text"
            placeholder={isUniversity
              ? 'Search any topic — Chemistry, History, Law...'
              : 'Search any topic — Algebra, Geography, Government...'}
            value={query}
            onChange={e => { setQuery(e.target.value); setGenerateError(''); }}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            className="flex-1 text-[15px] text-[#1E293B] placeholder-[#94A3B8] outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowDropdown(false); setGenerateError(''); }}
              className="text-[#94A3B8] hover:text-[#475467] flex-shrink-0">{Icons.close}</button>
          )}
          {searching && (
            <div className="w-4 h-4 rounded-full border-2 border-[#E4E7EC] flex-shrink-0"
              style={{ borderTopColor: '#5B9BD5', animation: 'spin 1s linear infinite' }}/>
          )}
        </div>

        {!query && !isUniversity && (
          <p className="text-[12px] text-[#94A3B8] mt-2 px-1">
            You can search beyond the 3 subjects — try Geography, Civic Education, Agriculture, or anything you are studying.
          </p>
        )}

        {/* DROPDOWN */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E7EC] rounded-2xl shadow-xl z-50 overflow-hidden">
            {results.length > 0 ? (
              <>
                <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
                  <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">
                    {results.length} topic{results.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {results.map((topic, i) => {
                  const p = progress[topic.id];
                  const color = getSubjectColor(topic.subject);
                  return (
                    <button key={i} onClick={() => handleSelectTopic(topic)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9] last:border-0 text-left">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                        style={{ background: `${color}20`, color }}>
                        {topic.subject?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-[#0F172A]">{topic.title}</p>
                        <p className="text-[11px] text-[#94A3B8]">{topic.subject}</p>
                      </div>
                      {p?.completed
                        ? <span className="text-[#70AD47] flex-shrink-0">{Icons.check}</span>
                        : <span className="text-[#94A3B8] flex-shrink-0">{Icons.arrow}</span>}
                    </button>
                  );
                })}
                <button onClick={handleGenerate} disabled={generating}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#EFF6FF] transition-colors text-left border-t border-[#E4E7EC]">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#5B9BD5] flex-shrink-0">{Icons.spark}</div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#136299]">
                      {generating ? 'Generating...' : `Generate lesson on "${query}"`}
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">AI creates a full adaptive lesson</p>
                  </div>
                </button>
              </>
            ) : (
              <div className="p-4">
                <p className="text-[13px] text-[#475467] mb-3">No existing lessons for "{query}"</p>
                <button onClick={handleGenerate} disabled={generating}
                  className="w-full flex items-center gap-3 p-4 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E4E7EC] hover:border-[#5B9BD5] rounded-xl transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#5B9BD5] flex-shrink-0">{Icons.spark}</div>
                  <div>
                    <p className="text-[14px] font-bold text-[#136299]">
                      {generating ? 'Generating...' : `Generate "${query}"`}
                    </p>
                    <p className="text-[12px] text-[#94A3B8]">AI creates a full 4-level adaptive lesson</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {generating && (
          <div className="mt-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#BFDBFE] flex-shrink-0"
              style={{ borderTopColor: '#5B9BD5', animation: 'spin 1s linear infinite' }}/>
            <div>
              <p className="text-[13px] font-semibold text-[#136299]">Creating your lesson...</p>
              <p className="text-[11px] text-[#475467]">This takes about 10 seconds.</p>
            </div>
          </div>
        )}

        {generateError && !generating && (
          <div className="mt-3 bg-[#FFF1F1] border border-[#FFCDD2] rounded-xl p-4 flex items-center gap-3">
            <button onClick={() => setGenerateError('')} className="text-[#BA1A1A] flex-shrink-0">{Icons.close}</button>
            <p className="text-[13px] text-[#BA1A1A]">{generateError}</p>
          </div>
        )}

        {!showDropdown && recentSearches.length > 0 && !query && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest self-center">Recent:</span>
            {recentSearches.map((s, i) => (
              <button key={i} onClick={() => setQuery(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4E7EC] hover:border-[#5B9BD5] rounded-full text-[12px] text-[#475467] font-medium transition-colors">
                {Icons.clock} {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* UNIVERSITY UPLOAD CTA */}
      {isUniversity && (
        <div className="f2 bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 hover:border-[#5B9BD5] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#136299] flex-shrink-0">{Icons.upload}</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-[15px] font-bold text-[#0F172A]">Upload Lecture Notes</h3>
            <p className="text-[13px] text-[#475467] mt-0.5">Upload a PDF or paste notes — we break them into adaptive micro-lessons.</p>
          </div>
          <button onClick={() => onNavigate && onNavigate('upload')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[13px] font-bold rounded-xl flex-shrink-0">
            Upload {Icons.arrow}
          </button>
        </div>
      )}

      {/* TEACHER CLASSES — grouped by class */}
      {teacherClasses.length > 0 && (
        <div className="f3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-[#70AD47]">{Icons.teacher}</div>
              <h2 className="text-[15px] font-bold text-[#0F172A]">From Your Teachers</h2>
            </div>
            <span className="text-[12px] font-semibold text-[#94A3B8]">
              {totalTeacherLessons} lesson{totalTeacherLessons !== 1 ? 's' : ''} across {teacherClasses.length} class{teacherClasses.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {teacherClasses.map((group) => {
            const isExpanded = expandedClasses[group.classId] !== false;
            const completedInClass = group.topics.filter(t => progress[t.id]?.completed).length;
            const classProgress = group.topics.length > 0
              ? Math.round((completedInClass / group.topics.length) * 100) : 0;

            return (
              <div key={group.classId} className="bg-white border border-[#E4E7EC] rounded-2xl overflow-hidden">
                {/* Class Header */}
                <button
                  onClick={() => toggleClass(group.classId)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#F8FAFC] transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#70AD47] flex-shrink-0 font-bold text-[14px]">
                    {group.className?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-bold text-[#0F172A]">{group.className}</p>
                      <span className="text-[11px] font-semibold text-[#70AD47] bg-[#F0FDF4] px-2 py-0.5 rounded-full">
                        {group.subject}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#94A3B8] mt-0.5">
                      {group.teacherName} · {group.level} · {group.topics.length} lesson{group.topics.length !== 1 ? 's' : ''}
                    </p>
                    {group.topics.length > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 bg-[#F1F5F9] rounded-full h-1">
                          <div className="h-1 rounded-full bg-[#70AD47] progress-bar"
                            style={{ width: `${classProgress}%` }}/>
                        </div>
                        <span className="text-[11px] text-[#94A3B8] flex-shrink-0">
                          {completedInClass}/{group.topics.length}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`text-[#94A3B8] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    {Icons.chevron}
                  </div>
                </button>

                {/* Class Lessons */}
                {isExpanded && group.topics.length > 0 && (
                  <div className="border-t border-[#F1F5F9]">
                    {group.topics.map((topic, i) => {
                      const p = progress[topic.id];
                      return (
                        <button key={i}
                          onClick={() => navigate(`/lesson/${topic.id}`)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors text-left border-b border-[#F8FAFC] last:border-0 ${
                            p?.completed ? 'opacity-80' : ''
                          }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                            p?.completed ? 'bg-[#F0FDF4] text-[#70AD47]' : 'bg-[#F8FAFC] text-[#94A3B8]'
                          }`}>
                            {p?.completed ? Icons.check : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[#0F172A] truncate">{topic.title}</p>
                            <p className="text-[11px] text-[#94A3B8] mt-0.5">
                              {p?.completed
                                ? 'Completed'
                                : p?.level_reached > 0
                                ? `Level ${p.level_reached} of 4 — in progress`
                                : '4 explanation levels · Voice · Visual'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {p && !p.completed && (
                              <div className="flex gap-0.5">
                                {[1,2,3,4].map(l => (
                                  <div key={l} className="w-1 h-3 rounded-full"
                                    style={{ background: l <= (p.level_reached || 0) ? '#70AD47' : '#E4E7EC' }}/>
                                ))}
                              </div>
                            )}
                            <span className="text-[#70AD47]">{Icons.arrow}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {isExpanded && group.topics.length === 0 && (
                  <div className="border-t border-[#F1F5F9] px-4 py-6 text-center">
                    <p className="text-[13px] text-[#94A3B8]">No lessons uploaded yet for this class.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MY UPLOADED LESSONS — university */}
      {isUniversity && myUploadedTopics.length > 0 && (
        <div className="f3">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[#136299]">{Icons.file}</div>
            <h2 className="text-[14px] font-bold text-[#0F172A]">My Uploaded Notes</h2>
            <span className="text-[11px] font-semibold text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
              {myUploadedTopics.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {myUploadedTopics.map((topic, i) => {
              const p = progress[topic.id];
              return (
                <div key={i} className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-3">
                  <button onClick={() => navigate(`/lesson/${topic.id}`)}
                    className="flex items-center gap-3 flex-1 text-left min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#136299] flex-shrink-0">{Icons.file}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#0F172A] truncate">{topic.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-[#136299] bg-[#EFF6FF] px-2 py-0.5 rounded-full">Mine</span>
                        <p className="text-[11px] text-[#94A3B8]">
                          {p?.completed ? 'Completed' : p?.level_reached ? `Level ${p.level_reached} of 4` : 'Not started'}
                        </p>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => handleDeleteTopic(topic.id)}
                    disabled={deletingId === topic.id}
                    className="text-[#94A3B8] hover:text-[#BA1A1A] transition-colors p-1 flex-shrink-0">
                    {Icons.trash}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBJECT CARDS — secondary */}
      {!isUniversity && (
        <div className="f3 flex flex-col gap-3">
          <h2 className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">
            {teacherClasses.length > 0 ? 'Also browse by subject' : 'Browse by subject'}
          </h2>
          {subjectLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="bg-white border border-[#E4E7EC] rounded-2xl p-5 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex-shrink-0"/>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-[#F1F5F9] rounded mb-2"/>
                  <div className="w-24 h-3 bg-[#F1F5F9] rounded mb-2"/>
                  <div className="w-28 h-1.5 bg-[#F1F5F9] rounded-full"/>
                </div>
              </div>
            ))
          ) : (
            subjectConfig.map((s) => {
              const sp = subjectProgress[s.key] || { done: 0, total: 3, progress: 0 };
              return (
                <button key={s.key}
                  onClick={() => navigate(`/topics/${encodeURIComponent(s.key)}`)}
                  className="bg-white border border-[#E4E7EC] rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#5B9BD5] hover:shadow-sm transition-all text-left active:scale-[0.99]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#0F172A]">{s.key}</h3>
                      <p className="text-[12px] text-[#94A3B8] mt-0.5">{sp.done} of {sp.total} topics complete</p>
                      <div className="mt-1.5 bg-[#F1F5F9] rounded-full h-1.5 w-[120px]">
                        <div className="h-1.5 rounded-full progress-bar"
                          style={{ width: `${sp.progress}%`, background: s.color }}/>
                      </div>
                    </div>
                  </div>
                  <span style={{ color: s.color }}>{Icons.arrow}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}