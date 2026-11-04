import React, { useState, useEffect } from 'react';
import { dbStore } from '../../services/dbStore';
import { BloodInventoryItem } from '../../types';
import { HeartPulse, Plus, AlertTriangle, ShieldCheck, Clock, User, CheckCircle2, Droplets, ThermometerSnowflake } from 'lucide-react';

export const BloodBankModule: React.FC = () => {
  const [bloodUnits, setBloodUnits] = useState<BloodInventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('All');

  // Form states
  const [bloodType, setBloodType] = useState<BloodInventoryItem['bloodType']>('O+');
  const [component, setComponent] = useState<BloodInventoryItem['component']>('Whole Blood');
  const [volumeMl, setVolumeMl] = useState<number>(450);
  const [donorName, setDonorName] = useState('');
  const [donorContact, setDonorContact] = useState('');
  const [storageLocation, setStorageLocation] = useState('Cold Chamber A1 - Tray 1');
  const [expiryDate, setExpiryDate] = useState('2026-12-05');

  useEffect(() => {
    const update = () => {
      setBloodUnits(dbStore.getBloodBank());
    };
    update();
    return dbStore.subscribe(update);
  }, []);

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorContact) return;

    await dbStore.addBloodUnit({
      unitNumber: `BLD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bloodType,
      component,
      volumeMl: Number(volumeMl),
      collectionDate: new Date().toISOString().split('T')[0],
      expiryDate,
      donorId: `DON-${Math.floor(1000 + Math.random() * 9000)}`,
      donorName,
      donorContact,
      storageLocation,
      status: 'Available',
    });

    setIsAdding(false);
    setDonorName('');
    setDonorContact('');
  };

  const handleStatusChange = async (id: string, status: BloodInventoryItem['status']) => {
    await dbStore.updateBloodUnitStatus(id, status);
  };

  // Group inventory counts by blood type
  const BLOOD_TYPES: BloodInventoryItem['bloodType'][] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const typeCounts = BLOOD_TYPES.map((bt) => {
    const available = bloodUnits.filter((u) => u.bloodType === bt && u.status === 'Available').length;
    return {
      type: bt,
      count: available,
      isLow: available < 2,
    };
  });

  const filteredUnits = selectedType === 'All'
    ? bloodUnits
    : bloodUnits.filter((u) => u.bloodType === selectedType);

  // Check expiring soon (< 7 days from Nov 3, 2026)
  const isExpiringSoon = (expiry: string) => {
    const expTime = new Date(expiry).getTime();
    const now = new Date('2026-11-03').getTime();
    const diffDays = (expTime - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Droplets className="w-3.5 h-3.5" />
            <span>Certified Transfusion & Cold-Chain Inventory</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Blood Bank Management
          </h2>
          <p className="text-xs text-slate-500">
            Track blood units by ABO/Rh group, monitor cold-storage shelf lives, verify donor histories, and safeguard emergency stock reserves.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Intake Form' : 'Register New Donated Unit'}</span>
        </button>
      </div>

      {/* Stock Levels by Blood Type (#4 Low Supply Alerts) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Stock Summary by Blood Group (Low Supply Alert Threshold: &lt; 2 Units)
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-500" />
            Cold Storage Monitored (2&deg;C - 6&deg;C)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {typeCounts.map((tc) => (
            <div
              key={tc.type}
              onClick={() => setSelectedType(selectedType === tc.type ? 'All' : tc.type)}
              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                tc.isLow
                  ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              } ${selectedType === tc.type ? 'ring-2 ring-hospital-navy' : ''}`}
            >
              <div className="font-black text-xl text-hospital-navy">{tc.type}</div>
              <div className="text-sm font-extrabold text-slate-700 mt-0.5">
                {tc.count} <span className="text-[10px] font-normal text-slate-400">units</span>
              </div>
              {tc.isLow ? (
                <span className="inline-block mt-1 text-[9px] font-extrabold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.2 rounded animate-pulse">
                  LOW STOCK!
                </span>
              ) : (
                <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.2 rounded">
                  Adequate
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Unit Form */}
      {isAdding && (
        <form onSubmit={handleAddUnit} className="p-6 bg-white rounded-2xl border border-rose-200 shadow-md space-y-4">
          <h4 className="font-bold text-hospital-navy text-sm flex items-center gap-2">
            <Droplets className="w-4 h-4 text-rose-600" />
            Voluntary Donor Intake & Unit Quarantine Tagging
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-hospital-navy focus:ring-2 focus:ring-rose-500"
              >
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Component</label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="Whole Blood">Whole Blood</option>
                <option value="PRBC (Red Cells)">PRBC (Packed Red Cells)</option>
                <option value="Platelets">Platelets</option>
                <option value="Fresh Frozen Plasma (FFP)">Fresh Frozen Plasma (FFP)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Volume (mL)</label>
              <input
                type="number"
                value={volumeMl}
                onChange={(e) => setVolumeMl(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Donor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John K. Weah"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Donor Telephone *</label>
              <input
                type="tel"
                required
                placeholder="+231 77 000 0000"
                value={donorContact}
                onChange={(e) => setDonorContact(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Storage Location</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
            >
              Save Blood Unit to Bank
            </button>
          </div>
        </form>
      )}

      {/* Blood Units Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-hospital-navy text-sm">
            Stored Blood Units ({filteredUnits.length})
          </h4>
          <span className="text-xs text-slate-400">
            Filtering by: <strong>{selectedType}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Unit #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Donor Details</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.map((u) => {
                const expiring = isExpiringSoon(u.expiryDate);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {u.unitNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-sm text-hospital-navy px-2 py-0.5 rounded bg-slate-100">
                        {u.bloodType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {u.component}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.volumeMl} mL
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${expiring ? 'text-amber-600 flex items-center gap-1' : 'text-slate-700'}`}>
                        {expiring && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        {u.expiryDate}
                        {expiring && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded">Exp Soon</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{u.donorName}</div>
                      <div className="text-[11px] text-slate-400">{u.donorContact}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.storageLocation}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : u.status === 'Reserved'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.status === 'Available' ? (
                        <button
                          onClick={() => handleStatusChange(u.id, 'Reserved')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Reserve Unit
                        </button>
                      ) : u.status === 'Reserved' ? (
                        <button
                          onClick={() => handleStatusChange(u.id, 'Transfused')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Issue Transfusion
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
