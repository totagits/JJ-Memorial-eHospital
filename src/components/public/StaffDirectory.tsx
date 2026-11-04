import React, { useState } from 'react';
import { useTranslation } from '../../services/i18n';
import { Award, Calendar, CheckCircle2, Stethoscope, Search, Mail } from 'lucide-react';

interface StaffDirectoryProps {
  onBookWithDoctor: (doctorName: string, specialty: string) => void;
}

interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  department: string;
  qualifications: string[];
  experienceYears: number;
  availableDays: string;
  bio: string;
  avatarUrl: string;
}

const DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-1',
    name: 'Dr. Emmanuel Tamba, MD',
    title: 'Consultant Internist & Clinical Director',
    specialty: 'Internal Medicine & Cardiovascular Care',
    department: 'Internal Medicine',
    qualifications: ['MD (A.M. Dogliotti College of Medicine)', 'FWACP (Internal Medicine)', 'Fellowship in Tropical Disease (London)'],
    experienceYears: 16,
    availableDays: 'Monday - Thursday, 08:30 - 15:00',
    bio: 'Specializing in hypertension management, complex adult tropical infections, diabetes optimization, and cardiovascular diagnostics.',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'doc-2',
    name: 'Dr. Fatumata Fofana, MD',
    title: 'Head of Emergency Medicine & Trauma',
    specialty: 'Emergency Medicine & Acute Care',
    department: 'Emergency & Triage',
    qualifications: ['MD (Liberia)', 'Emergency Ultrasound Certified', 'ATLS / ACLS Instructor'],
    experienceYears: 11,
    availableDays: 'Tuesday - Saturday (Shift Rotations)',
    bio: 'Leads 24/7 acute resuscitation, emergency triage protocols, trauma stabilization, and critical care transfers.',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813583-09758f8b8682?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'doc-3',
    name: 'Dr. Christian Nyenpan, FACS',
    title: 'Chief Surgical Consultant',
    specialty: 'General & Minimally Invasive Laparoscopy',
    department: 'Surgery',
    qualifications: ['MBBS', 'Fellow West African College of Surgeons (FWACS)', 'Fellow American College of Surgeons (FACS)'],
    experienceYears: 22,
    availableDays: 'Wednesdays & Fridays (Elective OR)',
    bio: 'Pioneered laparoscopic hernia repair, abdominal surgical emergencies, and oncologic surgical resection in Monrovia.',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'doc-4',
    name: 'Dr. Moses Weah, MD',
    title: 'Senior Pediatrician & Neonatologist',
    specialty: 'Pediatrics & Neonatal Intensive Care',
    department: 'Pediatrics',
    qualifications: ['MD (Ghana)', 'Postgraduate Diploma in Child Health (DCH)', 'Neonatal Resuscitation Program (NRP)'],
    experienceYears: 13,
    availableDays: 'Monday - Friday, 09:00 - 16:00',
    bio: 'Passionate child advocate focusing on neonatal jaundice, childhood asthma, growth nutrition, and pediatric emergency care.',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'doc-5',
    name: 'Dr. Sekou Massaquoi, MD',
    title: 'Consultant Diagnostic Radiologist',
    specialty: 'Diagnostic Imaging & Cross-Sectional MRI/CT',
    department: 'Radiology',
    qualifications: ['MD', 'Board Certified Radiologist', 'Member RSNA / ESR'],
    experienceYears: 14,
    availableDays: 'Monday - Saturday, 08:00 - 17:00',
    bio: 'Oversees high-resolution digital X-ray reporting, CT angiography, obstetric Doppler ultrasounds, and MRI evaluations.',
    avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'doc-6',
    name: 'Nurse Sarah Kiatamba, RN, BSN',
    title: 'Chief Triage & Nurse Coordinator',
    specialty: 'Triage & Inpatient Nursing Leadership',
    department: 'Nursing & Triage',
    qualifications: ['BSN (Tubman National Institute of Medical Arts - TNIMA)', 'Certified Emergency Nurse (CEN)'],
    experienceYears: 15,
    availableDays: 'Daily Roster',
    bio: 'Champion for compassionate bedside communication, rapid triage acuity scoring, and family-centered health education.',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
  },
];

export const StaffDirectory: React.FC<StaffDirectoryProps> = ({ onBookWithDoctor }) => {
  const { t } = useTranslation();
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = ['All', 'Internal Medicine', 'Emergency & Triage', 'Surgery', 'Pediatrics', 'Radiology', 'Nursing & Triage'];

  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesDept = selectedDept === 'All' || doc.department === selectedDept;
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualifications.some((q) => q.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesQuery;
  });

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Faculty & Staff</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-hospital-navy tracking-tight">
            {t('findDoctor')}
          </h2>
          <p className="text-slate-600 text-base">
            Meet our certified physicians, surgeons, pediatricians, and nurse specialists dedicated to evidence-based healthcare.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto pt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or qualification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedDept === dept
                  ? 'bg-hospital-navy text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur border border-teal-500/30">
                      {doc.department}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {doc.name}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                  <div className="text-xs font-semibold text-teal-700">
                    {doc.title}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.bio}
                  </p>

                  {/* Qualifications */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Credentials & Licensing
                    </span>
                    <div className="space-y-1">
                      {doc.qualifications.map((q, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consultation schedule */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-medium text-slate-500">Clinic Hours:</span>
                    <span className="font-semibold text-slate-800">{doc.availableDays}</span>
                  </div>
                </div>
              </div>

              {/* Book Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onBookWithDoctor(doc.name, doc.specialty)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation With {doc.name.split(' ')[1]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
