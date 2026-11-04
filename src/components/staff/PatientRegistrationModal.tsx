import React, { useState } from 'react';
import { X, UserPlus, AlertTriangle, CheckCircle2, Printer, ShieldCheck, Search } from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent, generateNextMRN, findPotentialDuplicates } from '../../services/storageService';
import { Patient } from '../../types/patient';
import { UserAccount } from '../../types/auth';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onRegisteredSuccess: (patient: Patient) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRegisteredSuccess,
}) => {
  const db = getDatabaseState();

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'F' as 'M' | 'F' | 'OTHER',
    phone: '',
    altPhone: '',
    email: '',
    nationalId: '',
    community: 'Congo Town',
    city: 'Monrovia',
    county: 'Montserrado',
    country: 'Liberia',
    bloodGroup: 'O+' as const,
    allergySubstance: '',
    allergySeverity: 'severe' as const,
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    insuranceProvider: 'Self-Pay (Cash/MoMo)',
    policyNumber: '',
    coveragePercent: 0,
  });

  const [potentialDuplicates, setPotentialDuplicates] = useState<Patient[]>([]);
  const [duplicateWarningAcknowledged, setDuplicateWarningAcknowledged] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePhoneOrNameBlur = () => {
    if (formData.firstName && formData.lastName && formData.phone) {
      const dupes = findPotentialDuplicates({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        nationalId: formData.nationalId,
      });
      setPotentialDuplicates(dupes);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.dateOfBirth || !formData.phone.trim()) {
      setErrorMsg('Please complete all mandatory demographic fields.');
      return;
    }

    // If duplicates found and not acknowledged
    if (potentialDuplicates.length > 0 && !duplicateWarningAcknowledged) {
      setErrorMsg('Potential duplicate patient found! Please review candidates below or check override acknowledgment.');
      return;
    }

    const mrn = generateNextMRN();
    const newPatient: Patient = {
      id: `PAT-${Date.now().toString().slice(-5)}`,
      mrn,
      nationalId: formData.nationalId ? formData.nationalId.trim() : undefined,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() || undefined,
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone.trim(),
      altPhone: formData.altPhone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: {
        community: formData.community,
        city: formData.city,
        county: formData.county,
        country: 'Liberia',
      },
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergySubstance.trim() ? [
        {
          substance: formData.allergySubstance.trim(),
          reaction: 'Documented at Front Desk registration intake',
          severity: formData.allergySeverity,
          recordedAt: new Date().toISOString(),
        }
      ] : [],
      emergencyContact: {
        fullName: formData.emergencyName || 'Relative',
        relationship: formData.emergencyRelationship || 'Family',
        phone: formData.emergencyPhone || formData.phone,
      },
      insurance: formData.insuranceProvider !== 'Self-Pay (Cash/MoMo)' ? {
        providerName: formData.insuranceProvider,
        policyNumber: formData.policyNumber || 'POL-PENDING',
        memberId: `MEM-${Date.now().toString().slice(-4)}`,
        coveragePercent: formData.coveragePercent || 80,
        validUntil: '2027-12-31',
      } : undefined,
      registeredAt: new Date().toISOString(),
      registeredBy: currentUser.fullName,
    };

    // Auto-create initial queue entry for Triage
    const queueToken = `Q-TRIAGE-${String(db.queue.length + 1).padStart(3, '0')}`;
    const newQueueEntry = {
      id: `QUE-${Date.now()}`,
      patientId: newPatient.id,
      patientMrn: newPatient.mrn,
      patientName: `${newPatient.firstName} ${newPatient.lastName}`,
      tokenNumber: queueToken,
      department: 'TRIAGE' as const,
      priority: 'ROUTINE' as const,
      status: 'WAITING' as const,
      checkInTime: new Date().toISOString(),
      estimatedWaitMinutes: 10,
    };

    updateDatabaseState(draft => {
      draft.patients.unshift(newPatient);
      draft.queue.unshift(newQueueEntry);
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'PATIENT_INDEX',
      patientId: newPatient.id,
      patientMrn: newPatient.mrn,
      details: `Registered new patient ${newPatient.firstName} ${newPatient.lastName} with MRN ${newPatient.mrn}. Enqueued to Triage as ${queueToken}.`,
      ipAddress: 'Front Desk Station #1',
      status: 'SUCCESS',
    });

    setRegisteredPatient(newPatient);
    onRegisteredSuccess(newPatient);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm">Master Patient Index (MPI) Registration</h3>
              <p className="text-[11px] text-slate-400">Issue Immutable Hospital MRN & Initial Triage Enqueue</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {registeredPatient ? (
          <div className="p-8 space-y-6 printable-area">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Registration Successful!</h4>
              <p className="text-xs text-slate-600">Patient identity recorded in the master database.</p>
            </div>

            {/* Official Printable Patient Card */}
            <div className="border-2 border-slate-900 rounded-xl p-5 bg-white space-y-4 max-w-md mx-auto shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">J & J MEMORIAL e-HOSPITAL</span>
                  <span className="text-[10px] text-slate-500">VOA East Community, Monrovia · Official Patient Card</span>
                </div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  MPI CERTIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Patient Full Name:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {registeredPatient.firstName} {registeredPatient.middleName || ''} {registeredPatient.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Unique Medical Record No:</span>
                  <span className="font-mono font-bold text-teal-900 text-sm">{registeredPatient.mrn}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Date of Birth & Gender:</span>
                  <span className="font-medium text-slate-800">{registeredPatient.dateOfBirth} ({registeredPatient.gender})</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Blood Group:</span>
                  <span className="font-bold text-rose-700">{registeredPatient.bloodGroup || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Phone Contact:</span>
                  <span className="font-mono text-slate-800">{registeredPatient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Community / City:</span>
                  <span className="text-slate-800">{registeredPatient.address.community}, {registeredPatient.address.city}</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="pt-3 border-t border-slate-200 text-center">
                <div className="font-mono text-xl font-bold tracking-widest text-slate-900 select-all">
                  ||||| | |||| ||| ||||||| | |||
                </div>
                <span className="font-mono text-[10px] text-slate-500 tracking-wider">
                  *{registeredPatient.mrn}*
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-4 no-print">
              <button
                onClick={handlePrint}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Registration Slip</span>
              </button>
              <button
                onClick={onClose}
                className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-6 py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Potential Duplicate Banner */}
            {potentialDuplicates.length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Duplicate Record Safeguard Intercept</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  The system detected existing patient(s) with matching phone or names. Merging prevents fragmented charts:
                </p>
                <div className="space-y-1">
                  {potentialDuplicates.map(d => (
                    <div key={d.id} className="bg-white p-2 rounded border border-amber-200 text-xs flex justify-between items-center">
                      <span className="font-semibold text-slate-900">{d.firstName} {d.lastName} (DOB: {d.dateOfBirth})</span>
                      <span className="font-mono text-teal-800 font-bold">{d.mrn}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-1 text-xs text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={duplicateWarningAcknowledged}
                    onChange={e => setDuplicateWarningAcknowledged(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Confirm this is a distinct person with legal documentation</span>
                </label>
              </div>
            )}

            {/* Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onBlur={handlePhoneOrNameBlur}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Marie"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="e.g. S."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onBlur={handlePhoneOrNameBlur}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Weah"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onBlur={handlePhoneOrNameBlur}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            {/* Contacts & National ID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onBlur={handlePhoneOrNameBlur}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+231-770-xxx-xxx"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">National Registry ID (NIR)</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onBlur={handlePhoneOrNameBlur}
                  onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                  placeholder="e.g. NIR-LR-xxxx-xxxx"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Community / Quarter</label>
                <input
                  type="text"
                  value={formData.community}
                  onChange={e => setFormData({ ...formData, community: e.target.value })}
                  placeholder="e.g. Sinkor 24th St"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Clinical Allergy Capture */}
            <div className="bg-rose-50/60 border border-rose-200/80 p-3.5 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-900 block">Critical Allergy Alerts</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={formData.allergySubstance}
                    onChange={e => setFormData({ ...formData, allergySubstance: e.target.value })}
                    placeholder="Substance (e.g. Penicillin, Sulfa, NSAIDs)"
                    className="w-full text-xs border border-rose-300 bg-white rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <select
                    value={formData.allergySeverity}
                    onChange={e => setFormData({ ...formData, allergySeverity: e.target.value as any })}
                    className="w-full text-xs border border-rose-300 bg-white rounded-lg p-2 focus:outline-hidden"
                  >
                    <option value="mild">Mild (Rash/Itch)</option>
                    <option value="moderate">Moderate (Hives/Swelling)</option>
                    <option value="severe">Severe / Life-Threatening (Anaphylaxis)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Insurance / Payer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Scheme / Payer</label>
                <select
                  value={formData.insuranceProvider}
                  onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                >
                  <option value="Self-Pay (Cash/MoMo)">Self-Pay (Cash / MTN MoMo)</option>
                  <option value="Activa International Liberia">Activa International Liberia</option>
                  <option value="Accident & General Insurance (AGI)">Accident & General Insurance (AGI)</option>
                  <option value="Liberian Government Scheme">Liberian Government Scheme</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person & Phone</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                    placeholder="Name"
                    className="w-1/2 text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  />
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="Phone"
                    className="w-1/2 text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-600 hover:text-slate-900 px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs px-6 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Issue MRN & Enqueue to Triage</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
