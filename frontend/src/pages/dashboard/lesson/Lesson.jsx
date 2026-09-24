import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  stop: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  flashcard: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
};

const levelLabels = {
  1: { label: 'Simple', desc: 'Clear, plain explanation' },
  2: { label: 'Analogy', desc: 'Explained using a comparison' },
  3: { label: 'Visual', desc: 'Shown as a diagram or steps' },
  4: { label: 'Interactive', desc: 'Try it yourself' },
};

const subjectColor = {
  'Mathematics': '#5B9BD5',
  'English Language': '#70AD47',
  'Basic Science': '#F59E0B',
};

// ─── HARDCODED VISUALS for the 9 pre-built topics ──────────────────────────
const TopicVisuals = {
  'Introduction to Fractions': (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">A fraction has two parts</p>
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-14 bg-[#5B9BD5] rounded-xl flex items-center justify-center">
          <span className="text-[28px] font-extrabold text-white">3</span>
        </div>
        <div className="w-32 h-1 bg-[#1E293B] rounded"/>
        <div className="w-20 h-14 bg-[#E4E7EC] rounded-xl flex items-center justify-center">
          <span className="text-[28px] font-extrabold text-[#475467]">4</span>
        </div>
        <div className="flex gap-8 mt-2 text-center">
          <p className="text-[12px] text-[#5B9BD5] font-bold">Numerator<br/>(parts you have)</p>
          <p className="text-[12px] text-[#475467] font-bold">Denominator<br/>(total parts)</p>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        {[1,2,3,4].map(i => (
          <div key={i} className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-[16px] font-bold ${i <= 3 ? 'bg-[#5B9BD5] border-[#5B9BD5] text-white' : 'bg-white border-[#E4E7EC] text-[#94A3B8]'}`}>
            {i <= 3 ? '✓' : ''}
          </div>
        ))}
      </div>
      <p className="text-[13px] text-[#475467]">3 out of 4 equal parts = 3/4</p>
    </div>
  ),
  'Adding Fractions': (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">Adding fractions with same denominator</p>
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {[1,2,3,4,5].map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded border-2 ${i === 0 ? 'bg-[#5B9BD5] border-[#5B9BD5]' : 'bg-white border-[#E4E7EC]'}`}/>
            ))}
          </div>
          <p className="text-[16px] font-bold text-[#0F172A] mt-2">1/5</p>
        </div>
        <span className="text-[24px] font-bold text-[#475467]">+</span>
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {[1,2,3,4,5].map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded border-2 ${i < 2 ? 'bg-[#70AD47] border-[#70AD47]' : 'bg-white border-[#E4E7EC]'}`}/>
            ))}
          </div>
          <p className="text-[16px] font-bold text-[#0F172A] mt-2">2/5</p>
        </div>
        <span className="text-[24px] font-bold text-[#475467]">=</span>
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            {[1,2,3,4,5].map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded border-2 ${i < 3 ? 'bg-[#136299] border-[#136299]' : 'bg-white border-[#E4E7EC]'}`}/>
            ))}
          </div>
          <p className="text-[16px] font-bold text-[#0F172A] mt-2">3/5</p>
        </div>
      </div>
      <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-4 w-full max-w-[320px] text-center">
        <p className="text-[13px] text-[#475467] leading-[1.7]">
          <span className="font-bold text-[#0F172A]">Rule:</span> Same denominator? Add the top numbers. Keep the bottom number.
        </p>
      </div>
    </div>
  ),
  'Multiplying Fractions': (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">Multiplying fractions step by step</p>
      <div className="flex flex-col gap-3 w-full max-w-[320px]">
        {[
          { step: '1', label: 'Multiply the TOP numbers', sum: '2 × 3 = 6', color: '#5B9BD5' },
          { step: '2', label: 'Multiply the BOTTOM numbers', sum: '3 × 4 = 12', color: '#70AD47' },
          { step: '3', label: 'Simplify if possible', sum: '6/12 = 1/2', color: '#F59E0B' },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-4 bg-white border border-[#E4E7EC] rounded-xl p-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0" style={{ background: s.color }}>
              {s.step}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A]">{s.label}</p>
              <p className="text-[13px] font-bold mt-0.5" style={{ color: s.color }}>{s.sum}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[18px] font-bold text-[#0F172A] flex-wrap justify-center">
        <span>2/3</span><span className="text-[#475467]">×</span><span>3/4</span>
        <span className="text-[#475467]">=</span><span className="text-[#5B9BD5]">6/12</span>
        <span className="text-[#475467]">=</span><span className="text-[#70AD47]">1/2</span>
      </div>
    </div>
  ),
  'Parts of Speech': (
    <div className="flex flex-col items-center gap-5">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">The sentence broken down</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { word: 'The', type: 'Article', color: '#94A3B8', bg: '#F8FAFC' },
          { word: 'tall', type: 'Adjective', color: '#F59E0B', bg: '#FFFBEB' },
          { word: 'girl', type: 'Noun', color: '#5B9BD5', bg: '#EFF6FF' },
          { word: 'runs', type: 'Verb', color: '#70AD47', bg: '#F0FDF4' },
          { word: 'quickly', type: 'Adverb', color: '#9B8DBE', bg: '#F5F3FF' },
        ].map((w) => (
          <div key={w.word} className="flex flex-col items-center gap-1">
            <div className="px-4 py-2 rounded-xl border-2 font-bold text-[16px]" style={{ borderColor: w.color, color: w.color, background: w.bg }}>
              {w.word}
            </div>
            <span className="text-[11px] font-semibold" style={{ color: w.color }}>{w.type}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-[340px] mt-2">
        {[
          { type: 'Noun', desc: 'Person, place or thing', color: '#5B9BD5' },
          { type: 'Verb', desc: 'Action or state word', color: '#70AD47' },
          { type: 'Adjective', desc: 'Describes a noun', color: '#F59E0B' },
          { type: 'Adverb', desc: 'Describes a verb', color: '#9B8DBE' },
        ].map((p) => (
          <div key={p.type} className="bg-white border border-[#E4E7EC] rounded-xl p-3">
            <p className="text-[12px] font-bold" style={{ color: p.color }}>{p.type}</p>
            <p className="text-[11px] text-[#475467]">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),
  'Punctuation Marks': (
    <div className="flex flex-col items-center gap-5">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">Punctuation marks and their jobs</p>
      <div className="flex flex-col gap-3 w-full max-w-[360px]">
        {[
          { mark: '.', name: 'Full Stop', job: 'Ends a sentence', color: '#5B9BD5' },
          { mark: ',', name: 'Comma', job: 'Creates a pause', color: '#70AD47' },
          { mark: '?', name: 'Question Mark', job: 'Ends a question', color: '#F59E0B' },
          { mark: '!', name: 'Exclamation Mark', job: 'Shows strong feeling', color: '#BA1A1A' },
          { mark: "'", name: 'Apostrophe', job: 'Shows ownership or shortening', color: '#9B8DBE' },
        ].map((p) => (
          <div key={p.mark} className="flex items-center gap-4 bg-white border border-[#E4E7EC] rounded-xl p-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[28px] font-extrabold flex-shrink-0" style={{ background: `${p.color}15`, color: p.color }}>
              {p.mark}
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#0F172A]">{p.name}</p>
              <p className="text-[12px] text-[#475467]">{p.job}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  'Writing a Good Paragraph': (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">The paragraph burger</p>
      <div className="flex flex-col items-center gap-1 w-full max-w-[320px]">
        <div className="w-full bg-[#F59E0B] rounded-t-2xl p-4 text-center">
          <p className="text-[13px] font-extrabold text-white">TOP BUN</p>
          <p className="text-[12px] text-white/80 mt-0.5">Topic Sentence — introduces the main idea</p>
        </div>
        <div className="w-[90%] bg-[#70AD47] p-4 text-center">
          <p className="text-[13px] font-extrabold text-white">FILLING</p>
          <p className="text-[12px] text-white/80 mt-0.5">Supporting Sentences — details and examples</p>
        </div>
        <div className="w-[90%] bg-[#70AD47] p-3 text-center opacity-80">
          <p className="text-[12px] text-white">More supporting sentences...</p>
        </div>
        <div className="w-full bg-[#5B9BD5] rounded-b-2xl p-4 text-center">
          <p className="text-[13px] font-extrabold text-white">BOTTOM BUN</p>
          <p className="text-[12px] text-white/80 mt-0.5">Concluding Sentence — wraps everything up</p>
        </div>
      </div>
    </div>
  ),
  'Photosynthesis': (
    <div className="flex flex-col items-center gap-5">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">How photosynthesis works</p>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {[
          { label: 'Sunlight', color: '#F59E0B', bg: '#FFFBEB', symbol: 'SUN' },
          { label: 'Water', color: '#5B9BD5', bg: '#EFF6FF', symbol: 'H₂O' },
          { label: 'CO₂', color: '#475467', bg: '#F8FAFC', symbol: 'CO₂' },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[13px] font-bold" style={{ background: item.bg, color: item.color }}>
                {item.symbol}
              </div>
              <p className="text-[11px] font-bold" style={{ color: item.color }}>{item.label}</p>
            </div>
            {i < 2 && <span className="text-[20px] text-[#475467] font-bold">+</span>}
          </React.Fragment>
        ))}
        <span className="text-[20px] text-[#475467] font-bold">→</span>
        {[
          { label: 'Glucose', color: '#70AD47', bg: '#F0FDF4', symbol: 'C₆H₁₂' },
          { label: 'Oxygen', color: '#136299', bg: '#EFF6FF', symbol: 'O₂' },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[13px] font-bold" style={{ background: item.bg, color: item.color }}>
                {item.symbol}
              </div>
              <p className="text-[11px] font-bold" style={{ color: item.color }}>{item.label}</p>
            </div>
            {i < 1 && <span className="text-[20px] text-[#475467] font-bold">+</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 w-full max-w-[320px] text-center">
        <p className="text-[13px] text-[#1E293B] leading-[1.7]">
          Happens inside the green parts of the leaf in structures called <span className="font-bold text-[#70AD47]">chloroplasts</span>
        </p>
      </div>
    </div>
  ),
  'The Human Digestive System': (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">The digestive journey</p>
      <div className="flex flex-col gap-2 w-full max-w-[340px]">
        {[
          { num: '1', organ: 'Mouth', desc: 'Chewing begins digestion', color: '#5B9BD5' },
          { num: '2', organ: 'Oesophagus', desc: 'Carries food to stomach', color: '#70AD47' },
          { num: '3', organ: 'Stomach', desc: 'Acid breaks food down', color: '#F59E0B' },
          { num: '4', organ: 'Small Intestine', desc: 'Nutrients absorbed into blood', color: '#136299' },
          { num: '5', organ: 'Large Intestine', desc: 'Water absorbed, waste formed', color: '#9B8DBE' },
          { num: '6', organ: 'Rectum & Anus', desc: 'Waste removed from body', color: '#475467' },
        ].map((item) => (
          <div key={item.num} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0" style={{ background: item.color }}>
              {item.num}
            </div>
            <div className="flex-1 bg-white border border-[#E4E7EC] rounded-xl px-4 py-2.5">
              <p className="text-[13px] font-bold text-[#0F172A]">{item.organ}</p>
              <p className="text-[11px] text-[#475467]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  'States of Matter': (
    <div className="flex flex-col items-center gap-5">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest">Three states of matter</p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-[360px]">
        {[
          { state: 'SOLID', example: 'Ice', desc: 'Fixed shape & volume', color: '#5B9BD5', bg: '#EFF6FF',
            particles: [[0.5,0.5],[1.5,0.5],[2.5,0.5],[0.5,1.5],[1.5,1.5],[2.5,1.5],[0.5,2.5],[1.5,2.5],[2.5,2.5]] },
          { state: 'LIQUID', example: 'Water', desc: 'Fixed volume, no fixed shape', color: '#70AD47', bg: '#F0FDF4',
            particles: [[0.5,0.5],[2.5,0.8],[1.2,1.5],[0.3,2],[2.2,1.8],[1.5,2.5]] },
          { state: 'GAS', example: 'Steam', desc: 'No fixed shape or volume', color: '#F59E0B', bg: '#FFFBEB',
            particles: [[0.4,0.4],[2.6,0.6],[1.5,1.5],[0.3,2.6],[2.7,2.4]] },
        ].map((s) => (
          <div key={s.state} className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2" style={{ background: s.bg, borderColor: s.color }}>
            <p className="text-[10px] font-extrabold" style={{ color: s.color }}>{s.state}</p>
            <svg viewBox="0 0 3 3" className="w-14 h-14">
              {s.particles.map(([cx,cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="0.35" fill={s.color}/>
              ))}
            </svg>
            <p className="text-[10px] font-bold text-[#0F172A]">{s.example}</p>
            <p className="text-[9px] text-[#475467] text-center leading-tight">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ─── DYNAMIC VISUAL for AI-generated topics ─────────────────────────────────
function DynamicVisual({ visualData, color }) {
  if (!visualData) return null;

  let parsed = visualData;
  if (typeof visualData === 'string') {
    try { parsed = JSON.parse(visualData); } catch { return null; }
  }

  const accentColor = color || '#5B9BD5';
  const accentBg = `${accentColor}15`;

  if (parsed.type === 'steps') {
    return (
      <div className="flex flex-col gap-4">
        {parsed.title && (
          <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">
            {parsed.title}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {(parsed.items || []).map((item, i) => (
            <div key={i} className="flex items-start gap-4 bg-white border border-[#E4E7EC] rounded-xl p-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                style={{ background: accentColor }}>
                {i + 1}
              </div>
              <div>
                {item.label && <p className="text-[12px] font-bold uppercase tracking-wide mb-0.5" style={{ color: accentColor }}>{item.label}</p>}
                <p className="text-[14px] text-[#1E293B] leading-[1.6]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (parsed.type === 'terms') {
    return (
      <div className="flex flex-col gap-4">
        {parsed.title && (
          <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">
            {parsed.title}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {(parsed.items || []).map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-[#E4E7EC] rounded-xl p-4">
              <div className="px-3 py-1.5 rounded-lg text-[12px] font-bold flex-shrink-0"
                style={{ background: accentBg, color: accentColor }}>
                {item.term}
              </div>
              <p className="text-[13px] text-[#475467] leading-[1.6] mt-0.5">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (parsed.type === 'compare') {
    return (
      <div className="flex flex-col gap-4">
        {parsed.title && (
          <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">
            {parsed.title}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border-2 rounded-xl p-3 text-center" style={{ borderColor: accentColor }}>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>Option A</p>
          </div>
          <div className="bg-white border-2 rounded-xl p-3 text-center" style={{ borderColor: '#70AD47' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#70AD47' }}>Option B</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {(parsed.items || []).map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-[#E4E7EC] rounded-xl p-3">
                <p className="text-[13px] text-[#1E293B] leading-[1.5]">{item.left}</p>
              </div>
              <div className="bg-white border border-[#E4E7EC] rounded-xl p-3">
                <p className="text-[13px] text-[#1E293B] leading-[1.5]">{item.right}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback — plain numbered list from level_3 text
  return <GenericVisual text={parsed.toString()} />;
}

function GenericVisual({ text }) {
  const lines = (text || '').split('\n').filter(l => l.trim()).slice(0, 8);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-widest text-center mb-2">Key Points</p>
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-3 bg-white border border-[#E4E7EC] rounded-xl p-4">
          <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#5B9BD5] text-[12px] font-bold flex-shrink-0">
            {i + 1}
          </div>
          <p className="text-[14px] text-[#1E293B] leading-[1.6]">{line.replace(/^[-*•]\s*/, '').replace(/^Step \d+:\s*/i, '').trim()}</p>
        </div>
      ))}
    </div>
  );
}

export default function Lesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [topic, setTopic] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextTopic, setNextTopic] = useState(null);

  useEffect(() => {
    isMounted.current = true;
    fetchLesson();
    return () => {
      isMounted.current = false;
      window.speechSynthesis?.cancel();
    };
  }, [topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentLevel === 4 && lesson) fetchQuizQuestion();
  }, [currentLevel, lesson]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLesson = async () => {
    try {
      const { data: topicData } = await supabase
        .from('topics').select('*').eq('id', topicId).single();

      const { data: lessonData } = await supabase
        .from('lessons').select('*').eq('topic_id', topicId).single();

      if (!topicData || !lessonData) {
        if (isMounted.current) setNotFound(true);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: progressData } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', user.id)
          .eq('topic_id', topicId)
          .maybeSingle();

        if (progressData && isMounted.current) {
          if (progressData.completed) {
            setIsCompleted(true);
            setCurrentLevel(progressData.level_reached || 4);
          } else if (progressData.level_reached) {
            setCurrentLevel(progressData.level_reached);
          }
        }

        if (topicData) {
          const { data: nextTopics } = await supabase
            .from('topics')
            .select('*')
            .eq('subject', topicData.subject)
            .gt('order_index', topicData.order_index)
            .order('order_index', { ascending: true })
            .limit(1);
          if (nextTopics && nextTopics.length > 0 && isMounted.current) {
            setNextTopic(nextTopics[0]);
          }
        }
      }

      if (isMounted.current) {
        setTopic(topicData);
        setLesson(lessonData);
      }
    } catch (err) {
      console.error(err);
      if (isMounted.current) setNotFound(true);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const fetchQuizQuestion = async () => {
    try {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', topicId)
        .limit(5);

      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        if (isMounted.current) {
          setQuizQuestion({
            question: random.question,
            options: [random.option_a, random.option_b, random.option_c, random.option_d],
            answer: ['A','B','C','D'].indexOf(random.answer),
            explanation: `The correct answer is option ${random.answer}.`
          });
        }
      } else if (lesson) {
        try {
          const { generateInteractiveQuestion } = await import('../../../services/openrouter');
          const q = await generateInteractiveQuestion(topic?.title, lesson?.level_1);
          if (q && isMounted.current) setQuizQuestion(q);
        } catch {
          // Silently fail
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentText = () => {
    if (!lesson) return '';
    const map = { 1: lesson.level_1, 2: lesson.level_2, 3: lesson.level_3, 4: lesson.level_4 };
    return map[currentLevel] || '';
  };

  const handleVoice = () => {
    // Read voice speed fresh each time
    const voiceSpeed = parseFloat(localStorage.getItem('pathfinder_voice_speed') || '0.75');

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = currentLevel === 4 && quizQuestion ? quizQuestion.question : getCurrentText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => { if (isMounted.current) setSpeaking(false); };
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleExplainDifferently = async () => {
    if (currentLevel >= 4) return;
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setSpeaking(false);
    window.speechSynthesis?.cancel();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('student_progress').upsert({
        student_id: user.id,
        topic_id: topicId,
        level_reached: newLevel,
        completed: false,
        last_studied_at: new Date().toISOString(),
      }, { onConflict: 'student_id,topic_id' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnderstood = async () => {
    setUnderstood(true);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('student_progress').upsert({
        student_id: user.id,
        topic_id: topicId,
        level_reached: currentLevel,
        completed: false,
        last_studied_at: new Date().toISOString(),
      }, { onConflict: 'student_id,topic_id' });
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => navigate(`/lesson/${topicId}/quiz`), 600);
  };

  const color = topic ? (subjectColor[topic.subject] || '#5B9BD5') : '#5B9BD5';
  const hardcodedVisual = topic ? TopicVisuals[topic.title] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E4E7EC]"
            style={{ borderTopColor: '#5B9BD5', animation: 'spin 1s linear infinite' }}/>
          <p className="text-[14px] text-[#475467]">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <div className="text-center max-w-[360px]">
          <p className="text-[20px] font-extrabold text-[#0F172A] mb-2">Lesson not found</p>
          <p className="text-[14px] text-[#475467] mb-5 leading-[1.6]">
            This lesson does not exist or may have been removed.
          </p>
          <button onClick={() => navigate('/dashboard/student')}
            className="px-6 py-3 bg-[#136299] text-white text-[14px] font-bold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeUp 0.4s ease forwards; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .pulse { animation: pulse 1.5s ease infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* TOP BAR */}
      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-20">
        <div className="max-w-[760px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <button onClick={() => { window.speechSynthesis?.cancel(); navigate(-1); }}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors">
            {Icons.back} Back
          </button>
          <div className="flex items-center gap-1.5">
            {[1,2,3,4].map(l => (
              <div key={l} className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: l <= currentLevel ? color : '#E4E7EC',
                  transform: l === currentLevel ? 'scale(1.4)' : 'scale(1)'
                }}/>
            ))}
          </div>
          <button onClick={handleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
              speaking ? 'text-white pulse' : 'bg-[#F8FAFC] border border-[#E4E7EC] text-[#475467] hover:border-[#5B9BD5]'
            }`}
            style={speaking ? { background: color } : {}}>
            {speaking ? Icons.stop : Icons.voice}
            {speaking ? 'Stop' : 'Listen'}
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 max-w-[760px] mx-auto w-full px-5 md:px-8 py-8 flex flex-col gap-6">

        {/* COMPLETED BANNER */}
        {isCompleted && (
          <div className="fade bg-[#F0FDF4] border-2 border-[#70AD47] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#70AD47] flex items-center justify-center text-white flex-shrink-0">
                {Icons.check}
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#336b07]">You completed this topic!</p>
                <p className="text-[12px] text-[#475467]">You can review it or move to the next topic.</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => navigate(`/flashcards/${topicId}`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#70AD47] text-[#336b07] text-[13px] font-semibold rounded-xl hover:bg-[#F0FDF4] transition-colors">
                {Icons.flashcard} Flashcards
              </button>
              {nextTopic && (
                <button onClick={() => navigate(`/lesson/${nextTopic.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#70AD47] text-white text-[13px] font-bold rounded-xl hover:bg-[#336b07] transition-colors">
                  Next Topic {Icons.arrow}
                </button>
              )}
            </div>
          </div>
        )}

        {/* TOPIC HEADER */}
        <div className="fade">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
            {topic?.subject} · {levelLabels[currentLevel].label}
          </p>
          <h1 className="text-[22px] md:text-[26px] font-extrabold text-[#0F172A]">{topic?.title}</h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">{levelLabels[currentLevel].desc}</p>
        </div>

        {/* LEVEL TABS */}
        <div className="flex items-center gap-2 flex-wrap">
          {[1,2,3,4].map(l => (
            <button key={l}
              onClick={() => { if (l <= currentLevel) { setCurrentLevel(l); setSpeaking(false); window.speechSynthesis?.cancel(); } }}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                l === currentLevel ? 'text-white border-transparent'
                : l < currentLevel ? 'bg-white text-[#475467] border-[#E4E7EC] cursor-pointer hover:border-[#94A3B8]'
                : 'bg-[#F8FAFC] text-[#94A3B8] border-[#F1F5F9] cursor-not-allowed opacity-50'
              }`}
              style={l === currentLevel ? { background: color } : {}}>
              {levelLabels[l].label}
            </button>
          ))}
        </div>

        {/* LEVEL 1 */}
        {currentLevel === 1 && (
          <div className="fade bg-white border border-[#E4E7EC] rounded-2xl p-6 md:p-8">
            <p className="text-[16px] md:text-[17px] text-[#1E293B] leading-[1.9] whitespace-pre-line">
              {lesson?.level_1}
            </p>
          </div>
        )}

        {/* LEVEL 2 */}
        {currentLevel === 2 && (
          <div className="fade bg-white border border-[#E4E7EC] rounded-2xl p-6 md:p-8">
            <p className="text-[16px] md:text-[17px] text-[#1E293B] leading-[1.9] whitespace-pre-line">
              {lesson?.level_2}
            </p>
          </div>
        )}

        {/* LEVEL 3 — hardcoded for pre-built topics, dynamic for AI topics */}
        {currentLevel === 3 && (
          <div className="fade bg-white border border-[#E4E7EC] rounded-2xl p-6 md:p-8">
            {hardcodedVisual ? (
              hardcodedVisual
            ) : lesson?.level_3_visual ? (
              <DynamicVisual visualData={lesson.level_3_visual} color={color} />
            ) : (
              <GenericVisual text={lesson?.level_3} />
            )}
          </div>
        )}

        {/* LEVEL 4 */}
        {currentLevel === 4 && (
          <div className="fade bg-white border border-[#E4E7EC] rounded-2xl p-6 md:p-8">
            {quizQuestion ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color }}>
                  Try it yourself
                </p>
                <p className="text-[18px] font-bold text-[#0F172A] mb-6 leading-[1.5]">
                  {quizQuestion.question}
                </p>
                <div className="flex flex-col gap-3">
                  {quizQuestion.options.map((option, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === quizQuestion.answer;
                    let borderColor = '#E4E7EC';
                    let bgColor = 'white';
                    let textColor = '#1E293B';
                    if (showAnswer && isCorrect) { borderColor = '#70AD47'; bgColor = '#F0FDF4'; textColor = '#336b07'; }
                    else if (showAnswer && isSelected && !isCorrect) { borderColor = '#BA1A1A'; bgColor = '#FFF1F1'; textColor = '#BA1A1A'; }
                    else if (isSelected && !showAnswer) { borderColor = color; bgColor = '#EFF6FF'; }
                    return (
                      <button key={i}
                        onClick={() => { if (!showAnswer) { setSelectedAnswer(i); setShowAnswer(true); } }}
                        disabled={showAnswer}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                        style={{ borderColor, backgroundColor: bgColor }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 border-2"
                          style={{ borderColor, color: textColor }}>
                          {['A','B','C','D'][i]}
                        </div>
                        <span className="text-[15px] font-medium" style={{ color: textColor }}>{option}</span>
                      </button>
                    );
                  })}
                </div>
                {showAnswer && (
                  <div className={`mt-5 p-4 rounded-xl border ${
                    selectedAnswer === quizQuestion.answer ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#FFF1F1] border-[#FFCDD2]'
                  }`}>
                    <p className="text-[14px] font-bold mb-1" style={{
                      color: selectedAnswer === quizQuestion.answer ? '#336b07' : '#BA1A1A'
                    }}>
                      {selectedAnswer === quizQuestion.answer ? 'That is correct!' : 'Not quite — but that is okay.'}
                    </p>
                    <p className="text-[13px] text-[#1E293B] leading-[1.6]">{quizQuestion.explanation}</p>
                    {selectedAnswer !== quizQuestion.answer && (
                      <button onClick={() => { setSelectedAnswer(null); setShowAnswer(false); }}
                        className="mt-3 text-[13px] font-semibold text-[#136299] hover:underline">
                        Try again
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-8 h-8 rounded-full border-2 border-[#E4E7EC] mx-auto mb-3"
                  style={{ borderTopColor: color, animation: 'spin 1s linear infinite' }}/>
                <p className="text-[14px] text-[#475467]">Loading question...</p>
              </div>
            )}
          </div>
        )}

        {/* ENCOURAGEMENT */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0"/>
          <p className="text-[13px] text-[#1E293B] leading-[1.6]">
            {currentLevel === 1 && "Take your time reading this. There is no rush."}
            {currentLevel === 2 && "This explanation uses a comparison to help it make sense."}
            {currentLevel === 3 && "Sometimes seeing it laid out visually makes it clearer."}
            {currentLevel === 4 && "Have a go at the question. There is no wrong answer for trying."}
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
<div className="bg-white border-t border-[#E4E7EC] sticky bottom-0"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
  <div className="max-w-[760px] mx-auto px-5 md:px-8 py-4 flex flex-col gap-2">
    <div className="flex items-center justify-between gap-3">
      <button onClick={handleExplainDifferently} disabled={currentLevel >= 4}
        className="flex items-center gap-2 px-5 py-3 bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#5B9BD5] disabled:opacity-40 disabled:cursor-not-allowed text-[#475467] text-[14px] font-semibold rounded-xl transition-all">
        {Icons.refresh} Explain differently
      </button>
      <button onClick={handleUnderstood} disabled={understood}
        className="flex items-center gap-2 px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-all"
        style={{ background: understood ? '#70AD47' : color }}>
        {understood ? Icons.check : Icons.arrow}
        {understood ? 'Moving to quiz...' : 'I understand — next'}
      </button>
    </div>
    {!understood && (
      <button onClick={async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('student_progress').upsert({
              student_id: user.id,
              topic_id: topicId,
              level_reached: currentLevel,
              is_stuck: true,
              last_studied_at: new Date().toISOString(),
            }, { onConflict: 'student_id,topic_id' });
          }
        } catch (err) { console.error(err); }
        alert('Your teacher has been notified that you need help with this topic.');
      }}
        className="text-[12px] text-[#94A3B8] hover:text-[#BA1A1A] transition-colors text-center py-1">
        I am stuck and need help with this topic
      </button>
    )}
  </div>
</div>
    </div>
  );
}