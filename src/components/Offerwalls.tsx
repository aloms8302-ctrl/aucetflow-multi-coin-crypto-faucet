import React, { useState, useMemo } from 'react';
import { FaucetUser, CoinType } from '../types/faucet';
import { OfferwallProvider, OfferwallTask } from '../types/offerwall';
import {
  OFFERWALL_PROVIDERS,
  JUNKIE_OFFERS,
  ADOLLAR_OFFERS,
  DEFAULT_TASK_URL,
} from '../data/offerwallData';
import { FaucetEngine } from '../lib/faucetEngine';
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Smartphone,
  Monitor,
  Flame,
  Award,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  Zap,
  Globe,
  Gift,
  LogIn,
  X,
  PlayCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface OfferwallsProps {
  currentUser: FaucetUser | null;
  onRewardEarned: (coin: CoinType, amount: number, message: string) => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onNavigateToClaims: () => void;
}

export const Offerwalls: React.FC<OfferwallsProps> = ({
  currentUser,
  onRewardEarned,
  onOpenSignIn,
  onOpenSignUp,
  onNavigateToClaims,
}) => {
  // Active provider: 'junkie' or 'adollar'
  const [activeProvider, setActiveProvider] = useState<OfferwallProvider>('junkie');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'sdk'>('cards');

  // Modal state for active offer verification
  const [activeOffer, setActiveOffer] = useState<OfferwallTask | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [taskStarted, setTaskStarted] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Completed offers tracked for current user
  const completedIds = useMemo(() => {
    if (!currentUser) return [];
    return FaucetEngine.getCompletedOfferIds(currentUser.id);
  }, [currentUser, verificationSuccess]);

  // Current provider metadata
  const providerMeta = OFFERWALL_PROVIDERS[activeProvider];

  // Offers list based on provider
  const currentOffersList = activeProvider === 'junkie' ? JUNKIE_OFFERS : ADOLLAR_OFFERS;

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(currentOffersList.map((o) => o.category)));
    return ['All', ...cats];
  }, [currentOffersList]);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return currentOffersList.filter((offer) => {
      const matchesSearch =
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || offer.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [currentOffersList, searchQuery, selectedCategory]);

  // Handle open offer
  const handleOpenOffer = (offer: OfferwallTask) => {
    if (!currentUser) {
      onOpenSignIn();
      return;
    }
    setActiveOffer(offer);
    setTaskStarted(false);
    setIsVerifying(false);
    setVerificationSuccess(false);
  };

  // Handle start external task
  const handleStartTaskLink = () => {
    if (!activeOffer) return;
    setTaskStarted(true);
    window.open(activeOffer.externalUrl || DEFAULT_TASK_URL, '_blank', 'noopener,noreferrer');
  };

  // Handle verify and claim
  const handleVerifyAndClaim = async () => {
    if (!activeOffer || !currentUser) return;

    setIsVerifying(true);
    try {
      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const result = await FaucetEngine.creditOfferReward(currentUser, {
        id: activeOffer.id,
        title: activeOffer.title,
        provider: activeOffer.provider,
        coin: activeOffer.coin,
        coinAmount: activeOffer.coinAmount,
        payoutUsd: activeOffer.payoutUsd,
      });

      if (result.success) {
        setVerificationSuccess(true);
        onRewardEarned(activeOffer.coin, activeOffer.coinAmount, result.message);
        setTimeout(() => {
          setActiveOffer(null);
          setVerificationSuccess(false);
          setIsVerifying(false);
        }, 1600);
      }
    } catch (err) {
      console.error('Error claiming offer reward:', err);
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner with Provider Switcher */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0c1220] p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Multi-Provider Offerwall Hub</span>
              <span className="text-cyan-600">·</span>
              <span className="text-emerald-400 font-bold">Direct Crypto Earnings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Complete Tasks & Earn with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400">
                Junkie & Adollar
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Earn high-paying USDT, BTC, LTC & DOGE rewards by completing verified consumer opinion
              surveys on <strong className="text-purple-300">Junkie</strong> or app installs, games and
              sponsor microtasks on <strong className="text-emerald-300">Adollar</strong>. Instant payout
              credited directly to your active profile balance!
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex flex-wrap md:flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 shrink-0 text-xs">
            <div className="flex items-center gap-2.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Total Paid Out
                </div>
                <div className="font-mono font-bold text-slate-200">$111,370+ USD</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Available Offers
                </div>
                <div className="font-mono font-bold text-slate-200">60+ Active Tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Gift className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Referral Share
                </div>
                <div className="font-mono font-bold text-cyan-400">10% Lifetime Bonus</div>
              </div>
            </div>
          </div>
        </div>

        {/* Big Offerwall Switcher Tabs: Junkie vs Adollar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Provider 1: Junkie */}
          <button
            type="button"
            onClick={() => {
              setActiveProvider('junkie');
              setSelectedCategory('All');
            }}
            className={`group relative text-left rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
              activeProvider === 'junkie'
                ? 'border-purple-500/70 bg-gradient-to-br from-purple-950/60 via-slate-900 to-indigo-950/40 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white font-black text-xl shadow-md shadow-purple-900/40">
                  J
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-white">Junkie</span>
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                      Surveys & Polls
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Survey Junkie Opinion & Feedback Network</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-purple-400">★ 4.9 Rating</div>
                <div className="text-[11px] text-slate-400">24 Surveys Ready</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 text-purple-200">
                <Clock className="h-3 w-3 text-purple-400" /> 3-8 Mins
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 text-purple-200">
                <DollarSign className="h-3 w-3 text-purple-400" /> Avg $1.50 - $3.50
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 text-emerald-400 font-medium">
                Instant Verification
              </span>
            </div>

            {activeProvider === 'junkie' && (
              <div className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </div>
            )}
          </button>

          {/* Provider 2: Adollar */}
          <button
            type="button"
            onClick={() => {
              setActiveProvider('adollar');
              setSelectedCategory('All');
            }}
            className={`group relative text-left rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
              activeProvider === 'adollar'
                ? 'border-emerald-500/70 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-xl shadow-md shadow-emerald-900/40">
                  $
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-white">Adollar</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                      Apps & Games
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">AdDollar High-Bounty Task & App Network</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-emerald-400">★ 4.8 Rating</div>
                <div className="text-[11px] text-slate-400">36 Tasks Ready</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 text-emerald-200">
                <Smartphone className="h-3 w-3 text-emerald-400" /> Mobile & Web
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 text-emerald-200">
                <DollarSign className="h-3 w-3 text-emerald-400" /> Up to $12.00
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 text-cyan-400 font-medium">
                High Multipliers
              </span>
            </div>

            {activeProvider === 'adollar' && (
              <div className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Control Toolbar: Search, Category Filter, and View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeProvider === 'junkie' ? 'Junkie surveys' : 'Adollar tasks'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher: Card View vs SDK View */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-medium">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Offers List</span>
            </button>
            <button
              onClick={() => setViewMode('sdk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'sdk'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{activeProvider === 'junkie' ? 'Junkie SDK' : 'Adollar SDK'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg border transition-all ${
              selectedCategory === cat
                ? activeProvider === 'junkie'
                  ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-semibold shadow-sm'
                  : 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-semibold shadow-sm'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content: Cards or SDK View */}
      {viewMode === 'cards' ? (
        <div>
          {filteredOffers.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
              <Search className="h-8 w-8 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">No matching offers found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching with different keywords or switch the category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-cyan-400 hover:underline pt-2"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOffers.map((offer) => {
                const isCompleted = completedIds.includes(offer.id);
                return (
                  <div
                    key={offer.id}
                    className={`flex flex-col justify-between rounded-xl border bg-slate-900/70 p-5 transition-all duration-200 hover:border-slate-700 hover:shadow-lg ${
                      isCompleted
                        ? 'border-emerald-900/50 opacity-80'
                        : activeProvider === 'junkie'
                        ? 'border-slate-800 hover:border-purple-500/50'
                        : 'border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            activeProvider === 'junkie'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                          }`}
                        >
                          {offer.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {offer.badge && (
                            <span className="flex items-center gap-1 rounded-md bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              <Flame className="h-3 w-3 text-amber-400" />
                              {offer.badge}
                            </span>
                          )}

                          {isCompleted && (
                            <span className="flex items-center gap-1 rounded-md bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Done
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <div>
                        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-cyan-300">
                          {offer.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {offer.description}
                        </p>
                      </div>

                      {/* Specs: Time, Platforms, Rating */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {offer.timeEstimate}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1">
                          {offer.platforms.includes('Android') || offer.platforms.includes('iOS') ? (
                            <Smartphone className="h-3 w-3 text-slate-500" />
                          ) : (
                            <Monitor className="h-3 w-3 text-slate-500" />
                          )}
                          {offer.platforms.slice(0, 2).join(', ')}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-400 font-medium">★ {offer.rating}</span>
                      </div>
                    </div>

                    {/* Bottom Action & Reward */}
                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Reward
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-base font-extrabold ${
                              activeProvider === 'junkie' ? 'text-purple-400' : 'text-emerald-400'
                            }`}
                          >
                            +${offer.payoutUsd.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({offer.coinAmount} {offer.coin})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenOffer(offer)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98] ${
                          isCompleted
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : activeProvider === 'junkie'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Claim Again</span>
                          </>
                        ) : activeProvider === 'junkie' ? (
                          <>
                            <span>Take Survey</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Start Offer</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SDK Iframe Simulator View */
        <div className="rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden shadow-2xl">
          {/* SDK Browser chrome */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="flex h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="flex h-3 w-3 rounded-full bg-emerald-500/80" />
              <div className="ml-2 font-mono text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1 rounded-md border border-slate-800">
                https://embed.{activeProvider}.offerwall.net/v2/sdk?applet_id=faucetflow&user=
                {currentUser ? currentUser.id.slice(0, 8) : 'guest'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live SDK Connected
              </span>
            </div>
          </div>

          {/* Embedded Offerwall Body */}
          <div className="p-6 space-y-6">
            {/* Wall Header inside SDK */}
            <div
              className={`rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                activeProvider === 'junkie'
                  ? 'border-purple-500/30 bg-purple-950/20'
                  : 'border-emerald-500/30 bg-emerald-950/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-extrabold text-2xl shadow ${
                    activeProvider === 'junkie'
                      ? 'bg-purple-600 shadow-purple-900/40'
                      : 'bg-emerald-600 shadow-emerald-900/40'
                  }`}
                >
                  {activeProvider === 'junkie' ? 'J' : '$'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {activeProvider === 'junkie' ? 'Junkie Survey Portal' : 'Adollar Offer Wall'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Official API Endpoint · High Conversion · Instant Webhook Callbacks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="text-right">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">
                    Global Conversion
                  </div>
                  <div className="text-white font-bold">98.4% Payout Rate</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-right">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">
                    Referral Bonus
                  </div>
                  <div className="text-emerald-400 font-bold">+10% to Referrer</div>
                </div>
              </div>
            </div>

            {/* List inside SDK */}
            <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-900/40">
              {filteredOffers.map((offer) => {
                const isCompleted = completedIds.includes(offer.id);
                return (
                  <div
                    key={offer.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-900/70 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white font-bold text-sm ${
                          activeProvider === 'junkie' ? 'bg-purple-900/80' : 'bg-emerald-900/80'
                        }`}
                      >
                        {activeProvider === 'junkie' ? 'Q' : '★'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs">{offer.title}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                            {offer.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{offer.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">
                          +${offer.payoutUsd.toFixed(2)} USDT
                        </span>
                        <div className="text-[10px] text-slate-500">{offer.timeEstimate}</div>
                      </div>

                      <button
                        onClick={() => handleOpenOffer(offer)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isCompleted
                            ? 'bg-slate-800 text-slate-300'
                            : activeProvider === 'junkie'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isCompleted ? 'Completed' : 'Start Task'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Offer Execution & Verification Modal */}
      {activeOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              onClick={() => {
                if (!isVerifying) setActiveOffer(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-extrabold text-xl shadow-md ${
                  activeOffer.provider === 'junkie'
                    ? 'bg-purple-600 shadow-purple-900/40'
                    : 'bg-emerald-600 shadow-emerald-900/40'
                }`}
              >
                {activeOffer.provider === 'junkie' ? 'J' : '$'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    {activeOffer.provider === 'junkie' ? 'Junkie Offerwall' : 'Adollar Offerwall'}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                    {activeOffer.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{activeOffer.title}</h3>
              </div>
            </div>

            {/* Payout Banner */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                  Reward on Completion
                </span>
                <div className="text-lg font-black text-emerald-300">
                  +${activeOffer.payoutUsd.toFixed(2)} USD
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Credited As
                </span>
                <div className="text-xs font-mono font-bold text-cyan-300">
                  {activeOffer.coinAmount} {activeOffer.coin}
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                Instructions to Earn
              </h4>
              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-300">
                {activeOffer.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-cyan-400">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification & Success State */}
            {verificationSuccess ? (
              <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Reward Credited Successfully!</h4>
                <p className="text-xs text-emerald-300">
                  +${activeOffer.payoutUsd.toFixed(2)} {activeOffer.coin} has been added to your
                  account balance.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {/* Step 1: Open Task in New Tab */}
                <button
                  type="button"
                  onClick={handleStartTaskLink}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all shadow-md active:scale-[0.98] ${
                    taskStarted
                      ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : activeOffer.provider === 'junkie'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                  }`}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>
                    {taskStarted
                      ? 'Re-Open Task Link (surl.li/pwwkjr)'
                      : `Open ${activeOffer.provider === 'junkie' ? 'Survey' : 'Task'} in New Tab`}
                  </span>
                </button>

                {/* Step 2: Verify & Claim Reward */}
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleVerifyAndClaim}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all shadow-md ${
                    isVerifying
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : taskStarted
                      ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-cyan-950/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                      <span>Verifying Task with {activeOffer.provider === 'junkie' ? 'Junkie' : 'Adollar'}...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>
                        {taskStarted ? 'I Completed This — Verify & Claim Reward' : 'Verify & Claim Reward Directly'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Note about 10% referral bonus */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Security: Verified 256-bit SSL</span>
              <span className="text-emerald-400 font-medium">10% referral bonus applied</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
