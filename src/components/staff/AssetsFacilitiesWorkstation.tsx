import React from 'react';
import { Wrench, Zap, CheckCircle2, AlertTriangle, ShieldCheck, Clock, FileText } from 'lucide-react';
import { getDatabaseState } from '../../services/storageService';
import { UserAccount } from '../../types/auth';

interface AssetsFacilitiesWorkstationProps {
  currentUser: UserAccount;
}

export const AssetsFacilitiesWorkstation: React.FC<AssetsFacilitiesWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">Biomedical Engineering & Facilities Management</h2>
          <p className="text-xs text-slate-500">Critical Medical Equipment Registry, Preventive Maintenance, Cummins 500kVA Logs & Calibrations</p>
        </div>
        <div className="text-xs text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1 rounded font-mono">
          Biomedical Lead: {currentUser.fullName}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {db.assets.map(asset => (
          <div key={asset.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {asset.assetTag}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{asset.name}</h3>
                <span className="text-[11px] text-slate-500">{asset.model} · {asset.department}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                asset.status === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {asset.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Serial Number:</span>
                <span className="font-mono font-semibold text-slate-800">{asset.serialNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Location:</span>
                <span className="font-semibold text-slate-800">{asset.location}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Last Calibration:</span>
                <span className="font-mono text-emerald-700 font-semibold">{asset.lastCalibrationDate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Next Due Calibration:</span>
                <span className="font-mono text-teal-800 font-semibold">{asset.nextCalibrationDate}</span>
              </div>
            </div>

            {asset.maintenanceLog.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Latest Logged Service:</span>
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                  {asset.maintenanceLog[0].notes} (Tech: {asset.maintenanceLog[0].technician}, Cost: ${asset.maintenanceLog[0].costUSD})
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
