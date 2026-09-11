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
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
};

const subjectConfig = [
  { key: 'Mathematics', icon: Icons.math, color: '#5B9BD5', bg: '#EFF6FF' },
  { key: 'English Language', icon: Icons.english, color: '#70AD47', bg: '#F0FDF4' },
  { key: 'Basic Science', icon: Icons.science, color: '#F59E0B', bg: '#FFFBEB' },
];

const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;

async function generateLesson(topicTitle, subject) {
  const prompt = `You are a patient, encouraging teacher for neurodivergent students in Nigeria.

Generate a complete adaptive lesson about: "${topicTitle}" for the subject: "${subject}"

Return ONLY valid JSON, no extra text, no markdown:
{
  "level_1": "Simple, clear explanation in 3-4 sentences. Plain language, no jargon.",
  "level_2": "Explain the same concept using a relatable real-world analogy from Nigerian daily life. 3-4 sentences.",
  "level_3": "Break it down into clear numbered steps or key points. Use short lines. Format as: Step 1: ... Step 2: ... etc",
  "level_4": "Ask one reflective question that helps the student check their understanding. Start with 'Think about this:'"
}

Keep all levels appropriate for secondary school students. Use simple, encouraging language.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Pathfinder'
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error('No JSON found in response');
return JSON.parse(jsonMatch[0]);
}

export default function Subjects({ profile }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
  const isUniversity = profile?.student_level === 'university';

  useEffect(() => {
    fetchProgress();
    const saved = localStorage.getItem('pathfinder_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        subMap[s.key] = { total, done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
      }
      setSubjectProgress(subMap);
    } catch (err) {
      console.error(err);
    }
  };

  const searchTopics = async (q) => {
    setSearching(true);
    try {
      const { data } = await supabase
        .from('topics')
        .select('*')
        .ilike('title', `%${q}%`)
        .limit(8);
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
    setShowDropdown(false);

    try {
      // Detect subject from query
      const q = query.toLowerCase();
      let subject = 'General Studies';
if (q.includes('math') || q.includes('fraction') || q.includes('equation') ||
  q.includes('algebra') || q.includes('geometry') || q.includes('number') ||
  q.includes('calculus') || q.includes('trigonometry') || q.includes('statistic')) {
  subject = 'Mathematics';
} else if (q.includes('english') || q.includes('grammar') || q.includes('essay') ||
  q.includes('comprehension') || q.includes('noun') || q.includes('verb') ||
  q.includes('tense') || q.includes('sentence') || q.includes('literature') ||
  q.includes('poem') || q.includes('write')) {
  subject = 'English Language';
} else if (q.includes('biology') || q.includes('chemistry') || q.includes('physics') ||
  q.includes('science') || q.includes('plant') || q.includes('animal') ||
  q.includes('cell') || q.includes('energy') || q.includes('force')) {
  subject = 'Basic Science';
}

      // Generate lesson content
      const lessonContent = await generateLesson(query, subject);

      // Save topic to database
      const { data: newTopic, error: topicError } = await supabase
        .from('topics')
        .insert({
          subject,
          title: query.trim(),
          description: `AI-generated lesson on ${query.trim()}`,
          grade_level: profile?.grade_level || 'JSS 1',
          order_index: 999,
        })
        .select()
        .single();

      if (topicError) throw topicError;

      // Save lesson content
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          topic_id: newTopic.id,
          level_1: lessonContent.level_1,
          level_2: lessonContent.level_2,
          level_3: lessonContent.level_3,
          level_4: lessonContent.level_4,
        });

      if (lessonError) throw lessonError;

      saveRecentSearch(query);
      setQuery('');
      navigate(`/lesson/${newTopic.id}`);
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  const getSubjectColor = (subject) => {
    const map = { 'Mathematics': '#5B9BD5', 'English Language': '#70AD47', 'Basic Science': '#F59E0B' };
    return map[subject] || '#5B9BD5';
  };

  const getSubjectBg = (subject) => {
    const map = { 'Mathematics': '#EFF6FF', 'English Language': '#F0FDF4', 'Basic Science': '#FFFBEB' };
    return map[subject] || '#EFF6FF';
  };

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* HEADER */}
      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">
          {isUniversity ? 'My Notes' : 'My Subjects'}
        </h1>
        <p className="text-[14px] text-[#475467] mt-1">
          {isUniversity
            ? 'Upload and manage your lecture notes.'
            : 'Search any topic or pick a subject to continue learning.'}
        </p>
      </div>

      {/* UNIVERSITY UPLOAD */}
      {isUniversity && (
        <div className="f2 bg-white border-2 border-dashed border-[#E4E7EC] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center hover:border-[#5B9BD5] transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#136299]">
            {Icons.upload}
          </div>
          <h3 className="text-[16px] font-bold text-[#0F172A]">Upload Lecture Notes</h3>
          <p className="text-[13px] text-[#475467] max-w-[320px]">
            Upload a PDF and Pathfinder will break it into micro-lessons with voice support.
          </p>
          <button className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[13px] font-bold rounded-xl transition-colors">
            Upload PDF {Icons.arrow}
          </button>
        </div>
      )}

      {/* SEARCH BAR */}
      {!isUniversity && (
        <div className="f2 relative z-10" ref={searchRef}>
          <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3.5 transition-all ${query.length > 0 ? 'border-[#5B9BD5] shadow-sm shadow-[#5B9BD5]/10' : 'border-[#E4E7EC]'}`}>
            <span className="text-[#94A3B8] flex-shrink-0">{Icons.search}</span>
            <input
              type="text"
              placeholder="Search any topic... e.g. Simultaneous Equations"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              className="flex-1 text-[15px] text-[#1E293B] placeholder-[#94A3B8] outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => { setQuery(''); setShowDropdown(false); }}
                className="text-[#94A3B8] hover:text-[#475467] flex-shrink-0">
                {Icons.close}
              </button>
            )}
            {searching && (
              <div className="w-4 h-4 rounded-full border-2 border-[#E4E7EC] flex-shrink-0"
                style={{ borderTopColor: '#5B9BD5', animation: 'spin 1s linear infinite' }}/>
            )}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* SEARCH DROPDOWN */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E7EC] rounded-2xl shadow-xl z-50 overflow-hidden">
              {results.length > 0 ? (
                <>
                  <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
                    <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">
                      Found {results.length} topic{results.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {results.map((topic, i) => {
                    const p = progress[topic.id];
                    const color = getSubjectColor(topic.subject);
                    const bg = getSubjectBg(topic.subject);
                    return (
                      <button key={i} onClick={() => handleSelectTopic(topic)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9] last:border-0 text-left">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                          style={{ background: bg, color }}>
                          {topic.subject[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-semibold text-[#0F172A]">{topic.title}</p>
                          <p className="text-[11px] text-[#94A3B8]">{topic.subject}</p>
                        </div>
                        {p?.completed && (
                          <span className="text-[#70AD47] flex-shrink-0">{Icons.check}</span>
                        )}
                        {!p?.completed && (
                          <span className="text-[#94A3B8] flex-shrink-0">{Icons.arrow}</span>
                        )}
                      </button>
                    );
                  })}
                  {/* Generate option */}
                  <button onClick={handleGenerate} disabled={generating}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#EFF6FF] transition-colors text-left border-t border-[#E4E7EC]">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#5B9BD5] flex-shrink-0">
                      {Icons.spark}
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-[#136299]">
                        {generating ? 'Generating lesson...' : `Generate lesson on "${query}"`}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">AI will create a full adaptive lesson</p>
                    </div>
                  </button>
                </>
              ) : (
                /* NO RESULTS */
                <div className="p-4">
                  <p className="text-[13px] text-[#475467] mb-3">
                    No existing lessons found for "<span className="font-semibold">{query}</span>"
                  </p>
                  <button onClick={handleGenerate} disabled={generating}
                    className="w-full flex items-center gap-3 p-4 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E4E7EC] hover:border-[#5B9BD5] rounded-xl transition-all text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#5B9BD5] flex-shrink-0">
                      {Icons.spark}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#136299]">
                        {generating ? 'Generating your lesson...' : `Generate "${query}"`}
                      </p>
                      <p className="text-[12px] text-[#94A3B8]">
                        AI will create a full 4-level adaptive lesson
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GENERATING STATE */}
          {generating && (
            <div className="mt-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-[#BFDBFE] flex-shrink-0"
                style={{ borderTopColor: '#5B9BD5', animation: 'spin 1s linear infinite' }}/>
              <div>
                <p className="text-[13px] font-semibold text-[#136299]">Creating your lesson...</p>
                <p className="text-[11px] text-[#475467]">This takes about 10 seconds. Please wait.</p>
              </div>
            </div>
          )}

          {/* RECENT SEARCHES */}
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
      )}

      {/* SUBJECT CARDS */}
      {!isUniversity && (
        <div className="f3 flex flex-col gap-4">
          <h2 className="text-[14px] font-bold text-[#94A3B8] uppercase tracking-widest">Or browse by subject</h2>
          {subjectConfig.map((s) => {
            const sp = subjectProgress[s.key] || { done: 0, total: 3, progress: 0 };
            return (
              <button
                key={s.key}
                onClick={() => navigate(`/topics/${encodeURIComponent(s.key)}`)}
                className="bg-white border border-[#E4E7EC] rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#5B9BD5] hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0F172A]">{s.key}</h3>
                    <p className="text-[12px] text-[#94A3B8] mt-0.5">
                      {sp.done} of {sp.total} topics complete
                    </p>
                    <div className="mt-1.5 bg-[#F1F5F9] rounded-full h-1.5 w-[120px]">
                      <div className="h-1.5 rounded-full progress-bar"
                        style={{ width: `${sp.progress}%`, background: s.color }}/>
                    </div>
                  </div>
                </div>
                <span style={{ color: s.color }}>{Icons.arrow}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}