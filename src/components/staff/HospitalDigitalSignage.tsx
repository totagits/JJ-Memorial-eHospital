import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { DigitalSignageSlide } from '../../types';
import { Tv, Monitor, Plus, Play, Pause, Clock, AlertCircle, CheckCircle2, ShieldCheck, Volume2 } from 'lucide-react';

export const HospitalDigitalSignage: React.FC = () => {
  const [slides, setSlides] = useState<DigitalSignageSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  useEffect(() => {
    setSlides(dbStore.getSignageSlides());
  }, []);

  // Slide rotation timer
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;
    const currentDuration = (slides[activeSlideIndex]?.durationSeconds || 10) * 1000;
    const timer = setTimeout(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [isPlaying, activeSlideIndex, slides]);

  const toggleSlideActive = (id: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const currentSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Tv className="w-3.5 h-3.5" />
            <span>Public Waiting Bay Displays & Screen Control</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Hospital Digital Signage & TV Queue Screen
          </h2>
          <p className="text-xs text-slate-500">
            Configure rotating informational slides, health promotion bulletins, doctor on-duty rosters, and token calling numbers displayed on waiting room monitors.
          </p>
        </div>

        <button
          onClick={() => setIsFullscreenPreview(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-hospital-navy hover:bg-hospital-navy-light text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Monitor className="w-4 h-4 text-teal-400" />
          <span>Launch Full-Screen TV Display Mode</span>
        </button>
      </div>

      {/* Live Monitor Preview Canvas */}
      <div className="bg-slate-950 rounded-3xl border-4 border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between min-h-[380px]">
        {/* Top TV Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black text-sm">
              J&J
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight">
                J & J MEMORIAL HEALTH CENTER
              </span>
              <span className="text-[10px] text-teal-400 block font-mono">
                OUTPATIENT DEPARTMENT RECEPTION DISPLAY
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>{new Date().toLocaleTimeString()} GMT</span>
            </span>
            <span className="text-teal-400 font-bold">24/7 CARE</span>
          </div>
        </div>

        {/* Dynamic Slide Content Body */}
        {currentSlide && (
          <div className="py-8 space-y-4 max-w-3xl animate-in fade-in zoom-in-95 duration-500">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 inline-block">
              {currentSlide.type}
            </span>

            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {currentSlide.title}
            </h3>

            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
              {currentSlide.content}
            </p>

            {currentSlide.highlightText && (
              <div className="p-4 rounded-xl bg-teal-950/80 border border-teal-600/50 text-teal-200 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span>{currentSlide.highlightText}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Ticker Bar */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-slate-200 uppercase font-semibold">
              Now Calling: Token #A-104 (Room 1) | Token #B-088 (Room 3) | Token #C-012 (Triage)
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] text-slate-500">
              Slide {activeSlideIndex + 1} of {slides.length} ({currentSlide?.durationSeconds}s)
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slides Manager List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-hospital-navy text-sm">
            Signage Playlist Queue ({slides.length} Slides)
          </h4>
          <span className="text-xs text-slate-400">Drag or click to re-sequence playlist</span>
        </div>

        <div className="space-y-3">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setActiveSlideIndex(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                idx === activeSlideIndex
                  ? 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="font-black text-xs font-mono w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {s.title}
                    </span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {s.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {s.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs shrink-0">
                <span className="font-mono text-slate-400">{s.durationSeconds}s duration</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSlideActive(s.id);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.active ? 'Broadcasting' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-8 sm:p-14 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xl">
                J&J
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  J & J MEMORIAL HEALTH CENTER
                </h1>
                <span className="text-xs text-teal-400 font-mono tracking-wider">
                  OUTPATIENT DEPARTMENT RECEPTION DISPLAY
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <span className="text-base font-mono text-slate-300 bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800">
                {new Date().toLocaleTimeString()} GMT
              </span>
              <button
                onClick={() => setIsFullscreenPreview(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Exit Fullscreen
              </button>
            </div>
          </div>

          <div className="max-w-4xl space-y-6">
            <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 inline-block">
              {currentSlide.type}
            </span>
            <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight">
              {currentSlide.title}
            </h2>
            <p className="text-2xl text-slate-300 font-normal leading-relaxed">
              {currentSlide.content}
            </p>
            {currentSlide.highlightText && (
              <div className="p-6 rounded-2xl bg-teal-950/80 border border-teal-600/50 text-teal-200 text-lg font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
                <span>{currentSlide.highlightText}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-6 flex items-center justify-between text-sm text-slate-400 font-mono">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-white font-bold">
                NOW CALLING: TOKEN #A-104 (ROOM 1) | TOKEN #B-088 (ROOM 3) | TOKEN #C-012 (TRIAGE)
              </span>
            </div>
            <span className="text-teal-400">Tubman Blvd, Oldest Congo Town &bull; 24/7 Emergency Dispatch</span>
          </div>
        </div>
      )}
    </div>
  );
};
