import React, { useState } from 'react';
import { CoinType, COIN_SPECS, FaucetUser } from '../types/faucet';
import { CoinIcon } from './CoinIcon';
import {
  Clock,
  Lock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Zap,
  Gift,
  ExternalLink,
} from 'lucide-react';

export const CLAIM_SHORTLINK = 'https://surl.li/pwwkjr';

interface FaucetStationsProps {
  currentUser: FaucetUser;
  balances: Record<CoinType, number>;
  cooldowns: Record<CoinType, number>;
  onClaim: (coin: CoinType) => Promise<void>;
  onRefresh: () => Promise<void>;
  isClaiming: Record<CoinType, boolean>;
  isLiveSupabase: boolean;
  onNavigateToReferrals?: () => void;
}

export const FaucetStations: React.FC<FaucetStationsProps> = ({
  currentUser,
  balances,
  cooldowns,
  onClaim,
  onRefresh,
  isClaiming,
  isLiveSupabase,
  onNavigateToReferrals,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
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
              <span>Authenticated Profile</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-cyan-400">{currentUser.email}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-500">
                UUID: {currentUser.id.slice(0, 8)}...{currentUser.id.slice(-4)}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Multi-Coin Faucet Stations
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Claim cryptocurrency rewards every 60 seconds. Secured by PostgreSQL{' '}
              <code className="text-cyan-300 font-mono text-xs bg-slate-800/80 px-1 py-0.5 rounded">
                pg_advisory_xact_lock
              </code>{' '}
              and immutable ledger auditing.
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

        {/* Informational banner: PostgreSQL Advisory Locking & Security Definer */}
        <div className="mt-5 border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong>60s Cooldown Guard:</strong> Atomic transaction lock per (user_id, coin) prevents double-claims.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Engine:{' '}
              <strong className="text-slate-300">
                {isLiveSupabase ? 'Supabase RPC (claim_reward)' : 'PostgreSQL Engine'}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>Numeric Precision: <strong className="text-slate-300 font-mono">28,12</strong></span>
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
          const progressPercent = cooldown > 0 ? ((60 - cooldown) / 60) * 100 : 100;

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
                        {spec.unitNickname} / claim
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reward Highlight */}
                <div className="mt-4 rounded-lg border border-slate-800 bg-[#090d16] p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Fixed Reward</span>
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

              {/* Bottom: Cooldown Progress & Claim Action */}
              <div className="mt-6 space-y-3">
                {/* 60-Second Cooldown Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      {cooldown > 0 ? 'Cooldown' : 'Status'}
                    </span>
                    <span className={cooldown > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      {cooldown > 0 ? `${cooldown}s left` : 'Ready to claim'}
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        cooldown > 0
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Claim Action with https://surl.li/pwwkjr integration */}
                {isPending ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-xs font-semibold bg-cyan-700 text-white cursor-wait"
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Locking & Claiming...</span>
                  </button>
                ) : cooldown > 0 ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-xs font-semibold bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Wait {cooldown}s</span>
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

      {/* Quick Architecture Callout */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 text-sm text-slate-400">
        <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          Behind the Scenes: PostgreSQL Security Definer & RLS
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-3">
          <div className="p-3 bg-[#090d16] rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              1. Direct Insert Prohibited
            </span>
            Direct client modifications to <code className="text-cyan-300">public.balances</code> are blocked by RLS policies. Mutations only happen through the verified RPC.
          </div>
          <div className="p-3 bg-[#090d16] rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              2. Advisory Lock Serialization
            </span>
            <code className="text-cyan-300">pg_advisory_xact_lock(hashtextextended(uid:coin, 0))</code> serializes concurrent clicks, eliminating race conditions.
          </div>
          <div className="p-3 bg-[#090d16] rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              3. Immutable Ledger
            </span>
            Every successful payout atomically writes to <code className="text-cyan-300">public.claims</code> before returning a signed receipt to the client.
          </div>
        </div>
      </div>
    </div>
  );
};
