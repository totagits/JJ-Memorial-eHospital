import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, Award, Calendar, Clock, ShieldCheck, Mail, 
  Phone, Search, Filter, CheckCircle2, ChevronRight, UserCheck, 
  Heart, Sparkles, Building2, MapPin
} from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';

export interface StaffProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  category: 'INTERNAL_MEDICINE' | 'EMERGENCY' | 'MATERNAL_PEDIATRIC' | 'DIAGNOSTICS' | 'PHARMACY';
  categoryLabel: string;
  licenseNumber: string;
  boardCertifications: string[];
  areasOfExpertise: string[];
  education: string;
  consultationHours: string;
  experience: string;
  languages: string[];
  clinicianId: string;
  bio: string;
}

const STAFF_PROFILES: StaffProfile[] = [
  {
    id: 'DOC-001',
    name: 'Dr. J. Saydee Kollie, MD, FWACP',
    role: 'Medical Director & Chief of Internal Medicine',
    department: 'Clinical Governance & Internal Medicine',
    category: 'INTERNAL_MEDICINE',
    categoryLabel: 'Internal Medicine',
    licenseNumber: 'LMDC-MD-1892',
    boardCertifications: [
      'Liberian Medical and Dental Council (LMDC) — Full Specialist Register',
      'Fellow, West African College of Physicians (FWACP) — Internal Medicine',
      'Liberian Ministry of Health (MOH) Certified Clinical Preceptor'
    ],
    areasOfExpertise: [
      'Cardiovascular & Hypertension Management',
      'Complex Multi-Morbidity & Diabetic Complications',
      'Clinical Governance & Quality Auditing',
      'Tropical Infectious Diseases'
    ],
    education: 'Doctor of Medicine (MD), A.M. Dogliotti College of Medicine, University of Liberia; Postgraduate Fellowship, West African College of Physicians',
    consultationHours: 'Monday, Wednesday, Friday: 9:00 AM – 2:00 PM',
    experience: '22+ Years Clinical & Hospital Leadership Experience',
    languages: ['English', 'Liberian Kolokwa', 'Bassa'],
    clinicianId: 'USR-001',
    bio: 'Dr. Kollie oversees clinical governance and internal medicine at J & J Memorial, championing evidence-based treatment regimens and cardiovascular preventive care for the Montserrado community.',
  },
  {
    id: 'DOC-002',
    name: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
    role: 'Lead Outpatient Clinician & Emergency Care Lead',
    department: 'Outpatient Clinic & Emergency Triage',
    category: 'EMERGENCY',
    categoryLabel: 'Emergency & Acute Care',
    licenseNumber: 'LMDC-MD-2410',
    boardCertifications: [
      'Liberian Medical and Dental Council (LMDC) — Active Clinical Practitioner',
      'Advanced Trauma Life Support (ATLS) Certified',
      'MOH Certified Integrated Management of Adolescent and Adult Illness (IMAI)'
    ],
    areasOfExpertise: [
      'Acute Emergency Stabilization & Resuscitation',
      'Severe Malaria & Tropical Infectious Diseases',
      'Respiratory Distress & Pneumonia Protocol',
      'Chronic Disease Outpatient Continuity'
    ],
    education: 'Doctor of Medicine (MD), A.M. Dogliotti College of Medicine; Clinical Residency in Acute Care Medicine',
    consultationHours: 'Monday through Saturday: 8:00 AM – 4:00 PM',
    experience: '14+ Years Acute Medicine & Emergency Practice',
    languages: ['English', 'Liberian Kolokwa'],
    clinicianId: 'USR-002',
    bio: 'Dr. Sirleaf-Gbotoe directs daily outpatient consultations and emergency triage stabilization, ensuring timely clinical interventions for critical cases in VOA East and surrounding districts.',
  },
  {
    id: 'DOC-003',
    name: 'Dr. Varney B. Kamara, MD, FWACS',
    role: 'Consultant Obstetrician & Gynecologist',
    department: 'Maternal Health & Women’s Wellness',
    category: 'MATERNAL_PEDIATRIC',
    categoryLabel: 'Maternal & Women’s Health',
    licenseNumber: 'LMDC-MD-3105',
    boardCertifications: [
      'Liberian Medical and Dental Council (LMDC) — Specialist Board',
      'Fellow, West African College of Surgeons (FWACS) — Obstetrics & Gynecology',
      'Emergency Obstetric & Newborn Care (EmONC) Master Trainer'
    ],
    areasOfExpertise: [
      'High-Risk Prenatal Care & Postpartum Management',
      'Emergency Cesarean & Operative Delivery',
      'Cervical Cancer Screening & Reproductive Health',
      'Pre-eclampsia & Obstetric Hemorrhage Protocols'
    ],
    education: 'Doctor of Medicine (MD), University of Ghana Medical School; Residency & Fellowship, Korle-Bu Teaching Hospital',
    consultationHours: 'Tuesday & Thursday: 9:00 AM – 3:00 PM (Emergency On-Call 24/7)',
    experience: '16+ Years Specialist Obstetric Practice',
    languages: ['English', 'Liberian Kolokwa', 'Kpelle'],
    clinicianId: 'USR-001',
    bio: 'A passionate advocate for reducing maternal mortality in Liberia, Dr. Kamara leads the maternal health clinic, supervising safe delivery and prenatal screening protocols.',
  },
  {
    id: 'DOC-004',
    name: 'Dr. Musu S. Freeman, MD, FAAP',
    role: 'Consultant Pediatrician & Neonatologist',
    department: 'Pediatrics & Child Wellness',
    category: 'MATERNAL_PEDIATRIC',
    categoryLabel: 'Pediatrics & Child Health',
    licenseNumber: 'LMDC-MD-2918',
    boardCertifications: [
      'Liberian Medical and Dental Council (LMDC) — Pediatric Specialist',
      'Neonatal Resuscitation Program (NRP) Certified Instructor',
      'MOH Integrated Management of Childhood Illness (IMCI) Lead'
    ],
    areasOfExpertise: [
      'Neonatal Resuscitation & Premature Infant Support',
      'Severe Pediatric Malaria & Anemia Management',
      'Routine Immunization & Growth Tracking',
      'Childhood Asthma & Nutritional Recovery'
    ],
    education: 'Doctor of Medicine (MD), A.M. Dogliotti College of Medicine; Pediatric Fellowship, Red Cross Children’s Hospital',
    consultationHours: 'Monday, Tuesday, Thursday: 8:30 AM – 2:30 PM',
    experience: '12+ Years Dedicated Pediatric Healthcare',
    languages: ['English', 'Liberian Kolokwa', 'Bassa'],
    clinicianId: 'USR-002',
    bio: 'Dr. Freeman coordinates the pediatric outpatient and under-five wellness clinic, delivering evidence-based childhood illness management and community immunization oversight.',
  },
  {
    id: 'DOC-005',
    name: 'Sister Comfort Weah, RN, BSN',
    role: 'Head of Nursing Services & Clinical Inpatient Care',
    department: 'Nursing Administration & Inpatient Wards',
    category: 'EMERGENCY',
    categoryLabel: 'Nursing Services',
    licenseNumber: 'LBNM-RN-4402',
    boardCertifications: [
      'Liberian Board of Nursing and Midwifery (LBNM) — Registered Nurse',
      'Certified Clinical Nurse Educator (CCNE)',
      'Infection Prevention and Control (IPC) Hospital Lead'
    ],
    areasOfExpertise: [
      'Inpatient Acuity & Nurse-to-Patient Ratio Governance',
      'Infection Prevention & Sterilization Surveillance',
      'Maternal & Neonatal Post-Operative Recovery',
      'Emergency Triage Protocol Auditing'
    ],
    education: 'Bachelor of Science in Nursing (BSN), Tubman National Institute of Medical Arts (TNIMA); Diploma in Nursing Administration',
    consultationHours: '24/7 Clinical Shift Supervision',
    experience: '18+ Years Healthcare Leadership & Nursing Excellence',
    languages: ['English', 'Liberian Kolokwa', 'Kru'],
    clinicianId: 'USR-003',
    bio: 'Sister Weah leads the nursing cohort across OPD, Triage, and Wards, maintaining stringent bedside clinical standards and compassionate nursing care.',
  },
  {
    id: 'DOC-006',
    name: 'Anthony Barclay, MSc, MLS',
    role: 'Chief Medical Laboratory Scientist',
    department: 'Laboratory Medicine & Pathology',
    category: 'DIAGNOSTICS',
    categoryLabel: 'Diagnostic Sciences',
    licenseNumber: 'LMBA-MLS-0899',
    boardCertifications: [
      'Liberian Medical Laboratory Association (LMLA) — Licensed Scientist',
      'ISO 15189 Quality Management System Internal Auditor',
      'WHO National Influenza & Arbovirus Laboratory Surveillance Lead'
    ],
    areasOfExpertise: [
      'Clinical Parasitology & Malaria Microscopic Confirmation',
      'Blood Transfusion Serology & Safe Crossmatching',
      'Clinical Biochemistry & Renal Function Profiling',
      'Cold-Chain Blood Bank Integrity Monitoring'
    ],
    education: 'Master of Science (MSc) in Medical Laboratory Science, Cuttington Graduate School; BSc Medical Technology, University of Liberia',
    consultationHours: 'Daily 24-Hour Specimen Supervision & Review',
    experience: '15+ Years Diagnostic Laboratory Leadership',
    languages: ['English', 'Liberian Kolokwa'],
    clinicianId: 'USR-005',
    bio: 'Scientist Barclay manages the fully digitized laboratory information system (LIS), ensuring accurate, rapid diagnostic turnaround times and certified cold-chain blood banking.',
  },
  {
    id: 'DOC-007',
    name: 'Sarah Tubman, BPharm, RPh',
    role: 'Lead Clinical Pharmacist & Head of Pharmacy',
    department: 'Pharmacy & Therapeutics',
    category: 'PHARMACY',
    categoryLabel: 'Pharmacy & Therapeutics',
    licenseNumber: 'LPB-RPH-1142',
    boardCertifications: [
      'Liberian Pharmacy Board (LPB) — Registered Pharmacist',
      'Certified Clinical Pharmacotherapist (CCP)',
      'Antimicrobial Stewardship Program (ASP) Coordinator'
    ],
    areasOfExpertise: [
      'Pharmacovigilance & Drug-Drug Interaction Screening',
      'Antimicrobial Stewardship & Resistance Monitoring',
      'Cold-Chain Insulin & Vaccine Inventory Preservation',
      'Pediatric Weight-Based Dosage Verification'
    ],
    education: 'Bachelor of Pharmacy (BPharm), School of Pharmacy, University of Liberia; Postgraduate Diploma in Hospital Pharmacy',
    consultationHours: 'Monday through Saturday: 8:00 AM – 8:00 PM',
    experience: '11+ Years Clinical & Retail Hospital Pharmacy',
    languages: ['English', 'Liberian Kolokwa'],
    clinicianId: 'USR-006',
    bio: 'Pharmacist Tubman oversees medication dispensing, formulary management, and real-time patient prescription safety checks across all outpatient and inpatient departments.',
  }
];

interface StaffDirectoryPageProps {
  onOpenAppointmentModal: (clinicianId?: string, department?: string) => void;
}

export const StaffDirectoryPage: React.FC<StaffDirectoryPageProps> = ({
  onOpenAppointmentModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredStaff = useMemo(() => {
    return STAFF_PROFILES.filter(staff => {
      const matchesCategory = selectedCategory === 'ALL' || staff.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery = 
        staff.name.toLowerCase().includes(q) ||
        staff.role.toLowerCase().includes(q) ||
        staff.department.toLowerCase().includes(q) ||
        staff.areasOfExpertise.some(e => e.toLowerCase().includes(q)) ||
        staff.boardCertifications.some(c => c.toLowerCase().includes(q)) ||
        staff.licenseNumber.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'ALL', label: 'All Specialists' },
    { id: 'INTERNAL_MEDICINE', label: 'Internal Medicine' },
    { id: 'EMERGENCY', label: 'Emergency & Triage' },
    { id: 'MATERNAL_PEDIATRIC', label: 'Maternal & Pediatrics' },
    { id: 'DIAGNOSTICS', label: 'Diagnostic Laboratory' },
    { id: 'PHARMACY', label: 'Pharmacy & Therapeutics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full text-xs font-bold text-teal-800">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Statutory Accredited Medical Faculty</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Staff Directory & Medical Specialists
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Meet the licensed physicians, consultant specialists, nursing supervisors, and diagnostic scientists serving the J & J Memorial e-Hospital community in VOA East, Monrovia.
          </p>

          {/* Statutory Credentialing Trust Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs inline-flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Liberian Medical & Dental Council (LMDC) Registered
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Award className="w-3.5 h-3.5 text-teal-700" />
              West African Colleges of Physicians & Surgeons
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              MOH Clinical Governance Compliant
            </span>
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by physician name, specialty (e.g. Cardiology, Pediatrics, Malaria), or board license..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-teal-600 focus:bg-white focus:outline-hidden transition-all"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-800 self-center font-medium cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Department Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Profiles Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <span className="font-bold text-slate-800">{filteredStaff.length}</span> verified medical practitioners</span>
            <span>24/7 Clinical Shift Coverage Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredStaff.map(staff => (
              <div 
                key={staff.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-5">
                  {/* Top Bar with Avatar & License */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                        {staff.name.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded">
                            {staff.categoryLabel}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                          {staff.name}
                        </h3>
                        <p className="text-xs font-semibold text-teal-800">{staff.role}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded block">
                        {staff.licenseNumber}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {staff.bio}
                  </p>

                  {/* Areas of Expertise */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Clinical Focus & Areas of Expertise
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {staff.areasOfExpertise.map((exp, idx) => (
                        <span 
                          key={idx}
                          className="text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Board Certifications & Degrees */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                        Board Certifications & Fellowships
                      </span>
                      <ul className="space-y-1">
                        {staff.boardCertifications.map((cert, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-700">Education:</span> {staff.education}</p>
                      <p><span className="font-semibold text-slate-700">Experience:</span> {staff.experience}</p>
                      <p><span className="font-semibold text-slate-700">Languages:</span> {staff.languages.join(', ')}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-teal-800 font-semibold text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{staff.consultationHours}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Accepting Appointments</span>
                  </div>

                  <button
                    onClick={() => onOpenAppointmentModal(staff.clinicianId, staff.department)}
                    className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStaff.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Stethoscope className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No medical specialists match your search</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching for a broader specialty, another department, or clear the search filters above.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
