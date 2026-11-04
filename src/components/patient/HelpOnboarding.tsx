import React, { useState } from 'react';
import { Sparkles, Calendar, FileText, HeartPulse, Video, FileCheck, X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface HelpOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface Step {
  title: string;
  badge: string;
  description: string;
  highlightAction: string;
  targetTab?: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to J & J Memorial Patient Portal',
    badge: 'Step 1 of 5: Identity & Security',
    description: 'Your portal connects directly to the hospital electronic medical record. Your permanent Medical Record Number (MRN) securely links your appointments, doctor notes, and prescriptions across all branches in Liberia.',
    highlightAction: 'Review your personal MRN and profile in the header banner.',
    icon: <Sparkles className="w-8 h-8 text-teal-500" />,
  },
  {
    title: 'Schedule In-Person & Virtual Appointments',
    badge: 'Step 2 of 5: Clinical Booking',
    description: 'Browse certified consultants in Internal Medicine, Emergency, Surgery, and Pediatrics. Choose your preferred clinic branch or opt for a remote video consultation.',
    highlightAction: 'Use the "Book Appointment" button or Calendar tab to select your slot.',
    targetTab: 'calendar',
    icon: <Calendar className="w-8 h-8 text-teal-500" />,
  },
  {
    title: 'Access Real-Time Lab & Imaging Results',
    badge: 'Step 3 of 5: Medical Records',
    description: 'As soon as our diagnostic laboratory technicians release your test results or our radiologist verifies your X-rays/CT scans, they appear instantly in your Medical History tab for review and download.',
    highlightAction: 'Check the "Medical History" tab to view past visits and diagnoses.',
    targetTab: 'history',
    icon: <FileText className="w-8 h-8 text-teal-500" />,
  },
  {
    title: 'Track Daily Vitals with Interactive Recharts',
    badge: 'Step 4 of 5: Health Telemetry',
    description: 'Log your blood pressure, pulse, glucose, and body weight directly from home. Recharts visualizes your 7-day longitudinal trends so your physician can evaluate your response to treatment.',
    highlightAction: 'Visit "Vitals Tracker" to log your morning reading.',
    targetTab: 'vitals',
    icon: <HeartPulse className="w-8 h-8 text-teal-500" />,
  },
  {
    title: 'Execute Digital Legal Consents & Telehealth',
    badge: 'Step 5 of 5: Paperless Hospital',
    description: 'Sign admission authorizations and procedure consents electronically using our cryptographic canvas signature pad. Join scheduled telehealth video rooms with end-to-end security.',
    highlightAction: 'Click "Digital Consent" to test signing your admission record.',
    targetTab: 'consent',
    icon: <FileCheck className="w-8 h-8 text-teal-500" />,
  },
];

export const HelpOnboarding: React.FC<HelpOnboardingProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleGoToFeature = () => {
    if (currentStep.targetTab && onNavigateToTab) {
      onNavigateToTab(currentStep.targetTab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{currentStep.badge}</span>
            <span className="text-teal-600 font-mono">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Icon & Title */}
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 shadow-sm">
            {currentStep.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-hospital-navy leading-snug">
              {currentStep.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Highlight Tip Card */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-semibold">{currentStep.highlightAction}</span>
          </div>

          {currentStep.targetTab && (
            <button
              onClick={handleGoToFeature}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition"
            >
              Take Me There
            </button>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center space-x-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-hospital-navy hover:bg-hospital-navy-light text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 shadow-sm"
            >
              <span>{currentStepIndex === STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
