import React, { useState } from 'react';
import { CoinType, COIN_SPECS, FaucetUser } from '../types/faucet';
import { CoinIcon } from './CoinIcon';
import { MiddleAdsSection } from './AdBanners';
import {
  Clock,
  Lock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Zap,
  Gift,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  Layers,
  Flame,
  ChevronRight,
} from 'lucide-react';

export const CLAIM_SHORTLINK = 'https://surl.li/pwwkjr';
export const COOLDOWN_DURATION_SECONDS = 3600; // 1 Hour

interface FaucetStationsProps {
  currentUser: FaucetUser | null;
  balances: Record<CoinType, number>;
  cooldowns: Record<CoinType, number>;
  onClaim: (coin: CoinType) => Promise<void>;
  onRefresh: () => Promise<void>;
  isClaiming: Record<CoinType, boolean>;
  onNavigateToReferrals?: () => void;
  onNavigateToOfferwalls?: () => void;
  onOpenAuth?: () => void;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
}

export const FaucetStations: React.FC<FaucetStationsProps> = ({
  currentUser,
  balances,
  cooldowns,
  onClaim,
  onRefresh,
  isClaiming,
  onNavigateToReferrals,
  onNavigateToOfferwalls,
  onOpenAuth,
  onOpenSignIn,
  onOpenSignUp,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Helper to format remaining time in 1-hour cooldown
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Ready to claim';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
    return `${s}s`;
  };

  // Calculate total estimated portfolio USD value
  const totalUsdValue = Object.entries(balances).reduce(
    (acc, [coin, amount]) => {
      const spec = COIN_SPECS[coin as CoinType];
      return acc + (amount || 0) * (spec ? spec.estUsdPrice : 0);
    },
    0
  );

  const coins: CoinType[] = ['BTC', 'LTC', 'DOGE', 'USDT'];

  return (
    <div className="space-y-8">
      {/* Portfolio & Status Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              {currentUser ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono text-cyan-400">{currentUser.email}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">Verified Wallet</span>
                </>
              ) : (
                <>
                  <span className="text-amber-400">Guest Visitor</span>
                  <span aria-hidden="true">·</span>
                  <span>Sign in or register to track rewards</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              1-Hour Multi-Coin Faucet Stations
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Claim free cryptocurrency rewards every 1 hour (60 minutes). Payouts are credited instantly to your portfolio with zero fees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-lg border border-slate-800 bg-[#090d16] px-4 py-2.5">
              <span className="block text-xs text-slate-400">Est. Portfolio Value</span>
              <span className="font-mono text-lg font-bold text-emerald-400 font-mono-numbers">
                ${totalUsdValue.toFixed(4)}{' '}
                <span className="text-xs text-slate-500 font-normal">USD</span>
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
              title="Refresh balances"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-cyan-400 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Informational banner: 1-Hour Cooldown & Automated Security */}
        <div className="mt-5 border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong>1-Hour Cooldown Guard:</strong> Claims refresh once every 60 minutes for each individual coin.
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Instant & Automated Payouts</span>
          </div>
        </div>
      </div>

      {/* 10% Referral Bonus Program Spotlight Card */}
      {onNavigateToReferrals && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#090d16] p-4 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-white block">
                10% Lifetime Referral Commission Program Active
              </span>
              <span className="text-slate-400 text-[11px]">
                Share your personal invite link. Earn a 10% bonus credited to your balances every time friends claim rewards.
              </span>
            </div>
          </div>
          <button
            onClick={onNavigateToReferrals}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs shrink-0 shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Get Invite Link & 10% Bonus</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4 Coin Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {coins.map((coin) => {
          const spec = COIN_SPECS[coin];
          const cooldown = cooldowns[coin] || 0;
          const isPending = isClaiming[coin] || false;
          const currentBal = balances[coin] || 0;
          const estUsd = currentBal * spec.estUsdPrice;
          const progressPercent =
            cooldown > 0
              ? Math.max(0, Math.min(100, ((COOLDOWN_DURATION_SECONDS - cooldown) / COOLDOWN_DURATION_SECONDS) * 100))
              : 100;

          return (
            <div
              key={coin}
              className="relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition-all hover:border-slate-700 shadow-lg"
            >
              {/* Header: Coin Logo & Nickname */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CoinIcon coin={coin} size={36} />
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        {spec.name}
                        <span className="text-xs font-normal text-slate-400 font-mono">
                          {spec.symbol}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {spec.unitNickname} / 1 hour
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reward Highlight */}
                <div className="mt-4 rounded-lg border border-slate-800 bg-[#090d16] p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Hourly Reward</span>
                    <span className="text-xs text-slate-500 font-mono">
                      ~${(spec.rewardAmount * spec.estUsdPrice).toFixed(6)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1 text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono text-base font-bold font-mono-numbers">
                      +{spec.rewardDisplay}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 font-mono">
                      {spec.symbol}
                    </span>
                  </div>
                </div>

                {/* Current User Balance */}
                <div className="mt-3 px-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Current Balance</span>
                    <span className="text-slate-500 font-mono">
                      ≈ ${estUsd.toFixed(4)}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-semibold text-slate-200 font-mono-numbers truncate">
                    {currentBal.toFixed(spec.decimals)}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {spec.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom: 1-Hour Cooldown Progress & Claim Action */}
              <div className="mt-6 space-y-3">
                {/* 1-Hour Cooldown Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      {cooldown > 0 ? 'Cooldown (1h)' : 'Status'}
                    </span>
                    <span
                      className={
                        cooldown > 0
                          ? 'text-amber-400 font-bold'
                          : 'text-emerald-400 font-medium'
                      }
                    >
                      {formatTimeRemaining(cooldown)}
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        cooldown > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Claim Action */}
                {!currentUser ? (
                  <div className="flex gap-2">
                    <button
                      onClick={onOpenSignIn || onOpenAuth}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-[0.98]"
                    >
                      <LogIn className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={onOpenSignUp || onOpenAuth}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 px-2 text-xs font-bold transition-all bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-md active:scale-[0.98]"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                ) : isPending ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-xs font-semibold bg-cyan-700 text-white cursor-wait"
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing Claim...</span>
                  </button>
                ) : cooldown > 0 ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-xs font-bold bg-slate-800/90 text-amber-300 cursor-not-allowed border border-amber-500/30 shadow-inner"
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Wait {formatTimeRemaining(cooldown)}</span>
                  </button>
                ) : (
                  <a
                    href={CLAIM_SHORTLINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onClaim(coin)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-xs font-bold transition-all bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-md hover:shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
                    title="Claim reward and open sponsor task link"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Claim {spec.symbol}</span>
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </a>
                )}

                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-mono">
                  <span>Sponsored Task: surl.li/pwwkjr</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Centered Middle Ads (Majhe) - 468x60 Banner & Native Ad */}
      <MiddleAdsSection title="Sponsored Rewards & Community Offers" />

      {/* Offerwalls Promotion Banner: Junkie & Adollar */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                <Flame className="h-3 w-3 text-amber-400" />
                2 OFFERWALLS ACTIVE
              </span>
              <span className="text-xs font-semibold text-emerald-400">Earn up to $12.00 / Task</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Want to earn extra crypto during the 1-hour faucet cooldown?
            </h3>
            <p className="text-xs text-slate-300">
              Browse <strong>Junkie</strong> for quick opinion surveys ($0.50 - $3.50) and <strong>Adollar</strong> for games & app install rewards ($1.00 - $12.00). Complete tasks anytime and get credited instantly to your profile!
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToOfferwalls}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 transition-all shrink-0 active:scale-[0.98]"
          >
            <Layers className="h-4 w-4" />
            <span>Open Junkie & Adollar Offerwalls</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
        <div className="p-4 bg-[#090d16] rounded-xl border border-slate-800">
          <span className="font-semibold text-slate-200 block mb-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-cyan-400" />
            1-Hour Recurring Claim Cycle
          </span>
          Faucet stations reload automatically every 60 minutes. Set a reminder and claim all 4 coins hourly.
        </div>
        <div className="p-4 bg-[#090d16] rounded-xl border border-slate-800">
          <span className="font-semibold text-slate-200 block mb-1 flex items-center gap-1.5">
            <Gift className="h-4 w-4 text-emerald-400" />
            10% Referral Commissions
          </span>
          Invite friends to earn 10% commission on every claim they execute. Paid automatically in the claimed coin.
        </div>
        <div className="p-4 bg-[#090d16] rounded-xl border border-slate-800">
          <span className="font-semibold text-slate-200 block mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Zero Minimum Barrier
          </span>
          Sign up with any email address in seconds. Start building your cryptocurrency portfolio immediately.
        </div>
      </div>
    </div>
  );
};
