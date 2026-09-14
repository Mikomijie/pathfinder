import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Icons = {
  arrow: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
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
  study: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="13" y2="14"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  focus: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
};

const skillsData = [
  {
    key: 'study',
    title: 'Study Skills',
    subtitle: 'Learn how to learn — techniques that actually work for your brain',
    color: '#5B9BD5',
    bg: '#EFF6FF',
    icon: Icons.study,
    lessons: [
      {
        title: 'How to Take Notes That Stick',
        level_1: 'Note-taking is not about writing everything the lecturer says. Your brain cannot process and write at the same time. Instead, write the key idea in one sentence, leave space below it, and fill in details after the lecture. The goal is to capture the main idea, not every word. Review your notes within 24 hours — this is when your brain stores information most effectively.',
        level_2: 'Think of a lecture like a market stall owner calling out their goods. If you try to write down every single thing they say, you will be too busy writing to actually hear anything. A smarter trader listens first, identifies the best deal, and writes that down. Your notes are your deal list — only what matters most.',
        level_3: `THE PATHFINDER NOTE METHOD:

During the lecture:
→ Write only the main idea (1 sentence)
→ Leave 3-4 lines of space below it
→ Draw a star next to anything the lecturer repeats

After the lecture (within 24 hours):
→ Fill in the gaps from memory
→ Add examples in your own words
→ Write one question you still have at the bottom

Review:
→ Read your notes out loud
→ Cover and try to recall from memory`,
        level_4: 'Try this now: Think of the last lecture or class you attended. Without looking at your notes, write down the ONE main idea that was taught. Just one sentence. If you can do that, you remembered the most important thing. If you cannot, that is useful information — it means the notes need improving.',
      },
      {
        title: 'Breaking Big Tasks Into Small Steps',
        level_1: 'A big task like "write an essay" feels impossible to start because your brain cannot see where to begin. The solution is to break it into the smallest possible steps — so small that each one takes less than 10 minutes. Instead of "write essay", you write: "open document, write the title, write one sentence introducing the topic." Starting is always the hardest part. Tiny steps eliminate that barrier.',
        level_2: 'Imagine you need to eat an elephant. You cannot eat it in one bite — it is too big and the thought alone is overwhelming. But if someone cuts it into tiny pieces and puts one piece in front of you at a time, you can eat the whole thing without feeling overwhelmed. Breaking tasks works the same way. One tiny piece at a time.',
        level_3: `THE TASK BREAKDOWN METHOD:

Step 1: Write the full task
→ "Write a 2000-word assignment on climate change"

Step 2: Break into phases
→ Research | Outline | Write | Edit

Step 3: Break each phase into 10-minute tasks
→ Research: Find 3 sources (10 mins)
→ Research: Read abstract of each source (10 mins)
→ Outline: Write 5 bullet points for body (10 mins)

Step 4: Do ONE 10-minute task right now
→ Set a timer. Start.

Step 5: Rest for 5 minutes. Then do the next one.`,
        level_4: 'Try this now: Pick one assignment or task you have been avoiding. Write it at the top of a piece of paper. Now break it into exactly 5 steps. Each step should take no more than 15 minutes. Write all 5 steps. Do the first one right now — even if it is just "open the document and write the title."',
      },
    ]
  },
  {
    key: 'time',
    title: 'Time & Planning',
    subtitle: 'Manage your time without feeling controlled by it',
    color: '#70AD47',
    bg: '#F0FDF4',
    icon: Icons.clock,
    lessons: [
      {
        title: 'Time Blocking for ADHD Brains',
        level_1: 'Time blocking means assigning specific time slots to specific tasks instead of having a vague to-do list. Instead of "study today", you write "9am-10am: read chapter 3 of biology". This works for ADHD brains because it removes the decision of what to do next — the schedule tells you. Always add buffer time between blocks. If a task takes 30 minutes, give it 45. ADHD brains consistently underestimate time.',
        level_2: 'In Lagos, danfo drivers do not just drive anywhere and hope they end up somewhere useful. They have a route. They know: "I leave Oshodi at 7am, I get to CMS by 8am." Time blocking gives your day a route. Without it, you drive around burning fuel going nowhere. With it, you know exactly where you are headed at every hour.',
        level_3: `HOW TO BUILD YOUR TIME BLOCK SCHEDULE:

Morning (before lectures):
→ 7:00 - 7:30: Wake up, eat, no phone
→ 7:30 - 8:00: Review yesterday's notes (15 mins)
→ 8:00 - 8:30: Travel buffer

Study blocks (use this formula):
→ 25 mins focused work
→ 5 mins break (move around)
→ Repeat 3 times
→ 30 mins longer break

IMPORTANT RULES FOR ADHD:
→ Never schedule more than 3 hours of studying per day
→ Always add 15 mins buffer after each block
→ Put your hardest task in your FIRST block (when energy is highest)
→ Phone goes in another room during blocks`,
        level_4: 'Try this now: Open your calendar or a piece of paper. Plan tomorrow hour by hour. Include: wake up time, meals, travel, one 25-minute study block, and rest. Keep it simple. The goal is just to have a plan — even an imperfect one is better than none.',
      },
    ]
  },
  {
    key: 'focus',
    title: 'Focus & Attention',
    subtitle: 'Work with your attention, not against it',
    color: '#9B8DBE',
    bg: '#F5F3FF',
    icon: Icons.focus,
    lessons: [
      {
        title: 'The ADHD-Friendly Pomodoro Method',
        level_1: 'The standard Pomodoro method says 25 minutes of work then 5 minutes of rest. But for ADHD brains, 25 minutes can still be too long. Start with 10-15 minutes of focused work, then a 5 minute break. Build up gradually. The key is that during your work time, nothing else exists — phone off, one tab open, one task. The break is a real break: stand up, move, look away from the screen.',
        level_2: 'Think of your attention like phone battery. A regular phone battery lasts all day. An ADHD battery runs low faster but recharges quickly. The mistake most students make is trying to use their battery until it dies completely — then they cannot study at all. Smart charging means frequent short breaks before you run out. Keep the battery alive all day instead of draining it once.',
        level_3: `THE PATHFINDER FOCUS METHOD:

Setup (2 minutes):
→ Close all tabs except what you need
→ Put phone face down in another room
→ Write ONE task you are doing right now
→ Set timer for 15 minutes

During the 15 minutes:
→ Only work on that ONE task
→ If a thought comes, write it on a piece of paper and return to work
→ Do NOT check your phone

Break (5 minutes):
→ Stand up and move
→ Drink water
→ Look at something far away (rests your eyes)
→ Do NOT scroll social media

After 3 rounds → take a 20 minute proper break`,
        level_4: 'Try this now: Set a timer for 10 minutes. Put your phone in another room. Work on one thing only. When the timer goes off, notice how you feel. Was 10 minutes manageable? Most ADHD students are surprised that they can do 10 minutes easily. That is your starting point.',
      },
    ]
  },
  {
    key: 'emotion',
    title: 'Emotional Regulation',
    subtitle: 'Handle the emotional side of university life',
    color: '#F59E0B',
    bg: '#FFFBEB',
    icon: Icons.heart,
    lessons: [
      {
        title: 'Managing Exam Anxiety',
        level_1: 'Exam anxiety is extremely common in neurodivergent students. Your brain interprets the exam as a threat, triggering the same response as physical danger — heart racing, difficulty thinking clearly, sweating. This is not weakness. It is your nervous system doing its job. The key is to teach your body that the exam is safe. This is done through preparation, breathing, and self-talk. The anxiety does not go away — but you can reduce it to a manageable level.',
        level_2: 'Imagine you are about to perform on stage. If you have never rehearsed, your body panics — this is a real threat. But if you have rehearsed 20 times, your body says "I have done this before, I can do it again." Exam preparation works the same way. The more familiar the material feels, the less threatening the exam is to your nervous system. Revision is not just about knowing the content — it is about making the exam feel familiar.',
        level_3: `BEFORE THE EXAM:

Week before:
→ Do practice questions under timed conditions
→ This trains your brain that the exam environment is safe
→ Sleep 7-8 hours minimum (memory consolidation happens during sleep)

Day before:
→ Light review only — no new material
→ Prepare your bag the night before
→ Go to bed at your normal time

Morning of exam:
→ Eat a proper meal (glucose = brain fuel)
→ Arrive early — rushing increases anxiety
→ Do 5 deep breaths before entering

During the exam:
→ Read all questions first (2 minutes)
→ Start with the question you know best
→ If mind goes blank: breathe in for 4 counts, hold for 4, out for 4`,
        level_4: 'Try this now: Think of one upcoming exam or deadline that is making you anxious. Write down: (1) What is the worst realistic outcome? (2) What can you do in the next 24 hours to prepare? (3) Who can you ask for help? Writing it down takes it out of your head and makes it manageable.',
      },
    ]
  },
  {
    key: 'career',
    title: 'Career Readiness',
    subtitle: 'Prepare for life after university',
    color: '#136299',
    bg: '#EFF6FF',
    icon: Icons.briefcase,
    lessons: [
      {
        title: 'Writing Professional Emails',
        level_1: 'A professional email has five parts: subject line, greeting, purpose, request or information, and sign-off. The subject line should tell the reader exactly what the email is about before they open it. Keep emails short — three to five sentences if possible. State your purpose in the first sentence. Do not bury the main point at the end. Proofread before sending — a typo in a professional email leaves a poor impression.',
        level_2: 'Think of a professional email like a keke napep trip. When you enter a keke, the driver immediately asks where you are going. He does not drive for 5 minutes first and then ask. A good email works the same way — in the first sentence, you tell the person exactly where you are going (what you want). Do not make them ride with you for 10 sentences before they find out the point.',
        level_3: `PROFESSIONAL EMAIL TEMPLATE:

Subject: [Clear, specific — e.g. "Request for Appointment — CSC 301 Assignment"]

Greeting:
→ "Dear Dr. [Last Name]," (formal)
→ "Hello [First Name]," (semi-formal, if they have asked you to use first name)

Opening (1 sentence — state your purpose):
→ "I am writing to request an appointment to discuss my performance in CSC 301."

Body (2-3 sentences max):
→ Give necessary context
→ Make your request or provide information clearly

Closing:
→ "Thank you for your time."
→ "I look forward to hearing from you."

Sign-off:
→ "Best regards,"
→ [Your Full Name]
→ [Student ID]
→ [Course]`,
        level_4: 'Try this now: Write a professional email to a lecturer or potential employer. Use the template above. Before sending, check: (1) Is the subject line clear? (2) Did you state your purpose in the first sentence? (3) Is it under 5 sentences? (4) Did you proofread? If you do not have a real email to send, write a practice one to yourself.',
      },
    ]
  },
];

const levelLabels = {
  1: { label: 'Simple', desc: 'Clear, plain explanation' },
  2: { label: 'Analogy', desc: 'Explained using a comparison' },
  3: { label: 'Steps', desc: 'Broken down as a practical guide' },
  4: { label: 'Try it', desc: 'A real action you can do now' },
};

export default function SkillsHub() {
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars
  const [activeSkill, setActiveSkill] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  const handleVoice = (text) => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.75;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const getCurrentText = () => {
    if (!activeLesson) return '';
    const map = {
      1: activeLesson.level_1,
      2: activeLesson.level_2,
      3: activeLesson.level_3,
      4: activeLesson.level_4,
    };
    return map[currentLevel] || '';
  };

  // LESSON VIEW
  if (activeLesson) {
    const skill = activeSkill;
    return (
      <div className="flex flex-col min-h-[calc(100vh-120px)]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          .fade { animation: fadeUp 0.4s ease forwards; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
          .pulse { animation: pulse 1.5s ease infinite; }
        `}</style>

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { setActiveLesson(null); setCurrentLevel(1); window.speechSynthesis?.cancel(); setSpeaking(false); }}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors"
          >
            {Icons.back} Back to Skills
          </button>
          <button
            onClick={() => handleVoice(getCurrentText())}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
              speaking ? 'text-white pulse' : 'bg-[#F8FAFC] border border-[#E4E7EC] text-[#475467] hover:border-[#5B9BD5]'
            }`}
            style={speaking ? { background: skill.color } : {}}
          >
            {speaking ? Icons.stop : Icons.voice}
            {speaking ? 'Stop' : 'Listen'}
          </button>
        </div>

        {/* LESSON HEADER */}
        <div className="fade mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: skill.color }}>
            {skill.title} · {levelLabels[currentLevel].label}
          </p>
          <h1 className="text-[22px] font-extrabold text-[#0F172A]">{activeLesson.title}</h1>
          <p className="text-[13px] text-[#94A3B8] mt-1">{levelLabels[currentLevel].desc}</p>
        </div>

        {/* LEVEL TABS */}
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {[1,2,3,4].map(l => (
            <button key={l} onClick={() => { setCurrentLevel(l); window.speechSynthesis?.cancel(); setSpeaking(false); }}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                l === currentLevel ? 'text-white border-transparent'
                : 'bg-white text-[#475467] border-[#E4E7EC] cursor-pointer hover:border-opacity-50'
              }`}
              style={l === currentLevel ? { background: skill.color } : {}}>
              {levelLabels[l].label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div key={currentLevel} className="fade flex-1 bg-white border border-[#E4E7EC] rounded-2xl p-6 md:p-8 mb-5">
          <p className="text-[16px] md:text-[17px] text-[#1E293B] leading-[1.9] whitespace-pre-line">
            {getCurrentText()}
          </p>
        </div>

        {/* ENCOURAGEMENT */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-3 flex items-center gap-3 mb-5">
          <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0"/>
          <p className="text-[13px] text-[#1E293B] leading-[1.6]">
            {currentLevel === 1 && "Take your time reading this. There is no rush."}
            {currentLevel === 2 && "This explanation uses a comparison to help it make sense."}
            {currentLevel === 3 && "This is a practical guide you can use right now."}
            {currentLevel === 4 && "This is a real action. Try it — even a small attempt counts."}
          </p>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => currentLevel > 1 && setCurrentLevel(currentLevel - 1)}
            disabled={currentLevel === 1}
            className="flex items-center gap-2 px-5 py-3 bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#5B9BD5] disabled:opacity-40 disabled:cursor-not-allowed text-[#475467] text-[14px] font-semibold rounded-xl transition-all"
          >
            {Icons.refresh} Previous
          </button>
          {currentLevel < 4 ? (
            <button
              onClick={() => setCurrentLevel(currentLevel + 1)}
              className="flex items-center gap-2 px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-all"
              style={{ background: skill.color }}
            >
              Next Level {Icons.arrow}
            </button>
          ) : (
            <button
              onClick={() => { setActiveLesson(null); setCurrentLevel(1); window.speechSynthesis?.cancel(); setSpeaking(false); }}
              className="flex items-center gap-2 px-6 py-3 text-white text-[14px] font-bold rounded-xl transition-all"
              style={{ background: '#70AD47' }}
            >
              {Icons.check} Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // SKILL LESSONS LIST
  if (activeSkill) {
    return (
      <div className="flex flex-col gap-6">
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } .f1 { animation: fadeUp 0.4s ease forwards; } .f2 { animation: fadeUp 0.4s 0.08s ease both; }`}</style>

        <div className="f1 flex items-center gap-4">
          <button
            onClick={() => setActiveSkill(null)}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors"
          >
            {Icons.back} All Skills
          </button>
        </div>

        <div className="f1 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: activeSkill.bg, color: activeSkill.color }}>
            {activeSkill.icon}
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#0F172A]">{activeSkill.title}</h1>
            <p className="text-[13px] text-[#475467] mt-0.5">{activeSkill.subtitle}</p>
          </div>
        </div>

        <div className="f2 flex flex-col gap-3">
          {activeSkill.lessons.map((lesson, i) => (
            <button
              key={i}
              onClick={() => { setActiveLesson(lesson); setCurrentLevel(1); }}
              className="bg-white border border-[#E4E7EC] rounded-2xl p-5 flex items-center gap-4 hover:border-[#5B9BD5] hover:shadow-sm transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                style={{ background: activeSkill.bg, color: activeSkill.color }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#0F172A]">{lesson.title}</p>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">4 levels · Voice support · Try-it-now action</p>
              </div>
              <span style={{ color: activeSkill.color }}>{Icons.arrow}</span>
            </button>
          ))}
        </div>

        <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-4">
          <p className="text-[13px] text-[#475467] leading-[1.6]">
            Each lesson has 4 levels — simple explanation, analogy, practical steps, and a real action to try. Take your time with each one.
          </p>
        </div>
      </div>
    );
  }

  // SKILLS HOME
  return (
    <div className="flex flex-col gap-6">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .f1 { animation: fadeUp 0.4s ease forwards; }
        .f2 { animation: fadeUp 0.4s 0.08s ease both; }
        .f3 { animation: fadeUp 0.4s 0.16s ease both; }
      `}</style>

      <div className="f1">
        <h1 className="text-[24px] font-extrabold text-[#0F172A]">Skills Hub</h1>
        <p className="text-[14px] text-[#475467] mt-1">
          Essential skills for university life — built specifically for how your brain works.
        </p>
      </div>

      {/* INTRO CARD */}
      <div className="f2 bg-[#0F172A] rounded-2xl p-6">
        <p className="text-[10px] font-bold text-[#5B9BD5] uppercase tracking-widest mb-2">Why Skills Hub?</p>
        <p className="text-[15px] text-white font-semibold leading-[1.6] mb-1">
          University is hard for everyone. For neurodivergent students, it is harder.
        </p>
        <p className="text-[13px] text-[#64748B] leading-[1.7]">
          These lessons teach the skills Nigerian universities assume you already have — but never actually teach. Study techniques, time management, focus strategies, emotional tools, and career skills. All adapted for ADHD and neurodivergent learners.
        </p>
      </div>

      {/* SKILLS GRID */}
      <div className="f3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillsData.map((skill, i) => (
          <button
            key={skill.key}
            onClick={() => setActiveSkill(skill)}
            className="bg-white border border-[#E4E7EC] rounded-2xl p-5 text-left hover:border-[#5B9BD5] hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: skill.bg, color: skill.color }}>
                {skill.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-[#0F172A]">{skill.title}</h3>
                <p className="text-[12px] text-[#475467] mt-0.5 leading-[1.5]">{skill.subtitle}</p>
                <p className="text-[11px] font-semibold mt-2" style={{ color: skill.color }}>
                  {skill.lessons.length} lesson{skill.lessons.length !== 1 ? 's' : ''} · 4 levels each
                </p>
              </div>
              <span className="flex-shrink-0 mt-1" style={{ color: skill.color }}>{Icons.arrow}</span>
            </div>
          </button>
        ))}
      </div>

      {/* TIP */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-4 flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0 mt-1.5"/>
        <p className="text-[13px] text-[#1E293B] leading-[1.7]">
          Start with whichever skill feels most urgent right now. There is no wrong order. Each lesson takes about 5 minutes to read and has a real action you can try immediately.
        </p>
      </div>
    </div>
  );
}