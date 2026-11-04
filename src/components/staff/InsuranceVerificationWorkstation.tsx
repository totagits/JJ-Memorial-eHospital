import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Building2, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  User,
  Plus,
  FileText
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { InsurancePolicyRecord, InsuranceProviderId } from '../../types/insuranceVerification';
import { getDatabaseState, verifyInsurancePolicy, logAuditEvent } from '../../services/storageService';

interface InsuranceVerificationWorkstationProps {
  currentUser: UserAccount;
}

export const InsuranceVerificationWorkstation: React.FC<InsuranceVerificationWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const policies = db.insurancePolicies || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicyRecord | null>(policies[0] || null);
  const [verifying, setVerifying] = useState(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);

  // New lookup simulation state
  const [lookupMemberId, setLookupMemberId] = useState('');
  const [lookupProvider, setLookupProvider] = useState<InsuranceProviderId>('ACTIVA_LIBERIA');

  const filteredPolicies = policies.filter(p =>
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientMrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.memberId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunVerification = (policy: InsurancePolicyRecord) => {
    setVerifying(true);
    setVerifySuccessMsg(null);

    setTimeout(() => {
      verifyInsurancePolicy(policy.id, currentUser.fullName);
      setVerifying(false);
      setVerifySuccessMsg(`Eligibility Confirmed with ${policy.providerName}. Pre-auth token generated.`);

      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'UPDATE',
        module: 'BILLING',
        details: `Insurance policy ${policy.policyNumber} (${policy.providerName}) verified for ${policy.patientName} by ${currentUser.fullName}`,
        ipAddress: '10.0.4.15',
        status: 'SUCCESS'
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <CreditCard className="w-5 h-5 text-teal-700" />
            <span>Payer Gateway & Third-Party Administrator (TPA) Verification</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Real-Time Health Insurance & Eligibility Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Verify patient coverage, co-pay responsibilities, deductible balances, and pre-authorization approvals across Activa Liberia, Accident & General, Intrasur, and the Civil Service Health Scheme.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Policies Directory */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">Enrolled Patient Policies</h3>
            <span className="text-xs text-slate-500 font-mono">({filteredPolicies.length})</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, policy #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
            />
          </div>

          {/* Policies list */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredPolicies.map(pol => {
              const isSelected = selectedPolicy?.id === pol.id;
              return (
                <div
                  key={pol.id}
                  onClick={() => {
                    setSelectedPolicy(pol);
                    setVerifySuccessMsg(null);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{pol.patientName}</h4>
                      <span className="font-mono text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-bold">
                        {pol.patientMrn}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pol.coverageStatus === 'ACTIVE_ELIGIBLE'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {pol.coverageStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>{pol.providerName}</span>
                    <strong className="text-slate-900 font-mono">{pol.coveragePercentage}% Coverage</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Policy Details & Verification Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          {selectedPolicy ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">Payer Details</span>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedPolicy.providerName}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>Policy: <strong className="font-mono text-slate-800">{selectedPolicy.policyNumber}</strong></span>
                    <span>·</span>
                    <span>Member: <strong className="font-mono text-slate-800">{selectedPolicy.memberId}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => handleRunVerification(selectedPolicy)}
                  disabled={verifying}
                  className="bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Pinging Insurer Gateway...' : 'Re-Verify Real-Time'}</span>
                </button>
              </div>

              {verifySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{verifySuccessMsg}</span>
                </div>
              )}

              {/* Coverage Snapshot Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">Coverage Rate</span>
                  <span className="text-xl font-black text-teal-800 font-mono mt-1 block">
                    {selectedPolicy.coveragePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">Payer Portion</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">Patient Co-Pay</span>
                  <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
                    ${selectedPolicy.copayAmountUSD.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">Per Outpatient Visit</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">Remaining Deductible</span>
                  <span className="text-xl font-black text-amber-700 font-mono mt-1 block">
                    ${selectedPolicy.deductibleRemainingUSD.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">of ${selectedPolicy.annualDeductibleUSD}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">Status</span>
                  <span className="text-xs font-black text-emerald-700 font-mono mt-2 block">
                    ACTIVE
                  </span>
                  <span className="text-[10px] text-slate-400">Valid to {selectedPolicy.validUntil}</span>
                </div>
              </div>

              {/* Covered & Excluded Services */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-800">Covered Healthcare Benefits</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPolicy.coveredServices.map((srv, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPolicy.excludedServices.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs text-slate-800">Policy Exclusions</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPolicy.excludedServices.map((exc, idx) => (
                      <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {exc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-Authorization Code Box */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-teal-300 font-bold block uppercase">Confirmed Pre-Auth Code</span>
                  <span className="font-mono text-sm font-bold text-white tracking-wider">
                    {selectedPolicy.preAuthReference || 'PA-GEN-88410'}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Verified by: {selectedPolicy.verifiedBy} <br />
                  {new Date(selectedPolicy.lastVerifiedAt).toLocaleString()}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">Select a policy on the left to review verification details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
