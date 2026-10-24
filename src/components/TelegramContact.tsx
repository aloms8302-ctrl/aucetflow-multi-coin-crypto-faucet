import React, { useState } from 'react';
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const TELEGRAM_INVITE_URL = 'https://t.me/+ggHS2xN5u140N2Jl';

export const TelegramContact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(TELEGRAM_INVITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-br from-[#0c1929] via-[#09111e] to-[#070b14] p-6 sm:p-8 shadow-xl">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Branding & Copy */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24A1DE] text-white shadow-md shadow-sky-500/20">
              <Send className="h-5 w-5 -translate-x-0.5 translate-y-0.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-400">
                Official Telegram Channel & Community
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
                Connect With Us On Telegram
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Join our official Telegram group for instant updates, faucet reward alerts, community giveaways, and 24/7 support.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              Verified Official Channel
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="h-4 w-4 text-sky-400" />
              Live Member Support
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-sky-300 text-[11px]">
              t.me/+ggHS2xN5u140N2Jl
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-3 text-xs font-medium text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-400" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>

          <a
            href={TELEGRAM_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#24A1DE] to-sky-500 hover:from-[#1b8fc9] hover:to-sky-400 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            <span>Join Telegram Community</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-75" />
          </a>
        </div>
      </div>
    </div>
  );
};
