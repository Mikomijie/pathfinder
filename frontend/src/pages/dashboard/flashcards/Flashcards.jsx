import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
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
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const subjectColor = {
  'Mathematics': '#5B9BD5',
  'English Language': '#70AD47',
  'Basic Science': '#F59E0B',
};

const TopicFlashcards = {
  'Introduction to Fractions': [
    { front: 'What is a fraction?', back: 'A fraction is a part of a whole, written as one number over another.' },
    { front: 'What is the numerator?', back: 'The top number in a fraction — it tells you how many parts you have.' },
    { front: 'What is the denominator?', back: 'The bottom number — it tells you how many equal parts the whole is divided into.' },
    { front: 'What does 3/4 mean?', back: 'You have 3 out of 4 equal parts.' },
    { front: 'What is one half as a fraction?', back: '1/2 — one part out of two equal parts.' },
  ],
  'Adding Fractions': [
    { front: 'How do you add fractions with the same denominator?', back: 'Add only the numerators. Keep the denominator the same. Example: 1/5 + 2/5 = 3/5' },
    { front: 'What is 2/6 + 3/6?', back: '5/6 — add the top numbers, keep the bottom number.' },
    { front: 'What must you do before adding fractions with different denominators?', back: 'Make the denominators equal first.' },
    { front: 'What is 1/2 + 1/4?', back: '3/4 — convert 1/2 to 2/4 first, then add.' },
    { front: 'What stays the same when adding fractions with equal denominators?', back: 'The denominator stays the same. Only the numerators are added.' },
  ],
  'Multiplying Fractions': [
    { front: 'How do you multiply two fractions?', back: 'Multiply the numerators together, then multiply the denominators together.' },
    { front: 'What is 1/2 × 2/3?', back: '2/6 which simplifies to 1/3.' },
    { front: 'What is 2/3 × 3/4?', back: '6/12 which simplifies to 1/2.' },
    { front: 'What does it mean to simplify a fraction?', back: 'Divide both the numerator and denominator by the same number.' },
    { front: 'What is 6/12 simplified?', back: '1/2 — divide both numbers by 6.' },
  ],
  'Parts of Speech': [
    { front: 'What is a noun?', back: 'A word that names a person, place or thing. Example: Amaka, Lagos, book.' },
    { front: 'What is a verb?', back: 'A word that shows action or state. Example: runs, is, thinks.' },
    { front: 'What is an adjective?', back: 'A word that describes a noun. Example: tall, happy, red.' },
    { front: 'What is an adverb?', back: 'A word that describes a verb. Example: quickly, always, very.' },
    { front: 'What is a pronoun?', back: 'A word that replaces a noun. Example: he, she, it, they.' },
  ],
  'Punctuation Marks': [
    { front: 'What does a full stop do?', back: 'It ends a sentence. Example: I live in Lagos.' },
    { front: 'What does a comma do?', back: 'It creates a pause or separates items in a list.' },
    { front: 'When do you use a question mark?', back: 'At the end of a question. Example: Where are you going?' },
    { front: 'What does an exclamation mark show?', back: 'Strong feeling or surprise. Example: That is amazing!' },
    { front: 'What is an apostrophe used for?', back: "To show ownership or shorten words. Example: Emeka's book, I'm happy." },
  ],
  'Writing a Good Paragraph': [
    { front: 'What are the three parts of a good paragraph?', back: 'Topic sentence, supporting sentences, and concluding sentence.' },
    { front: 'What is a topic sentence?', back: 'The first sentence — it introduces the main idea of the paragraph.' },
    { front: 'What do supporting sentences do?', back: 'They give details and examples that back up the topic sentence.' },
    { front: 'What does a concluding sentence do?', back: 'It wraps up the paragraph and connects back to the main idea.' },
    { front: 'What is the burger analogy for paragraphs?', back: 'Top bun = topic sentence, filling = supporting sentences, bottom bun = concluding sentence.' },
  ],
  'Photosynthesis': [
    { front: 'What is photosynthesis?', back: 'The process by which plants make their own food using sunlight, water and carbon dioxide.' },
    { front: 'What three things does a plant need for photosynthesis?', back: 'Sunlight, water and carbon dioxide (CO₂).' },
    { front: 'What does a plant produce during photosynthesis?', back: 'Glucose (food for the plant) and oxygen.' },
    { front: 'Where does photosynthesis happen?', back: 'Inside the chloroplasts in the green parts of the leaf.' },
    { front: 'What gas is released during photosynthesis?', back: 'Oxygen — which is the air we breathe.' },
  ],
  'The Human Digestive System': [
    { front: 'Where does digestion begin?', back: 'In the mouth — teeth chew food and saliva begins breaking it down.' },
    { front: 'What does the stomach do?', back: 'It uses acid to break food down into liquid.' },
    { front: 'What is the role of the small intestine?', back: 'It absorbs nutrients from digested food into the bloodstream.' },
    { front: 'What does the large intestine absorb?', back: 'Water — and it forms waste from what is left.' },
    { front: 'What is the oesophagus?', back: 'A tube that carries food from the mouth down to the stomach.' },
  ],
  'States of Matter': [
    { front: 'What are the three states of matter?', back: 'Solid, liquid and gas.' },
    { front: 'What is a solid?', back: 'Fixed shape and volume. Example: ice, stone.' },
    { front: 'What is a liquid?', back: 'Fixed volume but no fixed shape. Example: water, oil.' },
    { front: 'What is a gas?', back: 'No fixed shape or volume. Example: steam, oxygen.' },
    { front: 'What are the three states of water?', back: 'Ice (solid), water (liquid) and steam (gas).' },
  ],
};

export default function Flashcards() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    fetchTopic();
    return () => window.speechSynthesis?.cancel();
  }, [topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTopic = async () => {
    const { data: topicData } = await supabase
      .from('topics').select('*').eq('id', topicId).single();
    setTopic(topicData);
    const hardcoded = TopicFlashcards[topicData?.title] || [];
    setCards(hardcoded);
    setLoading(false);
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const handleVoice = (e, text) => {
    e.stopPropagation();
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

  const nextCard = () => {
    setFlipped(false);
    setSpeaking(false);
    window.speechSynthesis?.cancel();
    setTimeout(() => {
      if (currentCard < cards.length - 1) {
        setCurrentCard(prev => prev + 1);
      } else {
        setFinished(true);
      }
    }, 250);
  };

  const handleKnow = () => { known.indexOf(currentCard) === -1 && setKnown(prev => [...prev, currentCard]); nextCard(); };
  const handleStudyMore = () => nextCard();

  const handleRestart = () => {
    setCurrentCard(0);
    setFlipped(false);
    setKnown([]);
    setFinished(false);
    setSpeaking(false);
  };

  const color = topic ? (subjectColor[topic.subject] || '#5B9BD5') : '#5B9BD5';
  const card = cards[currentCard];
  const knownCount = known.length;
  const remaining = cards.length - currentCard - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <p className="text-[14px] text-[#475467]">Loading flashcards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div className="text-center">
          <h2 className="text-[22px] font-extrabold text-[#0F172A] mb-3">No flashcards yet</h2>
          <button onClick={() => navigate('/dashboard/student')}
            className="px-8 py-3 bg-[#136299] text-white font-bold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .f1 { animation: fadeUp 0.5s ease forwards; }
          .f2 { animation: fadeUp 0.5s 0.15s ease both; }
          .f3 { animation: fadeUp 0.5s 0.3s ease both; }
        `}</style>
        <div className="text-center max-w-[440px] w-full">
          <div className="f1 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4"
            style={{ borderColor: color, background: `${color}15` }}>
            <div>
              <p className="text-[28px] font-extrabold" style={{ color }}>{knownCount}/{cards.length}</p>
              <p className="text-[10px] text-[#94A3B8] font-medium">known</p>
            </div>
          </div>

          <div className="f1 flex items-center justify-center gap-1.5 mb-5">
            {[1,2,3].map(i => (
              <span key={i} style={{ color: i <= Math.ceil(knownCount/cards.length*3) ? '#F59E0B' : '#E4E7EC' }}>
                {Icons.star}
              </span>
            ))}
          </div>

          <h1 className="f1 text-[26px] font-extrabold text-[#0F172A] mb-2">
            {knownCount === cards.length ? 'You know them all!' : knownCount >= cards.length / 2 ? 'Good session!' : 'Keep practising!'}
          </h1>
          <p className="f2 text-[14px] text-[#475467] leading-[1.7] mb-8">
            You marked <span className="font-bold" style={{ color }}>{knownCount} out of {cards.length}</span> cards as known.
            {knownCount < cards.length && ' Review the others again — repetition is how we learn.'}
          </p>

          <div className="f3 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleRestart}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#E4E7EC] hover:border-[#5B9BD5] text-[#475467] text-[14px] font-semibold rounded-xl transition-all">
              {Icons.refresh} Review Again
            </button>
            <button onClick={() => navigate('/dashboard/student')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 text-white text-[14px] font-bold rounded-xl transition-colors"
              style={{ background: color }}>
              Dashboard {Icons.arrow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .card-wrap { perspective: 1400px; }
        .card-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform 0.55s cubic-bezier(0.4,0,0.2,1);
          transform-style: preserve-3d;
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-front, .card-back {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; border-radius: 20px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 36px; text-align: center;
        }
        .card-back { transform: rotateY(180deg); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* TOP BAR */}
      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-20">
        <div className="max-w-[620px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          <button onClick={() => { window.speechSynthesis?.cancel(); navigate('/dashboard/student'); }}
            className="flex items-center gap-2 text-[14px] font-medium text-[#475467] hover:text-[#1E293B] transition-colors">
            {Icons.back} Dashboard
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-[#70AD47]">{knownCount} known</span>
            <span className="text-[12px] text-[#94A3B8]">·</span>
            <span className="text-[12px] text-[#94A3B8]">{remaining} left</span>
            <div className="flex gap-1 ml-1">
              {cards.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: known.includes(i) ? '#70AD47' : i === currentCard ? color : '#E4E7EC',
                    transform: i === currentCard ? 'scale(1.4)' : 'scale(1)'
                  }}/>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[560px] mx-auto w-full px-5 md:px-8 py-8 flex flex-col gap-5">

        {/* Header */}
        <div className="fade">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
            {topic?.subject} · Flashcards
          </p>
          <h2 className="text-[18px] font-extrabold text-[#0F172A]">{topic?.title}</h2>
          <p className="text-[13px] text-[#94A3B8] mt-1">
            Card {currentCard + 1} of {cards.length} — tap to reveal the answer
          </p>
        </div>

        {/* CARD */}
        <div className="card-wrap" style={{ height: '300px' }}>
          <div className={`card-inner ${flipped ? 'flipped' : ''}`} onClick={handleFlip}
            style={{ cursor: 'pointer' }}>

            {/* FRONT — white, colored border */}
            <div className="card-front bg-white border-2 shadow-lg shadow-black/5"
              style={{ borderColor: color }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60" style={{ color }}>
                Question
              </p>
              <p className="text-[17px] md:text-[19px] font-bold text-[#0F172A] leading-[1.6]">
                {card?.front}
              </p>
              <button
                onClick={(e) => handleVoice(e, card?.front)}
                className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] text-[12px] font-medium transition-colors"
                style={{ color: speaking ? color : '#94A3B8' }}
              >
                {Icons.voice} {speaking ? 'Stop' : 'Listen'}
              </button>
              <p className="text-[11px] text-[#94A3B8] mt-4 absolute bottom-5">tap to flip</p>
            </div>

            {/* BACK — dark navy, clean */}
            <div className="card-back bg-[#0F172A] border-2 border-[#1E293B] shadow-lg shadow-black/20">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40 text-white">
                Answer
              </p>
              <p className="text-[17px] md:text-[19px] font-bold text-white leading-[1.6]">
                {card?.back}
              </p>
              <button
                onClick={(e) => handleVoice(e, card?.back)}
                className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-[12px] font-medium text-white/60 hover:text-white hover:border-white/40 transition-colors"
              >
                {Icons.voice} Listen
              </button>
              <p className="text-[11px] text-white/20 mt-4 absolute bottom-5">tap to flip back</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {flipped ? (
          <div className="flex gap-3 fade">
            <button
              onClick={handleStudyMore}
              className="flex-1 py-4 bg-white border-2 border-[#E4E7EC] hover:border-[#BA1A1A] hover:bg-[#FFF1F1] text-[#475467] hover:text-[#BA1A1A] text-[15px] font-bold rounded-xl transition-all"
            >
              Study more
            </button>
            <button
              onClick={handleKnow}
              className="flex-1 py-4 text-white text-[15px] font-bold rounded-xl transition-all shadow-md"
              style={{ background: '#70AD47' }}
            >
              I know this
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 py-4 bg-[#F8FAFC] border-2 border-dashed border-[#E4E7EC] rounded-xl flex items-center justify-center">
              <p className="text-[13px] text-[#94A3B8] font-medium">Tap card to reveal answer</p>
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#70AD47] flex-shrink-0"/>
          <p className="text-[13px] text-[#1E293B] leading-[1.6]">
            Mark cards you know. The ones you don't will come back with practice.
          </p>
        </div>

      </div>
    </div>
  );
}