import React from 'react';
import { FaucetUser } from '../types/faucet';
import {
  Database,
  Droplets,
  History,
  Code,
  Send,
  LogIn,
  UserPlus,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { TELEGRAM_INVITE_URL } from './TelegramContact';

interface NavbarProps {
  currentTab: 'faucet' | 'claims' | 'referrals' | 'sql';
  setCurrentTab: (tab: 'faucet' | 'claims' | 'referrals' | 'sql') => void;
  currentUser: FaucetUser;
  isLiveSupabase: boolean;
  onOpenSettings: () => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  isLiveSupabase,
  onOpenSettings,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
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

        {/* Zone 2: Clean single-line text navigation links for standard users */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('faucet')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'faucet'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>Faucet Stations</span>
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
            <Droplets className="hidden" />
            <span className="flex items-center gap-1 text-emerald-400">
              <span>Invite & 10% Bonus</span>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('sql')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'sql'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>SQL Workbench</span>
          </button>

          {/* Direct Telegram Link in Nav */}
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

        {/* Zone 3: Distinct Separate Buttons for Sign In & Sign Up + User Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Database status button */}
          <button
            onClick={onOpenSettings}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isLiveSupabase
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
            title="Configure Supabase connection"
          >
            <Database className="h-3.5 w-3.5 text-slate-400" />
            <span className="whitespace-nowrap">
              {isLiveSupabase ? 'Supabase' : 'Postgres'}
            </span>
          </button>

          {/* Active user email pill / badge if logged in */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 rounded-lg">
              <UserCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="font-mono text-slate-300 max-w-[120px] truncate">
                {currentUser.username || currentUser.email.split('@')[0]}
              </span>
            </div>
          )}

          {/* SEPARATE BUTTON 1: SIGN IN */}
          <button
            onClick={onOpenSignIn}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/90 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <LogIn className="h-3.5 w-3.5 text-cyan-400" />
            <span>Sign In</span>
          </button>

          {/* SEPARATE BUTTON 2: SIGN UP */}
          <button
            onClick={onOpenSignUp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-md shadow-cyan-950/30 active:scale-[0.98]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Sign Up</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row with direct navigation & actions */}
      <div className="flex lg:hidden border-t border-slate-800/80 bg-slate-900/60 px-4 py-2 overflow-x-auto gap-4 text-xs font-medium text-slate-300">
        <button
          onClick={() => setCurrentTab('faucet')}
          className={`whitespace-nowrap ${currentTab === 'faucet' ? 'text-cyan-400 font-bold' : ''}`}
        >
          Faucet
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
        <button
          onClick={() => setCurrentTab('sql')}
          className={`whitespace-nowrap ${currentTab === 'sql' ? 'text-cyan-400 font-bold' : ''}`}
        >
          SQL Schema
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
