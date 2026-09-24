import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const Icons = {
  upload: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  paste: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
};

const loadingSteps = [
  { text: 'Reading your content...', icon: Icons.file },
  { text: 'Detecting topic sections...', icon: Icons.book },
  { text: 'Building adaptive lessons...', icon: Icons.brain },
  { text: 'Almost ready...', icon: Icons.spark },
];

export default function PDFUpload({ profile }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [mode, setMode] = useState(isMobile ? 'paste' : 'pdf');

  const [fileName, setFileName] = useState('');
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const readFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported. Please use Paste Notes for other formats.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File too large. Maximum 15MB. Try pasting the text directly instead.');
      return;
    }
    setFileName(file.name);
    setError('');
    setPdfBase64(null);
    if (!topicTitle) setTopicTitle(file.name.replace('.pdf', '').replace(/_/g, ' '));

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result?.split(',')[1];
      if (base64) {
        setPdfBase64(base64);
      } else {
        setError('Could not read PDF. Please try Paste Notes instead.');
      }
    };
    reader.onerror = () => setError('Failed to read file. Please try again.');
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.[0]) readFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) readFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'pdf' && !pdfBase64) { setError('Please select a PDF file first.'); return; }
    if (mode === 'paste' && !pasteText.trim()) { setError('Please paste your notes first.'); return; }

    setError('');
    setProcessing(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => prev < loadingSteps.length - 1 ? prev + 1 : prev);
    }, 7000);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in. Please log in again.');

      let data, fnError;
const result1 = await supabase.functions.invoke('process-pdf', { body: { pdfBase64: mode === 'pdf' ? pdfBase64 : null, pasteText: mode === 'paste' ? pasteText : null, topicTitle: topicTitle.trim() || fileName.replace('.pdf', '') || 'My Notes', studentId: user.id, gradeLevel: profile?.grade_level || 'University' } });
if (result1.error) {
  console.log('First attempt failed, retrying...');
  await new Promise(r => setTimeout(r, 3000));
  const result2 = await supabase.functions.invoke('process-pdf', { body: { pdfBase64: mode === 'pdf' ? pdfBase64 : null, pasteText: mode === 'paste' ? pasteText : null, topicTitle: topicTitle.trim() || fileName.replace('.pdf', '') || 'My Notes', studentId: user.id, gradeLevel: profile?.grade_level || 'University' } });
  data = result2.data;
  fnError = result2.error;
} else {
  data = result1.data;
  fnError = result1.error;
}

      clearInterval(stepInterval);
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setDone(data);
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
        setError('Connection lost. Please check your internet and try again.');
      } else if (msg.includes('timeout') || msg.includes('timed out')) {
        setError('This is taking too long. Please try with a shorter piece of text.');
      } else if (msg.includes('scanned') || msg.includes('image-based') || msg.includes('extract') || msg.includes('Could not read')) {
        setError(msg + ' Switch to Paste Notes and paste your content directly.');
      } else if (msg.includes('AI') || msg.includes('OpenRouter') || msg.includes('Empty response')) {
        setError('Our AI is busy right now. Please wait a moment and try again.');
      } else {
        setError(msg || 'Something went wrong. Please try Paste Notes mode instead.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setDone(null);
    setPdfBase64(null);
    setFileName('');
    setTopicTitle('');
    setError('');
    setPasteText('');
    setMode(isMobile ? 'paste' : 'pdf');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // SUCCESS SCREEN
  if (done) {
    return (
      <div className="flex flex-col gap-6 max-w-[600px]">
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
          .f1 { animation: fadeUp 0.4s ease forwards; }
          .f2 { animation: fadeUp 0.4s 0.1s ease both; }
          .f3 { animation: fadeUp 0.4s 0.2s ease both; }
          .pop { animation: pop 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
        `}</style>

        <div className="f1 flex flex-col items-center text-center gap-3 py-4">
          <div className="pop w-16 h-16 rounded-full bg-[#F0FDF4] border-2 border-[#70AD47] flex items-center justify-center text-[#70AD47]">
            {Icons.check}
          </div>
          <h2 className="text-[22px] font-extrabold text-[#0F172A]">Your lessons are ready!</h2>
          <p className="text-[14px] text-[#475467] leading-[1.7]">
            We created <span className="font-bold text-[#136299]">{done.totalParts} micro-lesson{done.totalParts !== 1 ? 's' : ''}</span> from your notes.
            Each one has 4 explanation levels, voice support, and a visual diagram.
          </p>
        </div>

        <div className="f2 flex flex-col gap-3">
          {done.lessons?.map((lesson, i) => (
            <button key={i} onClick={() => navigate(`/lesson/${lesson.topicId}`)}
              className="bg-white border border-[#E4E7EC] rounded-xl p-4 flex items-center gap-4 hover:border-[#5B9BD5] hover:shadow-sm transition-all text-left active:scale-[0.99]">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#136299] font-bold text-[13px] flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#0F172A]">{lesson.title}</p>
                <p className="text-[12px] text-[#94A3B8]">4 levels · Voice · Visual · Quiz</p>
              </div>
              <span className="text-[#5B9BD5]">{Icons.arrow}</span>
            </button>
          ))}
        </div>

        <div className="f3 flex gap-3">
          <button onClick={handleReset}
            className="flex-1 py-3 bg-white border border-[#E4E7EC] hover:border-[#5B9BD5] text-[#475467] text-[14px] font-semibold rounded-xl transition-colors">
            Upload Another
          </button>
          <button onClick={() => navigate(`/lesson/${done.lessons[0]?.topicId}`)}
            className="flex-1 py-3 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[14px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            Start Learning {Icons.arrow}
          </button>
        </div>
      </div>
    );
  }

  // PROCESSING SCREEN
  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-8 max-w-[480px] mx-auto text-center">
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-[#E4E7EC]"/>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#5B9BD5] border-r-[#70AD47]"
            style={{ animation: 'spin 1.2s linear infinite' }}/>
          <div className="absolute inset-0 flex items-center justify-center text-[#5B9BD5]">
            {loadingSteps[loadingStep].icon}
          </div>
        </div>
        <div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">Building your lessons</h3>
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {loadingSteps.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === loadingStep ? '24px' : '8px',
                  background: i === loadingStep ? '#5B9BD5' : '#E4E7EC'
                }}/>
            ))}
          </div>
          <p className="text-[14px] text-[#475467]">{loadingSteps[loadingStep].text}</p>
          <p className="text-[12px] text-[#94A3B8] mt-2">This takes 20 to 40 seconds depending on content length.</p>
        </div>
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 w-full text-left">
          <p className="text-[13px] text-[#1E293B] leading-[1.6]">
            Pathfinder is detecting natural topic breaks in your content and building adaptive lessons with 4 explanation levels, voice support, and visual diagrams.
          </p>
        </div>
      </div>
    );
  }

  // UPLOAD FORM
  return (
    <div className="flex flex-col gap-6 max-w-[600px]">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
      `}</style>

      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">Upload Lecture Notes</h1>
        <p className="text-[14px] text-[#475467] mt-1">
          Upload a PDF or paste your notes — Pathfinder creates adaptive micro-lessons automatically.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#FFF1F1] border border-[#FFCDD2] rounded-xl flex gap-3">
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#BA1A1A] mb-1">Something went wrong</p>
            <p className="text-[13px] text-[#BA1A1A]">{error}</p>
            {(error.includes('PDF') || error.includes('scanned') || error.includes('paste')) && (
              <button onClick={() => { setMode('paste'); setError(''); }}
                className="mt-2 text-[12px] font-bold text-[#136299] hover:underline">
                Switch to Paste Notes instead
              </button>
            )}
          </div>
          <button onClick={() => setError('')} className="flex-shrink-0 text-[#BA1A1A]">{Icons.close}</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="f2 flex flex-col gap-5">

        {/* MODE SWITCHER */}
        <div className="flex p-1 bg-[#F1F5F9] rounded-xl gap-1">
          <button type="button" onClick={() => { setMode('pdf'); setError(''); }}
            className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
              mode === 'pdf' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475467] hover:text-[#0F172A]'
            }`}>
            Upload PDF
          </button>
          <button type="button" onClick={() => { setMode('paste'); setError(''); }}
            className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
              mode === 'paste' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475467] hover:text-[#0F172A]'
            }`}>
            Paste Notes
          </button>
        </div>

        {/* PDF UPLOAD */}
        {mode === 'pdf' && (
          <div
            onDragEnter={handleDrag} onDragOver={handleDrag}
            onDragLeave={handleDrag} onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
              pdfBase64 ? 'border-[#70AD47] bg-[#F0FDF4]' : 'border-[#E4E7EC] bg-[#F8FAFC] hover:border-[#5B9BD5]'
            }`}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              style={{
                position: 'absolute', inset: 0, opacity: 0,
                width: '100%', height: '100%', cursor: 'pointer', zIndex: 10,
              }}
            />
            <div className="p-8 flex flex-col items-center justify-center text-center pointer-events-none">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                pdfBase64 ? 'bg-[#70AD47] text-white' : 'bg-white border border-[#E4E7EC] text-[#94A3B8]'
              }`}>
                {pdfBase64 ? Icons.check : Icons.upload}
              </div>
              {pdfBase64 ? (
                <>
                  <p className="text-[15px] font-bold text-[#336b07]">{fileName}</p>
                  <p className="text-[13px] text-[#70AD47] mt-1">PDF loaded — ready to process</p>
                  <button type="button" style={{ pointerEvents: 'auto' }}
                    onClick={(e) => { e.stopPropagation(); setPdfBase64(null); setFileName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="mt-3 text-[12px] text-[#94A3B8] hover:text-[#BA1A1A] transition-colors">
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-bold text-[#0F172A]">
                    {isMobile ? 'Tap to select PDF' : 'Drag and drop your PDF'}
                  </p>
                  <p className="text-[13px] text-[#94A3B8] mt-1">
                    {isMobile ? 'Lecture notes, textbook chapters, handouts' : 'or tap to browse files'}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-3">PDF files only · Max 15MB</p>
                  <p className="text-[11px] text-[#F59E0B] mt-1">
                    Note: If your PDF is scanned or image-based, use Paste Notes instead.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* PASTE TEXT */}
        {mode === 'paste' && (
          <div className="flex flex-col gap-2">
            <div className="border-2 border-[#E4E7EC] focus-within:border-[#5B9BD5] rounded-2xl p-4 bg-white transition-colors">
              <textarea
                rows={8}
                placeholder="Paste your lecture notes, textbook content or study material here..."
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                className="w-full text-[14px] text-[#1E293B] placeholder-[#94A3B8] outline-none resize-none leading-[1.7] bg-transparent"
              />
            </div>
            <p className="text-[12px] text-[#94A3B8]">
              Paste any amount — Pathfinder detects natural sections automatically.
            </p>
          </div>
        )}

        {/* TOPIC TITLE */}
        <div>
          <label className="text-[13px] font-semibold text-[#1E293B] block mb-1.5">
            Topic Title <span className="text-[#94A3B8] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Cell Biology, Nigerian History, Organic Chemistry"
            value={topicTitle}
            onChange={e => setTopicTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#E4E7EC] rounded-xl text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#5B9BD5] transition-all"
          />
        </div>

        {/* WHAT HAPPENS */}
        <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-4">
          <p className="text-[12px] font-bold text-[#475467] uppercase tracking-widest mb-3">What happens next</p>
          <div className="flex flex-col gap-2">
            {[
              'Pathfinder detects natural topic breaks in your content',
              'Each section becomes a micro-lesson with 4 adaptive explanation levels',
              'Voice support and visual diagrams added automatically',
              'Start learning immediately after processing',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#136299] text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-[13px] text-[#475467]">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={mode === 'pdf' ? !pdfBase64 : !pasteText.trim()}
          className="w-full py-4 bg-[#136299] hover:bg-[#0F4F7A] disabled:bg-[#94A3B8] text-white text-[15px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.99]">
          {Icons.spark} Process My Notes
        </button>
      </form>
    </div>
  );
}