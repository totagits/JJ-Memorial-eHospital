import React, { useState } from 'react';
import { 
  Droplet, 
  AlertTriangle, 
  Plus, 
  Search, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Thermometer, 
  Layers, 
  RefreshCw,
  FileText,
  Heart,
  X
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { BloodUnit, BloodDonor, BloodTransfusionRequest, BloodGroup, BloodComponent } from '../../types/bloodBank';
import { getDatabaseState, addBloodUnit, updateBloodUnit, addBloodDonor, createBloodTransfusionRequest, updateBloodTransfusionRequest, logAuditEvent } from '../../services/storageService';

interface BloodBankWorkstationProps {
  currentUser: UserAccount;
}

export const BloodBankWorkstation: React.FC<BloodBankWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const bloodUnits = db.bloodUnits || [];
  const bloodDonors = db.bloodDonors || [];
  const bloodRequests = db.bloodRequests || [];

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'DONORS' | 'TRANSFUSIONS'>('INVENTORY');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form states for adding new blood unit
  const [newGroup, setNewGroup] = useState<BloodGroup>('O+');
  const [newComponent, setNewComponent] = useState<BloodComponent>('PACKED_RBC');
  const [newVolume, setNewVolume] = useState<number>(350);
  const [newDonorName, setNewDonorName] = useState('Varney Johnson');
  const [newStorageLocation, setNewStorageLocation] = useState('Blood Refrigerator 1 · Shelf B (4°C)');

  // Form states for donor
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorAge, setDonorAge] = useState(26);
  const [donorGroup, setDonorGroup] = useState<BloodGroup>('O+');
  const [donorHb, setDonorHb] = useState(14.2);

  // Form states for transfusion request
  const [reqPatientMrn, setReqPatientMrn] = useState(db.patients[1]?.mrn || 'JJM-2026-00105');
  const [reqIndication, setReqIndication] = useState('Acute severe malarial anemia / surgical coverage');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqUrgency, setReqUrgency] = useState<'STAT_EMERGENCY' | 'URGENT_2HR' | 'ROUTINE_ELECTIVE'>('URGENT_2HR');

  // Low supply calculations
  const bloodGroupCounts = (['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).reduce((acc, grp) => {
    acc[grp] = bloodUnits.filter(u => u.bloodGroup === grp && u.status === 'AVAILABLE').length;
    return acc;
  }, {} as Record<BloodGroup, number>);

  const lowSupplyAlerts = Object.entries(bloodGroupCounts).filter(([grp, count]) => count <= 1);

  // Expiring units (within next 14 days)
  const expiringUnits = bloodUnits.filter(u => {
    if (u.status !== 'AVAILABLE') return false;
    const expiry = new Date(u.expiryDate).getTime();
    const now = Date.now();
    const diffDays = (expiry - now) / (1000 * 3600 * 24);
    return diffDays <= 14;
  });

  const filteredUnits = bloodUnits.filter(u => {
    if (selectedGroupFilter === 'ALL') return true;
    return u.bloodGroup === selectedGroupFilter;
  });

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitNumber = `BLD-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
    
    // Default expiration: 35 days for Whole Blood / RBC
    const expiryDate = new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const unit: BloodUnit = {
      id: `BLD-${Date.now()}`,
      unitNumber,
      bloodGroup: newGroup,
      component: newComponent,
      volumeMl: Number(newVolume),
      collectedDate: new Date().toISOString().split('T')[0],
      expiryDate,
      status: 'AVAILABLE',
      storageLocation: newStorageLocation,
      donorId: `DNR-${Date.now()}`,
      donorName: newDonorName,
      testedNegative: ['HIV 1/2 (EIA)', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'VDRL (Syphilis)']
    };

    addBloodUnit(unit);
    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'LAB',
      details: `New Blood Unit ${unitNumber} (${newGroup} ${newComponent}) added to Blood Bank by ${currentUser.fullName}`,
      ipAddress: '10.0.4.52',
      status: 'SUCCESS'
    });

    setShowAddUnitModal(false);
  };

  const handleAddDonorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donor: BloodDonor = {
      id: `DNR-${Date.now()}`,
      fullName: donorName.trim(),
      age: Number(donorAge),
      gender: 'M',
      phone: donorPhone.trim(),
      address: 'Monrovia, Montserrado',
      bloodGroup: donorGroup,
      lastDonationDate: new Date().toISOString().split('T')[0],
      eligibilityStatus: 'ELIGIBLE',
      totalDonations: 1,
      hemoglobinGdl: Number(donorHb)
    };

    addBloodDonor(donor);
    setShowAddDonorModal(false);
    setDonorName('');
    setDonorPhone('');
  };

  const handleTransfusionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = db.patients.find(p => p.mrn === reqPatientMrn) || db.patients[0];

    createBloodTransfusionRequest({
      patientId: patient.id,
      patientMrn: patient.mrn,
      patientName: `${patient.firstName} ${patient.lastName}`,
      clinicalIndication: reqIndication,
      urgency: reqUrgency,
      unitsRequested: Number(reqUnits),
      bloodGroup: (patient.bloodGroup || 'O+') as BloodGroup,
      component: 'PACKED_RBC',
      orderingDoctor: currentUser.fullName,
      ward: 'Male Medical Ward Bed 02',
      status: 'PENDING'
    });

    setShowRequestModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <Droplet className="w-5 h-5 text-rose-600" />
            <span>Transfusion Medicine & Cold-Chain Storage</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Blood Bank Inventory & Donor Registry
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage screened blood units, track refrigeration cold-chain integrity (+2°C to +6°C), monitor critical O-Negative emergency reserves, and execute patient crossmatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddUnitModal(true)}
            className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Screened Unit</span>
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-teal-400" />
            <span>+ Transfusion Request</span>
          </button>
        </div>
      </div>

      {/* Critical Shortage Warning Banner if any */}
      {lowSupplyAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-xs">
                Low Blood Inventory Warning ({lowSupplyAlerts.map(([grp, count]) => `${grp}: ${count} unit`).join(', ')})
              </h4>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Critical universal supply below safe threshold. Coordinate with Montserrado Red Cross Donor Drive.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddDonorModal(true)}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
          >
            Register Voluntary Donor
          </button>
        </div>
      )}

      {/* Blood Group Matrix Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(grp => {
          const count = bloodGroupCounts[grp] || 0;
          const isCritical = count === 0;
          const isLow = count === 1;

          return (
            <div
              key={grp}
              onClick={() => setSelectedGroupFilter(grp === selectedGroupFilter ? 'ALL' : grp)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedGroupFilter === grp
                  ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="font-extrabold text-base text-slate-900 font-mono block">{grp}</span>
              <span className={`text-xl font-black font-mono mt-1 block ${
                isCritical ? 'text-rose-600 animate-pulse' : isLow ? 'text-amber-600' : 'text-slate-800'
              }`}>
                {count}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {count === 1 ? '1 unit' : `${count} units`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold space-x-6">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'INVENTORY' ? 'text-rose-700 border-b-2 border-rose-700' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Blood Unit Inventory ({bloodUnits.length})
        </button>
        <button
          onClick={() => setActiveTab('DONORS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'DONORS' ? 'text-rose-700 border-b-2 border-rose-700' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Donor Registry ({bloodDonors.length})
        </button>
        <button
          onClick={() => setActiveTab('TRANSFUSIONS')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'TRANSFUSIONS' ? 'text-rose-700 border-b-2 border-rose-700' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Transfusion & Crossmatches ({bloodRequests.length})
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'INVENTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-bold text-slate-700">Cold-Chain Temperature:</span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +3.8°C (Refrig 1 Online)
              </span>
            </div>

            {selectedGroupFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedGroupFilter('ALL')}
                className="text-xs text-rose-700 font-semibold hover:underline"
              >
                Clear Filter ({selectedGroupFilter})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3">Unit Number</th>
                  <th className="pb-3">Group</th>
                  <th className="pb-3">Component</th>
                  <th className="pb-3">Volume</th>
                  <th className="pb-3">Expiry Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Refrigeration Bay</th>
                  <th className="pb-3">Screening Viral Markers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.map(unit => (
                  <tr key={unit.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {unit.unitNumber}
                    </td>
                    <td className="py-3 font-mono font-bold text-rose-700 text-sm">
                      {unit.bloodGroup}
                    </td>
                    <td className="py-3 text-slate-700 font-medium">
                      {unit.component.replace('_', ' ')}
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {unit.volumeMl} mL
                    </td>
                    <td className="py-3 font-mono text-slate-700">
                      {unit.expiryDate}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        unit.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : unit.status === 'RESERVED'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-slate-500">
                      {unit.storageLocation}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        ✓ All 4 Markers Non-Reactive
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Donors Tab */}
      {activeTab === 'DONORS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">Verified Voluntary Donor Registry</h3>
            <button
              onClick={() => setShowAddDonorModal(true)}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Donor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bloodDonors.map(donor => (
              <div key={donor.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{donor.fullName}</h4>
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    {donor.bloodGroup}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-0.5">
                  <div>Age: {donor.age} yrs · Contact: {donor.phone}</div>
                  <div>Hemoglobin: <strong className="text-slate-900">{donor.hemoglobinGdl} g/dL</strong></div>
                  <div>Last Donation: {donor.lastDonationDate} ({donor.totalDonations} total)</div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Eligible to Donate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfusion Requests Tab */}
      {activeTab === 'TRANSFUSIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">Clinical Transfusion Orders & Crossmatches</h3>
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </button>
          </div>

          <div className="space-y-3">
            {bloodRequests.map(req => (
              <div key={req.id} className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-950 text-sm">{req.patientName}</span>
                    <span className="font-mono text-xs bg-white border border-teal-300 px-2 py-0.5 rounded font-bold">
                      {req.patientMrn}
                    </span>
                    <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded font-bold">
                      {req.bloodGroup} {req.component.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="font-bold text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {req.status}
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Indication: {req.clinicalIndication} · Ordered by: {req.orderingDoctor} · Ward: {req.ward}
                </p>

                <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">Order ID: {req.id}</span>
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => updateBloodTransfusionRequest(req.id, { status: 'CROSSMATCHED' })}
                      className="bg-teal-800 hover:bg-teal-900 text-white font-semibold px-3 py-1 rounded text-xs cursor-pointer"
                    >
                      Complete Crossmatch & Reserve Unit
                    </button>
                  )}
                  {req.status === 'CROSSMATCHED' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Crossmatch Validated Compatible
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Blood Unit */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <Droplet className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Receive Screened Blood Unit</h3>
              </div>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddUnitSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={newGroup}
                    onChange={e => setNewGroup(e.target.value as BloodGroup)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-sm bg-white"
                  >
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-) [Universal]</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Component *</label>
                  <select
                    value={newComponent}
                    onChange={e => setNewComponent(e.target.value as BloodComponent)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="PACKED_RBC">Packed Red Blood Cells</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
                    <option value="PLATELETS">Platelet Concentrate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Volume in mL *</label>
                  <input
                    type="number"
                    required
                    value={newVolume}
                    onChange={e => setNewVolume(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Donor Name *</label>
                  <input
                    type="text"
                    required
                    value={newDonorName}
                    onChange={e => setNewDonorName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refrigeration Location</label>
                <input
                  type="text"
                  value={newStorageLocation}
                  onChange={e => setNewStorageLocation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 space-y-1">
                <span className="font-bold block">✓ Mandatory Viral Marker Screening Confirmed:</span>
                <span>HIV 1/2, Hepatitis B (HBsAg), Hepatitis C (HCV), and Syphilis (VDRL) non-reactive.</span>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-700 hover:bg-rose-800 text-white font-semibold px-5 py-2 rounded-lg"
                >
                  Save & Log to Cold-Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Donor */}
      {showAddDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Register Voluntary Blood Donor</h3>
              <button onClick={() => setShowAddDonorModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddDonorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Contact *</label>
                  <input
                    type="text"
                    required
                    value={donorPhone}
                    onChange={e => setDonorPhone(e.target.value)}
                    placeholder="+231-..."
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={donorGroup}
                    onChange={e => setDonorGroup(e.target.value as BloodGroup)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hemoglobin (Hb g/dL) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={donorHb}
                  onChange={e => setDonorHb(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDonorModal(false)}
                  className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-800 hover:bg-teal-900 text-white font-semibold px-5 py-2 rounded-lg"
                >
                  Register Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfusion Order */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Clinical Transfusion Order</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleTransfusionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Inpatient *</label>
                <select
                  value={reqPatientMrn}
                  onChange={e => setReqPatientMrn(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  {db.patients.map(p => (
                    <option key={p.id} value={p.mrn}>
                      {p.mrn} - {p.firstName} {p.lastName} (Blood Group: {p.bloodGroup || 'O+'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Indication *</label>
                <input
                  type="text"
                  required
                  value={reqIndication}
                  onChange={e => setReqIndication(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Units Needed *</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={reqUnits}
                    onChange={e => setReqUnits(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urgency *</label>
                  <select
                    value={reqUrgency}
                    onChange={e => setReqUrgency(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="STAT_EMERGENCY">STAT Emergency (&lt;15 min)</option>
                    <option value="URGENT_2HR">Urgent (Within 2 Hours)</option>
                    <option value="ROUTINE_ELECTIVE">Elective / Surgical</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2 rounded-lg"
                >
                  Dispatch Order to Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
