import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Fingerprint, 
  ExternalLink,
  Users,
  Shield,
  FileCode,
  ArrowRight,
  Stethoscope,
  Microscope,
  DollarSign,
  HeartPulse
} from 'lucide-react';
import { UserAccount } from '../../types/auth';
import { oidcAuthService, OidcUserSession, DEMO_CREDENTIALS } from '../../services/oidcAuthService';

interface StaffOAuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  allStaff: UserAccount[];
  onLoginSuccess: (session: OidcUserSession) => void;
}

export const StaffOAuthLoginModal: React.FC<StaffOAuthLoginModalProps> = ({
  isOpen,
  onClose,
  allStaff,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN_FORM' | 'STAFF_VAULT' | 'TOKEN_INSPECTOR'>('LOGIN_FORM');
  const [username, setUsername] = useState('mls.barclay');
  const [password, setPassword] = useState('Hospital2026!');
  const [smartcardPin, setSmartcardPin] = useState('0899');
  const [useSmartcardMfa, setUseSmartcardMfa] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectStaffCredential = (staff: UserAccount) => {
    const creds = DEMO_CREDENTIALS[staff.username];
    setUsername(staff.username);
    setPassword(creds?.password || 'Hospital2026!');
    setSmartcardPin(creds?.pin || '1234');
    setActiveTab('LOGIN_FORM');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await oidcAuthService.loginWithCredentials(
        username,
        password,
        useSmartcardMfa ? smartcardPin : undefined
      );

      if (result.success && result.session) {
        onLoginSuccess(result.session);
        onClose();
      } else {
        setErrorMessage(result.error || 'Authentication rejected by OAuth2 Identity Provider.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error reaching OIDC token endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeClaims = oidcAuthService.getIdTokenClaims();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center font-bold text-teal-200 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">Staff OAuth2 / OIDC Single Sign-On</h3>
                  <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-700 px-1.5 py-0.2 rounded font-mono font-bold">
                    OIDC 1.0 + PKCE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Issuer: https://auth.jjmemorial.totag.network/oauth2/v1
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('LOGIN_FORM')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'LOGIN_FORM'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>OIDC Login</span>
            </button>
            <button
              onClick={() => setActiveTab('STAFF_VAULT')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'STAFF_VAULT'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Credential Vault</span>
            </button>
            <button
              onClick={() => setActiveTab('TOKEN_INSPECTOR')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'TOKEN_INSPECTOR'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JWT ID Token Claims</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Login Form */}
        {activeTab === 'LOGIN_FORM' && (
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                Enter your hospital-issued email/username and password. Authentication grants a cryptographically signed OpenID Connect ID Token strictly scoped to your statutory clinical role.
              </span>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Username or Email *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. mls.barclay or abarclay@jjmemorial.totag.network"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-700 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Master Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-700 focus:outline-hidden font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default demo password: Hospital2026!</p>
              </div>

              {/* Biometric Smartcard MFA Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSmartcardMfa}
                      onChange={e => setUseSmartcardMfa(e.target.checked)}
                      className="rounded text-teal-700 focus:ring-teal-500"
                    />
                    <span>Verify Physical Smartcard / Biometric MFA PIN</span>
                  </label>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    LMDC Level 2
                  </span>
                </div>

                {useSmartcardMfa && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 text-teal-700 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        maxLength={6}
                        value={smartcardPin}
                        onChange={e => setSmartcardPin(e.target.value)}
                        placeholder="Smartcard PIN (e.g. 0899)"
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-teal-700 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('STAFF_VAULT')}
                  className="text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
                >
                  Need credentials? Pick from Staff Vault
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating OIDC...</span>
                    </>
                  ) : (
                    <>
                      <span>Authenticate with OIDC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Staff Credential Vault (Quick Fill) */}
        {activeTab === 'STAFF_VAULT' && (
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-slate-500">
              Select any hospital staff member below to automatically load their enterprise credentials and test role-scoped RBAC:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {allStaff.filter(s => s.role !== 'patient').map(staff => {
                const creds = DEMO_CREDENTIALS[staff.username];
                const isSelected = username === staff.username;

                return (
                  <button
                    key={staff.id}
                    onClick={() => handleSelectStaffCredential(staff)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{staff.fullName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.2 rounded font-semibold">
                          {staff.username}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {staff.department} · {creds?.title || staff.role}
                      </div>
                      <div className="text-[10px] font-mono text-teal-800 mt-0.5">
                        Pass: {creds?.password || 'Hospital2026!'} | PIN: {creds?.pin || '1234'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
                        Use Credential <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Decoded JWT ID Token Claims */}
        {activeTab === 'TOKEN_INSPECTOR' && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-xs">Decoded OpenID Connect Claims</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                RS256 Verified
              </span>
            </div>

            {activeClaims ? (
              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-[11px] overflow-x-auto leading-relaxed">
                {JSON.stringify(activeClaims, null, 2)}
              </pre>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center text-slate-500">
                No active OIDC ID Token found. Please authenticate first using the login tab.
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div><strong>Audience:</strong> jjm-hospital-workstation-app</div>
              <div><strong>Algorithm:</strong> RS256 with SHA-256 Digest</div>
              <div><strong>Session Scope:</strong> openid profile email clinical:emr billing:admin lab:lis</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
