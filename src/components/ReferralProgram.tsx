import React, { useState, useEffect } from 'react';
import { FaucetUser, UserReferralData, CoinType, COIN_SPECS } from '../types/faucet';
import { FaucetEngine } from '../lib/faucetEngine';
import { CoinIcon } from './CoinIcon';
import {
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  DollarSign,
  Send,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface ReferralProgramProps {
  currentUser: FaucetUser;
}

export const ReferralProgram: React.FC<ReferralProgramProps> = ({ currentUser }) => {
  const [copied, setCopied] = useState(false);
  const [refData, setRefData] = useState<UserReferralData>(() =>
    FaucetEngine.getReferralData(currentUser)
  );

  useEffect(() => {
    setRefData(FaucetEngine.getReferralData(currentUser));
  }, [currentUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText(refData.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(
    `Claim free BTC, LTC, DOGE, and USDT every 60 seconds on FaucetFlow! Join with my invite link to get instant access:`
  );
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    refData.inviteUrl
  )}&text=${shareText}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    refData.inviteUrl
  )}&text=${shareText}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(
    refData.inviteUrl
  )}`;

  return (
    <div className="space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1929] via-[#09111e] to-[#070b14] p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-md shadow-cyan-900/30">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-cyan-400">
                  10% Lifetime Referral Program
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Invite Friends & Earn 10% Faucet Bonus
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Share your personal invite link with friends. Every single time your referred user claims from any faucet station (BTC, LTC, DOGE, or USDT), you instantly receive an automated <strong>10% commission bonus</strong> credited straight to your balances.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Sparkles className="h-4 w-4" /> 10% Instant Bonus
              </span>
              <span aria-hidden="true">·</span>
              <span>Zero Earning Cap</span>
              <span aria-hidden="true">·</span>
              <span>Direct Multi-Coin Payouts</span>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex sm:flex-row flex-col gap-3 shrink-0">
            <div className="rounded-xl border border-slate-800 bg-[#070b14] p-4 min-w-[140px]">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-cyan-400" /> Total Referred
              </span>
              <span className="mt-1 block font-mono text-2xl font-bold text-white font-mono-numbers">
                {refData.totalReferrals}
              </span>
              <span className="text-[11px] text-slate-500">Active users</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#070b14] p-4 min-w-[160px]">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Total Earned
              </span>
              <span className="mt-1 block font-mono text-2xl font-bold text-emerald-400 font-mono-numbers">
                ${refData.totalEarnedUsd.toFixed(4)}
              </span>
              <span className="text-[11px] text-slate-500">USD valuation</span>
            </div>
          </div>
        </div>

        {/* Invite Link Share Input */}
        <div className="mt-6 border-t border-slate-800/80 pt-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Your Unique Invite Link
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={refData.inviteUrl}
                onClick={handleCopy}
                className="w-full rounded-xl border border-slate-700 bg-[#060911] px-4 py-3 text-xs font-mono text-cyan-300 selection:bg-cyan-600 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-cyan-950/40 transition-all shrink-0 active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied Invite Link!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 mr-2 text-[11px]">Quick Share:</span>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 text-sky-300 transition-colors"
            >
              <Send className="h-3 w-3" />
              <span>Telegram</span>
            </a>
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <Share2 className="h-3 w-3" />
              <span>Twitter / X</span>
            </a>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 10% Commission by Coin Breakdown Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <span>Your 10% Referral Commission Balances</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['BTC', 'LTC', 'DOGE', 'USDT'] as CoinType[]).map((coin) => {
            const spec = COIN_SPECS[coin];
            const earned = refData.earningsByCoin[coin] || 0;
            const usdVal = earned * spec.estUsdPrice;
            const bonusPerClaim = spec.rewardAmount * 0.1;

            return (
              <div
                key={coin}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CoinIcon coin={coin} size={20} />
                    <span className="font-bold text-white text-xs">{coin}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                    +10% Bonus
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-base font-bold text-slate-100 font-mono-numbers truncate">
                    {earned.toFixed(spec.decimals)}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {spec.symbol}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    ≈ ${usdVal.toFixed(4)} USD
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-500">
                  Rate: +{bonusPerClaim.toFixed(spec.decimals)} {coin} per friend's claim
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Commission History Ledger */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">
              10% Commission Payout History
            </h4>
            <p className="text-xs text-slate-400">
              Live payouts credited to your balance when referred friends claim rewards
            </p>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            {refData.earningsHistory.length} Total Payouts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-[#090d16]/80 text-slate-400 font-medium">
              <tr>
                <th className="px-5 py-3">Payout ID</th>
                <th className="px-5 py-3">Friend / Referee</th>
                <th className="px-5 py-3">Asset</th>
                <th className="px-5 py-3 text-right">10% Commission Bonus</th>
                <th className="px-5 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {refData.earningsHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    <Gift className="mx-auto h-7 w-7 text-slate-600 mb-2 opacity-50" />
                    <p className="font-medium text-slate-400">No referral claims yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Share your invite link above! When friends make their first claim, you'll earn 10% instantly.
                    </p>
                  </td>
                </tr>
              ) : (
                refData.earningsHistory.map((item) => {
                  const spec = COIN_SPECS[item.coin];
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-slate-500">
                        {item.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-3 font-medium text-white">
                        {item.referee_email || 'Referred Friend'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <CoinIcon coin={item.coin} size={16} />
                          <span className="font-semibold">{item.coin}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-400 font-semibold font-mono-numbers">
                        +{item.amount.toFixed(spec.decimals)} {item.coin}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-400 font-mono-numbers">
                        {new Date(item.created_at).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
