import React, { useState, useRef, useEffect } from 'react';
import { FaucetUser, CoinType } from '../types/faucet';
import {
  User,
  LogOut,
  ChevronDown,
  Gift,
  History,
  ShieldCheck,
  Wallet,
  Copy,
  Check,
  Layers,
  Flame,
} from 'lucide-react';
import { FaucetEngine } from '../lib/faucetEngine';

interface UserProfileMenuProps {
  currentUser: FaucetUser;
  balances: Record<CoinType, number>;
  onSignOut: () => void;
  onNavigateToClaims: () => void;
  onNavigateToReferrals: () => void;
  onNavigateToOfferwalls?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  currentUser,
  balances,
  onSignOut,
  onNavigateToClaims,
  onNavigateToReferrals,
  onNavigateToOfferwalls,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayName = currentUser.username || currentUser.email.split('@')[0];
  const initial = displayName.charAt(0).toUpperCase();

  const handleCopyInvite = () => {
    const refData = FaucetEngine.getReferralData(currentUser);
    navigator.clipboard.writeText(refData.inviteUrl);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Profile Trigger Button replacing Sign In / Sign Up */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        title="View profile and account settings"
      >
        {/* Avatar Circle with Online Dot */}
        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white font-bold text-xs shadow-inner">
          <span>{initial}</span>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
        </div>

        {/* User identifier */}
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
            <span className="max-w-[120px] truncate">{displayName}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
              Active
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono leading-tight max-w-[120px] truncate">
            {currentUser.email}
          </div>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-[#0b101b] p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white font-bold text-base shadow-lg shadow-cyan-950/40">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                <span>{displayName}</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                {currentUser.email}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                ID: {currentUser.id.slice(0, 8)}...{currentUser.id.slice(-4)}
              </div>
            </div>
          </div>

          {/* Quick Portfolio Balance Preview */}
          <div className="my-3 rounded-xl border border-slate-800/80 bg-[#070b14] p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3 text-cyan-400" />
                <span>Wallet Balances</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">1-Hour Claims</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1.5 rounded-lg border border-slate-800/50">
                <span className="text-amber-400 font-bold">BTC:</span>
                <span className="text-slate-200">{(balances.BTC || 0).toFixed(8)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1.5 rounded-lg border border-slate-800/50">
                <span className="text-blue-400 font-bold">LTC:</span>
                <span className="text-slate-200">{(balances.LTC || 0).toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1.5 rounded-lg border border-slate-800/50">
                <span className="text-yellow-400 font-bold">DOGE:</span>
                <span className="text-slate-200">{(balances.DOGE || 0).toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1.5 rounded-lg border border-slate-800/50">
                <span className="text-emerald-400 font-bold">USDT:</span>
                <span className="text-slate-200">{(balances.USDT || 0).toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-1 pt-1 text-xs">
            {/* Copy Invite Link */}
            <button
              onClick={handleCopyInvite}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Gift className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copy 10% Invite Link</span>
              </span>
              {copiedRef ? (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Check className="h-3 w-3" /> Copied
                </span>
              ) : (
                <Copy className="h-3 w-3 text-slate-500" />
              )}
            </button>

            {/* Offerwalls: Junkie & Adollar */}
            {onNavigateToOfferwalls && (
              <button
                onClick={() => {
                  onNavigateToOfferwalls();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-purple-300 hover:text-purple-200 hover:bg-purple-950/40 border border-purple-500/20 transition-colors font-medium"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-purple-400" />
                  <span>Junkie & Adollar Offerwalls</span>
                </span>
                <span className="text-[9px] bg-purple-500/30 text-purple-200 font-bold px-1.5 py-0.2 rounded border border-purple-500/30">
                  HOT
                </span>
              </button>
            )}

            {/* Claims ledger shortcut */}
            <button
              onClick={() => {
                onNavigateToClaims();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <History className="h-3.5 w-3.5 text-cyan-400" />
              <span>My Claims Ledger</span>
            </button>

            {/* Referral program shortcut */}
            <button
              onClick={() => {
                onNavigateToReferrals();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Gift className="h-3.5 w-3.5 text-emerald-400" />
              <span>Invite Friends (10% Bonus)</span>
            </button>

            {/* Sign Out Button */}
            <div className="pt-2 mt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors font-medium text-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
