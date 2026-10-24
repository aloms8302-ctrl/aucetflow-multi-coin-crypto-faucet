import React, { useState, useEffect } from 'react';
import {
  AdminUser,
  AdminActivityLog,
  AdminActivityAction,
  FaucetUser,
} from '../types/faucet';
import { FaucetEngine } from '../lib/faucetEngine';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  ScrollText,
  Activity,
  RefreshCw,
  Lock,
  Code2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface AdminConsoleProps {
  currentUser: FaucetUser;
  onToggleAdminRole: () => void;
  isLiveSupabase: boolean;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  onToggleAdminRole,
  isLiveSupabase,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'logs' | 'security'>('users');
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingAction, setIsLoggingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!currentUser.isAdmin) return;
    setIsLoading(true);
    try {
      // 1. Log dashboard view
      await FaucetEngine.adminLogActivity('dashboard_view', {
        tab: activeAdminTab,
        timestamp: new Date().toISOString(),
      }, currentUser);

      // 2. Fetch users & logs
      const [users, logs] = await Promise.all([
        FaucetEngine.adminListUsers(),
        FaucetEngine.adminListActivityLogs(),
      ]);

      setUsersList(users);
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser.isAdmin) {
      fetchAdminData();
    }
  }, [currentUser.isAdmin, activeAdminTab]);

  const handleManualLog = async (action: AdminActivityAction) => {
    setIsLoggingAction(true);
    try {
      await FaucetEngine.adminLogActivity(
        action,
        {
          trigger: 'manual_console_button',
          client_time: new Date().toISOString(),
        },
        currentUser
      );
      setActionSuccessMsg(`Recorded '${action}' to public.admin_activity_logs`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
      const logs = await FaucetEngine.adminListActivityLogs();
      setActivityLogs(logs);
    } catch (err) {
      console.error('Failed to log admin activity:', err);
    } finally {
      setIsLoggingAction(false);
    }
  };

  // If user is not admin, show the Access Denied / Setup screen
  if (!currentUser.isAdmin) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center max-w-2xl mx-auto space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">
            Administrator Access Required
          </h2>
          <p className="text-sm text-slate-400">
            PostgreSQL Error Code <code className="text-cyan-300 font-mono">42501</code> (Insufficient Privilege).
            The functions <code className="text-cyan-300 font-mono">admin_list_users()</code> and{' '}
            <code className="text-cyan-300 font-mono">admin_log_activity()</code> check{' '}
            <code className="text-cyan-300 font-mono">public.is_admin()</code> before executing.
          </p>
        </div>

        <div className="rounded-lg bg-[#090d16] p-4 text-left border border-slate-800 text-xs font-mono space-y-2">
          <div className="text-slate-400 font-sans font-semibold">
            How to grant admin privilege in Supabase:
          </div>
          <div className="text-cyan-300 bg-slate-900 p-2.5 rounded border border-slate-800 select-all overflow-x-auto">
            INSERT INTO public.admin_roles (user_id) VALUES ('{currentUser.id}');
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onToggleAdminRole}
            className="rounded-lg bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white px-5 py-2.5 text-xs font-semibold shadow-md transition-all"
          >
            Grant Admin Role to Current Account ({currentUser.username || currentUser.email})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> is_admin() = TRUE
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-cyan-400">SECURITY DEFINER RPCs Active</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Administrator Security Console
            </h1>
            <p className="text-sm text-slate-400">
              Manage platform users, inspect immutable system audit logs, and audit security policies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-cyan-400 ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              <span>Refresh RPC Data</span>
            </button>

            <button
              onClick={onToggleAdminRole}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-2.5 py-1.5"
              title="Revoke admin role from current account for testing"
            >
              Relinquish Admin
            </button>
          </div>
        </div>

        {/* Action success toast if any */}
        {actionSuccessMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Sub-tab navigation */}
        <div className="mt-6 flex items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeAdminTab === 'users'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>User Directory ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeAdminTab === 'logs'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Activity Audit Trail ({activityLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('security')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeAdminTab === 'security'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>RLS Policies & Schema Security</span>
          </button>
        </div>
      </div>

      {/* Tab 1: User Directory */}
      {activeAdminTab === 'users' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              RPC Source: <code className="text-cyan-300 font-mono">public.admin_list_users()</code>
            </div>
            <span className="text-xs text-slate-500">
              Limits: 1000 records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-[#090d16]/80 text-slate-400 font-medium">
                <tr>
                  <th className="px-5 py-3">UUID</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Created At (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-cyan-400">
                      {user.id}
                    </td>
                    <td className="px-5 py-3 font-medium text-white">
                      {user.email}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400">
                      {user.username || '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400 font-mono-numbers">
                      {new Date(user.created_at).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Activity Logs */}
      {activeAdminTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">
              RPC Source: <code className="text-cyan-300 font-mono">public.admin_list_activity_logs()</code>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Restricted to actions: dashboard_view, users_view, claims_view, activity_logs_view, data_refresh
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleManualLog('data_refresh')}
                disabled={isLoggingAction}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg transition-all disabled:opacity-50"
              >
                Trigger 'data_refresh' Log
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-[#090d16]/80 text-slate-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">Log ID</th>
                    <th className="px-5 py-3">Actor Email</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">JSON Details</th>
                    <th className="px-5 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-slate-400">
                        #{log.id}
                      </td>
                      <td className="px-5 py-3 font-mono text-cyan-300">
                        {log.actor_email || 'System'}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-400 max-w-md truncate">
                        {JSON.stringify(log.details)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-400 font-mono-numbers">
                        {new Date(log.created_at).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & RLS Policies Inspector */}
      {activeAdminTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>Row Level Security (RLS) Status</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All tables have RLS enabled. Client-side <code className="text-cyan-300">INSERT</code>,{' '}
              <code className="text-cyan-300">UPDATE</code>, and <code className="text-cyan-300">DELETE</code> are disabled.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>public.profiles</strong>: Viewable by owner (<code className="text-cyan-300">auth.uid() = id</code>) or admin.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>public.balances</strong>: Viewable by owner (<code className="text-cyan-300">auth.uid() = user_id</code>) or admin.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>public.claims</strong>: Viewable by owner or admin.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>public.admin_roles</strong>: Viewable strictly by assigned admin user.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Code2 className="h-4 w-4 text-cyan-400" />
              <span>Security Definer Hardening</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All stored functions explicitly set <code className="text-cyan-300 font-mono">search_path = ''</code> to eliminate schema poisoning vulnerabilities, and revoke execution from <code className="text-cyan-300 font-mono">public</code>.
            </p>
            <div className="rounded-lg bg-[#090d16] p-3 text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto">
              <div className="text-emerald-400">-- Protected Function Header</div>
              <div>CREATE OR REPLACE FUNCTION public.claim_reward(...)</div>
              <div>RETURNS jsonb LANGUAGE plpgsql</div>
              <div className="text-amber-400 font-semibold">SECURITY DEFINER</div>
              <div className="text-cyan-400">SET search_path = ''</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
