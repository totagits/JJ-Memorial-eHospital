import React from 'react';
import { Stethoscope, Award, Calendar, Clock, ShieldCheck, Mail, Phone } from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';

interface DoctorsPageProps {
  onOpenAppointmentModal: () => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ onOpenAppointmentModal }) => {
  const db = getDatabaseState();
  const doctors = [
    {
      name: 'Dr. J. Saydee Kollie, MD, FWACP',
      role: 'Medical Director & Chief of Internal Medicine',
      department: 'Clinical Governance & Internal Medicine',
      license: 'LMDC-MD-1892',
      specialty: 'Cardiovascular Care & Complex Multi-Morbidity',
      education: 'MD, University of Liberia (A.M. Dogliotti), Fellow West African College of Physicians',
      consultHours: 'Mon, Wed, Fri: 9:00 AM – 2:00 PM',
      experience: '22+ Years Clinical Experience',
    },
    {
      name: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
      role: 'Lead Outpatient Clinician & Acute Care Lead',
      department: 'Outpatient Clinic & Emergency Triage',
      license: 'LMDC-MD-2410',
      specialty: 'Infectious Diseases, Tropical Medicine, Emergency Stabilization',
      education: 'MD, A.M. Dogliotti College of Medicine',
      consultHours: 'Mon – Sat: 8:00 AM – 4:00 PM',
      experience: '14+ Years Clinical Practice',
    },
    {
      name: 'Sister Comfort Weah, RN, BSN',
      role: 'Head of Nursing Services & Inpatient Care',
      department: 'Nursing Administration & Maternal Care',
      license: 'LBNM-RN-4402',
      specialty: 'Advanced Inpatient Nursing & Maternal Resuscitation',
      education: 'BSN, Tubman National Institute of Medical Arts (TNIMA)',
      consultHours: '24/7 Clinical Shift Supervision',
      experience: '18+ Years Healthcare Leadership',
    },
    {
      name: 'Anthony Barclay, MSc, MLS',
      role: 'Chief Medical Laboratory Scientist',
      department: 'Laboratory Medicine & Pathology',
      license: 'LMBA-MLS-0899',
      specialty: 'Clinical Hematology, Parasitology & Blood Transfusion',
      education: 'MSc Medical Laboratory Science, Cuttington Graduate School',
      consultHours: 'Daily 24-Hour Specimen Supervision',
      experience: '15+ Years Diagnostic Sciences',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Medical Faculty & Consultants
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verified Attending Physicians & Specialists
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every practitioner at J & J Memorial maintains active statutory credentials registered with the Liberian Medical and Dental Council (LMDC) and relevant professional boards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {doctors.map((doc, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    {doc.name.split(' ')[1]?.[0] || 'D'}
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                    Lic: {doc.license}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs font-semibold text-teal-800 mt-0.5">{doc.role}</p>
                  <p className="text-xs text-slate-500">{doc.department}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-xs space-y-2">
                  <p><span className="font-semibold text-slate-700">Specialty Focus:</span> {doc.specialty}</p>
                  <p><span className="font-semibold text-slate-700">Credentials:</span> {doc.education}</p>
                  <p><span className="font-semibold text-slate-700">Experience:</span> {doc.experience}</p>
                  <p className="flex items-center gap-1.5 text-teal-800 font-medium pt-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Clinic Hours: {doc.consultHours}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutorily Verified</span>
                </div>
                <button
                  onClick={onOpenAppointmentModal}
                  className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Book with Doctor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
