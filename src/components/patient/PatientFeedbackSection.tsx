import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  HeartHandshake, 
  Send, 
  ShieldCheck, 
  Clock, 
  User, 
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Patient } from '../../types/patient';
import { PatientFeedback } from '../../types/feedback';
import { addPatientFeedback } from '../../services/storageService';

interface PatientFeedbackSectionProps {
  patient: Patient;
  feedbacks: PatientFeedback[];
}

export const PatientFeedbackSection: React.FC<PatientFeedbackSectionProps> = ({
  patient,
  feedbacks
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [serviceCategory, setServiceCategory] = useState<PatientFeedback['serviceCategory']>('OUTPATIENT_OPD');
  const [careProviderName, setCareProviderName] = useState('Dr. Evelyn Sirleaf-Gbotoe');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const patientReviews = feedbacks.filter(f => f.patientId === patient.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      alert('Please enter a review title and comment.');
      return;
    }

    const newFeedback: PatientFeedback = {
      id: `FDBK-${Date.now()}`,
      patientId: patient.id,
      patientName: isAnonymous ? 'Verified Patient' : `${patient.firstName} ${patient.lastName}`,
      isAnonymous,
      rating,
      serviceCategory,
      careProviderName: careProviderName.trim() || undefined,
      title: title.trim(),
      comment: comment.trim(),
      suggestionsForImprovement: suggestions.trim() || undefined,
      submittedAt: new Date().toISOString(),
      isVerifiedPatient: true,
      isFeaturedOnHome: rating >= 4,
      communityLocation: `${patient.address.community}, ${patient.address.city}`
    };

    addPatientFeedback(newFeedback);
    setSubmittedSuccess(true);
    setTitle('');
    setComment('');
    setSuggestions('');
    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <HeartHandshake className="w-5 h-5 text-teal-700" />
            <span>Voice of the Patient & Quality of Care</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Patient Feedback & Hospital Experience Ratings
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Your clinical experience directly drives hospital improvements at J & J Memorial. Verified ratings are reviewed by the Medical Director and featured on our community testimonials showcase.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Submit Review Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-700" />
              <span>Share Your Hospital Review</span>
            </h3>
            <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 font-bold px-2 py-0.5 rounded">
              Verified Patient: {patient.mrn}
            </span>
          </div>

          {submittedSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Thank You For Your Feedback!</h4>
              <p className="text-xs text-emerald-700">
                Your review has been saved to your health profile and forwarded to the Medical Quality Assurance Committee.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Star Rating Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Overall Rating *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {rating === 5 && 'Outstanding Care (5/5)'}
                    {rating === 4 && 'Very Good (4/5)'}
                    {rating === 3 && 'Average (3/5)'}
                    {rating === 2 && 'Needs Improvement (2/5)'}
                    {rating === 1 && 'Unsatisfactory (1/5)'}
                  </span>
                </div>
              </div>

              {/* Service Category & Care Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Service *</label>
                  <select
                    value={serviceCategory}
                    onChange={e => setServiceCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="OUTPATIENT_OPD">Outpatient Clinic (OPD)</option>
                    <option value="EMERGENCY_TRIAGE">Emergency & Acute Triage</option>
                    <option value="MATERNITY">Maternal & Child Health</option>
                    <option value="LABORATORY">Diagnostic Laboratory (LIS)</option>
                    <option value="PHARMACY">Pharmacy & Dispensary</option>
                    <option value="INPATIENT_WARDS">Inpatient Medical Wards</option>
                    <option value="TELEHEALTH">Virtual Care / Telehealth</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attending Clinician / Nurse</label>
                  <input
                    type="text"
                    value={careProviderName}
                    onChange={e => setCareProviderName(e.target.value)}
                    placeholder="e.g. Dr. Sirleaf or Sister Weah"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Title & Review Comment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Fast malaria recovery, kind nurses and clean room"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us about the physician attention, waiting time, pharmacy explanation, or facility cleanliness..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Suggestions for Improvement (Optional)</label>
                <input
                  type="text"
                  value={suggestions}
                  onChange={e => setSuggestions(e.target.value)}
                  placeholder="e.g. Expand clinic hours on Saturday afternoons..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    className="rounded text-teal-800"
                  />
                  <span>Submit as Anonymous Verified Patient</span>
                </label>

                <button
                  type="submit"
                  className="bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Previous Reviews History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Your Previous Reviews</span>
              <span className="text-xs font-normal text-slate-500">({patientReviews.length})</span>
            </h3>

            {patientReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                You haven't submitted any reviews yet. Share your experience on the left!
              </p>
            ) : (
              <div className="space-y-3">
                {patientReviews.map(rev => (
                  <div key={rev.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900">{rev.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{rev.comment}</p>

                    {rev.clinicalResponse && (
                      <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded text-[10px] text-teal-900 space-y-0.5">
                        <span className="font-bold block">Hospital Response:</span>
                        <p>{rev.clinicalResponse.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-teal-900 text-white rounded-2xl p-5 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 text-teal-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Public Testimonials Aggregation</span>
            </div>
            <p className="text-teal-100 text-[11px] leading-relaxed">
              Reviews rated 4 stars or higher with constructive feedback are featured on the public homepage to help families across Monrovia choose J & J Memorial with confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
