import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function LessonComplete() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
      <div className="text-center max-w-[480px]">
        <div className="w-20 h-20 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#70AD47]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2">Well done!</h1>
        <p className="text-[15px] text-[#475467] leading-[1.7] mb-8">
          You completed this lesson. Every step forward counts — no matter how small.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(`/lesson/${topicId}/quiz`)}
            className="px-8 py-3.5 bg-[#136299] hover:bg-[#0F4F7A] text-white text-[15px] font-bold rounded-xl transition-colors"
          >
            Take the Quiz
          </button>
          <button
            onClick={() => navigate('/dashboard/student')}
            className="px-8 py-3.5 bg-white border border-[#E4E7EC] hover:border-[#136299] text-[#475467] text-[15px] font-semibold rounded-xl transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}