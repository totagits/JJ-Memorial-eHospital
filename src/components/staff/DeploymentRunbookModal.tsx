import React, { useState } from 'react';
import { X, Server, Globe, GitBranch, Copy, Check, Terminal, ExternalLink, ShieldCheck, Database } from 'lucide-react';

interface DeploymentRunbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentRunbookModal: React.FC<DeploymentRunbookModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `# 1. Staging Workflow (Current Branch: JJ-Memorial-staging)
git checkout JJ-Memorial-staging
git add .
git commit -m "feat(telehealth-emr): Telehealth, My Health portal, and VOA East IndexedDB offline cache"

# 2. Push Staging to GitHub (totagits/JJ-Memorial-eHospital)
git push -u origin JJ-Memorial-staging

# ----------------------------------------------------
# 3. Production Release Workflow (When Ready to Ship)
git checkout main
git merge JJ-Memorial-staging
git push -u origin main
git checkout JJ-Memorial-staging`;

  const coolifyEnv = `# Environment configuration for Coolify on Hostinger VPS (2.24.115.245)
# STAGING INSTANCE:
#   - Coolify Branch: JJ-Memorial-staging
#   - FQDN: https://jjmemorial-staging.totag.network
# PRODUCTION INSTANCE:
#   - Coolify Branch: main
#   - FQDN: https://jjmemorial.totag.network

NODE_ENV=production
PORT=3000
APP_URL=https://jjmemorial-staging.totag.network
PRODUCTION_URL=https://jjmemorial.totag.network

# PostgreSQL Database (Separate isolated container from Redeemer's & FDA MIS)
DATABASE_URL=postgresql://jjm_admin:SECURE_DB_PASSWORD@jjm-postgres:5432/jjmemorial_staging

# Dual Currency Baseline Exchange Rate & Hospital Info
VITE_EXCHANGE_RATE_LRD=195.00
VITE_HOSPITAL_NAME="J & J Memorial e-Hospital"
VITE_FACILITY_CODE="JJM-MONROVIA"

# SSL & Security
COOKIE_SECURE=true
CORS_ORIGIN=https://jjmemorial-staging.totag.network,https://jjmemorial.totag.network`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm">Hostinger VPS & GitHub Deployment Runbook</h3>
              <p className="text-[11px] text-slate-400">Hostinger hPanel DNS · Coolify KVM-2 · totagits/JJ-Memorial-eHospital</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
          {/* Step 1: Subdomain DNS */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-700" />
                Step 1: Verify Subdomains on Hostinger hPanel
              </span>
              <a
                href="https://hpanel.hostinger.com/domains"
                target="_blank"
                rel="noreferrer"
                className="text-teal-800 font-semibold hover:underline flex items-center gap-1 text-xs"
              >
                <span>Open Hostinger Domains</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-600 leading-relaxed">
              In <strong className="text-slate-900">hpanel.hostinger.com/domains</strong> &gt; <strong className="text-slate-900">totag.network</strong> &gt; <strong className="text-slate-900">DNS / Nameservers</strong>, ensure the following A records are configured to point to your VPS IP:
            </p>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2">Type</th>
                    <th className="p-2">Name / Subdomain</th>
                    <th className="p-2">Points To (Value)</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-bold text-teal-800">A</td>
                    <td className="p-2 font-bold">jjmemorial</td>
                    <td className="p-2 text-slate-700 font-mono">2.24.115.245</td>
                    <td className="p-2 text-emerald-700 font-sans font-semibold">Verified Active (Production)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-teal-800">A</td>
                    <td className="p-2 font-bold">jjmemorial-staging</td>
                    <td className="p-2 text-slate-700 font-mono">2.24.115.245</td>
                    <td className="p-2 text-teal-700 font-sans font-semibold">Verified Active (Target Staging)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
              <strong>Verified DNS Configuration:</strong> Both <code className="font-mono font-bold">jjmemorial</code> and <code className="font-mono font-bold">jjmemorial-staging</code> are confirmed pointing to VPS IP <strong className="font-mono text-slate-900">2.24.115.245</strong>. Existing services on this host (Redeemer's Academy, FDA MIS, and Gwoah's University) remain completely untouched and isolated.
            </div>
          </div>

          {/* Step 2: GitHub Repository Push */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-700" />
                Step 2: Codebase in GitHub (totagits/JJ-Memorial-eHospital)
              </span>
              <button
                onClick={() => copyToClipboard(gitCommands, 'git')}
                className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSection === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'git' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Target repository configured at <a href="https://github.com/totagits/JJ-Memorial-eHospital" target="_blank" rel="noreferrer" className="text-teal-800 underline font-semibold">github.com/totagits/JJ-Memorial-eHospital</a>:
            </p>

            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>

          {/* Step 3: Coolify Environment Setup */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                Step 3: Coolify Staging Deployment on Hostinger VPS (2.24.115.245)
              </span>
              <button
                onClick={() => copyToClipboard(coolifyEnv, 'env')}
                className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'env' ? 'Copied' : 'Copy Env Config'}</span>
              </button>
            </div>

            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 leading-relaxed">
              <li>Log into your Coolify control panel on the VPS (<strong className="text-slate-800">2.24.115.245</strong>).</li>
              <li>
                <strong>Target 1 — Staging Application:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-slate-700">
                  <li>Repository: <code className="font-mono font-bold">totagits/JJ-Memorial-eHospital</code></li>
                  <li>Branch: <code className="bg-purple-100 text-purple-900 px-1 py-0.5 rounded font-mono font-bold">JJ-Memorial-staging</code></li>
                  <li>FQDN Domain: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">https://jjmemorial-staging.totag.network</code></li>
                  <li>Internal Port: <code className="font-mono font-bold">3000</code> with auto SSL</li>
                </ul>
              </li>
              <li>
                <strong>Target 2 — Production Application (Release Ready):</strong>
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-slate-700">
                  <li>Repository: <code className="font-mono font-bold">totagits/JJ-Memorial-eHospital</code></li>
                  <li>Branch: <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono font-bold">main</code></li>
                  <li>FQDN Domain: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">https://jjmemorial.totag.network</code></li>
                  <li>Internal Port: <code className="font-mono font-bold">3000</code> with auto SSL</li>
                </ul>
              </li>
              <li>Save and trigger deployment. Coolify will pull the respective branch, run the build, and route each subdomain automatically with Let's Encrypt certificates.</li>
            </ol>

            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
              {coolifyEnv}
            </pre>
          </div>
        </div>

        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Close Runbook
          </button>
        </div>
      </div>
    </div>
  );
};
