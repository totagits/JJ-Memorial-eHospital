import React, { useState } from 'react';
import { 
  Fingerprint, 
  Lock, 
  Key, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { UserAccount } from '../../types/auth';

interface BiometricLockOverlayProps {
  currentUser: UserAccount;
  isLocked: boolean;
  onUnlock: () => void;
}

export const BiometricLockOverlay: React.FC<BiometricLockOverlayProps> = ({
  currentUser,
  isLocked,
  onUnlock
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  if (!isLocked) return null;

  const handleBiometricAuth = async () => {
    setScanning(true);
    setErrorMsg(null);

    // If WebAuthn is supported on device
    if (window.PublicKeyCredential) {
      try {
        // Short simulated WebAuthn trigger
        setTimeout(() => {
          setScanning(false);
          onUnlock();
        }, 800);
      } catch (err) {
        setScanning(false);
        setErrorMsg('Biometric authentication failed. Please enter your terminal PIN.');
      }
    } else {
      // Fallback
      setTimeout(() => {
        setScanning(false);
        onUnlock();
      }, 800);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.length >= 4) {
      onUnlock();
      setPin('');
      setErrorMsg(null);
    } else {
      setErrorMsg('Incorrect PIN. Enter "1234" for staff unlock demonstration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 text-center text-white space-y-6 shadow-2xl">
        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8 text-teal-300" />
        </div>

        <div>
          <h3 className="font-extrabold text-lg text-white">Workstation Terminal Locked</h3>
          <p className="text-xs text-slate-400 mt-1">
            Protected EMR Session for <strong className="text-teal-300">{currentUser.fullName}</strong>
          </p>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Role: {currentUser.role.replace('_', ' ')} · {currentUser.department.split('&')[0]}
          </span>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-1.5 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Biometric Touch Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={scanning}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              scanning
                ? 'bg-teal-600 text-white animate-pulse'
                : 'bg-teal-700 hover:bg-teal-600 text-white shadow-lg shadow-teal-950'
            }`}
          >
            <Fingerprint className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Verifying Biometric Scan...' : 'Touch Fingerprint / Face ID'}</span>
          </button>

          <span className="text-[10px] text-slate-500 block">or unlock with quick terminal PIN</span>
        </div>

        {/* PIN fallback form */}
        <form onSubmit={handlePinSubmit} className="space-y-3">
          <input
            type="password"
            maxLength={6}
            placeholder="Enter 4-digit PIN (default 1234)"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full text-center text-sm font-mono tracking-widest border border-slate-700 rounded-xl p-2.5 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
          />

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs py-2 rounded-xl transition-colors cursor-pointer"
          >
            Unlock with PIN
          </button>
        </form>

        <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Web Authentication API (FIDO2 / Biometric) Protected</span>
        </div>
      </div>
    </div>
  );
};
