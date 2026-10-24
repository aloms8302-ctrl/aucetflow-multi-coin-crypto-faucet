import React, { useState } from 'react';
import { FaucetUser } from '../types/faucet';
import { FaucetEngine } from '../lib/faucetEngine';
import {
  X,
  Mail,
  UserPlus,
  LogIn,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Key,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: FaucetUser, msg: string) => void;
  currentUser?: FaucetUser | null;
  onSignOut?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser,
  onSignOut,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        const res = await FaucetEngine.signUpUser(email, password, username);
        if (res.success && res.user) {
          onAuthSuccess(res.user, res.message);
          onClose();
        } else {
          setErrorMsg(res.message);
        }
      } else {
        const res = await FaucetEngine.signInUser(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user, res.message);
          onClose();
        } else {
          setErrorMsg(res.message);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b101b] p-6 shadow-2xl cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-lg shadow-cyan-900/30">
            {mode === 'signup' ? (
              <UserPlus className="h-6 w-6" />
            ) : (
              <LogIn className="h-6 w-6" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'signup'
              ? 'Create Your FaucetFlow Account'
              : 'Sign In to FaucetFlow'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup'
              ? 'Use ANY email — instant access with zero admin approval required'
              : 'Enter your email to access your wallet balances & claims'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mb-5 flex rounded-lg bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'signup'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'signin'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-rose-950/60 border border-rose-500/30 p-2.5 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="yourname@gmail.com, yahoo.com, etc."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#070b14] pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Any email address is accepted. No admin verification required.
            </p>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Display Username (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. cryptohunter99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#070b14] px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password {mode === 'signin' && <span className="text-cyan-400">*</span>}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#070b14] pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-cyan-500/20 transition-all disabled:opacity-50 mt-2"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'signup'
              ? 'Start Claiming Rewards Now'
              : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Benefits badge */}
        <div className="mt-5 border-t border-slate-800/80 pt-4 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Automatic wallet setup for BTC, LTC, DOGE, and USDT</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Instant 60s reward claims — zero waiting for admin approval</span>
          </div>
        </div>

        {/* If user is already logged in, show signout option */}
        {currentUser && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Currently logged in as: <strong className="text-cyan-400">{currentUser.email}</strong></span>
            {onSignOut && (
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="text-rose-400 hover:underline"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
