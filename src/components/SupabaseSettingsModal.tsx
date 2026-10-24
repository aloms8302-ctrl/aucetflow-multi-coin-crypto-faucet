import React, { useState } from 'react';
import {
  getSavedCredentials,
  saveCredentials,
  clearCredentials,
  testSupabaseConnection,
} from '../lib/supabaseClient';
import { FAUCETFLOW_SQL_SCRIPT } from '../data/schemaSql';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  FileCode,
} from 'lucide-react';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
}) => {
  const currentCreds = getSavedCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(FAUCETFLOW_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({
        success: false,
        message: 'Please provide both Supabase URL and Anon Public Key.',
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveCredentials(url, anonKey);
    onCredentialsUpdated();
    onClose();
  };

  const handleClear = () => {
    clearCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onCredentialsUpdated();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0b101b] p-6 sm:p-7 shadow-2xl my-8 cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 shadow-md">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Connect to Supabase Backend
            </h2>
            <p className="text-xs text-slate-400">
              Live PostgreSQL database with multi-coin balances, 10% referral bonus & advisory locks
            </p>
          </div>
        </div>

        {/* Step-by-Step Supabase Setup Box */}
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <FileCode className="h-4 w-4" />
              Step 1: Run SQL in Supabase Dashboard
            </span>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shadow-sm"
            >
              {copiedSql ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Complete SQL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-300">
            Supabase Dashboard &rarr; <strong>SQL Editor</strong> &rarr; <strong>New Query</strong> এ গিয়ে সম্পূর্ণ SQL পেস্ট করে <strong>Run</strong> বাটনে ক্লিক করুন।
          </p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Step 2: Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#070b14] px-3.5 py-2.5 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Step 3: Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#070b14] px-3.5 py-2.5 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
                testResult.success
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.success ? 'Supabase Connection Live!' : 'Connection Error'}
                </p>
                <p className="text-[11px] opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Where to find credentials tip */}
          <div className="rounded-lg bg-slate-900/80 p-3.5 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              কোথা থেকে Project URL এবং Anon Key পাবেন?
            </div>
            <p>
              Supabase ড্যাশবোর্ডে <strong>Project Settings &rarr; API</strong> সেকশনে গেলেই আপনার <strong>Project URL</strong> এবং <strong>Project API Keys (anon public)</strong> পাবেন।
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-800 pt-5 gap-3">
          <div>
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Reset to Local Sandbox
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-cyan-400 ${
                  isTesting ? 'animate-spin' : ''
                }`}
              />
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSave}
              className="rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-950/30 transition-all"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
