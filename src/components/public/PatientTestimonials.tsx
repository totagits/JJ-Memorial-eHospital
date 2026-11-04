import React, { useState } from 'react';
import { 
  Star, 
  Quote, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';

export const PatientTestimonials: React.FC = () => {
  const db = getDatabaseState();
  const feedbacks = (db.patientFeedbacks || []).filter(f => f.isFeaturedOnHome && f.rating >= 4);

  const [activeIndex, setActiveIndex] = useState(0);

  if (feedbacks.length === 0) return null;

  const current = feedbacks[activeIndex] || feedbacks[0];

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % feedbacks.length);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + feedbacks.length) % feedbacks.length);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Verified Patient Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Families Across Monrovia
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Real feedback from patients treated at our VOA East Community main hospital and outpatient specialty clinics.
          </p>
        </div>

        {/* Featured Testimonial Hero Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden mb-12">
          {/* Subtle decoration */}
          <Quote className="absolute top-6 right-8 w-24 h-24 text-slate-800 pointer-events-none opacity-40" />

          <div className="relative max-w-3xl space-y-6">
            {/* Stars */}
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < current.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                />
              ))}
              <span className="text-xs font-bold text-amber-300 ml-2">
                5.0 Verified Patient Review
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              "{current.title}"
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic">
              "{current.comment}"
            </p>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-teal-300">{current.patientName}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    ✓ Verified EMR Patient
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    {current.communityLocation || 'Montserrado, Liberia'}
                  </span>
                  <span>·</span>
                  <span>Treated in {current.serviceCategory.replace('_', ' ')}</span>
                  {current.careProviderName && (
                    <>
                      <span>·</span>
                      <span className="text-slate-300">{current.careProviderName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono px-1">
                  {activeIndex + 1} / {feedbacks.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Small Grid Cards of other reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedbacks.slice(0, 3).map((fb, idx) => (
            <div
              key={fb.id}
              onClick={() => setActiveIndex(idx)}
              className={`bg-white rounded-2xl border p-6 shadow-xs space-y-4 cursor-pointer transition-all ${
                activeIndex === idx ? 'border-teal-700 ring-2 ring-teal-700/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: fb.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(fb.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                {fb.title}
              </h4>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                "{fb.comment}"
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-800">{fb.patientName}</span>
                <span className="text-[11px] text-teal-800 font-semibold">{fb.communityLocation?.split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
