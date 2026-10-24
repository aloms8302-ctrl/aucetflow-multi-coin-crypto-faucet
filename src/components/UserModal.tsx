import React, { useState } from 'react';
import { FaucetUser } from '../types/faucet';
import { FaucetEngine } from '../lib/faucetEngine';
import {
  X,
  User,
  Shield,
  ShieldAlert,
  Users,
  Plus,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FaucetUser;
  onSwitchUser: (user: FaucetUser) => void;
  onToggleAdmin: () => void;
  onResetData: () => void;
  isLiveSupabase: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onToggleAdmin,
  onResetData,
  isLiveSupabase,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const sandboxUsers = FaucetEngine.getSandboxUsers();

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    const user = FaucetEngine.addSandboxUser(
      newEmail.trim(),
      newUsername.trim() || newEmail.split('@')[0]
    );
    onSwitchUser(user);
    setNewEmail('');
    setNewUsername('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-[#0b101b] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Active User Profile</h2>
            <p className="text-xs text-slate-400 font-mono">
              public.profiles & auth.users session
            </p>
          </div>
        </div>

        {/* Current User Card */}
        <div className="rounded-lg border border-slate-800 bg-[#070b14] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Username</span>
            <span className="text-xs font-semibold text-white font-mono">
              {currentUser.username || 'Not set'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Email Address</span>
            <span className="text-xs font-semibold text-white font-mono">
              {currentUser.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">User UUID</span>
            <span className="text-[11px] font-mono text-cyan-400">
              {currentUser.id}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Admin Role (is_admin())</span>
            <span
              className={`text-xs font-semibold ${
                currentUser.isAdmin ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              {currentUser.isAdmin ? 'TRUE (Superuser)' : 'FALSE (Regular User)'}
            </span>
          </div>
        </div>

        {/* Admin toggle action */}
        <div className="mt-3">
          <button
            onClick={onToggleAdmin}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 py-2 text-xs font-medium text-slate-300 transition-colors"
          >
            {currentUser.isAdmin ? (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Switch to Non-Admin Regular Role</span>
              </>
            ) : (
              <>
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span>Grant Admin Access to This Account</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Switcher (when in Sandbox mode) */}
        {!isLiveSupabase && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-cyan-400" />
                Demo Account Switcher
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>New</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleCreateUser} className="mb-3 space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded bg-[#070b14] border border-slate-800 px-2.5 py-1.5 text-xs text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Username (optional)"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full rounded bg-[#070b14] border border-slate-800 px-2.5 py-1.5 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full bg-cyan-700 hover:bg-cyan-600 text-white rounded py-1 text-xs font-medium"
                >
                  Create & Switch
                </button>
              </form>
            )}

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {sandboxUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors ${
                    u.id === currentUser.id
                      ? 'bg-slate-800 border border-cyan-500/30 text-cyan-300'
                      : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {u.id === currentUser.id && (
                      <CheckCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">{u.username || u.email}</span>
                  </div>
                  {u.isAdmin && (
                    <span className="text-[10px] text-amber-400 shrink-0 font-sans font-bold">
                      ADMIN
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => {
                  onResetData();
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Sandbox Balances</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
