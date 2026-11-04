import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Pill, 
  Microscope, 
  Shield, 
  ArrowRight, 
  X,
  CreditCard,
  Building2,
  Clock
} from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';
import { Patient } from '../../types/patient';

interface GlobalStaffSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
  onNavigateModule: (moduleId: string) => void;
}

export const GlobalStaffSearchModal: React.FC<GlobalStaffSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
  onNavigateModule
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const db = getDatabaseState();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchingPatients = trimmed
    ? db.patients.filter(p => 
        p.firstName.toLowerCase().includes(trimmed) ||
        p.lastName.toLowerCase().includes(trimmed) ||
        p.mrn.toLowerCase().includes(trimmed) ||
        p.phone.replace(/[^0-9]/g, '').includes(trimmed.replace(/[^0-9]/g, '')) ||
        (p.nationalId && p.nationalId.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingEncounters = trimmed
    ? db.encounters.filter(e =>
        e.patientName.toLowerCase().includes(trimmed) ||
        e.chiefComplaint.toLowerCase().includes(trimmed) ||
        e.diagnoses.some(d => d.title.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingPrescriptions = trimmed
    ? db.prescriptions.filter(p =>
        p.medicationName.toLowerCase().includes(trimmed) ||
        p.patientName.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingLabOrders = trimmed
    ? db.labOrders.filter(l =>
        l.testName.toLowerCase().includes(trimmed) ||
        l.patientName.toLowerCase().includes(trimmed) ||
        l.accessionNumber.toLowerCase().includes(trimmed)
      )
    : [];

  const handlePatientClick = (patient: Patient) => {
    onSelectPatient(patient);
    onNavigateModule('opd');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 backdrop-blur-xs p-4 pt-16 sm:pt-24">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-teal-700 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search patients by Name, MRN, Phone contact, National ID, or Clinic diagnoses..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none focus:outline-hidden text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-slate-100">
          {!trimmed ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Global Hospital EMR & ERP Search</p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Type an MRN (e.g. "JJM-2026-00104"), patient surname, phone number, or diagnosis to search across all hospital records.
              </p>

              {/* Quick Jump Shortcuts */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Jump:</span>
                <button
                  onClick={() => { onNavigateModule('opd'); onClose(); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                >
                  OPD & EMR
                </button>
                <button
                  onClick={() => { onNavigateModule('lab'); onClose(); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                >
                  Diagnostic Lab
                </button>
                <button
                  onClick={() => { onNavigateModule('pharmacy'); onClose(); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                >
                  Pharmacy
                </button>
                <button
                  onClick={() => { onNavigateModule('blood_bank'); onClose(); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                >
                  Blood Bank
                </button>
                <button
                  onClick={() => { onNavigateModule('insurance'); onClose(); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                >
                  Insurance Verification
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Patient Matches */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Patients Found ({matchingPatients.length})</span>
                </div>

                {matchingPatients.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">No matching patient profiles.</p>
                ) : (
                  matchingPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handlePatientClick(p)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">
                              {p.firstName} {p.lastName}
                            </h4>
                            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                              {p.mrn}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span>DOB: {p.dateOfBirth}</span>
                            <span>·</span>
                            <span>Phone: {p.phone}</span>
                            <span>·</span>
                            <span>{p.address.community}, {p.address.city}</span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>

              {/* Encounters Matches */}
              {matchingEncounters.length > 0 && (
                <div className="space-y-2 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Clinical Encounters & Diagnoses ({matchingEncounters.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingEncounters.slice(0, 3).map(enc => (
                      <div
                        key={enc.id}
                        onClick={() => { onNavigateModule('opd'); onClose(); }}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{enc.patientName}</span>
                          <span className="text-slate-500 ml-2">Chief Complaint: {enc.chiefComplaint}</span>
                        </div>
                        <span className="text-teal-700 font-semibold">{enc.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Orders Matches */}
              {matchingLabOrders.length > 0 && (
                <div className="space-y-2 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Diagnostic Lab Reports ({matchingLabOrders.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingLabOrders.slice(0, 3).map(lab => (
                      <div
                        key={lab.id}
                        onClick={() => { onNavigateModule('lab'); onClose(); }}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{lab.testName}</span>
                          <span className="text-slate-500 ml-2">({lab.patientName})</span>
                        </div>
                        <span className="font-mono text-slate-400">{lab.accessionNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-[10px]">
              Ctrl + K
            </kbd>
            <span>anywhere to reopen</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Close Search
          </button>
        </div>
      </div>
    </div>
  );
};
