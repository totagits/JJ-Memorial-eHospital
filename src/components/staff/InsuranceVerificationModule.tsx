import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { InsurancePolicyCheck } from '../../types';
import { ShieldCheck, Search, CheckCircle2, AlertCircle, XCircle, Building2, Calendar, DollarSign } from 'lucide-react';

export const InsuranceVerificationModule: React.FC = () => {
  const records = dbStore.getInsuranceRecords();
  const [provider, setProvider] = useState('National Social Security & Welfare (NASSCORP)');
  const [policyId, setPolicyId] = useState('NASS-88921-LIB');
  const [isChecking, setIsChecking] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<InsurancePolicyCheck | null>(records[0]);
  const [searchHistory, setSearchHistory] = useState<InsurancePolicyCheck[]>(records);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate real-time API call

    // Match or generate verification result
    const found = records.find(
      (r) => r.insuranceId.toLowerCase() === policyId.trim().toLowerCase()
    );

    if (found) {
      setVerifiedRecord(found);
    } else {
      const generated: InsurancePolicyCheck = {
        id: `ins-${Date.now()}`,
        insuranceId: policyId.trim().toUpperCase(),
        provider,
        patientName: 'Verified Member',
        policyStatus: 'Active',
        validUntil: '2027-12-31',
        coveragePercentage: 80,
        deductibleRemainingUSD: 50.0,
        coPayUSD: 10.0,
        coveredServices: ['General OPD', 'Essential Diagnostics', 'Emergency Triage', 'Prescription Formulary'],
        exclusions: ['Cosmetic Elective Surgery'],
      };
      setVerifiedRecord(generated);
      setSearchHistory([generated, ...searchHistory]);
    }

    setIsChecking(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Payer Eligibility & Real-time Benefit Gateway</span>
          </div>
          <h2 className="text-2xl font-extrabold text-hospital-navy mt-1">
            Insurance Verification & Coverage Check
          </h2>
          <p className="text-xs text-slate-500">
            Verify patient health insurance status, active validity dates, remaining deductibles, and covered services in real-time.
          </p>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleVerify} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-hospital-navy text-sm">
          Check Patient Policy Coverage
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
          <div className="sm:col-span-5">
            <label className="block font-semibold text-slate-700 mb-1">Insurance Provider Organization *</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              <option value="National Social Security & Welfare (NASSCORP)">NASSCORP Healthcare Plan</option>
              <option value="Sunu Assurances Liberia Ltd.">Sunu Assurances Liberia Ltd.</option>
              <option value="Activa International Insurance Liberia">Activa International Insurance</option>
              <option value="Cigna Global / International SOS">Cigna Global / International SOS</option>
              <option value="Corporate Employer Private Direct">Corporate Employer Direct Billing</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block font-semibold text-slate-700 mb-1">Patient Policy / Member Card ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. NASS-88921-LIB"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={!policyId.trim() || isChecking}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{isChecking ? 'Querying Payer...' : 'Verify Eligibility'}</span>
            </button>
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold">Test Policies:</span>
          <button
            type="button"
            onClick={() => {
              setProvider('National Social Security & Welfare (NASSCORP)');
              setPolicyId('NASS-88921-LIB');
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px]"
          >
            NASS-88921-LIB (Korto Kollie)
          </button>
          <button
            type="button"
            onClick={() => {
              setProvider('Sunu Assurances Liberia Ltd.');
              setPolicyId('SUNU-9021-CL');
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px]"
          >
            SUNU-9021-CL (James Fahnbulleh)
          </button>
        </div>
      </form>

      {/* Verification Results Display */}
      {verifiedRecord && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Status: {verifiedRecord.policyStatus}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {verifiedRecord.insuranceId}</span>
              </div>
              <h3 className="text-xl font-extrabold text-hospital-navy mt-1">
                {verifiedRecord.provider}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Member: <strong>{verifiedRecord.patientName}</strong> &bull; Valid Until: <strong>{verifiedRecord.validUntil}</strong>
              </p>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-center sm:text-right shrink-0">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">Coverage Share</span>
              <div className="text-2xl font-black text-teal-700">{verifiedRecord.coveragePercentage}% Covered</div>
            </div>
          </div>

          {/* Deductibles and Co-Pay Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block">Remaining Annual Deductible</span>
              <div className="text-xl font-black text-hospital-navy">
                ${verifiedRecord.deductibleRemainingUSD.toFixed(2)} USD
              </div>
              <span className="text-[11px] text-slate-500">Patient responsibility</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block">Co-Payment Per Visit</span>
              <div className="text-xl font-black text-hospital-navy">
                ${verifiedRecord.coPayUSD.toFixed(2)} USD
              </div>
              <span className="text-[11px] text-slate-500">Fixed consultation co-pay</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 font-semibold block">Pre-Authorization Status</span>
              <div className="text-xl font-black text-emerald-600">
                Pre-Approved
              </div>
              <span className="text-[11px] text-slate-500">Direct settlement authorized</span>
            </div>
          </div>

          {/* Covered Services vs Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Covered Benefits
              </h5>
              <div className="space-y-1.5">
                {verifiedRecord.coveredServices.map((srv, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Policy Exclusions
              </h5>
              <div className="space-y-1.5">
                {verifiedRecord.exclusions.map((exc, idx) => (
                  <div key={idx} className="p-2 bg-rose-50/50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{exc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
