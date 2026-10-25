import React, { useState, useEffect, useCallback } from 'react';
import {
  CoinType,
  Claim,
  FaucetUser,
} from './types/faucet';
import { FaucetEngine, DEMO_USERS } from './lib/faucetEngine';
import { Navbar } from './components/Navbar';
import { FaucetStations } from './components/FaucetStations';
import { ClaimsLedger } from './components/ClaimsLedger';
import { ReferralProgram } from './components/ReferralProgram';
import { Offerwalls } from './components/Offerwalls';
import { TelegramContact, TELEGRAM_INVITE_URL } from './components/TelegramContact';
import { AuthModal } from './components/AuthModal';
import { MiddleAdsSection } from './components/AdBanners';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Send,
  UserPlus,
  LogIn,
  Gift,
  History,
  Droplets,
  Layers,
  Flame,
} from 'lucide-react';

const STORAGE_SESSION_KEY = 'faucetflow_session_user';
const FAUCET_COOLDOWN_SECONDS = 3600; // 1 hour

export default function App() {
  // User navigation tabs: 'faucet' | 'offerwalls' | 'claims' | 'referrals'
  const [userTab, setUserTab] = useState<'faucet' | 'offerwalls' | 'claims' | 'referrals'>('faucet');

  // Currently logged in user (null if signed out)
  const [currentUser, setCurrentUser] = useState<FaucetUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.email) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse stored session:', e);
      }
    }
    // Null initially if no stored session, so guest users see Sign In and Sign Up buttons
    return null;
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
    if (!currentUser) {
      setBalances({ BTC: 0, LTC: 0, DOGE: 0, USDT: 0 });
      setClaims([]);
      setCooldowns({ BTC: 0, LTC: 0, DOGE: 0, USDT: 0 });
      return;
    }

    try {
      const [bals, clms, cds] = await Promise.all([
        FaucetEngine.getBalances(currentUser),
        FaucetEngine.getClaims(currentUser, false),
        FaucetEngine.getCooldowns(currentUser),
      ]);

      setBalances(bals);
      setClaims(clms);
      setCooldowns(cds);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Capture referral code from URL if present (?ref=...)
  useEffect(() => {
    const ref = FaucetEngine.captureReferralFromUrl();
    if (ref) {
      const refName = FaucetEngine.getPendingReferrerName();
      showToast(
        `Invite link applied! You were referred by ${refName}. Start claiming rewards every 1 hour!`,
        'info'
      );
    }
  }, [showToast]);

  // 1-second countdown ticker for 1-hour (3600s) cooldowns
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

  // Faucet claim handler with 1-hour cooldown
  const handleClaim = async (coin: CoinType) => {
    if (!currentUser) {
      handleOpenSignIn();
      showToast('Please sign in to claim faucet rewards.', 'info');
      return;
    }

    setIsClaiming((prev) => ({ ...prev, [coin]: true }));
    try {
      const result = await FaucetEngine.claimReward(coin, currentUser);

      if (result.success && result.claim) {
        // Start 1-hour (3600s) cooldown
        setCooldowns((prev) => ({ ...prev, [coin]: FAUCET_COOLDOWN_SECONDS }));

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

  const handleAuthSuccess = (user: FaucetUser, msg: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to store session:', e);
    }
    showToast(msg, 'success');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (e) {
      console.error('Failed to remove session:', e);
    }
    showToast('Signed out successfully. Sign in or register anytime!', 'info');
  };

  const handleRewardEarned = (coin: CoinType, amount: number, message: string) => {
    setBalances((prev) => ({
      ...prev,
      [coin]: Number(((prev[coin] || 0) + amount).toFixed(8)),
    }));
    loadUserData();
    showToast(message, 'success');
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

      {/* Main Navbar */}
      <Navbar
        currentTab={userTab}
        setCurrentTab={setUserTab}
        currentUser={currentUser}
        balances={balances}
        onOpenSignIn={handleOpenSignIn}
        onOpenSignUp={handleOpenSignUp}
        onSignOut={handleSignOut}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Top Strip: Dynamic depending on whether user is signed in or out */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs">
          {currentUser ? (
            /* Logged in state: Only shows profile & referrals (NO Sign In/Sign Up buttons) */
            <>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">Active Profile:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {currentUser.email}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-medium">1-Hour Claims Ready</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setUserTab('offerwalls')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/50 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 text-purple-200 hover:from-purple-900/60 hover:to-indigo-900/60 transition-colors font-semibold text-xs shadow-sm"
                >
                  <Layers className="h-3.5 w-3.5 text-purple-400" />
                  <span>Offerwalls (Junkie & Adollar)</span>
                  <span className="flex items-center gap-0.5 rounded bg-purple-500/30 px-1 py-0.2 text-[9px] text-purple-200 font-bold">
                    <Flame className="h-2.5 w-2.5 text-amber-400" />
                    HOT
                  </span>
                </button>

                <button
                  onClick={() => setUserTab('referrals')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 transition-colors font-semibold text-xs shadow-sm"
                >
                  <Gift className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Invite Friends (10% Bonus)</span>
                </button>

                <button
                  onClick={() => setUserTab('claims')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-xs"
                >
                  <History className="h-3.5 w-3.5 text-cyan-400" />
                  <span>My Claims</span>
                </button>
              </div>
            </>
          ) : (
            /* Logged out state: Shows Sign In & Sign Up buttons */
            <>
              <div className="flex items-center gap-2 text-slate-300">
                <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                <span>Welcome to FaucetFlow · Free Crypto Every 1 Hour</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400">Instant Self-Service Signup</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setUserTab('offerwalls')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 transition-colors text-xs font-medium"
                >
                  <Layers className="h-3.5 w-3.5 text-purple-400" />
                  <span>Junkie & Adollar Offerwalls</span>
                </button>

                <button
                  onClick={handleOpenSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors font-medium text-xs shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={handleOpenSignUp}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up with Any Email</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tab 1: Faucet Stations (includes centered MiddleAdsSection in the middle between coin claim stations and offerwall banner) */}
        {userTab === 'faucet' && (
          <FaucetStations
            currentUser={currentUser}
            balances={balances}
            cooldowns={cooldowns}
            onClaim={handleClaim}
            onRefresh={loadUserData}
            isClaiming={isClaiming}
            onNavigateToReferrals={() => setUserTab('referrals')}
            onNavigateToOfferwalls={() => setUserTab('offerwalls')}
            onOpenAuth={handleOpenSignIn}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
          />
        )}

        {/* Tab: Offerwalls (Junkie & Adollar) */}
        {userTab === 'offerwalls' && (
          <Offerwalls
            currentUser={currentUser}
            onRewardEarned={handleRewardEarned}
            onOpenSignIn={handleOpenSignIn}
            onOpenSignUp={handleOpenSignUp}
            onNavigateToClaims={() => setUserTab('claims')}
          />
        )}

        {/* Tab 2: Claims Ledger */}
        {userTab === 'claims' && (
          <ClaimsLedger
            claims={claims}
            currentUserId={currentUser ? currentUser.id : ''}
            isAdmin={false}
            onRefresh={loadUserData}
          />
        )}

        {/* Tab 3: Referrals & 10% Bonus */}
        {userTab === 'referrals' && (
          currentUser ? (
            <ReferralProgram currentUser={currentUser} />
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
              <Gift className="h-10 w-10 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Join the 10% Referral Program</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Sign in or register an account to get your unique referral link and earn a 10% lifetime bonus on all friend claims!
              </p>
              <button
                onClick={handleOpenSignUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-xs font-semibold shadow-md hover:from-cyan-500 hover:to-emerald-500"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Free Account Now</span>
              </button>
            </div>
          )
        )}

        {/* Centered Middle Ads Section for non-faucet tabs */}
        {userTab !== 'faucet' && (
          <MiddleAdsSection title="Sponsored Rewards & Community Offers" />
        )}

        {/* Official Telegram Contact & Community */}
        <section className="pt-2">
          <TelegramContact />
        </section>
      </main>

      {/* Footer (No Admin Panel, No Supabase text) */}
      <footer className="border-t border-slate-800/80 bg-[#060911] py-8 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-bold text-slate-300">FaucetFlow</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Multi-Coin Cryptocurrency Faucet</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>1-Hour Claims Cycle (BTC · LTC · DOGE · USDT)</span>
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
          </div>
        </div>
      </footer>

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
