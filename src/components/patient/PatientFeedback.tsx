import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { Star, MessageSquarePlus, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

interface PatientFeedbackProps {
  patientName: string;
}

export const PatientFeedback: React.FC<PatientFeedbackProps> = ({ patientName }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [department, setDepartment] = useState('Internal Medicine & OPD');
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isPublicConsent, setIsPublicConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    await dbStore.submitFeedback({
      patientName,
      rating,
      comment: suggestions.trim() ? `${comment.trim()} (Suggestion: ${suggestions.trim()})` : comment.trim(),
      department,
      isPublicConsent,
    });

    setIsSubmitting(false);
    setSuccess(true);
    setComment('');
    setSuggestions('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Continuous Quality & Patient Voice</span>
        </div>
        <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
          Patient Feedback & Care Review
        </h2>
        <p className="text-xs text-slate-500">
          Your feedback directly informs clinical quality enhancements and helps fellow Liberians choose trusted healthcare services.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Thank you for your valuable feedback! Your review has been submitted and aggregated for the Patient Testimonials section.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Overall Hospital Care Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-xs font-bold text-slate-700">
              {rating === 5 && 'Outstanding Care (5/5)'}
              {rating === 4 && 'Very Good (4/5)'}
              {rating === 3 && 'Satisfactory (3/5)'}
              {rating === 2 && 'Needs Improvement (2/5)'}
              {rating === 1 && 'Unsatisfactory (1/5)'}
            </span>
          </div>
        </div>

        {/* Department Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Department Visited *
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="Internal Medicine & OPD">Internal Medicine & OPD</option>
            <option value="Emergency & Triage">Emergency & Triage (OPD)</option>
            <option value="Maternal & Child Health">Maternal & Child Health / Delivery</option>
            <option value="Surgery">General Surgery & Operating Theater</option>
            <option value="Pharmacy & Blood Bank">Pharmacy & Blood Bank Services</option>
            <option value="Diagnostic Laboratory">Diagnostic Laboratory Investigations</option>
            <option value="Radiology & Imaging">Radiology (X-Ray / CT / Ultrasound)</option>
          </select>
        </div>

        {/* Review Comments */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Your Experience & Feedback *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Tell us about the kindness of the nurses, timeliness of the doctors, or comfort of the facility..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Suggestions for Improvement */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Suggestions for Improvement (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="What could we do better on your next visit?"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Public Consent Checkbox */}
        <div className="pt-1">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublicConsent}
              onChange={(e) => setIsPublicConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="text-xs text-slate-600 leading-tight">
              I grant permission for J & J Memorial to publish this review on the public <strong>Patient Testimonials</strong> section to encourage other patients in our community.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!comment.trim() || isSubmitting}
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-2 ${
            comment.trim() && !isSubmitting
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting Review...' : 'Submit Patient Review'}</span>
        </button>
      </form>
    </div>
  );
};
