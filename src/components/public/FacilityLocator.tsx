import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink, 
  Building2, 
  ShieldCheck, 
  Navigation,
  Car,
  Activity,
  Zap
} from 'lucide-react';

interface ClinicBranch {
  id: string;
  name: string;
  tier: string;
  address: string;
  community: string;
  city: string;
  phone: string;
  emergencyHotline: string;
  hours: string;
  services: string[];
  powerGrid: string;
  coordinates: { lat: number; lng: number };
  googleMapsUrl: string;
  isMainCampus: boolean;
}

const BRANCHES: ClinicBranch[] = [
  {
    id: 'MAIN-VOA',
    name: 'J & J Memorial Main Hospital Campus',
    tier: 'Tertiary Medical Center & Surgical Facility',
    address: 'VOA East Community, Monrovia, Liberia',
    community: 'VOA East',
    city: 'Monrovia',
    phone: '+231 (0) 777-123-456',
    emergencyHotline: '+231 (0) 770-JJ-MEM',
    hours: 'Open 24 Hours / 7 Days a Week',
    services: [
      '24/7 Acute Emergency & Trauma Bay',
      'Dual Operating Theaters & Surgical Suites',
      'Inpatient Adult & Pediatric Wards (ADT)',
      'Clinical Pathology & Microbiology Lab',
      'Digital Radiography (X-Ray) & Ultrasound',
      'Full Blood Bank & Transfusion Medicine',
      '24/7 Licensed Inpatient Pharmacy'
    ],
    powerGrid: '500kVA Cummins Diesel Backup + 80kW Solar Hybrid Array',
    coordinates: { lat: 6.3892, lng: -10.7491 },
    googleMapsUrl: 'https://maps.google.com/?q=VOA+East+Community+Monrovia+Liberia',
    isMainCampus: true
  },
  {
    id: 'SINKOR-CLINIC',
    name: 'Sinkor Outpatient Specialty Center',
    tier: 'Executive Consultation & Specialist Clinic',
    address: 'Tubman Boulevard, 12th Street, Sinkor',
    community: 'Sinkor',
    city: 'Monrovia',
    phone: '+231 (0) 775-889-112',
    emergencyHotline: '+231 (0) 770-JJ-MEM',
    hours: 'Mon - Sat: 08:00 AM - 06:00 PM',
    services: [
      'Cardiology & Hypertension Consultations',
      'Maternal Antenatal & Postnatal Checks',
      'Routine Diagnostic Blood & Urine Panels',
      'Executive Health Screening Packages',
      'Outpatient Pharmacy Dispensary'
    ],
    powerGrid: 'Dedicated 150kVA Generator + Grid Power',
    coordinates: { lat: 6.2954, lng: -10.7891 },
    googleMapsUrl: 'https://maps.google.com/?q=Sinkor+Monrovia+Liberia',
    isMainCampus: false
  },
  {
    id: 'BUSHROD-POST',
    name: 'Bushrod Island Emergency Outreach Post',
    tier: 'Urgent Care & Rapid Triage Post',
    address: 'Somalia Drive, Near Freeport Gate',
    community: 'Bushrod Island',
    city: 'Monrovia',
    phone: '+231 (0) 776-334-900',
    emergencyHotline: '+231 (0) 770-JJ-MEM',
    hours: 'Open 24 Hours Daily',
    services: [
      'Rapid Triage & Vitals Assessment',
      'Minor Wound Debridement & Suturing',
      'Malaria Rapid Diagnostic Testing (RDT)',
      'Ambulance Direct Transfer to Main Campus',
      'Emergency Essential Medicine Dispensary'
    ],
    powerGrid: 'Automatic Solar Inverter + Backup Generator',
    coordinates: { lat: 6.3421, lng: -10.7952 },
    googleMapsUrl: 'https://maps.google.com/?q=Bushrod+Island+Monrovia+Liberia',
    isMainCampus: false
  }
];

export const FacilityLocator: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('MAIN-VOA');
  const activeBranch = BRANCHES.find(b => b.id === selectedBranchId) || BRANCHES[0];

  return (
    <section className="py-16 bg-white border-t border-slate-200" id="locations">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Facility Locator & Clinic Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find the Nearest J & J Memorial Health Facility
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Convenient care accessible across greater Monrovia, with 24/7 acute trauma capability and seamless patient record integration across all branches.
          </p>
        </div>

        {/* Branch Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BRANCHES.map(branch => {
            const isSelected = selectedBranchId === branch.id;
            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      branch.isMainCampus ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {branch.isMainCampus ? 'Main Hospital' : 'Branch Clinic'}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {branch.isMainCampus ? '24/7 Open' : 'Open'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {branch.name}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">{branch.phone}</span>
                  <span className="text-teal-800 font-semibold flex items-center gap-1">
                    <span>View Branch</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Branch Overview & Interactive Map Showcase */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-300 bg-teal-950 border border-teal-800 px-2.5 py-1 rounded-full">
                {activeBranch.tier}
              </span>
              <span className="text-xs text-slate-400">
                {activeBranch.city}, Liberia
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeBranch.name}
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{activeBranch.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-300">{activeBranch.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Emergency Hotline: <strong className="text-rose-300">{activeBranch.emergencyHotline}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Power Resilience: {activeBranch.powerGrid}</span>
              </div>
            </div>

            {/* Department services pills */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Services & Departments:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeBranch.services.map((srv, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-200 border border-slate-700 text-[11px] px-2.5 py-1 rounded-lg">
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={activeBranch.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-5 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Driving Directions (Google Maps)</span>
              </a>

              <a
                href={`tel:${activeBranch.phone}`}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Call Reception</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Visual Mockup */}
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between h-80 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-white">Monrovia Geospatial Grid</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {activeBranch.coordinates.lat.toFixed(4)}°N, {activeBranch.coordinates.lng.toFixed(4)}°W
              </span>
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-14 h-14 rounded-full bg-teal-900/60 border-2 border-teal-400 flex items-center justify-center text-teal-300 animate-bounce shadow-lg">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-white mt-3">{activeBranch.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{activeBranch.community}, Monrovia</p>
            </div>

            <div className="relative pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
              <span>Ambulance Direct Link: Active</span>
              <span className="text-emerald-400 font-semibold">Triage Open</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
