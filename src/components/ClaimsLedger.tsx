import React, { useState, useMemo } from 'react';
import { Claim, CoinType, COIN_SPECS } from '../types/faucet';
import { CoinIcon } from './CoinIcon';
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  Copy,
  ExternalLink,
  History,
} from 'lucide-react';

interface ClaimsLedgerProps {
  claims: Claim[];
  currentUserId: string;
  isAdmin: boolean;
  onRefresh: () => Promise<void>;
}

export const ClaimsLedger: React.FC<ClaimsLedgerProps> = ({
  claims,
  currentUserId,
  isAdmin,
  onRefresh,
}) => {
  const [selectedCoin, setSelectedCoin] = useState<CoinType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesCoin = selectedCoin === 'ALL' || claim.coin === selectedCoin;
      const matchesSearch =
        searchQuery === '' ||
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.user_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCoin && matchesSearch;
    });
  }, [claims, selectedCoin, searchQuery]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'User ID', 'Coin', 'Amount', 'Claimed At (UTC)'];
    const rows = filteredClaims.map((c) => [
      c.id,
      c.user_id,
      c.coin,
      c.amount.toString(),
      c.claimed_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `faucetflow_claims_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group metrics
  const coinTotals = useMemo(() => {
    const map: Record<CoinType, number> = { BTC: 0, LTC: 0, DOGE: 0, USDT: 0 };
    claims.forEach((c) => {
      if (c.coin in map) map[c.coin] += c.amount;
    });
    return map;
  }, [claims]);

  return (
    <div className="space-y-6">
      {/* Top Ledger Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>PostgreSQL Ledger</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-cyan-400">public.claims</span>
              <span aria-hidden="true">·</span>
              <span>{claims.length} Total Recorded Entries</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Reward Claims Ledger
            </h1>
            <p className="text-sm text-slate-400">
              Immutable ledger of all disbursed cryptocurrency faucet rewards with cryptographic timestamps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              disabled={filteredClaims.length === 0}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick totals strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-800/80 pt-4">
          {(['BTC', 'LTC', 'DOGE', 'USDT'] as CoinType[]).map((c) => (
            <div key={c} className="rounded-lg bg-[#090d16] p-3 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CoinIcon coin={c} size={14} /> Total {c} Payouts
              </span>
              <span className="mt-1 block font-mono text-sm font-bold text-slate-200 font-mono-numbers truncate">
                {coinTotals[c].toFixed(COIN_SPECS[c].decimals)} {c}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Interactive Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {(['ALL', 'BTC', 'LTC', 'DOGE', 'USDT'] as const).map((coin) => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                selectedCoin === coin
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {coin === 'ALL' ? 'All Coins' : coin}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-[#090d16]/80 text-slate-400 font-medium">
              <tr>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">User UUID</th>
                <th className="px-5 py-3.5">Coin Asset</th>
                <th className="px-5 py-3.5 text-right">Disbursed Amount</th>
                <th className="px-5 py-3.5 text-right">Timestamp (UTC)</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <History className="mx-auto h-8 w-8 text-slate-600 mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-400">No claims found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery
                        ? 'Try clearing the search query'
                        : 'Head over to Faucet Stations to claim your first reward!'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const spec = COIN_SPECS[claim.coin];
                  const isCurrentUser = claim.user_id === currentUserId;
                  const date = new Date(claim.claimed_at);
                  const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr
                      key={claim.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-5 py-3.5 font-mono text-slate-400">
                        <span className="text-slate-300">
                          {claim.id.slice(0, 8)}
                        </span>
                        ...{claim.id.slice(-4)}
                      </td>

                      {/* User ID */}
                      <td className="px-5 py-3.5 font-mono">
                        <span
                          className={`${
                            isCurrentUser ? 'text-cyan-400 font-medium' : 'text-slate-500'
                          }`}
                        >
                          {claim.user_id.slice(0, 6)}...{claim.user_id.slice(-4)}
                          {isCurrentUser && ' (You)'}
                        </span>
                      </td>

                      {/* Coin */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <CoinIcon coin={claim.coin} size={18} />
                          <span className="font-semibold text-white">
                            {claim.coin}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {spec.name}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 text-right font-mono font-mono-numbers font-semibold text-emerald-400">
                        +{claim.amount.toFixed(spec.decimals)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {claim.coin}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-3.5 text-right font-mono text-slate-400 font-mono-numbers">
                        <span>{formattedDate}</span>{' '}
                        <span className="text-slate-500">{formattedTime}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleCopy(claim.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors p-1"
                          title="Copy Full UUID"
                        >
                          {copiedId === claim.id ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
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
