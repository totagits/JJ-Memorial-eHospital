import React from 'react';
import { 
  Stethoscope, 
  HeartPulse, 
  Microscope, 
  Pill, 
  Baby, 
  Bed, 
  Activity, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Syringe,
  CheckCircle2
} from 'lucide-react';

interface ServicesPageProps {
  onOpenAppointmentModal: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenAppointmentModal }) => {
  const services = [
    {
      title: 'General Outpatient & Internal Medicine',
      icon: Stethoscope,
      hours: 'Mon – Sat: 8:00 AM – 5:00 PM',
      description: 'Comprehensive evaluations, management of chronic non-communicable diseases (hypertension, diabetes, asthma, arthritis), and preventive health checkups.',
      lead: 'Dr. Evelyn Sirleaf-Gbotoe, MD',
      color: 'teal',
    },
    {
      title: '24/7 Emergency & Acute Resuscitation',
      icon: HeartPulse,
      hours: '24 Hours / 7 Days a Week',
      description: 'Equipped for cardiac emergencies, acute trauma, severe pediatric malaria, anaphylaxis, and respiratory distress with dedicated oxygen concentrators.',
      lead: 'Dr. J. Saydee Kollie, MD & Emergency Nursing',
      color: 'rose',
    },
    {
      title: 'Maternal, Antenatal & Labor Delivery',
      icon: Baby,
      hours: '24 Hours Delivery & Prenatal Clinics',
      description: 'Comprehensive antenatal care, ultrasound fetal monitoring, normal and operative delivery suites, postnatal care, and newborn resuscitation.',
      lead: 'Sister Comfort Weah, RN & Midwifery Team',
      color: 'purple',
    },
    {
      title: 'Diagnostic Laboratory & Pathology (LIS)',
      icon: Microscope,
      hours: '24 Hours Stat Testing & Routine Batches',
      description: 'Automated 5-part hematology, blood smear parasitology, clinical biochemistry, lipid profiles, urinalysis, stool microscopy, and blood grouping.',
      lead: 'Anthony Barclay, MSc, MLS',
      color: 'cyan',
    },
    {
      title: 'Pharmacy & Therapeutics Dispensary',
      icon: Pill,
      hours: '24 Hours Continuous Dispensing',
      description: 'Stocked with quality-verified essential medications, WHO-recommended anti-malarials, antibiotics, antihypertensives, and insulin under strict cold-chain.',
      lead: 'Sarah Tubman, BPharm, RPh',
      color: 'emerald',
    },
    {
      title: 'Inpatient Ward Services & Recovery',
      icon: Bed,
      hours: '24 Hours Inpatient Monitoring',
      description: 'Male, Female, and Pediatric inpatient accommodation with round-the-clock nursing supervision, intravenous fluid management, and dietary care.',
      lead: 'Sister Comfort Weah, RN',
      color: 'indigo',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Departments & Clinical Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Hospital Services
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every clinical service is backed by verified clinical guidelines, modern diagnostic equipment, and strict infection control standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-teal-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-teal-800" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {srv.hours}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{srv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{srv.description}</p>
                  <p className="text-xs text-slate-500">
                    Clinical Lead: <span className="font-semibold text-slate-800">{srv.lead}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={onOpenAppointmentModal}
                    className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Schedule Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Operational
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
