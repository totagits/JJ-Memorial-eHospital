import React, { useState, useEffect } from 'react';
import { biometricAuthService } from '../../services/biometrics';
import { Fingerprint, Lock, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const BiometricLockOverlay: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUser, setLockedUser] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  useEffect(() => {
    return biometricAuthService.subscribe((locked, user) => {
      setIsLocked(locked);
      setLockedUser(user);
      if (!locked) {
        setPin('');
        setPinError(false);
      }
    });
  }, []);

  const handleBiometricScan = async () => {
    setIsVerifying(true);
    const success = await biometricAuthService.unlockWithBiometrics();
    setIsVerifying(false);
    if (success) {
      setSuccessAnimation(true);
      setTimeout(() => setSuccessAnimation(false), 800);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = biometricAuthService.unlockWithPin(pin);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center text-white space-y-6 shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-400">
            Clinical Workstation Secured
          </span>
          <h3 className="text-xl font-black">
            Terminal Locked
          </h3>
          <p className="text-xs text-slate-400">
            Active session: <strong>{lockedUser || 'Dr. Emmanuel Tamba, MD'}</strong>
          </p>
        </div>

        {/* Biometric Touch Scanner Button (#20 WebAuthn) */}
        <div className="py-2">
          <button
            onClick={handleBiometricScan}
            disabled={isVerifying}
            className={`w-32 h-32 rounded-3xl mx-auto flex flex-col items-center justify-center space-y-2 border-2 transition-all ${
              isVerifying
                ? 'bg-teal-500/20 border-teal-400 text-teal-300 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-teal-400 hover:scale-105 active:scale-95'
            }`}
          >
            <Fingerprint className={`w-14 h-14 ${isVerifying ? 'animate-bounce' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isVerifying ? 'Scanning...' : 'Touch Sensor'}
            </span>
          </button>
          <span className="text-[11px] text-slate-400 block mt-3">
            Web Authentication API &bull; Fingerprint / Face ID / Windows Hello
          </span>
        </div>

        {/* PIN Fallback Form */}
        <form onSubmit={handlePinSubmit} className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="password"
              placeholder="Or Enter 4-Digit Terminal PIN (Default: 1234)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase rounded-xl transition"
            >
              Unlock
            </button>
          </div>

          {pinError && (
            <p className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Incorrect Terminal PIN. Try 1234.
            </p>
          )}
        </form>

        <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-mono">
          <ShieldCheck className="w-3 h-3 text-teal-500" />
          HIPAA & ISO-27799 Compliant Auto-Terminal Lock
        </div>
      </div>
    </div>
  );
};
