import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { PatientTestimonial } from '../../types';
import { useTranslation } from '../../services/i18n';
import { Star, ShieldCheck, MessageSquarePlus, ThumbsUp, Quote } from 'lucide-react';

interface PatientTestimonialsProps {
  onLeaveFeedback: () => void;
}

export const PatientTestimonials: React.FC<PatientTestimonialsProps> = ({ onLeaveFeedback }) => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<PatientTestimonial[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');

  useEffect(() => {
    const update = () => {
      setTestimonials(dbStore.getTestimonials().filter((item) => item.isPublicConsent));
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const departments = ['All', 'Internal Medicine & OPD', 'Cardiology & Triage', 'Maternal & Child Health', 'Pharmacy & Blood Bank'];

  const filtered = selectedDept === 'All'
    ? testimonials
    : testimonials.filter((t) => t.department === selectedDept);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Patient Experiences</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-hospital-navy tracking-tight">
              {t('testimonials')}
            </h2>
            <p className="text-slate-600 text-base">
              Real feedback from patients and families cared for across our clinical departments in Monrovia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onLeaveFeedback}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Submit Your Review</span>
            </button>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedDept === dept
                  ? 'bg-hospital-navy text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              <div className="space-y-4">
                {/* Header: Stars & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {testimonial.verified && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-slate-700 text-sm leading-relaxed relative italic">
                  "{testimonial.comment}"
                </p>
              </div>

              {/* Author & Department Footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {testimonial.patientName}
                  </div>
                  <div className="text-[11px] font-medium text-teal-600">
                    {testimonial.department}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  {testimonial.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
