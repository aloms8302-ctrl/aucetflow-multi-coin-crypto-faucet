import React, { useState, useEffect, useCallback } from 'react';
import {
  CoinType,
  Claim,
  FaucetUser,
} from './types/faucet';
import { FaucetEngine, DEMO_USERS } from './lib/faucetEngine';
import { getSavedCredentials } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { FaucetStations } from './components/FaucetStations';
import { ClaimsLedger } from './components/ClaimsLedger';
import { SqlWorkbench } from './components/SqlWorkbench';
import { AdminPortal } from './components/AdminPortal';
import { ReferralProgram } from './components/ReferralProgram';
import { TelegramContact, TELEGRAM_INVITE_URL } from './components/TelegramContact';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { AuthModal } from './components/AuthModal';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Shield,
  Send,
  UserPlus,
  LogIn,
  Gift,
} from 'lucide-react';

export default function App() {
  // Main view mode: 'user' for normal dashboard, 'admin' for separated admin portal
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');

  // User tabs: 'faucet' | 'claims' | 'referrals' | 'sql'
  const [userTab, setUserTab] = useState<'faucet' | 'claims' | 'referrals' | 'sql'>('faucet');

  // Currently logged in user
  const [currentUser, setCurrentUser] = useState<FaucetUser>(() => {
    const users = FaucetEngine.getSandboxUsers();
    return users[0] || DEMO_USERS[0];
  });

  const [balances, setBalances] = useState<Record<CoinType, number>>({
    BTC: 0,
    LTC: 0,
    DOGE: 0,
    USDT: 0,
  });

  const [claims, setClaims] = useState<Claim[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<CoinType, number>>({
    BTC: 0,
    LTC: 0,
    DOGE: 0,
    USDT: 0,
  });

  const [isClaiming, setIsClaiming] = useState<Record<CoinType, boolean>>({
    BTC: false,
    LTC: false,
    DOGE: false,
    USDT: false,
  });

  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(() => {
    const creds = getSavedCredentials();
    return Boolean(creds.url && creds.anonKey);
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  const handleOpenSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  // Sync user data
  const loadUserData = useCallback(async () => {
    try {
      const [bals, clms, cds, isAdmin] = await Promise.all([
        FaucetEngine.getBalances(currentUser),
        FaucetEngine.getClaims(currentUser, false),
        FaucetEngine.getCooldowns(currentUser),
        FaucetEngine.checkIsAdmin(currentUser),
      ]);

      setBalances(bals);
      setClaims(clms);
      setCooldowns(cds);
      if (isAdmin !== currentUser.isAdmin) {
        setCurrentUser((prev) => ({ ...prev, isAdmin }));
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Capture referral code from URL if present
  useEffect(() => {
    const ref = FaucetEngine.captureReferralFromUrl();
    if (ref) {
      const refName = FaucetEngine.getPendingReferrerName();
      showToast(
        `Invite link applied! You were referred by ${refName}. Start claiming rewards every 60s!`,
        'info'
      );
    }
  }, [showToast]);

  // 1-second countdown ticker for 60s cooldowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const coin of ['BTC', 'LTC', 'DOGE', 'USDT'] as CoinType[]) {
          if (next[coin] > 0) {
            next[coin] -= 1;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Faucet claim handler
  const handleClaim = async (coin: CoinType) => {
    setIsClaiming((prev) => ({ ...prev, [coin]: true }));
    try {
      const result = await FaucetEngine.claimReward(coin, currentUser);

      if (result.success && result.claim) {
        // Start 60s cooldown
        setCooldowns((prev) => ({ ...prev, [coin]: 60 }));

        // Optimistically update
        setClaims((prev) => [result.claim!, ...prev]);
        if (result.newBalance !== undefined) {
          setBalances((prev) => ({ ...prev, [coin]: result.newBalance! }));
        } else {
          await loadUserData();
        }

        showToast(result.message, 'success');
      } else {
        if (result.timeRemaining) {
          setCooldowns((prev) => ({ ...prev, [coin]: result.timeRemaining! }));
        }
        showToast(result.message, 'error');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Claim failed: ${message}`, 'error');
    } finally {
      setIsClaiming((prev) => ({ ...prev, [coin]: false }));
    }
  };

  const handleCredentialsUpdated = () => {
    const creds = getSavedCredentials();
    const isLive = Boolean(creds.url && creds.anonKey);
    setIsLiveSupabase(isLive);
    showToast(
      isLive
        ? 'Connected to live Supabase backend!'
        : 'Switched to local PostgreSQL Simulator',
      'info'
    );
    loadUserData();
  };

  const handleAuthSuccess = (user: FaucetUser, msg: string) => {
    setCurrentUser(user);
    showToast(msg, 'success');
  };

  const handleSignOut = () => {
    const users = FaucetEngine.getSandboxUsers();
    setCurrentUser(users[0] || DEMO_USERS[0]);
    showToast('Signed out from current session', 'info');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur text-xs">
          {toast.type === 'success' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="h-4 w-4 text-cyan-400 shrink-0" />
          )}
          <span className="font-medium text-slate-200">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* RENDER SEPARATE ADMIN PORTAL */}
      {viewMode === 'admin' ? (
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <AdminPortal
            currentUser={currentUser}
            onExitAdmin={() => setViewMode('user')}
            isLiveSupabase={isLiveSupabase}
          />
        </div>
      ) : (
        /* RENDER USER DASHBOARD */
        <>
          <Navbar
            currentTab={userTab}
            setCurrentTab={setUserTab}
            currentUser={currentUser}
            isLiveSupabase={isLiveSupabase}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
            onSignOut={handleSignOut}
          />

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-12">
            {/* Quick account switch / register strip for users */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">Active Wallet:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {currentUser.email}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400">Zero Admin Approval Needed</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* INVITE & 10% BONUS BUTTON */}
                <button
                  onClick={() => setUserTab('referrals')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 transition-colors font-semibold text-xs shadow-sm"
                >
                  <Gift className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Invite Friends (10% Bonus)</span>
                </button>

                {/* SEPARATE BUTTON: SIGN IN */}
                <button
                  onClick={handleOpenSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors font-medium text-xs shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>

                {/* SEPARATE BUTTON: SIGN UP */}
                <button
                  onClick={handleOpenSignUp}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up with Any Email</span>
                </button>
              </div>
            </div>

            {userTab === 'faucet' && (
              <FaucetStations
                currentUser={currentUser}
                balances={balances}
                cooldowns={cooldowns}
                onClaim={handleClaim}
                onRefresh={loadUserData}
                isClaiming={isClaiming}
                isLiveSupabase={isLiveSupabase}
                onNavigateToReferrals={() => setUserTab('referrals')}
              />
            )}

            {userTab === 'claims' && (
              <ClaimsLedger
                claims={claims}
                currentUserId={currentUser.id}
                isAdmin={false}
                onRefresh={loadUserData}
              />
            )}

            {userTab === 'referrals' && (
              <ReferralProgram currentUser={currentUser} />
            )}

            {userTab === 'sql' && (
              <SqlWorkbench
                onOpenConnectModal={() => setIsSettingsOpen(true)}
              />
            )}

            {/* Telegram Community Contact Component at the Bottom */}
            <section className="pt-4">
              <TelegramContact />
            </section>
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060911] py-8 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-bold text-slate-300">FaucetFlow</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Self-Service Multi-Coin Cryptocurrency Faucet</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>60s Advisory Locks</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {/* Direct Telegram link */}
            <a
              href={TELEGRAM_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Telegram Group</span>
            </a>

            <span aria-hidden="true" className="text-slate-700">|</span>

            {/* Separate Admin Portal Link */}
            {viewMode === 'user' ? (
              <button
                onClick={() => setViewMode('admin')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                title="Restricted Administrator Portal"
              >
                <Shield className="h-3.5 w-3.5 text-amber-500" />
                <span>Admin Portal</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('user')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Return to User Dashboard
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Supabase Settings Modal */}
      <SupabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onCredentialsUpdated={handleCredentialsUpdated}
      />

      {/* User Self-Registration & Sign-In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        initialMode={authModalMode}
      />
    </div>
  );
}
