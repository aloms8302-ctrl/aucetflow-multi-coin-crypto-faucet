import React from 'react';
import { FaucetUser, CoinType } from '../types/faucet';
import {
  Droplets,
  History,
  Send,
  LogIn,
  UserPlus,
  Gift,
  Layers,
  Flame,
} from 'lucide-react';
import { TELEGRAM_INVITE_URL } from './TelegramContact';
import { UserProfileMenu } from './UserProfileMenu';

export type NavTabType = 'faucet' | 'offerwalls' | 'claims' | 'referrals';

interface NavbarProps {
  currentTab: NavTabType;
  setCurrentTab: (tab: NavTabType) => void;
  currentUser: FaucetUser | null;
  balances: Record<CoinType, number>;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  balances,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Logo and Brand Name */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentTab('faucet')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-sm">
              <Droplets className="h-4 w-4" />
            </div>
            <span className="whitespace-nowrap">FaucetFlow</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Faucet, Offerwalls [Junkie & Adollar], Claims, Referrals, Telegram) */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('faucet')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'faucet'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>Faucet Stations (1h)</span>
          </button>

          {/* Offerwalls: Junkie & Adollar */}
          <button
            onClick={() => setCurrentTab('offerwalls')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'offerwalls'
                ? 'text-purple-400 border-b-2 border-purple-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Offerwalls (Junkie & Adollar)</span>
            <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-emerald-500/20 border border-purple-500/40 px-1.5 py-0.2 text-[10px] font-bold text-purple-300">
              <Flame className="h-2.5 w-2.5 text-amber-400" />
              HOT
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('claims')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'claims'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>My Claims Ledger</span>
          </button>

          <button
            onClick={() => setCurrentTab('referrals')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'referrals'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <Gift className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">Invite & 10% Bonus</span>
          </button>

          {/* Telegram Channel Link */}
          <a
            href={TELEGRAM_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Telegram Channel</span>
          </a>
        </nav>

        {/* Zone 3: Profile (if logged in) OR Sign In / Sign Up buttons (if logged out) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser ? (
            /* When logged in: Sign In and Sign Up buttons are replaced by User Profile */
            <UserProfileMenu
              currentUser={currentUser}
              balances={balances}
              onSignOut={onSignOut}
              onNavigateToClaims={() => setCurrentTab('claims')}
              onNavigateToReferrals={() => setCurrentTab('referrals')}
              onNavigateToOfferwalls={() => setCurrentTab('offerwalls')}
            />
          ) : (
            /* When logged out: Show distinct Sign In and Sign Up buttons */
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/90 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5 text-cyan-400" />
                <span>Sign In</span>
              </button>

              <button
                onClick={onOpenSignUp}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-md shadow-cyan-950/30 active:scale-[0.98]"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex lg:hidden border-t border-slate-800/80 bg-slate-900/60 px-4 py-2 overflow-x-auto gap-4 text-xs font-medium text-slate-300">
        <button
          onClick={() => setCurrentTab('faucet')}
          className={`whitespace-nowrap ${currentTab === 'faucet' ? 'text-cyan-400 font-bold' : ''}`}
        >
          Faucet (1h)
        </button>
        <button
          onClick={() => setCurrentTab('offerwalls')}
          className={`whitespace-nowrap flex items-center gap-1 ${
            currentTab === 'offerwalls' ? 'text-purple-400 font-bold' : 'text-purple-300'
          }`}
        >
          <span>Offerwalls</span>
          <span className="rounded bg-purple-500/20 px-1 text-[9px] text-purple-300">Junkie/Adollar</span>
        </button>
        <button
          onClick={() => setCurrentTab('claims')}
          className={`whitespace-nowrap ${currentTab === 'claims' ? 'text-cyan-400 font-bold' : ''}`}
        >
          My Claims
        </button>
        <button
          onClick={() => setCurrentTab('referrals')}
          className={`whitespace-nowrap ${currentTab === 'referrals' ? 'text-emerald-400 font-bold' : 'text-emerald-400/90'}`}
        >
          Invite (10%)
        </button>
        <a
          href={TELEGRAM_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-sky-400 flex items-center gap-1"
        >
          <Send className="h-3 w-3" />
          Telegram
        </a>
      </div>
    </header>
  );
};
