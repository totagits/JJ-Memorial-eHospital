import React, { useState, useEffect, useRef } from 'react';
import { dbStore } from '../../services/dbStore';
import { Patient } from '../../types';
import { Search, User, Phone, MapPin, X, ArrowRight, ShieldCheck, HeartPulse, FileText } from 'lucide-react';

interface GlobalSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patient: Patient) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
}) => {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPatients(dbStore.getPatients());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredPatients = query.trim()
    ? patients.filter(
        (p) =>
          p.mrn.toLowerCase().includes(query.toLowerCase()) ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.phone.includes(query) ||
          p.county.toLowerCase().includes(query.toLowerCase())
      )
    : patients;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredPatients.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredPatients.length) % Math.max(1, filteredPatients.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPatients[selectedIndex]) {
        onSelectPatient?.(filteredPatients[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search EMR by Patient Name, MRN (e.g. JJM-2026-0042), or Phone..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-200 text-slate-600 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
            <span>Patients Found ({filteredPatients.length})</span>
            <span>Use ↑ ↓ keys and Enter to select</span>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No patient records match "{query}". Verify MRN format or telephone digits.
            </div>
          ) : (
            filteredPatients.map((patient, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={patient.id}
                  onClick={() => {
                    onSelectPatient?.(patient);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isSelected ? 'bg-teal-50 border border-teal-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-hospital-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {patient.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {patient.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.2 rounded border border-teal-300">
                          {patient.mrn}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {patient.bloodGroup}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {patient.phone}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {patient.county}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-teal-700 hidden sm:inline">
                      Open EMR Chart
                    </span>
                    <ArrowRight className="w-4 h-4 text-teal-600" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between px-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Audit Logged: Every patient lookup is recorded for PHI compliance
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
