import React, { useState, useEffect } from 'react';
import {
  AdminUser,
  AdminActivityLog,
  AdminActivityAction,
  FaucetUser,
  CoinType,
  COIN_SPECS,
} from '../types/faucet';
import { FaucetEngine } from '../lib/faucetEngine';
import { CoinIcon } from './CoinIcon';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Activity,
  Lock,
  ArrowLeft,
  RefreshCw,
  Search,
  Key,
  CheckCircle2,
  DollarSign,
  Droplets,
  Terminal,
} from 'lucide-react';

interface AdminPortalProps {
  currentUser: FaucetUser;
  onExitAdmin: () => void;
  isLiveSupabase: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onExitAdmin,
  isLiveSupabase,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => currentUser.isAdmin);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'security'>('overview');
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [userBalancesMap, setUserBalancesMap] = useState<Record<string, Record<CoinType, number>>>({});
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (FaucetEngine.verifyAdminPasscode(passcode) || currentUser.isAdmin) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid Admin Passcode. Default master passcode is: admin123');
    }
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      await FaucetEngine.adminLogActivity(
        'dashboard_view',
        { view: activeTab, timestamp: new Date().toISOString() },
        currentUser
      );

      const [users, logs] = await Promise.all([
        FaucetEngine.adminListUsers(),
        FaucetEngine.adminListActivityLogs(),
      ]);

      setUsersList(users);
      setActivityLogs(logs);
      setUserBalancesMap(FaucetEngine.getUserBalancesMap());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, activeTab]);

  const handleManualAction = async (action: AdminActivityAction) => {
    try {
      await FaucetEngine.adminLogActivity(
        action,
        { trigger: 'admin_portal_manual', time: new Date().toISOString() },
        currentUser
      );
      setActionSuccessMsg(`Action '${action}' logged into public.admin_activity_logs.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      const logs = await FaucetEngine.adminListActivityLogs();
      setActivityLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  // If not authenticated into Admin Portal yet, show Gatekeeper
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b101b] p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              FaucetFlow Admin Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Restricted management console. Dedicated area separated from user dashboard.
            </p>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg bg-rose-950/60 border border-rose-500/30 p-3 text-xs text-rose-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Master Passcode
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Enter admin passcode (default: admin123)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-[#070b14] pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Development master passcode: <code className="text-amber-400 font-mono">admin123</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 py-2.5 text-xs font-bold text-white shadow-md transition-all"
            >
              Access Admin Console
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to User Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter users by search
  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchUserQuery.toLowerCase())) ||
      u.id.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Portal Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> Master Administrator Portal
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Isolated Management System</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Admin Control Center
            </h1>
            <p className="text-sm text-slate-400">
              Full visibility over registered users, faucet disbursements, and security activity logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-cyan-400 ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              <span>Sync All</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to User Dashboard</span>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {actionSuccessMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Admin Tabs */}
        <div className="mt-6 flex items-center gap-2 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>System Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>All Registered Users ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Activity Logs ({activityLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>RLS & Security Rules</span>
          </button>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Total Registered Users</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">
                  {usersList.length}
                </span>
                <span className="text-xs text-emerald-400">Self-Registered</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Active Coins</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">4</span>
                <span className="text-xs text-cyan-400 font-mono">BTC, LTC, DOGE, USDT</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Cooldown Window</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white font-mono">60s</span>
                <span className="text-xs text-slate-400 font-mono">advisory_lock</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400">Security Definer RPCs</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-400 font-mono">
                  ACTIVE
                </span>
                <span className="text-xs text-slate-400 font-mono">RLS Protected</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Supported Coin Payout Standards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {(['BTC', 'LTC', 'DOGE', 'USDT'] as CoinType[]).map((coin) => (
                <div key={coin} className="p-3 bg-[#090d16] rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <CoinIcon coin={coin} size={18} />
                    <span className="font-semibold text-white text-xs">{coin}</span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    +{COIN_SPECS[coin].rewardDisplay} {coin}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {COIN_SPECS[coin].unitNickname}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search registered user email or UUID..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredUsers.length} of {usersList.length} user accounts
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-[#090d16]/80 text-slate-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">User Email</th>
                    <th className="px-5 py-3">UUID</th>
                    <th className="px-5 py-3 text-right">BTC Balance</th>
                    <th className="px-5 py-3 text-right">LTC Balance</th>
                    <th className="px-5 py-3 text-right">DOGE Balance</th>
                    <th className="px-5 py-3 text-right">USDT Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.map((user) => {
                    const balances = userBalancesMap[user.id] || {
                      BTC: 0,
                      LTC: 0,
                      DOGE: 0,
                      USDT: 0,
                    };
                    return (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-white">
                          <div>{user.email}</div>
                          {user.username && (
                            <div className="text-[11px] text-slate-500">
                              @{user.username}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 font-mono text-cyan-400 text-[11px]">
                          {user.id}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-300">
                          {balances.BTC.toFixed(8)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-300">
                          {balances.LTC.toFixed(8)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-300">
                          {balances.DOGE.toFixed(8)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-300">
                          {balances.USDT.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Activity Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                Immutable Audit Trail (public.admin_activity_logs)
              </span>
              <span className="text-[11px] text-slate-400">
                Automatic record of all admin panel accesses and data refreshes.
              </span>
            </div>
            <button
              onClick={() => handleManualAction('data_refresh')}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all"
            >
              Log 'data_refresh'
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-[#090d16]/80 text-slate-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Actor Email</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">JSON Details</th>
                    <th className="px-5 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-3 font-mono text-slate-500">#{log.id}</td>
                      <td className="px-5 py-3 font-mono text-cyan-300">{log.actor_email}</td>
                      <td className="px-5 py-3 font-mono text-amber-400">{log.action}</td>
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-400 truncate max-w-sm">
                        {JSON.stringify(log.details)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString('en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lock className="h-4 w-4 text-amber-400" />
              <span>Row Level Security (RLS) Policy Audit</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard users cannot insert or manipulate balances directly. All mutations execute via the <code className="text-cyan-300">claim_reward()</code> procedure.
            </p>
            <div className="text-xs text-slate-300 space-y-2 mt-2">
              <div className="p-2.5 bg-[#090d16] rounded border border-slate-800">
                <span className="font-semibold text-amber-300">Owner isolation:</span> users can only read their own rows unless they possess the admin role defined in <code className="text-cyan-300">public.admin_roles</code>.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Advisory Lock Concurrency Control</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <code className="text-cyan-300 font-mono">pg_advisory_xact_lock</code> locks the transactional hash of <code className="text-cyan-300 font-mono">uid:coin</code> for 60 seconds, eliminating duplicate double-spending attacks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
